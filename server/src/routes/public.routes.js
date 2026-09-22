import { Router } from 'express';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSettingsMap } from '../services/settings.js';
import { sendMail } from '../services/mail.js';
import {readSettings} from '../services/integrationSettings.js';
import {normalizeBdPhone,validEmail} from '../utils/identity.js';

const r = Router();

r.get('/site-config', asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const [settings, categories, pages, shippingZones, navigation] = await Promise.all([
    getSettingsMap(),
    query('SELECT id,name,slug,icon,image FROM categories WHERE is_active=1 AND deleted_at IS NULL ORDER BY sort_order,name LIMIT 12'),
    query('SELECT slug,title FROM cms_pages WHERE is_active=1 ORDER BY title'),
    query('SELECT id,name,division,district,fee,estimated_days,free_shipping_threshold FROM shipping_zones WHERE is_active=1 ORDER BY sort_order,id'),
    query('SELECT id,label,url,location,parent_id,open_new_tab,sort_order FROM navigation_items WHERE is_active=1 ORDER BY location,sort_order,id')
  ]);
  const publicKeys = ['brand.name', 'brand.tagline', 'brand.logo', 'brand.favicon', 'theme.active', 'admin.panel_slug', 'contact.email', 'contact.phone', 'contact.address', 'contact.hours', 'footer.about', 'footer.copyright', 'social.facebook', 'social.instagram', 'social.youtube', 'social.linkedin', 'announcement.text', 'announcement.enabled', 'home.hero_badge', 'home.hero_note', 'header.search_placeholder', 'currency', 'currency.symbol', 'shipping.free_threshold', 'payment.cod', 'payment.bkash', 'payment.nagad', 'payment.rocket', 'payment.sslcommerz', 'payment.bkash.number', 'payment.bkash.instructions', 'payment.nagad.number', 'payment.nagad.instructions', 'whatsapp.enabled', 'whatsapp.number', 'whatsapp.message', 'whatsapp.position'];
  const safe = {}; for (const k of publicKeys) if (settings[k] !== undefined) safe[k] = settings[k];
  res.json({ success: true, data: { settings: safe, categories, pages, shippingZones, navigation } });
}));


r.get('/offers', asyncHandler(async (req, res) => {
  const offers = await query(`SELECT o.* FROM offers o WHERE o.is_active=1 AND (o.start_at IS NULL OR o.start_at<=NOW()) AND (o.end_at IS NULL OR o.end_at>=NOW()) ORDER BY o.sort_order,o.id DESC`);
  for (const offer of offers) {
    offer.products = await query(`SELECT p.id,p.name,p.slug,p.pack_size,p.unit_label,p.unit_price,p.strip_price,p.box_price,p.units_per_strip,p.units_per_box,p.sale_price,p.regular_price,p.discount_percent,p.rating_avg,p.review_count,p.prescription_required,(SELECT image_url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC,sort_order,id LIMIT 1) image,(SELECT COALESCE(SUM(CASE WHEN ib.expiry_date>CURDATE() THEN ib.remaining_quantity ELSE 0 END),0) FROM inventory_batches ib WHERE ib.product_id=p.id) stock FROM offer_products op JOIN products p ON p.id=op.product_id WHERE op.offer_id=? AND p.is_active=1 AND p.deleted_at IS NULL ORDER BY p.name`,[offer.id]);
  }
  res.json({success:true,data:offers});
}));

r.get('/track-order', asyncHandler(async (req, res) => {
  const orderNumber=String(req.query.orderNumber||'').trim().toUpperCase();
  const rawContact=String(req.query.contact||'').trim();
  const email=validEmail(rawContact); const phone=normalizeBdPhone(rawContact);
  if(!orderNumber||(!email&&!phone)) return res.status(400).json({success:false,message:'Tracking number plus a valid customer email or phone is required'});
  const rows = email
    ? await query(`SELECT o.id,o.order_number,o.status,o.payment_status,o.tracking_code,o.courier_name,o.created_at FROM orders o JOIN users u ON u.id=o.user_id WHERE o.order_number=? AND LOWER(u.email)=LOWER(?)`, [orderNumber,email])
    : await query(`SELECT o.id,o.order_number,o.status,o.payment_status,o.tracking_code,o.courier_name,o.created_at FROM orders o JOIN users u ON u.id=o.user_id WHERE o.order_number=? AND u.phone=?`, [orderNumber,phone]);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'Order not found' });
  const history = await query('SELECT status,note,created_at FROM order_status_history WHERE order_id=? ORDER BY id', [rows[0].id]);
  res.json({ success: true, data: { ...rows[0], history } });
}));

r.get(
  '/home',
  asyncHandler(async (req, res) => {
    // Prevent old homepage/banner data from being served from cache
    res.set({
      'Cache-Control':
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      SurrogateControl: 'no-store',
    });

    const productFields = `
      p.id,
      p.name,
      p.slug,
      p.pack_size,
      p.unit_label,
      p.unit_price,
      p.units_per_strip,
      p.strip_price,
      p.strips_per_box,
      p.units_per_box,
      p.box_price,
      p.discount_percent,
      p.regular_price,
      p.sale_price,
      p.rating_avg,
      p.review_count,
      p.prescription_required,

      b.name AS brand,

      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY
          pi.is_primary DESC,
          pi.sort_order ASC,
          pi.id ASC
        LIMIT 1
      ) AS image,

      (
        SELECT COALESCE(
          SUM(
            CASE
              WHEN ib.expiry_date > CURDATE()
              THEN ib.remaining_quantity
              ELSE 0
            END
          ),
          0
        )
        FROM inventory_batches ib
        WHERE ib.product_id = p.id
      ) AS stock
    `;

    const [
      banners,
      sections,
      categories,
      bestSellers,
      featuredProducts,
      newArrivals,
      services,
      brands,
    ] = await Promise.all([
      // IMPORTANT:
      // image and mobile_image MUST be returned to frontend
      query(`
        SELECT
          id,
          title,
          subtitle,
          content,
          button_text,
          button_url,
          image,
          mobile_image,
          position,
          sort_order,
          is_active,
          start_at AS start_date,
          end_at AS end_date
        FROM banners
        WHERE is_active = 1
        ORDER BY
          CASE
            WHEN position = 'hero' THEN 0
            WHEN position = 'prescription' THEN 1
            ELSE 2
          END,
          sort_order ASC,
          id ASC
      `),

      query(`
        SELECT
          id,
          section_key,
          title,
          subtitle,
          is_enabled,
          sort_order
        FROM homepage_sections
        WHERE is_enabled = 1
        ORDER BY sort_order ASC, id ASC
      `),

      query(`
        SELECT
          id,
          name,
          slug,
          icon,
          image,
          description,
          sort_order
        FROM categories
        WHERE
          is_active = 1
          AND deleted_at IS NULL
        ORDER BY
          is_featured DESC,
          sort_order ASC,
          id ASC
        LIMIT 12
      `),

      query(`
        SELECT
          ${productFields}
        FROM products p
        LEFT JOIN brands b
          ON b.id = p.brand_id
        WHERE
          p.is_active = 1
          AND p.deleted_at IS NULL
          AND p.is_best_seller = 1
        ORDER BY p.id DESC
        LIMIT 12
      `),

      query(`
        SELECT
          ${productFields}
        FROM products p
        LEFT JOIN brands b
          ON b.id = p.brand_id
        WHERE
          p.is_active = 1
          AND p.deleted_at IS NULL
          AND p.is_featured = 1
        ORDER BY p.id DESC
        LIMIT 12
      `),

      query(`
        SELECT
          ${productFields}
        FROM products p
        LEFT JOIN brands b
          ON b.id = p.brand_id
        WHERE
          p.is_active = 1
          AND p.deleted_at IS NULL
          AND p.is_new_arrival = 1
        ORDER BY p.id DESC
        LIMIT 12
      `),

      query(`
        SELECT
          id,
          name,
          slug,
          description,
          icon,
          image,
          price,
          sort_order
        FROM services
        WHERE is_active = 1
        ORDER BY sort_order ASC, id ASC
        LIMIT 12
      `),

      query(`
        SELECT
          id,
          name,
          slug,
          logo,
          description
        FROM brands
        WHERE
          is_active = 1
          AND deleted_at IS NULL
        ORDER BY id DESC
        LIMIT 16
      `),
    ]);

    /*
     * If your existing project already imports getSettingsMap,
     * keep this line.
     *
     * At top of public.routes.js there should be:
     *
     * import { getSettingsMap } from '../services/settings.js';
import { sendMail } from '../services/mail.js';
import {readSettings} from '../services/integrationSettings.js';
import {normalizeBdPhone,validEmail} from '../utils/identity.js';
     */
    const allSettings = await getSettingsMap();

    const publicSettingKeys = [
      'brand.name',
      'brand.tagline',
      'brand.logo',
      'brand.favicon',

      'theme.active',

      'currency',
      'currency.symbol',

      'shipping.default_fee',
      'shipping.free_threshold',

      'payment.cod',
      'payment.bkash',
      'payment.nagad',
      'payment.rocket',
      'payment.sslcommerz',

      'payment.bkash.number',
      'payment.bkash.instructions',

      'payment.nagad.number',
      'payment.nagad.instructions',

      'contact.email',
      'contact.phone',
      'contact.address',
      'contact.hours',

      'footer.about',
      'footer.copyright',

      'social.facebook',
      'social.instagram',
      'social.youtube',
      'social.linkedin',

      'announcement.enabled',
      'announcement.text',

      'header.search_placeholder',

      'home.hero_badge',
      'home.hero_note',

      'home.trust_1_title',
      'home.trust_1_text',

      'home.trust_2_title',
      'home.trust_2_text',

      'home.trust_3_title',
      'home.trust_3_text',

      'home.trust_4_title',
      'home.trust_4_text',
    ];

    const settings = {};

    for (const key of publicSettingKeys) {
      if (allSettings[key] !== undefined) {
        settings[key] = allSettings[key];
      }
    }

    res.json({
      success: true,
      message: 'Homepage loaded successfully',

      data: {
        banners,
        homepageSections: sections,
        sections,

        categories,

        bestSellers,
        best_sellers: bestSellers,

        featuredProducts,
        featured: featuredProducts,

        newArrivals,
        new_arrivals: newArrivals,

        services,
        brands,

        settings,

        // Helpful during development
        meta: {
          heroBannerCount: banners.filter(
            (banner) => banner.position === 'hero'
          ).length,
        },
      },
    });
  })
);
r.get('/services', asyncHandler(async (req, res) => res.json({ success: true, data: await query('SELECT * FROM services WHERE is_active=1 ORDER BY sort_order,id') })));
r.get('/services/:slug', asyncHandler(async (req, res) => { const x = (await query('SELECT * FROM services WHERE slug=? AND is_active=1', [req.params.slug]))[0]; if (!x) return res.status(404).json({ success: false, message: 'Service not found' }); res.json({ success: true, data: x }) }));

r.get('/pages/:slug', asyncHandler(async (req, res) => { const x = (await query('SELECT slug,title,content,seo_title,seo_description FROM cms_pages WHERE slug=? AND is_active=1', [req.params.slug]))[0]; if (!x) return res.status(404).json({ success: false, message: 'Page not found' }); res.json({ success: true, data: x }) }));

r.post('/newsletter', asyncHandler(async (req, res) => { const email = String(req.body.email || '').trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: 'Valid email required' }); await query('INSERT INTO newsletter_subscribers(email,is_active) VALUES(?,1) ON DUPLICATE KEY UPDATE is_active=1', [email]); res.status(201).json({ success: true, message: 'Subscribed successfully' }) }));

r.post('/contact', asyncHandler(async (req, res) => { const d = req.body; if (!String(d.name || '').trim() || !/^\S+@\S+\.\S+$/.test(String(d.email || '')) || !String(d.message || '').trim()) return res.status(400).json({ success: false, message: 'Name, valid email and message are required' }); const x = await query('INSERT INTO contact_messages(name,email,phone,subject,message,status) VALUES(?,?,?,?,?,?)', [String(d.name).trim(), String(d.email).trim().toLowerCase(), String(d.phone || '').trim(), String(d.subject || '').trim(), String(d.message).trim(), 'new']); void readSettings('email').then(s=>s?.sender_email?sendMail({to:s.sender_email,subject:`Website message: ${String(d.subject||'Support request')}`,text:`From: ${String(d.name).trim()} <${String(d.email).trim()}>\nPhone: ${String(d.phone||'').trim()}\n\n${String(d.message).trim()}`}):null).catch(()=>{}); res.status(201).json({ success: true, data: { id: x.insertId }, message: 'Message sent successfully' }) }));

export default r;
