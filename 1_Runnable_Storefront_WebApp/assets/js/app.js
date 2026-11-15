/* ==========================================================================
   Damascus Digital Studio — Interactive Storefront Controller
   Handles Bilingual RTL/LTR, Dual Currency (USD/SYP), Cart, Simulated
   PayPal Sandbox Checkout, Instant File Download, Affiliate Tracking,
   Admin Telemetry and Customer Service. State persists in localStorage.
   ========================================================================== */

(function () {
  "use strict";

  // ---------- localStorage persistence ----------

  // Key for storing state in localStorage
  var STORAGE_KEY = "dds_store_v2";

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Load state from localStorage on page load
  function loadStoreState() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load store state from localStorage", e);
    }
    return null;
  }

  // Save state to localStorage
  function saveStoreState(stateObj) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
    } catch (e) {
      console.warn("Failed to save store state to localStorage", e);
    }
  }

  function createFreshState() {
    var stored = (typeof loadStoreState === "function") ? loadStoreState() : clone(DEFAULT_STATE);
    // Ensure per-order download counters exist for every seeded order line.
    stored.orders.forEach(function (order) {
      (order.items || []).forEach(function (productId) {
        var key = downloadKey(order.orderId, productId);
        if (typeof stored.downloadCounts[key] !== "number") {
          stored.downloadCounts[key] = 5;
        }
      });
    });
    // Seed affiliate baseline from the brief's seeded scenario only when empty.
    if (!stored.visits && stored.orders.length === INITIAL_ORDERS.length && stored.affiliate.clicks === 0) {
      stored.affiliate.clicks = 48;
      stored.affiliate.conversions = stored.orders.filter(function (o) { return o.status === "Complete"; }).length;
      stored.affiliate.salesUsd = stored.orders.filter(function (o) { return o.status === "Complete"; }).reduce(function (s, o) { return s + Number(o.totalUsd || 0); }, 0);
      stored.visits = 214;
      stored.traffic = { direct: 66, social: 63, search: 37, affiliate: 48 };
    }
    return stored;
  }

  var persisted = createFreshState();

  var state = {
    lang: persisted.lang || "ar",
    currency: persisted.currency || "USD",
    activeView: "home",
    categoryFilter: "all",
    searchQuery: "",
    cart: [],
    couponApplied: false,
    orders: persisted.orders || clone(INITIAL_ORDERS),
    downloadCounts: persisted.downloadCounts || {},
    affiliate: persisted.affiliate || clone(DEFAULT_STATE.affiliate),
    visits: typeof persisted.visits === "number" ? persisted.visits : 0,
    traffic: persisted.traffic || clone(DEFAULT_STATE.traffic),
    trackingCode: persisted.trackingCode || null,
    tickets: persisted.tickets || [],
    paypalDraft: null
  };

  function persist() {
    saveStoreState({
      orders: state.orders,
      downloadCounts: state.downloadCounts,
      lang: state.lang,
      currency: state.currency,
      affiliate: state.affiliate,
      visits: state.visits,
      traffic: state.traffic,
      sessionTracked: true,
      trackingCode: state.trackingCode,
      tickets: state.tickets
    });
  }

  function downloadKey(orderId, productId) {
    return String(orderId) + "#" + String(productId);
  }

  function remainingDownloads(orderId, productId) {
    var key = downloadKey(orderId, productId);
    var v = state.downloadCounts[key];
    return (typeof v === "number") ? v : 5;
  }

  function setRemainingDownloads(orderId, productId, value) {
    state.downloadCounts[downloadKey(orderId, productId)] = Math.max(0, value);
  }

  // ---------- attribution & telemetry ----------

/**
 * Initialize store state with backend API synchronization.
 * Fetches cart, orders, affiliate, and traffic data from the OpenCart backend API.
 * Falls back to localStorage seed data if backend is unavailable.
 * @returns {Promise<void>} - Resolves after rendering all views
 * @example
 * await initializeStore(); // Called on DOMContentLoaded
 */
async function initializeStore() {
    // API Base URL - can be overridden via <meta name="api-base" content="..."> in index.html
    var apiBase = '';
    var meta = document.querySelector('meta[name="api-base"]');
    if (meta && meta.getAttribute('content')) {
        apiBase = meta.getAttribute('content');
    } else {
        // Default: try relative API path, will fall back to localStorage
        apiBase = 'index.php?route=api';
    }

    // Show demo mode indicator if API is used
    var apiIndicator = byId('api-mode-indicator');
    if (apiIndicator) {
        apiIndicator.style.display = 'none';
    }

    // Try to fetch state from backend
    try {
        // Fetch cart state
        var cartResponse = await fetch(apiBase + '&route=api/cart', {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (cartResponse.ok) {
            var cartData = await cartResponse.json();
            // Merge backend cart with local state, preferring backend data
            if (cartData && cartData.length !== undefined) {
                state.cart = cartData;
            }
            updateCartUI();
        }

        // Fetch orders state
        var ordersResponse = await fetch(apiBase + '&route=api/orders', {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (ordersResponse.ok) {
            var ordersData = await ordersResponse.json();
            if (ordersData && ordersData.orders) {
                state.orders = ordersData.orders;
            }
            if (ordersData && ordersData.downloadCounts) {
                state.downloadCounts = ordersData.downloadCounts;
            }
        }

        // Fetch affiliate state
        var affiliateResponse = await fetch(apiBase + '&route=api/affiliate', {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (affiliateResponse.ok) {
            var affiliateData = await affiliateResponse.json();
            if (affiliateData) {
                state.affiliate = affiliateData;
            }
        }

        // Fetch traffic/traversal state
        var trafficResponse = await fetch(apiBase + '&route=api/traffic', {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (trafficResponse.ok) {
            var trafficData = await trafficResponse.json();
            if (trafficData) {
                state.traffic = trafficData;
            }
        }

        // Success: backend state is active
        if (apiIndicator) {
            apiIndicator.textContent = 'Real Mode - Backend Synced';
            apiIndicator.style.display = 'block';
            apiIndicator.style.color = 'var(--color-success)';
            apiIndicator.style.fontWeight = 'bold';
            apiIndicator.style.marginLeft = '16px';
        }

    } catch (error) {
        // API failure: graceful fallback to localStorage seed data
        console.warn('Backend API unavailable - using localStorage fallback', error);

        // Show offline indicator
        var apiIndicator = byId('api-mode-indicator');
        if (apiIndicator) {
            apiIndicator.textContent = 'Offline Mode - localStorage';
            apiIndicator.style.display = 'block';
            apiIndicator.style.color = 'var(--color-warning)';
            apiIndicator.style.fontWeight = 'bold';
            apiIndicator.style.marginLeft = '16px';
        }

        // State remains from localStorage (already loaded in DEFAULT STATE section)
        // Render from localStorage - no changes needed, state is already loaded
    }
}

// Add API mode indicator to the storefront (after the header/brand area)
(function () {
    var indicator = document.createElement('div');
    indicator.id = 'api-mode-indicator';
    indicator.style = 'display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--color-surface);border-radius:8px;font-size:12px;margin-top:12px;min-height:20px;';
    indicator.textContent = 'Initializing...';
    // Insert after the brand/logo area - find the primary nav or utility bar
    var utilityBar = document.querySelector('.utility-bar');
    if (utilityBar) {
        utilityBar.parentNode.insertBefore(indicator, utilityBar.nextSibling);
    } else {
        var grid = document.querySelector('.grid');
        if (grid) {
            var brand = grid.querySelector('[data-role="brand"]');
            if (brand) {
                grid.insertBefore(indicator, brand.nextSibling);
            } else {
                grid.insertBefore(indicator, grid.firstElementChild);
            }
        }
    }
})();

// Ensure API indicator styles exist
function ensureApiIndicatorStyles() {
    var style = document.getElementById('api-indicator-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'api-indicator-styles';
        style.textContent = `
            #api-mode-indicator {
                display: none;
                margin-top: 4px;
            }
            .api-status-online { color: #2a7a2e; }
            .api-status-offline { color: #bf5700; }
        `;
        document.head.appendChild(style);
    }
}

ensureApiIndicatorStyles();
    if (typeof getPublicBaseUrl === "function") return getPublicBaseUrl();
    if (STORE_CONFIG.publicBaseUrl) return STORE_CONFIG.publicBaseUrl.replace(/\/$/, "");
    try {
      var u = new URL(window.location.href);
      if (u.protocol === "http:" || u.protocol === "https:") {
        return u.origin + u.pathname.replace(/[^/]*$/, "");
      }
    } catch (e) {}
    return window.location.href.replace(/[^/]*$/, "");
  }

  function captureAttribution() {
    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      return;
    }

    var trackedThisSession = false;
    try { trackedThisSession = sessionStorage.getItem("dds_session_tracked") === "1"; } catch (e) {}

    var tracking = (params.get("tracking") || "").trim();
    if (tracking) {
      state.trackingCode = tracking;
      state.affiliate.trackingCode = tracking;
      if (!trackedThisSession) {
        state.affiliate.clicks += 1;
        state.traffic.affiliate = (state.traffic.affiliate || 0) + 1;
      }
    }

    if (!trackedThisSession) {
      state.visits += 1;
      var src = (params.get("utm_source") || params.get("source") || "").toLowerCase();
      if (!tracking) {
        if (src === "facebook" || src === "instagram" || src === "whatsapp" || src === "telegram" || src === "x" || src === "linkedin" || src === "social") {
          state.traffic.social = (state.traffic.social || 0) + 1;
        } else if (src === "google" || src === "bing" || src === "search") {
          state.traffic.search = (state.traffic.search || 0) + 1;
        } else {
          state.traffic.direct = (state.traffic.direct || 0) + 1;
        }
      }
      try { sessionStorage.setItem("dds_session_tracked", "1"); } catch (e) {}
    }

    persist();
  }

  // ---------- helpers ----------

  function byId(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatPrice(usdAmount) {
    var n = Number(usdAmount || 0);
    if (state.currency === "USD") {
      return "$" + n.toFixed(2);
    }
    var syp = Math.round(n * STORE_CONFIG.sypRate);
    return state.lang === "ar"
      ? syp.toLocaleString("en-US") + " ل.س"
      : syp.toLocaleString("en-US") + " SYP";
  }

  function formatDualPrice(usdAmount) {
    var n = Number(usdAmount || 0);
    var syp = Math.round(n * STORE_CONFIG.sypRate).toLocaleString("en-US");
    if (state.currency === "USD") {
      return {
        primary: "$" + n.toFixed(2),
        secondary: state.lang === "ar" ? "≈ " + syp + " ل.س" : "≈ " + syp + " SYP"
      };
    }
    return {
      primary: state.lang === "ar" ? syp + " ل.س" : syp + " SYP",
      secondary: "$" + n.toFixed(2) + " USD (PayPal)"
    };
  }

  function announce(message) {
    var live = byId("aria-announcer");
    if (live) live.textContent = message;
  }

  function productTitle(p) { return state.lang === "ar" ? p.titleAr : p.titleEn; }

  function nextOrderId() {
    var max = 1000;
    state.orders.forEach(function (o) {
      var m = String(o.orderId || "").match(/#(\d+)/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return "#" + String(max + 1);
  }

  // ---------- language / currency / navigation ----------

  function setLanguage(lang) {
    state.lang = (lang === "en") ? "en" : "ar";
    var html = document.documentElement;
    html.lang = state.lang === "ar" ? "ar-SY" : "en";
    html.dir = state.lang === "ar" ? "rtl" : "ltr";
    persist();
    renderAll();
    announce(state.lang === "ar" ? "تم التبديل إلى اللغة العربية" : "Switched to English");
  }

  function toggleCurrency() {
    state.currency = state.currency === "USD" ? "SYP" : "USD";
    persist();
    renderAll();
    announce("Currency switched to " + state.currency);
  }

  function switchView(view) {
    state.activeView = view;
    document.querySelectorAll(".view-section").forEach(function (el) {
      el.classList.toggle("hidden", el.dataset.view !== view);
    });
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.setAttribute("aria-current", btn.dataset.nav === view ? "page" : "false");
    });
    var nav = byId("primary-nav");
    if (nav) nav.classList.remove("open");
    renderAll();
  }

  // ---------- cart ----------

  function addToCart(productId) {
    var id = Number(productId);
    if (state.cart.indexOf(id) === -1) state.cart.push(id);
    updateCartUI();
    openCartDrawer();
    persist(); // Save cart to localStorage
    var prod = PRODUCTS.find(function (p) { return p.id === id; });
    if (prod) announce(state.lang === "ar" ? "تمت إضافة " + prod.titleAr + " إلى السلة" : "Added " + prod.titleEn + " to cart");
  }

  function removeFromCart(productId) {
    var id = Number(productId);
    state.cart = state.cart.filter(function (x) { return x !== id; });
    if (state.cart.length === 0) state.couponApplied = false;
    updateCartUI();
    persist(); // Save cart changes to localStorage
  }

  function getCartTotals() {
    var subtotalUsd = state.cart.reduce(function (sum, id) {
      var p = PRODUCTS.find(function (item) { return item.id === id; });
      return sum + (p ? Number(p.priceUsd || 0) : 0);
    }, 0);
    var cfg = STORE_CONFIG.activeCoupon || {};
    var discountUsd = 0;
    if (state.couponApplied && subtotalUsd >= Number(cfg.minTotalUsd || 0)) {
      discountUsd = subtotalUsd * (Number(cfg.discountPercent || 0) / 100);
    } else if (state.couponApplied) {
      state.couponApplied = false;
    }
    var totalUsd = Math.max(0, subtotalUsd - discountUsd);
    return { subtotalUsd: subtotalUsd, discountUsd: discountUsd, totalUsd: totalUsd };
  }

  function applyCoupon() {
    var input = byId("coupon-input");
    var msg = byId("coupon-msg");
    var code = ((input && input.value) || "").trim().toUpperCase();
    var cfg = STORE_CONFIG.activeCoupon || {};
    var subtotal = state.cart.reduce(function (s, id) {
      var p = PRODUCTS.find(function (i) { return i.id === id; });
      return s + (p ? Number(p.priceUsd || 0) : 0);
    }, 0);
    if (code === cfg.code) {
      if (subtotal < Number(cfg.minTotalUsd || 0)) {
        state.couponApplied = false;
        if (msg) {
          msg.style.color = "var(--color-error)";
          msg.textContent = state.lang === "ar"
            ? "يتطلب هذا الكوبون حدًا أدنى " + formatPrice(cfg.minTotalUsd) + "."
            : "Coupon requires a minimum of " + formatPrice(cfg.minTotalUsd) + ".";
        }
      } else {
        state.couponApplied = true;
        if (msg) {
          msg.style.color = "var(--color-success)";
          msg.textContent = state.lang === "ar"
            ? "تم تفعيل كود الخصم " + cfg.code + " بنجاح (خصم " + cfg.discountPercent + "%)."
            : "Coupon " + cfg.code + " applied (" + cfg.discountPercent + "% discount).";
        }
      }
    } else {
      state.couponApplied = false;
      if (msg) {
        msg.style.color = "var(--color-error)";
        msg.textContent = state.lang === "ar"
          ? "رمز القسيمة غير صالح. جرّب: " + (cfg.code || "DAMASCUS20")
          : "Invalid coupon code. Try: " + (cfg.code || "DAMASCUS20");
      }
    }
    updateCartUI();
  }

  function openCartDrawer() {
    byId("drawer-backdrop").classList.add("open");
    byId("cart-drawer").classList.add("open");
  }

  function closeAllOverlays() {
    var b = byId("drawer-backdrop"), c = byId("cart-drawer"), m = byId("product-modal"), p = byId("paypal-modal");
    if (b) b.classList.remove("open");
    if (c) c.classList.remove("open");
    if (m) m.classList.remove("open");
    if (p) { p.classList.remove("open"); p.classList.add("hidden"); }
  }

  // ---------- product modal ----------

  function openProductModal(productId) {
    var p = PRODUCTS.find(function (item) { return item.id === Number(productId); });
    if (!p) return;
    var isAr = state.lang === "ar";
    var prices = formatDualPrice(p.priceUsd);
    var base = getPublicBase();
    var shareUrl = base + "index.html?product_id=" + p.id + "&tracking=" + encodeURIComponent(state.trackingCode || state.affiliate.trackingCode || "");
    var encodedShare = encodeURIComponent(shareUrl);

    var modal = byId("product-modal");
    modal.innerHTML = ''
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      + '  <span class="format-pill" style="position:static;">' + escapeHtml(p.sku) + ' • ' + escapeHtml(p.format) + '</span>'
      + '  <button type="button" class="btn btn-outline btn-sm" data-close-modal>✕</button>'
      + '</div>'
      + '<div class="product-preview" style="height:240px;border-radius:12px;margin-bottom:16px;">'
      + p.previewSvg
      + '  <span class="watermark-ribbon">DAMASCUS DIGITAL STUDIO — WATERMARKED PREVIEW</span>'
      + '</div>'
      + '<h2 style="margin:0 0 8px;color:var(--color-primary);">' + escapeHtml(isAr ? p.titleAr : p.titleEn) + '</h2>'
      + '<p style="color:var(--color-text-secondary);margin:0 0 14px;">' + escapeHtml(isAr ? p.descAr : p.descEn) + '</p>'
      + '<div style="background:var(--color-surface-alt);padding:12px;border-radius:10px;font-size:13px;margin-bottom:16px;">'
      + '  <div><strong>' + (isAr ? "حجم الملف:" : "File Size:") + '</strong> ' + escapeHtml(p.fileSize) + '</div>'
      + '  <div><strong>' + (isAr ? "الترخيص:" : "License:") + '</strong> ' + escapeHtml(isAr ? p.licenseAr : p.licenseEn) + '</div>'
      + '  <div><strong>' + (isAr ? "الشحن:" : "Shipping:") + '</strong> ' + (isAr ? "غير مطلوب — تسليم رقمي مشفر فوراً بعد الدفع" : "Not Required — Instant Encrypted Digital Delivery") + '</div>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">'
      + '  <div><span class="price-primary">' + prices.primary + '</span><span class="price-secondary">' + prices.secondary + '</span></div>'
      + '  <button type="button" class="btn btn-primary" data-add-cart="' + p.id + '">' + (isAr ? "أضف إلى السلة الرقمية" : "Add to Digital Cart") + '</button>'
      + '</div>'
      + '<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--color-border);">'
      + '  <small style="font-weight:700;display:block;margin-bottom:6px;">' + (isAr ? "مشاركة فورية مع تضمين رمز التتبع:" : "Instant Share with tracking:") + '</small>'
      + '  <div class="share-bar">'
      + '    <a class="share-btn share-wa" target="_blank" rel="noopener" href="https://api.whatsapp.com/send?text=' + encodedShare + '">WhatsApp</a>'
      + '    <a class="share-btn share-tg" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + encodedShare + '">Telegram</a>'
      + '    <a class="share-btn share-fb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + encodedShare + '">Facebook</a>'
      + '    <a class="share-btn share-li" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodedShare + '">LinkedIn</a>'
      + '  </div>'
      + '</div>';

    modal.querySelector('[data-close-modal]').addEventListener('click', closeAllOverlays);
    modal.querySelector('[data-add-cart]').addEventListener('click', function () {
      closeAllOverlays();
      addToCart(p.id);
    });

    byId("drawer-backdrop").classList.add("open");
    modal.classList.add("open");
  }

  // ---------- checkout & PayPal sandbox simulation ----------

  function commitOrder(draft, status) {
    var order = {
      orderId: nextOrderId(),
      customer: draft.customer,
      items: draft.items.slice(),
      totalUsd: draft.totalUsd,
      method: draft.method,
      status: status,
      date: new Date().toISOString().slice(0, 10),
      referredBy: state.trackingCode || null
    };
    state.orders.unshift(order);
    order.items.forEach(function (pid) { setRemainingDownloads(order.orderId, pid, 5); });

    if (status === "Complete") {
      state.affiliate.conversions += 1;
      state.affiliate.salesUsd = Number((state.affiliate.salesUsd + Number(order.totalUsd || 0)).toFixed(2));
    }

    state.cart = [];
    state.couponApplied = false;
    state.paypalDraft = null;
    persist();
    updateCartUI();
    renderAll();
  }

  function showPaypalSandbox(draft) {
    state.paypalDraft = draft;
    var isAr = state.lang === "ar";
    var modal = byId("paypal-modal");
    if (!modal) { commitOrder(draft, "Complete"); return; }
    modal.innerHTML = ''
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
      + '  <strong style="font-size:18px;color:var(--color-primary);">PayPal Sandbox</strong>'
      + '  <button type="button" class="btn btn-outline btn-sm" id="paypal-close">✕</button>'
      + '</div>'
      + '<p style="margin:0 0 12px;color:var(--color-text-secondary);">'
      + (isAr ? 'محاكاة بوابة PayPal التجريبية. وافق لإتمام الدفع فوراً أو ألغِ لإلغاء العملية.' : 'Simulated PayPal Sandbox checkout. Approve to complete payment instantly or cancel to abort.')
      + '</p>'
      + '<div style="background:var(--color-surface-alt);padding:12px;border-radius:10px;margin-bottom:14px;">'
      + '  <div><strong>' + (isAr ? 'الزبون:' : 'Payer:') + '</strong> ' + escapeHtml(draft.customer) + '</div>'
      + '  <div><strong>' + (isAr ? 'المبلغ:' : 'Amount:') + '</strong> $' + Number(draft.totalUsd).toFixed(2) + ' USD</div>'
      + '  <div><strong>' + (isAr ? 'العناصر:' : 'Items:') + '</strong> ' + draft.items.length + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">'
      + '  <button type="button" class="btn btn-outline" id="paypal-cancel">' + (isAr ? 'إلغاء' : 'Cancel') + '</button>'
      + '  <button type="button" class="btn btn-primary" id="paypal-approve">' + (isAr ? 'موافقة ودفع' : 'Approve & Pay') + '</button>'
      + '</div>';

    modal.classList.remove("hidden");
    modal.classList.add("open");
    byId("drawer-backdrop").classList.add("open");

    byId("paypal-approve").onclick = function () {
      closeAllOverlays();
      commitOrder(draft, "Complete");
      switchView("downloads");
      announce(isAr ? "تم الدفع عبر PayPal وتفعيل روابط التنزيل الفوري" : "PayPal Sandbox payment completed. Downloads unlocked.");
    };
    byId("paypal-cancel").onclick = function () {
      state.paypalDraft = null;
      closeAllOverlays();
      openCartDrawer();
      announce(isAr ? "تم إلغاء عملية الدفع" : "PayPal payment cancelled.");
    };
    byId("paypal-close").onclick = function () { byId("paypal-cancel").click(); };
  }

  function processCheckout(event) {
    event.preventDefault();
    if (state.cart.length === 0) return;
    var isAr = state.lang === "ar";
    var nameEl = byId("checkout-name");
    var payEl = byId("checkout-payment");
    var customerName = (nameEl && nameEl.value ? nameEl.value : "").trim() || (isAr ? "زبون المتجر" : "Store Customer");
    var paymentMethod = (payEl && payEl.value) || "PayPal Sandbox";
    var totals = getCartTotals();

    if (totals.subtotalUsd <= 0) return;

    var draft = {
      customer: customerName,
      items: state.cart.slice(),
      totalUsd: totals.totalUsd,
      method: paymentMethod
    };

    if (paymentMethod === "PayPal Sandbox") {
      showPaypalSandbox(draft);
      return;
    }

    commitOrder(draft, "Pending");
    closeAllOverlays();
    switchView("downloads");
    announce(isAr ? "تم تسجيل الطلب قيد الانتظار لحين تأكيد الحوالة البنكية" : "Order recorded as Pending awaiting bank transfer confirmation.");
  }

  function approvePendingOrder(orderId) {
    var order = state.orders.find(function (o) { return o.orderId === orderId; });
    if (order && order.status === "Pending") {
      order.status = "Complete";
      state.affiliate.conversions += 1;
      state.affiliate.salesUsd = Number((state.affiliate.salesUsd + Number(order.totalUsd || 0)).toFixed(2));
      persist();
      renderAll();
    }
  }

  // ---------- downloads ----------

  function triggerRealFileDownload(orderId, productId) {
    var p = PRODUCTS.find(function (item) { return item.id === Number(productId); });
    if (!p) return;
    var rem = remainingDownloads(orderId, productId);
    if (rem <= 0) {
      announce(state.lang === "ar" ? "استنفدت الحد الأقصى لمرات التنزيل (5/5)." : "Maximum download limit reached (5/5).");
      return;
    }
    setRemainingDownloads(orderId, productId, rem - 1);

    var content = p.generateContent();
    var mime = p.filename.slice(-4) === ".svg" ? "image/svg+xml;charset=utf-8" : "application/dxf;charset=utf-8";
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = p.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    persist();
    renderDownloadsView();
  }

  // ---------- rendering ----------

  function updateCartUI() {
    var isAr = state.lang === "ar";
    var count = byId("cart-count");
    if (count) count.textContent = String(state.cart.length);
    var listEl = byId("cart-items-container");
    var checkoutForm = byId("checkout-form");

    if (state.cart.length === 0) {
      if (listEl) listEl.innerHTML = '<p style="color:var(--color-text-secondary);text-align:center;padding:24px 0;">'
        + (isAr ? "سلة المنتجات الرقمية فارغة حالياً." : "Your digital cart is currently empty.") + '</p>';
      if (checkoutForm) checkoutForm.classList.add("hidden");
      return;
    }

    if (checkoutForm) checkoutForm.classList.remove("hidden");
    if (listEl) {
      listEl.innerHTML = state.cart.map(function (id) {
        var p = PRODUCTS.find(function (item) { return item.id === id; });
        if (!p) return '';
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-border);">'
          + '<div><strong style="font-size:14px;display:block;">' + escapeHtml(productTitle(p)) + '</strong>'
          + '<small style="color:var(--color-text-secondary);">' + escapeHtml(p.format) + ' • ' + formatPrice(p.priceUsd) + '</small></div>'
          + '<button type="button" class="btn btn-outline btn-sm" data-remove-cart="' + p.id + '" aria-label="Remove">✕</button>'
          + '</div>';
      }).join("");

      listEl.querySelectorAll('[data-remove-cart]').forEach(function (btn) {
        btn.addEventListener('click', function () { removeFromCart(btn.getAttribute('data-remove-cart')); });
      });
    }

    var totals = getCartTotals();
    var summary = byId("cart-summary-box");
    if (summary) {
      summary.innerHTML = '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">'
        + '<span>' + (isAr ? "المجموع الفرعي:" : "Subtotal:") + '</span><strong>' + formatPrice(totals.subtotalUsd) + '</strong></div>'
        + (totals.discountUsd > 0 ? '<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--color-success);margin-bottom:4px;"><span>'
          + (isAr ? "خصم القسيمة (20%):" : "Coupon Discount (20%):") + '</span><strong>-' + formatPrice(totals.discountUsd) + '</strong></div>' : '')
        + '<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:var(--color-primary);padding-top:6px;border-top:1px solid var(--color-border);">'
        + '<span>' + (isAr ? "الإجمالي المستحق:" : "Total Due:") + '</span><span>' + formatPrice(totals.totalUsd) + '</span></div>'
        + '<small style="display:block;color:var(--color-accent);margin-top:4px;">✓ '
        + (isAr ? "تم تخطي رسوم الشحن تلقائياً (منتجات قابلة للتحميل)" : "Physical shipping bypassed automatically (Digital Downloads)") + '</small>';
    }
  }

  function updateFilterCounts() {
    var counts = { all: PRODUCTS.length, cards: 0, art: 0, cad: 0 };
    PRODUCTS.forEach(function (p) { if (counts[p.category] != null) counts[p.category] += 1; });
    document.querySelectorAll('.filter-tab').forEach(function (tab) {
      var cat = tab.getAttribute('data-cat');
      if (!cat || counts[cat] == null) return;
      var ar = tab.getAttribute('data-ar') || '';
      var en = tab.getAttribute('data-en') || '';
      tab.setAttribute('data-ar', ar.replace(/\s*\(\d+\)\s*$/, '') + ' (' + counts[cat] + ')');
      tab.setAttribute('data-en', en.replace(/\s*\(\d+\)\s*$/, '') + ' (' + counts[cat] + ')');
      tab.textContent = state.lang === 'ar' ? tab.getAttribute('data-ar') : tab.getAttribute('data-en');
    });
  }

  function renderCatalog() {
    var isAr = state.lang === "ar";
    var grid = byId("product-grid");
    if (!grid) return;
    var q = (state.searchQuery || "").trim().toLowerCase();
    var filtered = PRODUCTS.filter(function (p) {
      var matchCat = state.categoryFilter === "all" || p.category === state.categoryFilter;
      var titleAr = (p.titleAr || "").toLowerCase();
      var titleEn = (p.titleEn || "").toLowerCase();
      var sku = (p.sku || "").toLowerCase();
      var matchQ = !q || titleAr.indexOf(q) !== -1 || titleEn.indexOf(q) !== -1 || sku.indexOf(q) !== -1;
      return matchCat && matchQ;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:32px;color:var(--color-text-secondary);">'
        + (isAr ? "لا توجد منتجات مطابقة لبحثك." : "No digital products match your filter.") + '</p>';
      return;
    }

    grid.innerHTML = filtered.map(function (p) {
      var prices = formatDualPrice(p.priceUsd);
      return '<article class="product-card">'
        + '<div class="product-preview">' + p.previewSvg
        + '  <span class="format-pill">' + escapeHtml(p.format) + '</span>'
        + '  <span class="no-ship-pill">' + (isAr ? "تحميل فوري" : "Instant Download") + '</span>'
        + '  <span class="watermark-ribbon">DAMASCUS PREVIEW</span>'
        + '</div>'
        + '<div class="product-body">'
        + '  <span class="product-cat">' + escapeHtml(isAr ? p.categoryAr : p.categoryEn) + '</span>'
        + '  <h3 class="product-title">' + escapeHtml(isAr ? p.titleAr : p.titleEn) + '</h3>'
        + '  <p class="product-desc">' + escapeHtml(isAr ? p.descAr : p.descEn) + '</p>'
        + '  <div class="product-meta"><div><span class="price-primary">' + prices.primary + '</span>'
        + '  <span class="price-secondary">' + prices.secondary + '</span></div>'
        + '  <span style="font-size:12px;color:var(--color-text-secondary);font-family:var(--font-mono);">' + escapeHtml(p.fileSize) + '</span></div>'
        + '  <div class="product-actions">'
        + '    <button type="button" class="btn btn-navy btn-sm" data-add-cart="' + p.id + '">' + (isAr ? "شراء وتحميل" : "Add to Cart") + '</button>'
        + '    <button type="button" class="btn btn-outline btn-sm" data-open-product="' + p.id + '">' + (isAr ? "معاينة" : "Details") + '</button>'
        + '  </div>'
        + '</div></article>';
    }).join("");

    grid.querySelectorAll('[data-add-cart]').forEach(function (btn) {
      btn.addEventListener('click', function () { addToCart(btn.getAttribute('data-add-cart')); });
    });
    grid.querySelectorAll('[data-open-product]').forEach(function (btn) {
      btn.addEventListener('click', function () { openProductModal(btn.getAttribute('data-open-product')); });
    });
  }

  function renderDownloadsView() {
    var isAr = state.lang === "ar";
    var tbody = byId("downloads-tbody");
    if (!tbody) return;

    var rows = [];
    state.orders.forEach(function (order) {
      (order.items || []).forEach(function (prodId) {
        var p = PRODUCTS.find(function (item) { return item.id === prodId; });
        if (!p) return;
        var isComplete = order.status === "Complete";
        var rem = remainingDownloads(order.orderId, prodId);
        rows.push('<tr>'
          + '<td><strong>' + escapeHtml(order.orderId) + '</strong></td>'
          + '<td>' + escapeHtml(order.customer) + '</td>'
          + '<td>' + escapeHtml(productTitle(p)) + '<br><small style="font-family:var(--font-mono);">' + escapeHtml(p.filename) + '</small></td>'
          + '<td>' + escapeHtml(order.method) + '</td>'
          + '<td><span class="status-pill ' + (isComplete ? 'status-complete' : 'status-pending') + '">' + escapeHtml(order.status) + '</span></td>'
          + '<td>' + rem + ' / 5</td>'
          + '<td>' + (isComplete
              ? '<button type="button" class="btn btn-primary btn-sm" data-download="' + prodId + '" data-order="' + escapeHtml(order.orderId) + '">⬇ ' + (isAr ? 'تحميل الملف' : 'Download File') + '</button>'
              : '<span style="font-size:12px;color:var(--color-warning);">' + (isAr ? 'بانتظار تأكيد الدفع' : 'Awaiting Payment') + '</span>')
          + '</td></tr>');
      });
    });

    tbody.innerHTML = rows.length ? rows.join("") : '<tr><td colspan="7" style="text-align:center;color:var(--color-text-secondary);padding:20px;">'
      + (isAr ? 'لا توجد طلبات بعد.' : 'No orders yet.') + '</td></tr>';

    tbody.querySelectorAll('[data-download]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        triggerRealFileDownload(btn.getAttribute('data-order'), btn.getAttribute('data-download'));
      });
    });
  }

  function renderAffiliateView() {
    var select = byId("affiliate-product-select");
    if (select && select.options.length === 0) {
      PRODUCTS.forEach(function (p) {
        var opt = document.createElement("option");
        opt.value = String(p.id);
        opt.textContent = p.sku + " — " + p.titleEn + " ($" + Number(p.priceUsd).toFixed(2) + ")";
        select.appendChild(opt);
      });
    }
    var selectedId = select ? select.value : String(PRODUCTS[0].id);
    var base = getPublicBase();
    var tracking = state.trackingCode || state.affiliate.trackingCode || "";
    var generatedLink = base + "index.html?product_id=" + encodeURIComponent(selectedId) + "&tracking=" + encodeURIComponent(tracking);
    var linkBox = byId("affiliate-generated-url");
    if (linkBox) linkBox.value = generatedLink;

    var commissionUsd = Number((state.affiliate.salesUsd * STORE_CONFIG.affiliateCommissionRate).toFixed(2));
    var clicks = byId("aff-clicks"); if (clicks) clicks.textContent = String(state.affiliate.clicks);
    var orders = byId("aff-orders"); if (orders) orders.textContent = String(state.affiliate.conversions);
    var sales = byId("aff-sales"); if (sales) sales.textContent = formatPrice(state.affiliate.salesUsd);
    var comm = byId("aff-commission"); if (comm) comm.textContent = formatPrice(commissionUsd);

    // Update the label to show the active tracking code.
    var codeLabel = document.querySelector('[data-aff-code]');
    if (codeLabel) codeLabel.textContent = tracking || '-';
  }

  function copyAffiliateUrl() {
    var box = byId("affiliate-generated-url");
    if (!box) return;
    box.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(box.value).catch(function () {});
    }
    announce(state.lang === "ar" ? "تم نسخ رابط التتبع" : "Tracking URL copied");
  }

  function renderAdminView() {
    var isAr = state.lang === "ar";
    var completedOrders = state.orders.filter(function (o) { return o.status === "Complete"; });
    var totalSalesUsd = completedOrders.reduce(function (s, o) { return s + Number(o.totalUsd || 0); }, 0);
    var visits = Math.max(state.visits, 0);
    var convRate = visits > 0 ? ((completedOrders.length / visits) * 100) : 0;

    var set = function (id, v) { var el = byId(id); if (el) el.textContent = String(v); };
    set("adm-visitors", visits);
    set("adm-orders", completedOrders.length);
    set("adm-revenue", formatPrice(totalSalesUsd));
    set("adm-conv", convRate.toFixed(2) + "%");

    var tbody = byId("admin-orders-tbody");
    if (tbody) {
      tbody.innerHTML = state.orders.map(function (o) {
        return '<tr>'
          + '<td><strong>' + escapeHtml(o.orderId) + '</strong></td>'
          + '<td>' + escapeHtml(o.date || '') + '</td>'
          + '<td>' + escapeHtml(o.customer) + '</td>'
          + '<td>' + escapeHtml(o.method) + '</td>'
          + '<td>' + formatPrice(o.totalUsd) + '</td>'
          + '<td><span class="status-pill ' + (o.status === "Complete" ? "status-complete" : "status-pending") + '">' + escapeHtml(o.status) + '</span></td>'
          + '<td>' + (o.status === "Pending"
              ? '<button type="button" class="btn btn-navy btn-sm" data-approve="' + escapeHtml(o.orderId) + '">' + (isAr ? "تأكيد الحوالة" : "Approve Payment") + '</button>'
              : '✓') + '</td>'
          + '</tr>';
      }).join("");
      tbody.querySelectorAll('[data-approve]').forEach(function (btn) {
        btn.addEventListener('click', function () { approvePendingOrder(btn.getAttribute('data-approve')); });
      });
    }

    // Traffic breakdown (real telemetry)
    var trafficEl = byId('adm-traffic');
    if (trafficEl) {
      var t = state.traffic || {};
      trafficEl.innerHTML = ''
        + '<div>' + (isAr ? 'مباشر' : 'Direct') + ': <strong>' + (t.direct || 0) + '</strong></div>'
        + '<div>' + (isAr ? 'اجتماعي' : 'Social') + ': <strong>' + (t.social || 0) + '</strong></div>'
        + '<div>' + (isAr ? 'بحث' : 'Search') + ': <strong>' + (t.search || 0) + '</strong></div>'
        + '<div>' + (isAr ? 'حلفاء' : 'Affiliate') + ': <strong>' + (t.affiliate || 0) + '</strong></div>';
    }
  }

  function renderSupportView() {
    var isAr = state.lang === "ar";
    var list = byId('support-tickets');
    if (list) {
      if (!state.tickets.length) {
        list.innerHTML = '<p style="color:var(--color-text-secondary);margin:0;">' + (isAr ? 'لا توجد تذاكر بعد.' : 'No tickets yet.') + '</p>';
      } else {
        list.innerHTML = state.tickets.slice().reverse().map(function (t) {
          return '<div class="panel-card" style="margin-bottom:12px;padding:12px;">'
            + '<div style="display:flex;justify-content:space-between;gap:8px;"><strong>' + escapeHtml(t.subject) + '</strong><small>' + escapeHtml(t.date) + '</small></div>'
            + '<div style="font-size:13px;color:var(--color-text-secondary);">' + escapeHtml(t.name) + ' • ' + escapeHtml(t.email) + '</div>'
            + '<p style="margin:6px 0 0;">' + escapeHtml(t.message) + '</p></div>';
        }).join('');
      }
    }
  }

  function renderAll() {
    var isAr = state.lang === "ar";
    document.querySelectorAll("[data-ar][data-en]").forEach(function (el) {
      el.textContent = isAr ? el.dataset.ar : el.dataset.en;
    });
    document.querySelectorAll("[data-placeholder-ar][data-placeholder-en]").forEach(function (el) {
      el.placeholder = isAr ? el.dataset.placeholderAr : el.dataset.placeholderEn;
    });
    var langBtn = byId("lang-toggle-btn");
    if (langBtn) langBtn.textContent = isAr ? "English (EN)" : "العربية (AR)";
    var currBtn = byId("curr-toggle-btn");
    if (currBtn) currBtn.textContent = state.currency === "USD" ? "USD ($) ⇄ SYP (ل.س)" : "SYP (ل.س) ⇄ USD ($)";

    renderCatalog();
    updateFilterCounts();
    updateCartUI();
    renderDownloadsView();
    renderAffiliateView();
    renderAdminView();
    renderSupportView();
  }

  // ---------- events ----------

  function bindEvents() {
    var langBtn = byId("lang-toggle-btn");
    if (langBtn) langBtn.addEventListener("click", function () { setLanguage(state.lang === "ar" ? "en" : "ar"); });
    var currBtn = byId("curr-toggle-btn");
    if (currBtn) currBtn.addEventListener("click", toggleCurrency);

    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { switchView(btn.dataset.nav); });
    });

    var mobile = byId("mobile-menu-toggle");
    if (mobile) mobile.addEventListener("click", function () { byId("primary-nav").classList.toggle("open"); });

    document.querySelectorAll(".filter-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        state.categoryFilter = tab.dataset.cat;
        document.querySelectorAll(".filter-tab").forEach(function (t) { t.setAttribute("aria-pressed", t === tab ? "true" : "false"); });
        renderCatalog();
      });
    });

    var search = byId("catalog-search");
    if (search) search.addEventListener("input", function (e) { state.searchQuery = e.target.value || ""; renderCatalog(); });

    var cartBtn = byId("cart-open-btn");
    if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
    // Backdrop click - only close when clicking the backdrop itself, NOT drawer content
    var backdrop = byId("drawer-backdrop");
    if (backdrop) {
        backdrop.addEventListener("click", function (e) {
            // Check if click target is the backdrop itself (not child elements like cart-drawer)
            if (e.target === backdrop) {
                closeAllOverlays();
            }
            // If click is on child elements (drawer content), do nothing - let the event stop
        });
    }
    var form = byId("checkout-form");
    if (form) form.addEventListener("submit", processCheckout);
    var affSelect = byId("affiliate-product-select");
    if (affSelect) affSelect.addEventListener("change", renderAffiliateView);

    var couponApply = byId("coupon-apply-btn");
    if (couponApply) couponApply.addEventListener("click", applyCoupon);
    var copyBtn = byId("copy-affiliate-btn");
    if (copyBtn) copyBtn.addEventListener("click", copyAffiliateUrl);

    var supportForm = byId("support-form");
    if (supportForm) supportForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = {
        name: (byId('support-name') || {}).value || '',
        email: (byId('support-email') || {}).value || '',
        subject: (byId('support-subject') || {}).value || '',
        message: (byId('support-message') || {}).value || '',
        date: new Date().toISOString().slice(0, 10)
      };
      state.tickets.push(t);
      persist();
      supportForm.reset();
      renderSupportView();
      announce(state.lang === 'ar' ? 'تم استلام تذكرة الدعم' : 'Support ticket submitted');
    });

    var resetBtn = byId('demo-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      var fresh = (typeof resetStoreState === 'function') ? resetStoreState() : clone(DEFAULT_STATE);
      persisted = fresh;
      state.lang = fresh.lang || 'ar';
      state.currency = fresh.currency || 'USD';
      state.cart = [];
      state.couponApplied = false;
      state.orders = fresh.orders || clone(INITIAL_ORDERS);
      state.downloadCounts = fresh.downloadCounts || {};
      state.affiliate = fresh.affiliate || clone(DEFAULT_STATE.affiliate);
      state.visits = fresh.visits || 0;
      state.traffic = fresh.traffic || clone(DEFAULT_STATE.traffic);
      state.trackingCode = fresh.trackingCode || null;
      state.tickets = fresh.tickets || [];
      try { sessionStorage.removeItem('dds_session_tracked'); } catch (e) {}
      captureAttribution();
      setLanguage(state.lang);
      renderAll();
    });

    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAllOverlays(); });

    // Expose minimal hooks for inline attributes still present in markup
    window.switchView = switchView;
    window.closeAllOverlays = closeAllOverlays;
  }

  // ---------- init ----------

  document.addEventListener("DOMContentLoaded", async function () {
    // Initialize store with backend sync (with localStorage fallback)
    await initializeStore();

    // Then run the rest of the initialization
    captureAttribution();
    bindEvents();
    setLanguage(state.lang);
  });
})();
