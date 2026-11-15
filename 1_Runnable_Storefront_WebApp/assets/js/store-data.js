/* ==========================================================================
   Damascus Digital Studio — Production Catalog Data & Digital Asset Generators
   Matches OpenCart 4.0.2.3 Database Seed (oc_product, oc_download, oc_coupon)
   ========================================================================== */

const STORE_CONFIG = {
  sypRate: 13000, // 1 USD = 13,000 SYP
  affiliateCommissionRate: 0.10, // 10%
  // publicBaseUrl: override the derived public base URL when deploying to a
  // real domain. Leave null to auto-derive from window.location (http(s) origin
  // + directory, or the same value on file://). All share/affiliate/canonical
  // links fall back to this so they never point at the dead InfinityFree host.
  publicBaseUrl: null,
  activeCoupon: {
    code: "DAMASCUS20",
    discountPercent: 20,
    minTotalUsd: 10
  },
  hosting: {
    provider: "InfinityFree Cloud Hosting (PHP 8.2 + MySQL 8.0 + Let's Encrypt SSL)",
    domain: "https://damascus-digital.infinityfreeapp.com",
    adminUrl: "https://damascus-digital.infinityfreeapp.com/admin_dds/",
    engine: "OpenCart 4.0.2.3 (Open Source)"
  }
};

const PRODUCTS = [
  {
    id: 5001,
    sku: "DDS-CARD-01",
    category: "cards",
    categoryAr: "بطاقات معايدة رقمية",
    categoryEn: "Digital Greeting Cards",
    titleAr: "بطاقة معايدة دمشقية متحركة (4K Vector)",
    titleEn: "Damascene Royal Greeting Card (4K Vector)",
    descAr: "بطاقة معايدة فاخرة بزخارف دمشقية مذهبة قابلة للتخصيص والطباعة الفورية بدقة 4K أو المشاركة الرقمية.",
    descEn: "Luxury Damascene gilded greeting card ready for instant 4K printing or personalized digital sharing.",
    format: "SVG / PDF 4K",
    fileSize: "4.2 MB",
    licenseAr: "رخصة استخدام شخصي وتجاري غير محدود",
    licenseEn: "Unlimited Personal & Commercial Print License",
    priceUsd: 5.00,
    maxDownloads: 5,
    filename: "Damascus_Eid_Greeting_Card_4K.svg",
    previewSvg: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#102A43"/><stop offset="100%" stop-color="#1E4E79"/></linearGradient></defs>
      <rect width="400" height="220" fill="url(#g1)"/>
      <rect x="14" y="14" width="372" height="192" fill="none" stroke="#FCD34D" stroke-width="2" rx="10"/>
      <circle cx="200" cy="72" r="26" fill="none" stroke="#FCD34D" stroke-width="2"/>
      <text x="200" y="132" fill="#FCD34D" font-size="18" font-weight="bold" text-anchor="middle" font-family="Tahoma">أطيب التهاني من دمشق</text>
      <text x="200" y="162" fill="#E2E8F0" font-size="11" text-anchor="middle" font-family="Arial">4K PRINTABLE &amp; INTERACTIVE VECTOR</text>
    </svg>`,
    generateContent: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
  <rect width="1200" height="750" fill="#102A43"/>
  <rect x="40" y="40" width="1120" height="670" fill="none" stroke="#FCD34D" stroke-width="5" rx="24"/>
  <text x="600" y="320" font-family="Tahoma, Arial" font-size="56" fill="#FCD34D" text-anchor="middle" font-weight="bold">أطيب التهاني وأصدق الأمنيات</text>
  <text x="600" y="410" font-family="Tahoma, Arial" font-size="30" fill="#FFFFFF" text-anchor="middle">مرسم دمشق الرقمي — Damascus Digital Studio (Licensed Clean Edition)</text>
</svg>`
  },
  {
    id: 5002,
    sku: "DDS-ART-01",
    category: "art",
    categoryAr: "رسوم ولوحات فنية",
    categoryEn: "Digital Art & Illustrations",
    titleAr: "لوحة رقمية: الياسمين الدمشقي والعمارة القديمة",
    titleEn: "Digital Artwork: Damascene Jasmine & Old Courtyard",
    descAr: "عمل فني رقمي بصيغة فيكتور قابلة للتكبير بلا حدود، مصمم للطباعة الجدارية الفاخرة والمشاريع الإبداعية.",
    descEn: "Infinitely scalable vector illustration inspired by Old Damascus courtyards, crafted for fine art prints.",
    format: "SVG / EPS / PNG",
    fileSize: "18.6 MB",
    licenseAr: "رخصة طباعة فنية وعرض رقمي",
    licenseEn: "Fine Art Print & Editorial Display License",
    priceUsd: 15.00,
    maxDownloads: 5,
    filename: "Damascus_Jasmine_Digital_Art.svg",
    previewSvg: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#FDFBF7"/>
      <circle cx="200" cy="110" r="78" fill="#0F5132"/>
      <circle cx="200" cy="110" r="64" fill="none" stroke="#FCD34D" stroke-width="2.5" stroke-dasharray="8 5"/>
      <text x="200" y="108" fill="#FFFFFF" font-size="16" font-weight="bold" text-anchor="middle" font-family="Tahoma">الياسمين الدمشقي</text>
      <text x="200" y="130" fill="#FCD34D" font-size="10" text-anchor="middle" font-family="Arial">DAMASCUS FINE ART COLLECTION</text>
    </svg>`,
    generateContent: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="#FDFBF7"/>
  <circle cx="500" cy="500" r="360" fill="#0F5132"/>
  <circle cx="500" cy="500" r="300" fill="none" stroke="#FCD34D" stroke-width="6" stroke-dasharray="16 10"/>
  <text x="500" y="490" font-family="Tahoma, Arial" font-size="48" fill="#FFFFFF" text-anchor="middle" font-weight="bold">لوحة الياسمين الدمشقي</text>
  <text x="500" y="555" font-family="Arial" font-size="24" fill="#FCD34D" text-anchor="middle">Damascus Digital Studio — Unwatermarked Master File</text>
</svg>`
  },
  {
    id: 5003,
    sku: "DDS-CAD-01",
    category: "cad",
    categoryAr: "حلول ومخططات هندسية",
    categoryEn: "Engineering & CAD Solutions",
    titleAr: "حزمة مخططات AutoCAD فيلا سكنية متكاملة (DXF/DWG)",
    titleEn: "Complete Residential Villa AutoCAD Plan Suite (DXF/DWG)",
    descAr: "مخططات معمارية وإنشائية وتفاصيل محاور وأعمدة جاهزة للتعديل الفوري وفق الكود العربي السوري والدولي.",
    descEn: "Complete architectural & structural CAD drawings with layered walls, columns, and dimensions ready for editing.",
    format: "DXF / DWG",
    fileSize: "34.0 MB",
    licenseAr: "رخصة مكاتب هندسية ومشاريع تنفيذية",
    licenseEn: "Engineering Office & Construction Project License",
    priceUsd: 45.00,
    maxDownloads: 5,
    filename: "Residential_Villa_CAD_Plan.dxf",
    previewSvg: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#0B2545"/>
      <g stroke="#38BDF8" stroke-width="0.6" opacity="0.35">
        <line x1="0" y1="40" x2="400" y2="40"/><line x1="0" y1="80" x2="400" y2="80"/>
        <line x1="0" y1="120" x2="400" y2="120"/><line x1="0" y1="160" x2="400" y2="160"/>
        <line x1="80" y1="0" x2="80" y2="220"/><line x1="160" y1="0" x2="160" y2="220"/>
        <line x1="240" y1="0" x2="240" y2="220"/><line x1="320" y1="0" x2="320" y2="220"/>
      </g>
      <rect x="70" y="35" width="260" height="145" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
      <line x1="190" y1="35" x2="190" y2="180" stroke="#FFFFFF" stroke-width="1.8"/>
      <line x1="70" y1="110" x2="330" y2="110" stroke="#FFFFFF" stroke-width="1.8"/>
      <text x="200" y="202" fill="#7DD3FC" font-size="11" font-family="monospace" text-anchor="middle">AUTOCAD DXF LAYERED STRUCTURAL PLAN 12m x 8m</text>
    </svg>`,
    generateContent: () => `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
WALLS
10
0.0
20
0.0
30
0.0
11
12000.0
21
0.0
31
0.0
0
LINE
8
WALLS
10
12000.0
20
0.0
30
0.0
11
12000.0
21
8000.0
31
0.0
0
LINE
8
WALLS
10
12000.0
20
8000.0
30
0.0
11
0.0
21
8000.0
31
0.0
0
LINE
8
WALLS
10
0.0
20
8000.0
30
0.0
11
0.0
21
0.0
31
0.0
0
TEXT
8
ANNOTATIONS
10
2200.0
20
4000.0
30
0.0
40
350.0
1
DAMASCUS DIGITAL STUDIO - LICENSED CAD PLAN 12m x 8m
0
ENDSEC
0
EOF
`
  },
  {
    id: 5004,
    sku: "DDS-CAD-02",
    category: "cad",
    categoryAr: "حلول ومخططات هندسية",
    categoryEn: "Engineering & CAD Solutions",
    titleAr: "مكتبة بلوكات إنشائية وكهربائية Revit & AutoCAD",
    titleEn: "Structural & MEP BIM/CAD Block Library (150+ Elements)",
    descAr: "أكثر من 150 عنصراً هندسياً قياسياً للوحات التوزيع الكهربائية والتسليح الإنشائي لتسريع إنجاز المخططات.",
    descEn: "Over 150 standardized reinforcement and electrical panel blocks engineered to accelerate CAD workflows.",
    format: "DXF / RFA",
    fileSize: "52.4 MB",
    licenseAr: "رخصة استخدام هندسي شاملة",
    licenseEn: "Full Engineering Studio License",
    priceUsd: 30.00,
    maxDownloads: 5,
    filename: "MEP_Structural_Blocks_Library.dxf",
    previewSvg: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#102A43"/>
      <rect x="55" y="40" width="90" height="90" fill="none" stroke="#FCD34D" stroke-width="2"/>
      <circle cx="100" cy="85" r="28" fill="none" stroke="#38BDF8" stroke-width="2"/>
      <rect x="255" y="40" width="90" height="90" fill="none" stroke="#FCD34D" stroke-width="2"/>
      <line x1="255" y1="40" x2="345" y2="130" stroke="#38BDF8" stroke-width="2"/>
      <line x1="345" y1="40" x2="255" y2="130" stroke="#38BDF8" stroke-width="2"/>
      <text x="200" y="185" fill="#E2E8F0" font-size="11" font-family="monospace" text-anchor="middle">150+ PARAMETRIC CAD &amp; MEP BLOCKS</text>
    </svg>`,
    generateContent: () => `0
SECTION
2
ENTITIES
0
CIRCLE
8
MEP_BLOCKS
10
500.0
20
500.0
30
0.0
40
250.0
0
ENDSEC
0
EOF
`
  },
  {
    id: 5005,
    sku: "DDS-CARD-02",
    category: "cards",
    categoryAr: "بطاقات معايدة رقمية",
    categoryEn: "Digital Greeting Cards",
    titleAr: "باقة بطاقات تهنئة بالخط الديواني والثلث (12 تصميماً)",
    titleEn: "Arabic Calligraphy Greeting Suite — Diwani & Thuluth (12 Cards)",
    descAr: "مجموعة بطاقات معايدة للمناسبات الرسمية والأعياد بتخطيط عربي أصيل وصيغ مفتوحة المصدر.",
    descEn: "Curated suite of 12 formal and festive greeting cards featuring authentic Arabic calligraphy.",
    format: "SVG / PDF",
    fileSize: "14.8 MB",
    licenseAr: "رخصة استخدام شخصي وتجاري",
    licenseEn: "Personal & Commercial License",
    priceUsd: 8.00,
    maxDownloads: 5,
    filename: "Calligraphy_Greeting_Suite_12Pack.svg",
    previewSvg: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#3B0764"/>
      <rect x="18" y="18" width="364" height="184" fill="none" stroke="#F59E0B" stroke-width="2" rx="12"/>
      <text x="200" y="112" fill="#FDE68A" font-size="20" font-weight="bold" text-anchor="middle" font-family="Tahoma">كل عام وأنتم بخير</text>
      <text x="200" y="148" fill="#E9D5FF" font-size="11" text-anchor="middle" font-family="Arial">12 DIWANI &amp; THULUTH VECTOR CARDS</text>
    </svg>`,
    generateContent: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#3B0764"/>
  <text x="400" y="255" font-family="Tahoma" font-size="44" fill="#FDE68A" text-anchor="middle">كل عام وأنتم بخير — مرسم دمشق الرقمي</text>
</svg>`
  },
  {
    id: 5006,
    sku: "DDS-ART-02",
    category: "art",
    categoryAr: "رسوم ولوحات فنية",
    categoryEn: "Digital Art & Illustrations",
    titleAr: "مجموعة أيقونات وزخارف الأرابيسك الدمشقي (Vector)",
    titleEn: "Damascene Arabesque Geometric Ornament Kit (Vector)",
    descAr: "60 وحدة زخرفية هندسية مستوحاة من القصور الدمشقية والجامع الأموي جاهزة للتصميم الجرافيكي والليزر.",
    descEn: "60 geometric arabesque ornaments inspired by historic Damascene palaces, ready for graphic & CNC design.",
    format: "SVG / DXF",
    fileSize: "9.5 MB",
    licenseAr: "رخصة مصممين ومطابع",
    licenseEn: "Design Studio & Print Shop License",
    priceUsd: 12.00,
    maxDownloads: 5,
    filename: "Damascene_Arabesque_Vector_Kit.svg",
    previewSvg: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#1E293B"/>
      <polygon points="200,30 250,110 200,190 150,110" fill="none" stroke="#F59E0B" stroke-width="2.5"/>
      <polygon points="120,110 200,60 280,110 200,160" fill="none" stroke="#38BDF8" stroke-width="2"/>
      <text x="200" y="208" fill="#CBD5E1" font-size="10" font-family="monospace" text-anchor="middle">60 VECTOR ARABESQUE &amp; CNC PATTERNS</text>
    </svg>`,
    generateContent: () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#1E293B"/>
  <polygon points="400,100 600,400 400,700 200,400" fill="none" stroke="#F59E0B" stroke-width="6"/>
  <polygon points="100,400 400,200 700,400 400,600" fill="none" stroke="#38BDF8" stroke-width="6"/>
</svg>`
  }
];

const INITIAL_ORDERS = [
  {
    orderId: "#1001",
    customer: "سامر العلي (دمشق)",
    items: [5001],
    totalUsd: 5.00,
    method: "PayPal Sandbox",
    status: "Complete",
    date: "2026-11-08",
    referredBy: null
  },
  {
    orderId: "#1002",
    customer: "John Miller (USA)",
    items: [5003],
    totalUsd: 45.00,
    method: "PayPal Sandbox",
    status: "Complete",
    date: "2026-11-09",
    referredBy: null
  },
  {
    orderId: "#1003",
    customer: "ريم الحسن (حلب)",
    items: [5002],
    totalUsd: 12.00,
    method: "PayPal Sandbox (Coupon DAMASCUS20)",
    status: "Complete",
    date: "2026-11-10",
    referredBy: null
  },
  {
    orderId: "#1004",
    customer: "طارق مراد (اللاذقية)",
    items: [5004],
    totalUsd: 30.00,
    method: "Syrian Bank Transfer",
    status: "Pending",
    date: "2026-11-11",
    referredBy: null
  }
];

/* ---------------------------------------------------------------------------
   Persistence layer — versioned localStorage key with safe fallbacks.
   Reads are wrapped in try/catch; corrupt or missing values fall back to the
   defaults below. On file:// the same key is used (no fetch, no modules).
   ------------------------------------------------------------------------- */
const STORE_KEY = "dds_store_v2";

const DEFAULT_STATE = {
  orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
  // Per-order-line download counters: { "orderId#productId": remaining }
  downloadCounts: {},
  lang: "ar",
  currency: "USD",
  affiliate: {
    partnerName: "م. كنان الصباغ",
    trackingCode: "66a8f9b2c1",
    clicks: 0,
    conversions: 0,
    salesUsd: 0
  },
  visits: 0,
  traffic: { direct: 0, social: 0, search: 0, affiliate: 0 },
  sessionTracked: false,
  trackingCode: null,
  tickets: []
};

function loadStoreState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    const base = JSON.parse(JSON.stringify(DEFAULT_STATE));
    // Merge defensively: only accept known keys with the right type.
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.orders)) base.orders = parsed.orders;
      if (parsed.downloadCounts && typeof parsed.downloadCounts === "object") base.downloadCounts = parsed.downloadCounts;
      if (parsed.lang === "ar" || parsed.lang === "en") base.lang = parsed.lang;
      if (parsed.currency === "USD" || parsed.currency === "SYP") base.currency = parsed.currency;
      if (parsed.affiliate && typeof parsed.affiliate === "object") {
        base.affiliate.partnerName = parsed.affiliate.partnerName || base.affiliate.partnerName;
        base.affiliate.trackingCode = parsed.affiliate.trackingCode || base.affiliate.trackingCode;
        base.affiliate.clicks = Number(parsed.affiliate.clicks) || 0;
        base.affiliate.conversions = Number(parsed.affiliate.conversions) || 0;
        base.affiliate.salesUsd = Number(parsed.affiliate.salesUsd) || 0;
      }
      base.visits = Number(parsed.visits) || 0;
      if (parsed.traffic && typeof parsed.traffic === "object") {
        base.traffic.direct = Number(parsed.traffic.direct) || 0;
        base.traffic.social = Number(parsed.traffic.social) || 0;
        base.traffic.search = Number(parsed.traffic.search) || 0;
        base.traffic.affiliate = Number(parsed.traffic.affiliate) || 0;
      }
      base.sessionTracked = Boolean(parsed.sessionTracked);
      base.trackingCode = parsed.trackingCode || null;
      if (Array.isArray(parsed.tickets)) base.tickets = parsed.tickets;
    }
    return base;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveStoreState(stateObj) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(stateObj));
  } catch (e) {
    /* ignore quota/security errors on file:// */
  }
}

function resetStoreState() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch (e) { /* ignore */ }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

/** Resolve the public base URL used by all share / affiliate / canonical links. */
function getPublicBaseUrl() {
  if (STORE_CONFIG.publicBaseUrl) return STORE_CONFIG.publicBaseUrl.replace(/\/$/, "");
  try {
    const u = new URL(window.location.href);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return u.origin + u.pathname.replace(/[^/]*$/, "");
    }
  } catch (e) { /* fall through */ }
  return window.location.href.replace(/[^/]*$/, "");
}
