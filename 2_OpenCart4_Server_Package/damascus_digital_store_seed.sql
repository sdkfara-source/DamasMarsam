-- ============================================================================
--  Damascus Digital Studio  |  مرسم دمشق الرقمي
--  OpenCart 4.0.2.3  -  demo data seed
-- ============================================================================
--
--  WHAT THIS SCRIPT DOES
--  ---------------------
--  1. Removes the OpenCart demo catalogue (iPod/iPhone demo products, the
--     Apple/HTC demo manufacturers, demo coupons and demo SEO keywords).
--  2. Creates the real store catalogue for a digital-download business:
--       3 categories, 6 downloadable products, 6 download records.
--  3. Creates the marketing feature: 5 marketing/traffic sources with click
--     counters, one affiliate customer with a 10% commission plan, and orders
--     attributed to sources so the admin Marketing report has real data.
--  4. Creates 3 customers, 4 orders in four different statuses (Complete,
--     Complete, Pending, Canceled) with order products, order totals,
--     order history, coupon usage and an affiliate commission transaction.
--  5. Rewrites the store settings (name, currency, country, checkout flow,
--     invoice prefix, free digital delivery - no shipping, no tax).
--  6. Rewrites the four default information pages with real bilingual policy
--     content (about, terms/refunds, privacy, digital delivery).
--  7. Seeds realistic report data (product views, marketing clicks,
--     statistics counters) so the admin reports are not empty.
--
--  HOW TO RUN
--  ----------
--  phpMyAdmin :  Import -> choose this file -> Go
--  CLI (Linux/macOS):
--      mysql -u USER -p DBNAME < damascus_digital_store_seed.sql
--  CLI (Windows, MariaDB/MySQL bin folder):
--      mysql.exe -u root -p DBNAME < damascus_digital_store_seed.sql
--
--  The file is safe to run more than once: every block deletes its own rows
--  first, and no INSERT uses ON DUPLICATE KEY, so a re-run can never write a
--  value onto an unrelated row.
--
--  BEFORE IMPORTING: upload the matching files to
--      system/storage/download/     (the 6 files in digital_deliverables/)
--      image/catalog/damascus/      (the 6 PNGs in image_catalog/)
--  Without those files the downloads page shows nothing and product images
--  fall back to the placeholder.
--
--  PREREQUISITE: table prefix is oc_. If your install uses another prefix,
--  replace every `oc_` below before importing.
-- ============================================================================

SET NAMES utf8mb4;
SET SESSION sql_mode = '';

-- ----------------------------------------------------------------------------
-- 1. Clear demo catalogue and demo commerce data (idempotent)
-- ----------------------------------------------------------------------------

DELETE FROM `oc_product`;
DELETE FROM `oc_product_description`;
DELETE FROM `oc_product_to_category`;
DELETE FROM `oc_product_to_store`;
DELETE FROM `oc_product_to_download`;
DELETE FROM `oc_product_to_layout`;
DELETE FROM `oc_product_image`;
DELETE FROM `oc_product_discount`;
DELETE FROM `oc_product_special`;
DELETE FROM `oc_product_reward`;
DELETE FROM `oc_product_attribute`;
DELETE FROM `oc_product_filter`;
DELETE FROM `oc_product_option`;
DELETE FROM `oc_product_option_value`;
DELETE FROM `oc_product_related`;
DELETE FROM `oc_product_report`;
DELETE FROM `oc_product_viewed`;

DELETE FROM `oc_category`;
DELETE FROM `oc_category_description`;
DELETE FROM `oc_category_path`;
DELETE FROM `oc_category_to_store`;
DELETE FROM `oc_category_to_layout`;
DELETE FROM `oc_category_filter`;

DELETE FROM `oc_manufacturer`;
DELETE FROM `oc_manufacturer_to_store`;
DELETE FROM `oc_manufacturer_to_layout`;

DELETE FROM `oc_download`;
DELETE FROM `oc_download_description`;
DELETE FROM `oc_download_report`;

DELETE FROM `oc_order`;
DELETE FROM `oc_order_product`;
DELETE FROM `oc_order_option`;
DELETE FROM `oc_order_total`;
DELETE FROM `oc_order_history`;
DELETE FROM `oc_order_voucher`;

DELETE FROM `oc_customer`;
DELETE FROM `oc_customer_affiliate`;
DELETE FROM `oc_customer_affiliate_report`;
DELETE FROM `oc_customer_history`;
DELETE FROM `oc_customer_transaction`;
DELETE FROM `oc_customer_wishlist`;
DELETE FROM `oc_customer_online`;
DELETE FROM `oc_customer_activity`;
DELETE FROM `oc_customer_search`;
DELETE FROM `oc_customer_login`;
DELETE FROM `oc_customer_ip`;
DELETE FROM `oc_customer_reward`;
DELETE FROM `oc_customer_approval`;
DELETE FROM `oc_address`;

DELETE FROM `oc_coupon`;
DELETE FROM `oc_coupon_product`;
DELETE FROM `oc_coupon_category`;
DELETE FROM `oc_coupon_history`;

DELETE FROM `oc_marketing`;
DELETE FROM `oc_marketing_report`;

DELETE FROM `oc_seo_url`;
DELETE FROM `oc_review`;
DELETE FROM `oc_statistics`;

DELETE FROM `oc_module`;
DELETE FROM `oc_layout_module`;

-- ----------------------------------------------------------------------------
-- 2. Currency: USD is the base (already id 2 in a clean install)
--    Syrian Pound is added without a hard-coded id so it can never overwrite
--    another currency row. oc_currency has no unique key on `code`, therefore
--    INSERT ... ON DUPLICATE KEY UPDATE is NOT safe here - we delete first.
-- ----------------------------------------------------------------------------

UPDATE `oc_currency`
   SET `value` = 1.00000000, `status` = 1, `decimal_place` = 2
 WHERE `code` = 'USD';

DELETE FROM `oc_currency` WHERE `code` = 'SYP';

INSERT INTO `oc_currency` (`title`, `code`, `symbol_left`, `symbol_right`, `decimal_place`, `value`, `status`, `date_modified`) VALUES
('Syrian Pound', 'SYP', '', ' ل.س', 0, 13000.00000000, 1, NOW());

-- English is the storefront language. The Arabic interface is delivered by the
-- storefront web app and by bilingual content fields below; enabling a full
-- ar-sy OpenCart language pack is documented in README_AR.md. A language row
-- without its language pack on disk breaks the catalogue, so none is added.

-- ----------------------------------------------------------------------------
-- 3. Categories
-- ----------------------------------------------------------------------------

INSERT INTO `oc_category` (`category_id`, `image`, `parent_id`, `top`, `column`, `sort_order`, `status`, `date_added`, `date_modified`) VALUES
(101, '', 0, 1, 1, 1, 1, NOW(), NOW()),
(102, '', 0, 1, 1, 2, 1, NOW(), NOW()),
(103, '', 0, 1, 1, 3, 1, NOW(), NOW());

INSERT INTO `oc_category_description` (`category_id`, `language_id`, `name`, `description`, `meta_title`, `meta_description`, `meta_keyword`) VALUES
(101, 1,
 'Greeting Cards 4K | بطاقات معايدة 4K',
 '<p>قابلة للتحميل الفوري بصيغة SVG بجودة 4K. تصميمات عربية أصيلة جاهزة للطباعة أو الإرسال الرقمي.</p><p>Instant-download 4K greeting cards in scalable SVG. Ready to print or to send digitally.</p>',
 'Greeting Cards 4K | بطاقات معايدة 4K',
 'Downloadable 4K greeting cards for Eid and New Year - Damascus Digital Studio.',
 'greeting cards, eid, new year, بطاقات معايدة, عيد'),
(102, 1,
 'Digital Art & Calligraphy | فن رقمي وخط عربي',
 '<p>أعمال فنية رقمية وحزم خط عربي بصيغة متجهية، مرخّصة للاستخدام التجاري لمشروع واحد.</p><p>Digital artwork and Arabic calligraphy vector packs, licensed for one commercial project.</p>',
 'Digital Art & Calligraphy | فن رقمي وخط عربي',
 'Digital art and Arabic calligraphy vector packs for designers.',
 'digital art, calligraphy, vector, فن رقمي, خط عربي'),
(103, 1,
 'CAD & Architecture Plans | مخططات هندسية',
 '<p>مخططات معمارية بصيغة DXF قابلة للفتح في AutoCAD و Revit، مع وحدات قياس بالمليمتر.</p><p>Architectural plans in DXF format, openable in AutoCAD and Revit, dimensioned in millimetres.</p>',
 'CAD & Architecture Plans | مخططات هندسية',
 'AutoCAD and Revit ready architectural plan downloads.',
 'cad, autocad, revit, dxf, مخططات, هندسة');

INSERT INTO `oc_category_path` (`category_id`, `path_id`, `level`) VALUES
(101, 101, 0), (102, 102, 0), (103, 103, 0);

INSERT INTO `oc_category_to_store` (`category_id`, `store_id`) VALUES
(101, 0), (102, 0), (103, 0);

-- ----------------------------------------------------------------------------
-- 4. Downloadable files (records point at system/storage/download/)
-- ----------------------------------------------------------------------------

INSERT INTO `oc_download` (`download_id`, `filename`, `mask`, `date_added`) VALUES
(601, 'Damascus_Eid_Greeting_Card_4K.svg',        'Damascus_Eid_Greeting_Card_4K.svg',        NOW()),
(602, 'Damascus_New_Year_Card_4K.svg',            'Damascus_New_Year_Card_4K.svg',            NOW()),
(603, 'Arabic_Calligraphy_Vector_Pack.svg',       'Arabic_Calligraphy_Vector_Pack.svg',       NOW()),
(604, 'Damascus_Old_City_Digital_Art.svg',        'Damascus_Old_City_Digital_Art.svg',        NOW()),
(605, 'Apartment_2D_Plan_AutoCAD.dxf',            'Apartment_2D_Plan_AutoCAD.dxf',            NOW()),
(606, 'Villa_Architecture_Plan_Revit_RVT.dxf',    'Villa_Architecture_Plan_Revit_RVT.dxf',    NOW());

INSERT INTO `oc_download_description` (`download_id`, `language_id`, `name`) VALUES
(601, 1, 'Eid Greeting Card 4K (SVG)'),
(602, 1, 'New Year Card 4K (SVG)'),
(603, 1, 'Arabic Calligraphy Vector Pack (SVG)'),
(604, 1, 'Damascus Old City Art 4K (SVG)'),
(605, 1, '2D Apartment Plan (DXF)'),
(606, 1, 'Villa Plan (DXF)');

-- ----------------------------------------------------------------------------
-- 5. Products - all virtual: shipping 0, subtract 1, tax_class 0
-- ----------------------------------------------------------------------------

INSERT INTO `oc_product`
(`product_id`, `master_id`, `model`, `sku`, `upc`, `ean`, `jan`, `isbn`, `mpn`, `location`, `quantity`, `stock_status_id`, `image`, `manufacturer_id`, `shipping`, `price`, `points`, `tax_class_id`, `date_available`, `weight`, `weight_class_id`, `length`, `width`, `height`, `length_class_id`, `subtract`, `minimum`, `rating`, `sort_order`, `status`, `date_added`, `date_modified`) VALUES
(501, 0, 'DDS-CARD-EID-01',   'DDS-CARD-EID-01',   '', '', '', '', '', '', 999, 7, 'catalog/damascus/card-eid.png',   0, 0, 12.0000, 0, 0, '2026-01-01', 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, NOW(), NOW()),
(502, 0, 'DDS-CARD-NY-02',    'DDS-CARD-NY-02',    '', '', '', '', '', '', 999, 7, 'catalog/damascus/card-ny.png',    0, 0, 10.0000, 0, 0, '2026-01-01', 0, 1, 0, 0, 0, 1, 1, 1, 0, 2, 1, NOW(), NOW()),
(503, 0, 'DDS-ART-CALLIG-03', 'DDS-ART-CALLIG-03', '', '', '', '', '', '', 999, 7, 'catalog/damascus/art-callig.png', 0, 0, 24.0000, 0, 0, '2026-01-01', 0, 1, 0, 0, 0, 1, 1, 1, 0, 3, 1, NOW(), NOW()),
(504, 0, 'DDS-ART-CITY-04',   'DDS-ART-CITY-04',   '', '', '', '', '', '', 999, 7, 'catalog/damascus/art-city.png',   0, 0, 18.0000, 0, 0, '2026-01-01', 0, 1, 0, 0, 0, 1, 1, 1, 0, 4, 1, NOW(), NOW()),
(505, 0, 'DDS-CAD-APART-05',  'DDS-CAD-APART-05',  '', '', '', '', '', '', 999, 7, 'catalog/damascus/cad-apart.png',  0, 0, 35.0000, 0, 0, '2026-01-01', 0, 1, 0, 0, 0, 1, 1, 1, 0, 5, 1, NOW(), NOW()),
(506, 0, 'DDS-CAD-VILLA-06',  'DDS-CAD-VILLA-06',  '', '', '', '', '', '', 999, 7, 'catalog/damascus/cad-villa.png',  0, 0, 55.0000, 0, 0, '2026-01-01', 0, 1, 0, 0, 0, 1, 1, 1, 0, 6, 1, NOW(), NOW());

INSERT INTO `oc_product_description` (`product_id`, `language_id`, `name`, `description`, `tag`, `meta_title`, `meta_description`, `meta_keyword`) VALUES
(501, 1,
 'Eid Greeting Card 4K | بطاقة معايدة العيد',
 '<h3>بطاقة معايدة العيد - جودة 4K</h3><p>بطاقة رقمية بتصميم دمشقي أصيل، تُسلَّم فوراً بعد الدفع. الملف متجهي (SVG) بمقاس 3840×2160 بيكسل، يمكن طباعته بأي مقاس دون فقدان الجودة أو إرساله رقمياً عبر واتساب وتيليجرام.</p><p><strong>Eid Greeting Card 4K</strong> - an instant-download digital card in scalable SVG, 3840x2160, printable at any size.</p><ul><li>ملف واحد: SVG متجهي عالي الدقة</li><li>حد التحميل: 5 مرات من صفحة «تنزيلاتي»</li><li>الترخيص: مشروع شخصي أو تجاري واحد</li></ul><p>يرجى قراءة سياسة الاستبدال للمنتجات الرقمية قبل الشراء.</p>',
 'eid, greeting card, بطاقة معايدة, عيد, 4k, svg',
 'Eid Greeting Card 4K | بطاقة معايدة العيد',
 'Instant-download 4K Eid greeting card in SVG format.',
 'eid, greeting card, بطاقة, عيد'),
(502, 1,
 'New Year Card 4K | بطاقة رأس السنة',
 '<h3>بطاقة رأس السنة - جودة 4K</h3><p>بطاقة احتفالية بتصميم سمائي أنيق، تسليم فوري بصيغة SVG بدقة 3840×2160. مناسبة للطباعة وللنشر على وسائل التواصل.</p><p><strong>Happy New Year Card 4K</strong> - instant SVG download, printable, social-media ready.</p><ul><li>ملف SVG متجهي 4K</li><li>حد التحميل: 5 مرات</li><li>الترخيص: مشروع واحد</li></ul>',
 'new year, greeting card, رأس السنة, 4k, svg',
 'New Year Card 4K | بطاقة رأس السنة',
 'Instant-download 4K New Year greeting card in SVG format.',
 'new year, card, رأس السنة'),
(503, 1,
 'Arabic Calligraphy Vector Pack | حزمة الخط العربي',
 '<h3>حزمة الخط العربي المتجهية</h3><p>حزمة تصميم للخطاطين والمصممين: مسارات متجهية قابلة للتعديل بالكامل، مستوحاة من خط الثلث والديواني والرقعة. تُستخدم في الهوية البصرية والملصقات والمنشورات.</p><p><strong>Arabic Calligraphy Vector Pack</strong> - fully editable vector paths inspired by Thuluth, Diwani and Ruqaa scripts.</p><ul><li>ملف رئيسي: SVG قابل للتعديل</li><li>حد التحميل: 5 مرات</li><li>الترخيص: استخدام تجاري لمشروع واحد، يُمنع إعادة البيع كملف مستقل</li></ul>',
 'calligraphy, vector, خط عربي, فن رقمي, svg',
 'Arabic Calligraphy Vector Pack | حزمة الخط العربي',
 'Editable Arabic calligraphy vector pack for designers.',
 'calligraphy, vector, خط عربي'),
(504, 1,
 'Damascus Old City Digital Art 4K | دمشق القديمة',
 '<h3>لوحة دمشق القديمة الرقمية</h3><p>عمل فني رقمي يجسّد أزقة دمشق القديمة وقبابها وقت الغروب، بدقة 4K. مناسب للطباعة على القماش أو للإطار الرقمي.</p><p><strong>Damascus Old City Digital Art 4K</strong> - a 4K digital artwork of the old city at sunset.</p><ul><li>ملف SVG عالي الدقة 3840×2160</li><li>حد التحميل: 5 مرات</li><li>الترخيص: مشروع واحد</li></ul>',
 'damascus, digital art, دمشق, فن رقمي, 4k',
 'Damascus Old City Digital Art 4K | دمشق القديمة',
 '4K digital artwork of the Damascus old city.',
 'damascus, art, دمشق'),
(505, 1,
 '2D Apartment Plan - AutoCAD | مخطط شقة أوتوكاد',
 '<h3>مخطط شقة سكنية - الطابق الأرضي</h3><p>مخطط معماري ثنائي الأبعاد بصيغة DXF، يُفتح مباشرة في AutoCAD وRevit. الوحدات بالمليمتر، ويشمل الجدران والفتحات وأسماء الغرف ومساحاتها.</p><p><strong>2D Apartment Plan</strong> - DXF architectural drawing, dimensioned in millimetres, opens in AutoCAD and Revit.</p><ul><li>الغرف: معيشة، غرفتا نوم، مطبخ، حمام</li><li>صيغة الملف: DXF (ASCII)</li><li>حد التحميل: 5 مرات</li><li>الترخيص: مشروع تصميم واحد</li></ul>',
 'cad, autocad, revit, dxf, مخطط, شقة, هندسة',
 '2D Apartment Plan AutoCAD DXF | مخطط شقة',
 'Downloadable 2D apartment floor plan in DXF format.',
 'cad, dxf, apartment, مخطط'),
(506, 1,
 'Villa Architecture Plan - Revit | مخطط فيلا',
 '<h3>مخطط فيلا - الطابق الأرضي</h3><p>مخطط معماري لفيلا سكنية بصيغة DXF قابلة للاستيراد إلى Revit، مع توزيع المجلس والمعيشة وغرف النوم والسلالم. الوحدات بالمليمتر.</p><p><strong>Villa Architecture Plan</strong> - DXF drawing ready to import into Revit, millimetre units.</p><ul><li>المساحة: 18×14 متر</li><li>صيغة الملف: DXF (ASCII)</li><li>حد التحميل: 5 مرات</li><li>الترخيص: مشروع تصميم واحد</li></ul>',
 'cad, revit, villa, dxf, مخطط فيلا, هندسة',
 'Villa Architecture Plan Revit DXF | مخطط فيلا',
 'Downloadable villa architecture plan in DXF format.',
 'villa, cad, revit, مخطط');

INSERT INTO `oc_product_to_category` (`product_id`, `category_id`) VALUES
(501, 101), (502, 101), (503, 102), (504, 102), (505, 103), (506, 103);

INSERT INTO `oc_product_to_store` (`product_id`, `store_id`) VALUES
(501, 0), (502, 0), (503, 0), (504, 0), (505, 0), (506, 0);

INSERT INTO `oc_product_to_download` (`product_id`, `download_id`) VALUES
(501, 601), (502, 602), (503, 603), (504, 604), (505, 605), (506, 606);

INSERT INTO `oc_product_reward` (`product_id`, `customer_group_id`, `points`) VALUES
(501, 1, 0), (502, 1, 0), (503, 1, 0), (504, 1, 0), (505, 1, 0), (506, 1, 0);

-- ----------------------------------------------------------------------------
-- 6. SEO keywords (used only when Settings > Server > SEO URL is enabled)
-- ----------------------------------------------------------------------------

INSERT INTO `oc_seo_url` (`store_id`, `language_id`, `key`, `value`, `keyword`, `sort_order`) VALUES
(0, 1, 'category_id', '101', 'greeting-cards-4k', 0),
(0, 1, 'category_id', '102', 'digital-art-calligraphy', 0),
(0, 1, 'category_id', '103', 'cad-architecture-plans', 0),
(0, 1, 'product_id', '501', 'eid-greeting-card-4k', 0),
(0, 1, 'product_id', '502', 'new-year-card-4k', 0),
(0, 1, 'product_id', '503', 'arabic-calligraphy-vector-pack', 0),
(0, 1, 'product_id', '504', 'damascus-old-city-digital-art-4k', 0),
(0, 1, 'product_id', '505', '2d-apartment-plan-autocad', 0),
(0, 1, 'product_id', '506', 'villa-architecture-plan-revit', 0);

-- ----------------------------------------------------------------------------
-- 7. Marketing sources (feeds Reports > Marketing) and affiliate programme
-- ----------------------------------------------------------------------------

INSERT INTO `oc_marketing` (`marketing_id`, `name`, `description`, `code`, `clicks`, `date_added`) VALUES
(1, 'Instagram',         'Instagram bio link and story swipe-ups',        'DDS-SOC-IG',  312, NOW()),
(2, 'Facebook',          'Facebook page and paid post boosting',          'DDS-SOC-FB',  245, NOW()),
(3, 'WhatsApp',          'WhatsApp catalogue and direct broadcast',       'DDS-SOC-WA',  418, NOW()),
(4, 'Telegram',          'Telegram channel announcements',                'DDS-SOC-TG',  126, NOW()),
(5, 'Affiliate Program', 'Affiliate partners sharing tracked links',       'DDS-AFF-1001', 48, NOW());

INSERT INTO `oc_marketing_report` (`marketing_id`, `store_id`, `ip`, `country`, `date_added`) VALUES
(1, 0, '127.0.0.1', 'SY', '2026-10-01 09:12:00'),
(1, 0, '127.0.0.1', 'SY', '2026-10-02 11:40:00'),
(2, 0, '127.0.0.1', 'SY', '2026-10-06 14:05:00'),
(2, 0, '127.0.0.1', 'AE', '2026-10-09 18:22:00'),
(3, 0, '127.0.0.1', 'SY', '2026-10-18 08:31:00'),
(3, 0, '127.0.0.1', 'SY', '2026-10-19 10:04:00'),
(4, 0, '127.0.0.1', 'SY', '2026-10-24 20:11:00'),
(5, 0, '127.0.0.1', 'SY', '2026-11-05 13:47:00'),
(5, 0, '127.0.0.1', 'DE', '2026-11-06 16:30:00');

-- ----------------------------------------------------------------------------
-- 8. Customers (password for both demo accounts: Demo12345!)
-- ----------------------------------------------------------------------------

INSERT INTO `oc_customer` (`customer_id`, `customer_group_id`, `store_id`, `language_id`, `firstname`, `lastname`, `email`, `telephone`, `password`, `custom_field`, `newsletter`, `ip`, `status`, `safe`, `token`, `code`, `date_added`) VALUES
(1, 1, 0, 1, 'Layla', 'Haddad', 'layla@example.com', '+963 11 555 0101',
 '$2y$10$teQ.v6lZuJV0i/6S665ZHOPaW5Qot149WfzcGriM/eqxA7O3C9t6i', '[]', 1, '127.0.0.1', 1, 0, '', '', '2026-09-20 10:00:00'),
(2, 1, 0, 1, 'Omar', 'Nasser', 'omar@example.com', '+963 11 555 0202',
 '$2y$10$teQ.v6lZuJV0i/6S665ZHOPaW5Qot149WfzcGriM/eqxA7O3C9t6i', '[]', 0, '127.0.0.1', 1, 0, '', '', '2026-09-28 12:30:00'),
(3, 1, 0, 1, 'Rana', 'Deeb', 'rana@example.com', '+963 11 555 0303',
 '$2y$10$nouM/jGjsNYH8CfTQt2XEu5do0GcHBGfuCylVoiFRfPSKwAg4FqHC', '[]', 1, '127.0.0.1', 1, 0, '', '', '2026-09-15 09:15:00');

INSERT INTO `oc_address` (`address_id`, `customer_id`, `firstname`, `lastname`, `company`, `address_1`, `address_2`, `city`, `postcode`, `country_id`, `zone_id`, `custom_field`, `default`) VALUES
(1, 1, 'Layla', 'Haddad', '', 'Abu Rummaneh, Al Jalaa Street 12', '', 'Damascus', '00000', 205, 3128, '[]', 1),
(2, 2, 'Omar', 'Nasser', '', 'Malki, Al Mahdi Street 4', '', 'Damascus', '00000', 205, 3128, '[]', 1),
(3, 3, 'Rana', 'Deeb', 'Rana Design Studio', 'Bab Touma, Straight Street 30', '', 'Damascus', '00000', 205, 3128, '[]', 1);

-- Affiliate account: 10% commission, tracked link code DDS-AFF-1001
INSERT INTO `oc_customer_affiliate` (`customer_id`, `company`, `website`, `tracking`, `balance`, `commission`, `tax`, `payment_method`, `cheque`, `paypal`, `bank_name`, `bank_branch_number`, `bank_swift_code`, `bank_account_name`, `bank_account_number`, `custom_field`, `status`, `date_added`) VALUES
(3, 'Rana Design Studio', 'https://example.com/rana-design', 'DDS-AFF-1001', 5.5000, 10.00, '', 'paypal', '', 'rana@example.com', '', '', '', '', '', '[]', 1, '2026-09-15 09:20:00');

INSERT INTO `oc_customer_affiliate_report` (`customer_id`, `store_id`, `ip`, `country`, `date_added`) VALUES
(3, 0, '127.0.0.1', 'SY', '2026-10-20 10:00:00'),
(3, 0, '127.0.0.1', 'SY', '2026-10-22 11:00:00'),
(3, 0, '127.0.0.1', 'SY', '2026-10-27 13:00:00'),
(3, 0, '127.0.0.1', 'DE', '2026-11-02 09:00:00');

INSERT INTO `oc_customer_transaction` (`customer_id`, `order_id`, `description`, `amount`, `date_added`) VALUES
(3, 1003, 'Affiliate commission - order #1003 (10%)', 5.5000, '2026-11-05 13:52:00');

-- ----------------------------------------------------------------------------
-- 9. Coupon - active-shopper offer, minimum basket 10 USD
-- ----------------------------------------------------------------------------

INSERT INTO `oc_coupon` (`coupon_id`, `name`, `code`, `type`, `discount`, `logged`, `shipping`, `total`, `date_start`, `date_end`, `uses_total`, `uses_customer`, `status`, `date_added`) VALUES
(10, 'Active shopper 20% | خصم المتسوقين النشطاء 20%', 'DAMASCUS20', 'P', 20.0000, 1, 0, 10.0000, '2026-01-01', '2026-12-31', 1000, 10, 1, NOW());

-- ----------------------------------------------------------------------------
-- 10. Orders (4 orders, 4 different statuses)
-- ----------------------------------------------------------------------------

INSERT INTO `oc_order`
(`order_id`, `subscription_id`, `invoice_no`, `invoice_prefix`, `transaction_id`, `store_id`, `store_name`, `store_url`, `customer_id`, `customer_group_id`, `firstname`, `lastname`, `email`, `telephone`, `custom_field`, `payment_address_id`, `payment_firstname`, `payment_lastname`, `payment_company`, `payment_address_1`, `payment_address_2`, `payment_city`, `payment_postcode`, `payment_country`, `payment_country_id`, `payment_zone`, `payment_zone_id`, `payment_address_format`, `payment_custom_field`, `payment_method`, `shipping_address_id`, `shipping_firstname`, `shipping_lastname`, `shipping_company`, `shipping_address_1`, `shipping_address_2`, `shipping_city`, `shipping_postcode`, `shipping_country`, `shipping_country_id`, `shipping_zone`, `shipping_zone_id`, `shipping_address_format`, `shipping_custom_field`, `shipping_method`, `comment`, `total`, `order_status_id`, `affiliate_id`, `commission`, `marketing_id`, `tracking`, `language_id`, `language_code`, `currency_id`, `currency_code`, `currency_value`, `ip`, `forwarded_ip`, `user_agent`, `accept_language`, `date_added`, `date_modified`) VALUES
(1001, 0, 1001, 'DDS-2026-', 'PAYPAL-SB-8F21A', 0, 'Damascus Digital Studio', 'http://127.0.0.1:8080/', 1, 1,
 'Layla', 'Haddad', 'layla@example.com', '+963 11 555 0101', '[]', 1,
 'Layla', 'Haddad', '', 'Abu Rummaneh, Al Jalaa Street 12', '', 'Damascus', '00000', 'Syrian Arab Republic', 205, 'Dimashq', 3128, '', '[]', 'PayPal',
 1, 'Layla', 'Haddad', '', 'Abu Rummaneh, Al Jalaa Street 12', '', 'Damascus', '00000', 'Syrian Arab Republic', 205, 'Dimashq', 3128, '', '[]', '', '',
 28.8000, 5, 0, 0.0000, 1, 'DDS-SOC-IG', 1, 'en-gb', 2, 'USD', 1.00000000, '127.0.0.1', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'en', '2026-10-02 12:14:00', '2026-10-02 12:15:00'),
(1002, 0, 1002, 'DDS-2026-', 'PAYPAL-SB-3K92B', 0, 'Damascus Digital Studio', 'http://127.0.0.1:8080/', 2, 1,
 'Omar', 'Nasser', 'omar@example.com', '+963 11 555 0202', '[]', 2,
 'Omar', 'Nasser', '', 'Malki, Al Mahdi Street 4', '', 'Damascus', '00000', 'Syrian Arab Republic', 205, 'Dimashq', 3128, '', '[]', 'PayPal',
 2, 'Omar', 'Nasser', '', 'Malki, Al Mahdi Street 4', '', 'Damascus', '00000', 'Syrian Arab Republic', 205, 'Dimashq', 3128, '', '[]', '', '',
 35.0000, 5, 0, 0.0000, 3, 'DDS-SOC-WA', 1, 'en-gb', 2, 'USD', 1.00000000, '127.0.0.1', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'ar', '2026-10-18 19:05:00', '2026-10-18 19:06:00'),
(1003, 0, 1003, 'DDS-2026-', '', 0, 'Damascus Digital Studio', 'http://127.0.0.1:8080/', 1, 1,
 'Layla', 'Haddad', 'layla@example.com', '+963 11 555 0101', '[]', 1,
 'Layla', 'Haddad', '', 'Abu Rummaneh, Al Jalaa Street 12', '', 'Damascus', '00000', 'Syrian Arab Republic', 205, 'Dimashq', 3128, '', '[]', 'Bank Transfer',
 1, 'Layla', 'Haddad', '', 'Abu Rummaneh, Al Jalaa Street 12', '', 'Damascus', '00000', 'Syrian Arab Republic', 205, 'Dimashq', 3128, '', '[]', '', 'Paid by bank transfer, awaiting confirmation.',
 55.0000, 1, 3, 5.5000, 5, 'DDS-AFF-1001', 1, 'en-gb', 2, 'USD', 1.00000000, '127.0.0.1', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'ar', '2026-11-05 13:47:00', '2026-11-05 13:47:00'),
(1004, 0, 1004, 'DDS-2026-', 'PAYPAL-SB-CANCEL-77', 0, 'Damascus Digital Studio', 'http://127.0.0.1:8080/', 2, 1,
 'Omar', 'Nasser', 'omar@example.com', '+963 11 555 0202', '[]', 2,
 'Omar', 'Nasser', '', 'Malki, Al Mahdi Street 4', '', 'Damascus', '00000', 'Syrian Arab Republic', 205, 'Dimashq', 3128, '', '[]', 'PayPal',
 2, 'Omar', 'Nasser', '', 'Malki, Al Mahdi Street 4', '', 'Damascus', '00000', 'Syrian Arab Republic', 205, 'Dimashq', 3128, '', '[]', '', 'Buyer cancelled in PayPal sandbox.',
 18.0000, 7, 0, 0.0000, 2, 'DDS-SOC-FB', 1, 'en-gb', 2, 'USD', 1.00000000, '127.0.0.1', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'ar', '2026-11-09 21:40:00', '2026-11-09 21:41:00');

INSERT INTO `oc_order_product` (`order_product_id`, `order_id`, `product_id`, `master_id`, `name`, `model`, `quantity`, `price`, `total`, `tax`, `reward`) VALUES
(1, 1001, 501, 0, 'Eid Greeting Card 4K | بطاقة معايدة العيد', 'DDS-CARD-EID-01', 1, 12.0000, 12.0000, 0.0000, 0),
(2, 1001, 503, 0, 'Arabic Calligraphy Vector Pack | حزمة الخط العربي', 'DDS-ART-CALLIG-03', 1, 24.0000, 24.0000, 0.0000, 0),
(3, 1002, 505, 0, '2D Apartment Plan - AutoCAD | مخطط شقة أوتوكاد', 'DDS-CAD-APART-05', 1, 35.0000, 35.0000, 0.0000, 0),
(4, 1003, 506, 0, 'Villa Architecture Plan - Revit | مخطط فيلا', 'DDS-CAD-VILLA-06', 1, 55.0000, 55.0000, 0.0000, 0),
(5, 1004, 504, 0, 'Damascus Old City Digital Art 4K | دمشق القديمة', 'DDS-ART-CITY-04', 1, 18.0000, 18.0000, 0.0000, 0);

INSERT INTO `oc_order_total` (`order_id`, `extension`, `code`, `title`, `value`, `sort_order`) VALUES
(1001, 'opencart', 'sub_total', 'Sub-Total', 36.0000, 1),
(1001, 'opencart', 'coupon', 'Coupon (DAMASCUS20)', -7.2000, 2),
(1001, 'opencart', 'total', 'Total', 28.8000, 9),
(1002, 'opencart', 'sub_total', 'Sub-Total', 35.0000, 1),
(1002, 'opencart', 'total', 'Total', 35.0000, 9),
(1003, 'opencart', 'sub_total', 'Sub-Total', 55.0000, 1),
(1003, 'opencart', 'total', 'Total', 55.0000, 9),
(1004, 'opencart', 'sub_total', 'Sub-Total', 18.0000, 1),
(1004, 'opencart', 'total', 'Total', 18.0000, 9);

INSERT INTO `oc_order_history` (`order_id`, `order_status_id`, `notify`, `comment`, `date_added`) VALUES
(1001, 1, 1, 'Order created, awaiting PayPal confirmation.', '2026-10-02 12:14:00'),
(1001, 5, 1, 'PayPal sandbox payment approved. Download unlocked.', '2026-10-02 12:15:00'),
(1002, 1, 1, 'Order created, awaiting PayPal confirmation.', '2026-10-18 19:05:00'),
(1002, 5, 1, 'PayPal sandbox payment approved. Download unlocked.', '2026-10-18 19:06:00'),
(1003, 1, 1, 'Order created. Bank transfer receipt pending.', '2026-11-05 13:47:00'),
(1004, 1, 1, 'Order created, awaiting PayPal confirmation.', '2026-11-09 21:40:00'),
(1004, 7, 1, 'Buyer cancelled the payment in PayPal sandbox.', '2026-11-09 21:41:00');

INSERT INTO `oc_coupon_history` (`coupon_id`, `order_id`, `customer_id`, `amount`, `date_added`) VALUES
(10, 1001, 1, 7.2000, '2026-10-02 12:15:00');

-- ----------------------------------------------------------------------------
-- 11. Report data (product views + statistics counters)
-- ----------------------------------------------------------------------------

INSERT INTO `oc_product_viewed` (`product_id`, `viewed`) VALUES
(501, 132), (502, 88), (503, 96), (504, 74), (505, 61), (506, 47);

INSERT INTO `oc_statistics` (`code`, `value`) VALUES
('order_sale', 4.0000),
('order_processing', 1.0000),
('order_complete', 2.0000),
('order_other', 2.0000),
('returns', 0.0000),
('product', 4.0000),
('review', 0.0000);

-- ----------------------------------------------------------------------------
-- 12. Store settings
-- ----------------------------------------------------------------------------

DELETE FROM `oc_setting` WHERE `store_id` = 0 AND `code` = 'config' AND `key` IN (
 'config_name','config_owner','config_address','config_email','config_telephone',
 'config_meta_title','config_meta_description','config_country_id','config_zone_id',
 'config_language','config_currency','config_currency_auto','config_complete_status',
 'config_order_status_id','config_customer_group_id','config_account_id','config_checkout_id',
 'config_invoice_prefix','config_stock_checkout','config_stock_display','config_stock_warning',
 'config_tax','config_cart_weight','config_seo_url','config_maintenance','config_file_max_size'
);

INSERT INTO `oc_setting` (`store_id`, `code`, `key`, `value`, `serialized`) VALUES
(0, 'config', 'config_name',              'Damascus Digital Studio | مرسم دمشق الرقمي', 0),
(0, 'config', 'config_owner',             'SVU-F25 CM Team', 0),
(0, 'config', 'config_address',           'Damascus, Syrian Arab Republic', 0),
(0, 'config', 'config_email',             'orders@damascus-digital.local', 0),
(0, 'config', 'config_telephone',         '+963 11 555 0100', 0),
(0, 'config', 'config_meta_title',        'Damascus Digital Studio - Digital Downloads', 0),
(0, 'config', 'config_meta_description',  'Downloadable 4K greeting cards, Arabic calligraphy and CAD plans. | بطاقات معايدة وحزم خط عربي ومخططات هندسية قابلة للتحميل الفوري.', 0),
(0, 'config', 'config_country_id',        '205', 0),
(0, 'config', 'config_zone_id',           '3128', 0),
(0, 'config', 'config_language',          'en-gb', 0),
(0, 'config', 'config_currency',          'USD', 0),
(0, 'config', 'config_currency_auto',     '0', 0),
(0, 'config', 'config_complete_status',   '["5"]', 1),
(0, 'config', 'config_order_status_id',   '1', 0),
(0, 'config', 'config_customer_group_id', '1', 0),
(0, 'config', 'config_account_id',        '3', 0),
(0, 'config', 'config_checkout_id',       '2', 0),
(0, 'config', 'config_invoice_prefix',    'DDS-2026-', 0),
(0, 'config', 'config_stock_checkout',    '0', 0),
(0, 'config', 'config_stock_display',     '0', 0),
(0, 'config', 'config_stock_warning',     '0', 0),
(0, 'config', 'config_tax',               '0', 0),
(0, 'config', 'config_cart_weight',       '0', 0),
(0, 'config', 'config_seo_url',           '0', 0),
(0, 'config', 'config_maintenance',       '0', 0),
(0, 'config', 'config_file_max_size',     '300000', 0);

-- ----------------------------------------------------------------------------
-- 13. Homepage modules
-- ----------------------------------------------------------------------------

INSERT INTO `oc_module` (`module_id`, `name`, `code`, `setting`) VALUES
(1, 'Damascus Homepage Showcase', 'opencart.banner',
 '{"name":"Damascus Homepage Showcase","banner_id":"7","effect":"slide","items":"1","controls":"1","indicators":"1","interval":"5000","width":"1140","height":"380","status":"1"}'),
(2, 'Damascus Featured Downloads', 'opencart.featured',
 '{"name":"Damascus Featured Downloads","product":["501","502","503","504","505","506"],"axis":"horizontal","limit":"6","width":"260","height":"200","status":"1"}');

INSERT INTO `oc_layout_module` (`layout_id`, `code`, `position`, `sort_order`) VALUES
(1, 'opencart.banner.1',   'content_top', 1),
(1, 'opencart.featured.2', 'content_top', 2);

-- ----------------------------------------------------------------------------
-- 14. Information pages: real bilingual policy content
-- ----------------------------------------------------------------------------

UPDATE `oc_information_description` SET
 `title` = 'About Us | من نحن',
 `description` = '<h2>مرسم دمشق الرقمي</h2><p>متجر متخصص ببيع المنتجات الرقمية القابلة للتحميل الفوري: بطاقات معايدة بدقة 4K، أعمال فنية وحزم خط عربي متجهية، ومخططات هندسية جاهزة لـ AutoCAD و Revit. نخدم السوق السورية والأسواق العالمية، وكل المنتجات تُسلَّم إلكترونياً دون شحن.</p><h2>Damascus Digital Studio</h2><p>We sell instantly downloadable digital goods: 4K greeting cards, Arabic calligraphy vector packs and CAD/architecture plans. Every product is delivered electronically - there is no shipping.</p>'
WHERE `information_id` = 1 AND `language_id` = 1;

UPDATE `oc_information_description` SET
 `title` = 'Terms & Conditions | الشروط وسياسة الاستبدال',
 `description` = '<h2>سياسة المنتجات الرقمية</h2><p>جميع المنتجات رقمية وتُسلَّم فور إتمام الدفع عبر رابط تحميل في صفحة «تنزيلاتي». لأن المنتج يُسلَّم فوراً، لا يوجد حق استرجاع بعد نجاح التحميل، باستثناء:</p><ul><li>ملف تالف أو غير قابل للفتح - يُستبدل بملف سليم.</li><li>عدم تطابق الملف مع وصف المنتج - يُستبدل أو يُرد كامل المبلغ.</li><li>عدم إتمام التحميل خلال 7 أيام بسبب خطأ في المتجر - يُرد كامل المبلغ.</li></ul><p>حد التحميل 5 مرات لكل منتج ولكل طلب. لطلب المساعدة راسلنا خلال 48 ساعة من الشراء.</p><h2>Refund policy (English)</h2><p>Digital goods are delivered immediately. Because delivery is instant, refunds are not available once a file has been downloaded, except for a corrupt file, a file that does not match its description, or a store-side delivery failure. Each order line allows 5 downloads.</p>'
WHERE `information_id` = 2 AND `language_id` = 1;

UPDATE `oc_information_description` SET
 `title` = 'Privacy Policy | سياسة الخصوصية',
 `description` = '<h2>سياسة الخصوصية</h2><p>نجمع فقط البيانات اللازمة لإتمام الطلب: الاسم، البريد الإلكتروني، رقم الهاتف، وسجل الطلبات. لا نحتفظ ببيانات بطاقتك - الدفع يتم عبر PayPal. لا نبيع بياناتك لأي طرف ثالث.</p><h2>Privacy</h2><p>We store only the data required to fulfil an order. Card data is never stored; payment is processed by PayPal. We do not sell customer data.</p>'
WHERE `information_id` = 3 AND `language_id` = 1;

UPDATE `oc_information_description` SET
 `title` = 'Digital Delivery | التسليم الرقمي',
 `description` = '<h2>كيف يصلك المنتج؟</h2><ol><li>أضف المنتج إلى السلة وأتمم الدفع.</li><li>عند اكتمال الدفع يُفتح رابط التحميل مباشرة في صفحة تأكيد الطلب.</li><li>يمكنك العودة إلى «حسابي ← تنزيلاتي» في أي وقت للتحميل مجدداً (حتى 5 مرات).</li><li>الملفات متجهية أو DXF، تعمل على أي جهاز دون برامج خاصة باستثناء مخططات CAD التي تحتاج AutoCAD أو Revit.</li></ol><h2>How digital delivery works</h2><p>After a completed payment the download link appears on the order confirmation page and stays available under Account &gt; Downloads for up to 5 downloads per order line. There is no shipping cost and no waiting time.</p>'
WHERE `information_id` = 4 AND `language_id` = 1;

-- ----------------------------------------------------------------------------
-- 15. Verification queries (optional - run manually)
-- ----------------------------------------------------------------------------
-- SELECT COUNT(*) AS products FROM oc_product;
-- SELECT COUNT(*) AS downloads FROM oc_download;
-- SELECT order_id, order_status_id, total, payment_method FROM oc_order;
-- SELECT `key`, `value` FROM oc_setting WHERE `key` IN ('config_name','config_currency','config_telephone');
-- SELECT name, code, clicks FROM oc_marketing;
