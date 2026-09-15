import { Router } from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { query, pool } from '../../config/db.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { productUpload, mediaUpload } from '../../middleware/upload.js';
import { sanitizeRichHtml } from '../../utils/richText.js';
import { slugify } from '../../utils/slug.js';
import { audit } from '../../utils/audit.js';
import { requirePermission } from '../../middleware/admin.js';

const r = Router();
const bool = v => v === true || v === 1 || v === '1' || v === 'true' || v === 'on';
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;

async function uniqueSlug(table, value, excludeId = null) {
  const base = slugify(value); let candidate = base, n = 2;
  while (true) {
    const row = (await query(`SELECT id FROM ${table} WHERE slug=?${excludeId ? ' AND id<>?' : ''} LIMIT 1`, excludeId ? [candidate, excludeId] : [candidate]))[0];
    if (!row) return candidate;
    candidate = `${base}-${n++}`;
  }
}

function productData(d) {
  return {
    name: String(d.name || '').trim(), slug: String(d.slug || '').trim(), sku: String(d.sku || '').trim(), barcode: String(d.barcode || '').trim() || null,
    genericName: String(d.genericName ?? d.generic_name ?? '').trim() || null, brandId: d.brandId ?? d.brand_id ?? null, manufacturerId: d.manufacturerId ?? d.manufacturer_id ?? null, categoryId: d.categoryId ?? d.category_id ?? null,
    productType: String(d.productType ?? d.product_type ?? '').trim() || null, dosageForm: String(d.dosageForm ?? d.dosage_form ?? '').trim() || null, strength: String(d.strength || '').trim() || null, packSize: String(d.packSize ?? d.pack_size ?? '').trim() || null, unitLabel: String(d.unitLabel ?? d.unit_label ?? 'Unit').trim() || 'Unit', unitPrice: num(d.unitPrice ?? d.unit_price), unitsPerStrip: Math.max(1, Math.round(num(d.unitsPerStrip ?? d.units_per_strip, 1))), stripPrice: num(d.stripPrice ?? d.strip_price), stripsPerBox: Math.max(1, Math.round(num(d.stripsPerBox ?? d.strips_per_box, 1))), unitsPerBox: Math.max(1, Math.round(num(d.unitsPerBox ?? d.units_per_box, 1))), boxPrice: num(d.boxPrice ?? d.box_price), discountPercent: Math.max(0, Math.min(100, num(d.discountPercent ?? d.discount_percent, 20))),
    shortDescription: sanitizeRichHtml(d.shortDescription ?? d.short_description ?? ''), description: sanitizeRichHtml(d.description || ''), ingredients: sanitizeRichHtml(d.ingredients || ''), usageInfo: sanitizeRichHtml(d.usageInfo ?? d.usage_info ?? ''), warnings: sanitizeRichHtml(d.warnings || ''), storageInfo: sanitizeRichHtml(d.storageInfo ?? d.storage_info ?? ''),
    regularPrice: num(d.regularPrice ?? d.regular_price), salePrice: num(d.salePrice ?? d.sale_price), costPrice: num(d.costPrice ?? d.cost_price), taxRate: num(d.taxRate ?? d.tax_rate), lowStockThreshold: Math.max(0, Math.round(num(d.lowStockThreshold ?? d.low_stock_threshold, 10))),
    prescriptionRequired: bool(d.prescriptionRequired ?? d.prescription_required), featured: bool(d.featured ?? d.is_featured), bestSeller: bool(d.bestSeller ?? d.is_best_seller), newArrival: bool(d.newArrival ?? d.is_new_arrival), active: d.active === undefined ? bool(d.is_active ?? true) : bool(d.active),
    seoTitle: String(d.seoTitle ?? d.seo_title ?? '').trim() || null, seoDescription: String(d.seoDescription ?? d.seo_description ?? '').trim() || null
  };
}

async function insertProduct(conn, d) {
  if (!d.name) throw Object.assign(new Error('Product name is required'), { status: 400 });
  if (!d.salePrice && d.regularPrice > 0) d.salePrice = Number((d.regularPrice * (1 - d.discountPercent / 100)).toFixed(2)); const medicineLike = String(d.productType || '').toLowerCase().includes('medicine'); if (!d.stripPrice) d.stripPrice = d.salePrice; if (!d.unitPrice) d.unitPrice = medicineLike ? Number((d.stripPrice / Math.max(1, d.unitsPerStrip)).toFixed(2)) : d.salePrice; if (!d.unitsPerBox) d.unitsPerBox = d.unitsPerStrip * d.stripsPerBox; if (!d.boxPrice) d.boxPrice = medicineLike ? Number((d.stripPrice * d.stripsPerBox).toFixed(2)) : d.salePrice; if (d.regularPrice < 0 || d.salePrice < 0 || d.costPrice < 0 || d.unitPrice < 0 || d.stripPrice < 0 || d.boxPrice < 0) throw Object.assign(new Error('Prices cannot be negative'), { status: 400 });
  d.slug = await uniqueSlug('products', d.slug || d.name);
  if (!d.sku) d.sku = `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const [x] = await conn.execute(`INSERT INTO products(name,slug,sku,barcode,generic_name,brand_id,manufacturer_id,category_id,product_type,dosage_form,strength,pack_size,unit_label,unit_price,units_per_strip,strip_price,strips_per_box,units_per_box,box_price,discount_percent,short_description,description,ingredients,usage_info,warnings,storage_info,regular_price,sale_price,cost_price,tax_rate,prescription_required,is_featured,is_best_seller,is_new_arrival,is_active,low_stock_threshold,seo_title,seo_description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    d.name, d.slug, d.sku, d.barcode, d.genericName, d.brandId || null, d.manufacturerId || null, d.categoryId || null, d.productType, d.dosageForm, d.strength, d.packSize, d.unitLabel, d.unitPrice, d.unitsPerStrip, d.stripPrice, d.stripsPerBox, d.unitsPerBox, d.boxPrice, d.discountPercent, d.shortDescription, d.description, d.ingredients, d.usageInfo, d.warnings, d.storageInfo, d.regularPrice, d.salePrice, d.costPrice, d.taxRate, d.prescriptionRequired ? 1 : 0, d.featured ? 1 : 0, d.bestSeller ? 1 : 0, d.newArrival ? 1 : 0, d.active ? 1 : 0, d.lowStockThreshold, d.seoTitle, d.seoDescription
  ]);
  return x.insertId;
}

r.get('/products', requirePermission('products.view'), asyncHandler(async (req, res) => {
  let { page = 1, limit = 30, q = '', status = '' } = req.query; page = Math.max(1, +page || 1); limit = Math.min(100, Math.max(1, +limit || 30));
  const where = ['p.deleted_at IS NULL'], p = []; if (q) { where.push('(p.name LIKE ? OR p.sku LIKE ? OR p.slug LIKE ? OR p.generic_name LIKE ?)'); p.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`) } if (status === 'active') where.push('p.is_active=1'); if (status === 'inactive') where.push('p.is_active=0');
  const from = ` FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN brands b ON b.id=p.brand_id WHERE ${where.join(' AND ')}`;
  const total = (await query(`SELECT COUNT(*) total${from}`, p))[0].total;
  const rows = await query(`SELECT p.id,p.name,p.slug,p.sku,p.generic_name,p.sale_price,p.regular_price,p.discount_percent,p.unit_price,p.strip_price,p.box_price,p.units_per_strip,p.units_per_box,p.is_active,p.prescription_required,p.is_featured,p.is_best_seller,p.is_new_arrival,c.name category,b.name brand,(SELECT image_url FROM product_images pi WHERE pi.product_id=p.id ORDER BY is_primary DESC,sort_order,id LIMIT 1) image,(SELECT COALESCE(SUM(CASE WHEN ib.expiry_date>CURDATE() THEN ib.remaining_quantity ELSE 0 END),0) FROM inventory_batches ib WHERE ib.product_id=p.id) stock${from} ORDER BY p.id DESC LIMIT ? OFFSET ?`, [...p, limit, (page - 1) * limit]);
  res.json({ success: true, data: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

r.get('/products/:id', requirePermission('products.view'), asyncHandler(async (req, res) => {
  const p = (await query('SELECT * FROM products WHERE id=? AND deleted_at IS NULL', [req.params.id]))[0];
  if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
  p.images = await query('SELECT * FROM product_images WHERE product_id=? ORDER BY is_primary DESC,sort_order,id', [p.id]);
  p.batches = await query('SELECT ib.*,s.name supplier_name FROM inventory_batches ib LEFT JOIN suppliers s ON s.id=ib.supplier_id WHERE ib.product_id=? ORDER BY expiry_date ASC', [p.id]);
  res.json({ success: true, data: p });
}));

r.post('/products', requirePermission('products.create'), asyncHandler(async (req, res) => {
  const d = productData(req.body); const conn = await pool.getConnection();
  try { await conn.beginTransaction(); const id = await insertProduct(conn, d); await conn.commit(); await audit(req, 'create', 'product', id, null, d); res.status(201).json({ success: true, data: { id, slug: d.slug } }) } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
}));

r.patch('/products/:id', requirePermission('products.update'), asyncHandler(async (req, res) => {
  const old = (await query('SELECT * FROM products WHERE id=? AND deleted_at IS NULL', [req.params.id]))[0]; if (!old) return res.status(404).json({ success: false, message: 'Product not found' });
  const d = productData({ ...old, ...req.body }); d.slug = await uniqueSlug('products', d.slug || d.name, req.params.id);
  await query(`UPDATE products SET name=?,slug=?,sku=?,barcode=?,generic_name=?,brand_id=?,manufacturer_id=?,category_id=?,product_type=?,dosage_form=?,strength=?,pack_size=?,unit_label=?,unit_price=?,units_per_strip=?,strip_price=?,strips_per_box=?,units_per_box=?,box_price=?,discount_percent=?,short_description=?,description=?,ingredients=?,usage_info=?,warnings=?,storage_info=?,regular_price=?,sale_price=?,cost_price=?,tax_rate=?,prescription_required=?,is_featured=?,is_best_seller=?,is_new_arrival=?,is_active=?,low_stock_threshold=?,seo_title=?,seo_description=?,updated_at=NOW() WHERE id=?`, [
    d.name, d.slug, d.sku, d.barcode, d.genericName, d.brandId || null, d.manufacturerId || null, d.categoryId || null, d.productType, d.dosageForm, d.strength, d.packSize, d.unitLabel, d.unitPrice, d.unitsPerStrip, d.stripPrice, d.stripsPerBox, d.unitsPerBox, d.boxPrice, d.discountPercent, d.shortDescription, d.description, d.ingredients, d.usageInfo, d.warnings, d.storageInfo, d.regularPrice, d.salePrice, d.costPrice, d.taxRate, d.prescriptionRequired ? 1 : 0, d.featured ? 1 : 0, d.bestSeller ? 1 : 0, d.newArrival ? 1 : 0, d.active ? 1 : 0, d.lowStockThreshold, d.seoTitle, d.seoDescription, req.params.id
  ]);
  await audit(req, 'update', 'product', req.params.id, old, d); res.json({ success: true, data: { id: +req.params.id, slug: d.slug } });
}));

r.delete('/products/:id', requirePermission('products.delete'), asyncHandler(async (req, res) => { const old = (await query('SELECT id,name,slug FROM products WHERE id=?', [req.params.id]))[0]; if (!old) return res.status(404).json({ success: false, message: 'Product not found' }); await query('UPDATE products SET deleted_at=NOW(),is_active=0 WHERE id=?', [req.params.id]); await audit(req, 'delete', 'product', req.params.id, old, null); res.json({ success: true, message: 'Product archived' }) }));

r.post('/products/import-json', requirePermission('products.create'), asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : Array.isArray(req.body.products) ? req.body.products : [req.body.product || req.body];
  if (!list.length || list.length > 100) return res.status(400).json({ success: false, message: 'Provide 1 to 100 products' });
  const conn = await pool.getConnection(); const created = [];
  try { await conn.beginTransaction(); for (const raw of list) { const d = productData(raw); const id = await insertProduct(conn, d); created.push({ id, slug: d.slug, name: d.name }); if (Array.isArray(raw.images)) { let n = 0, primaryAssigned = false; for (const entry of raw.images.slice(0, 12)) { const url = typeof entry === 'string' ? entry : entry?.url; if (typeof url === 'string' && /^(https?:\/\/|\/uploads\/)/.test(url)) { const wantsPrimary = typeof entry === 'object' ? bool(entry.isPrimary) : n === 0; const primary = !primaryAssigned && wantsPrimary; if (primary) primaryAssigned = true; await conn.execute('INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) VALUES(?,?,?,?,?)', [id, url, (typeof entry === 'object' && entry.altText) || d.name, primary ? 1 : 0, n++]); } } if (n > 0 && !primaryAssigned) await conn.execute('UPDATE product_images SET is_primary=1 WHERE product_id=? ORDER BY sort_order,id LIMIT 1', [id]); } if (Array.isArray(raw.batches)) { for (const batch of raw.batches.slice(0, 50)) { const quantity = Math.round(num(batch.quantity)); if (quantity <= 0) throw Object.assign(new Error(`Batch quantity must be positive for ${d.name}`), { status: 400 }); if (!batch.expiryDate && !batch.expiry_date) throw Object.assign(new Error(`Batch expiryDate is required for ${d.name}`), { status: 400 }); await conn.execute('INSERT INTO inventory_batches(product_id,supplier_id,batch_number,manufacturing_date,expiry_date,purchase_price,selling_price,quantity,remaining_quantity) VALUES(?,?,?,?,?,?,?,?,?)', [id, batch.supplierId || batch.supplier_id || null, String(batch.batchNumber || batch.batch_number || `JSON-${id}-${Date.now()}`), batch.manufacturingDate || batch.manufacturing_date || null, batch.expiryDate || batch.expiry_date, num(batch.purchasePrice ?? batch.purchase_price), batch.sellingPrice === undefined && batch.selling_price === undefined ? null : num(batch.sellingPrice ?? batch.selling_price), quantity, quantity]); } } } await conn.commit(); for (const x of created) await audit(req, 'json_import', 'product', x.id, null, x); res.status(201).json({ success: true, data: created, message: `${created.length} product(s) imported` }) } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
}));

async function optimize(file, folder = 'products') {
  const out = file.path.replace(/(\.[^.]+)$/, '-optimized.webp');
  await sharp(file.path).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toFile(out);
  await fs.unlink(file.path).catch(() => { });
  return `/uploads/${folder}/${path.basename(out)}`;
}

r.post('/products/:id/images', requirePermission('products.update'), productUpload.fields([{ name: 'cover', maxCount: 1 }, { name: 'images', maxCount: 12 }]), asyncHandler(async (req, res) => {
  const exists = (await query('SELECT id FROM products WHERE id=? AND deleted_at IS NULL', [req.params.id]))[0]; if (!exists) return res.status(404).json({ success: false, message: 'Product not found' });
  const made = []; const cover = req.files?.cover?.[0]; const extras = req.files?.images || [];
  const coverUrl = String(req.body.coverUrl || '').trim();
  let imageUrls = [];
  try { imageUrls = JSON.parse(req.body.imageUrls || '[]') } catch { return res.status(400).json({ success: false, message: 'Invalid image URL list' }) }
  if (!Array.isArray(imageUrls) || imageUrls.some(url => typeof url !== 'string' || !/^https?:\/\//i.test(url.trim()))) return res.status(400).json({ success: false, message: 'Image URLs must begin with http:// or https://' });
  if (coverUrl && !/^https?:\/\//i.test(coverUrl)) return res.status(400).json({ success: false, message: 'Cover image URL must begin with http:// or https://' });
  if (!cover && !extras.length && !coverUrl && !imageUrls.length) return res.status(400).json({ success: false, message: 'Choose at least one image' });
  if (cover || coverUrl) { const url = cover ? await optimize(cover) : coverUrl; await query('UPDATE product_images SET is_primary=0 WHERE product_id=?', [req.params.id]); const x = await query('INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) VALUES(?,?,?,?,?)', [req.params.id, url, req.body.altText || '', 1, 0]); made.push({ id: x.insertId, image_url: url, is_primary: 1 }) }
  const start = (await query('SELECT COALESCE(MAX(sort_order),0) n FROM product_images WHERE product_id=?', [req.params.id]))[0].n;
  const hasPrimary = (await query('SELECT id FROM product_images WHERE product_id=? AND is_primary=1 LIMIT 1', [req.params.id]))[0];
  for (let i = 0; i < extras.length; i++) { const url = await optimize(extras[i]); const primary = !hasPrimary && !cover && !coverUrl && !i; const x = await query('INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) VALUES(?,?,?,?,?)', [req.params.id, url, req.body.altText || '', primary ? 1 : 0, start + i + 1]); made.push({ id: x.insertId, image_url: url, is_primary: primary ? 1 : 0 }) }
  const urlStart = start + extras.length + 1; for (let i = 0; i < imageUrls.length; i++) { const url = imageUrls[i].trim(); const primary = !hasPrimary && !cover && !coverUrl && !extras.length && !i; const x = await query('INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) VALUES(?,?,?,?,?)', [req.params.id, url, req.body.altText || '', primary ? 1 : 0, urlStart + i]); made.push({ id: x.insertId, image_url: url, is_primary: primary ? 1 : 0 }) }
  await audit(req, 'upload_images', 'product', req.params.id, null, { count: made.length }); res.status(201).json({ success: true, data: made });
}));

r.patch('/products/:id/images/:imageId', requirePermission('products.update'), asyncHandler(async (req, res) => { const image = (await query('SELECT * FROM product_images WHERE id=? AND product_id=?', [req.params.imageId, req.params.id]))[0]; if (!image) return res.status(404).json({ success: false, message: 'Image not found' }); if (bool(req.body.isPrimary)) { await query('UPDATE product_images SET is_primary=0 WHERE product_id=?', [req.params.id]); await query('UPDATE product_images SET is_primary=1 WHERE id=?', [image.id]) } if (req.body.sortOrder !== undefined) await query('UPDATE product_images SET sort_order=? WHERE id=?', [num(req.body.sortOrder), image.id]); if (req.body.altText !== undefined) await query('UPDATE product_images SET alt_text=? WHERE id=?', [String(req.body.altText), image.id]); res.json({ success: true }) }));

r.delete('/products/:id/images/:imageId', requirePermission('products.update'), asyncHandler(async (req, res) => { const image = (await query('SELECT * FROM product_images WHERE id=? AND product_id=?', [req.params.imageId, req.params.id]))[0]; if (!image) return res.status(404).json({ success: false, message: 'Image not found' }); await query('DELETE FROM product_images WHERE id=?', [image.id]); if (image.is_primary) { const next = (await query('SELECT id FROM product_images WHERE product_id=? ORDER BY sort_order,id LIMIT 1', [req.params.id]))[0]; if (next) await query('UPDATE product_images SET is_primary=1 WHERE id=?', [next.id]) } res.json({ success: true }) }));

async function saveMedia(file) { if (!file) return null; const out = file.path.replace(/(\.[^.]+)$/, '-optimized.webp'); await sharp(file.path).rotate().resize({ width: 1800, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toFile(out); await fs.unlink(file.path).catch(() => { }); return '/uploads/media/' + path.basename(out) }

r.get('/categories', requirePermission('products.view'), asyncHandler(async (req, res) => res.json({ success: true, data: await query('SELECT c.*,p.name parent_name FROM categories c LEFT JOIN categories p ON p.id=c.parent_id WHERE c.deleted_at IS NULL ORDER BY c.sort_order,c.name') })));
r.post('/categories', requirePermission('products.create'), mediaUpload.single('image'), asyncHandler(async (req, res) => { const slug = await uniqueSlug('categories', req.body.slug || req.body.name); const image = await saveMedia(req.file); const x = await query('INSERT INTO categories(parent_id,name,slug,description,icon,image,sort_order,is_featured,is_active) VALUES(?,?,?,?,?,?,?,?,?)', [req.body.parentId || null, req.body.name, slug, sanitizeRichHtml(req.body.description || ''), req.body.icon || 'Pill', image, +req.body.sortOrder || 0, bool(req.body.featured) ? 1 : 0, req.body.active === undefined ? 1 : (bool(req.body.active) ? 1 : 0)]); await audit(req, 'create', 'category', x.insertId, null, req.body); res.status(201).json({ success: true, data: { id: x.insertId } }) }));
r.patch('/categories/:id', requirePermission('products.update'), mediaUpload.single('image'), asyncHandler(async (req, res) => { const old = (await query('SELECT * FROM categories WHERE id=?', [req.params.id]))[0]; if (!old) return res.status(404).json({ success: false, message: 'Category not found' }); const slug = await uniqueSlug('categories', req.body.slug || old.slug || req.body.name || old.name, req.params.id); const image = req.file ? await saveMedia(req.file) : (req.body.image ?? old.image); await query('UPDATE categories SET parent_id=?,name=?,slug=?,description=?,icon=?,image=?,sort_order=?,is_featured=?,is_active=? WHERE id=?', [req.body.parentId || null, req.body.name ?? old.name, slug, sanitizeRichHtml(req.body.description ?? old.description ?? ''), req.body.icon ?? old.icon, image, num(req.body.sortOrder ?? old.sort_order), bool(req.body.featured ?? old.is_featured) ? 1 : 0, bool(req.body.active ?? old.is_active) ? 1 : 0, req.params.id]); await audit(req, 'update', 'category', req.params.id, old, req.body); res.json({ success: true }) }));
r.delete('/categories/:id', requirePermission('products.delete'), asyncHandler(async (req, res) => { await query('UPDATE categories SET deleted_at=NOW(),is_active=0 WHERE id=?', [req.params.id]); res.json({ success: true }) }));

for (const cfg of [
  { path: 'brands', table: 'brands', perm: 'products', logo: true },
  { path: 'manufacturers', table: 'manufacturers', perm: 'products', logo: true }
]) {
  r.get('/' + cfg.path, requirePermission('products.view'), asyncHandler(async (req, res) => res.json({ success: true, data: await query(`SELECT * FROM ${cfg.table}${cfg.table === 'brands' ? ' WHERE deleted_at IS NULL' : ''} ORDER BY name`) })));
  r.post('/' + cfg.path, requirePermission('products.create'), mediaUpload.single('logo'), asyncHandler(async (req, res) => { const slug = await uniqueSlug(cfg.table, req.body.slug || req.body.name); const logo = await saveMedia(req.file); const x = await query(`INSERT INTO ${cfg.table}(name,slug,logo,description,is_active) VALUES(?,?,?,?,?)`, [req.body.name, slug, logo, sanitizeRichHtml(req.body.description || ''), req.body.active === undefined ? 1 : (bool(req.body.active) ? 1 : 0)]); await audit(req, 'create', cfg.table.slice(0, -1), x.insertId, null, req.body); res.status(201).json({ success: true, data: { id: x.insertId } }) }));
  r.patch('/' + cfg.path + '/:id', requirePermission('products.update'), mediaUpload.single('logo'), asyncHandler(async (req, res) => { const old = (await query(`SELECT * FROM ${cfg.table} WHERE id=?`, [req.params.id]))[0]; if (!old) return res.status(404).json({ success: false, message: 'Record not found' }); const slug = await uniqueSlug(cfg.table, req.body.slug || old.slug || req.body.name || old.name, req.params.id); const logo = req.file ? await saveMedia(req.file) : (req.body.logo ?? old.logo); await query(`UPDATE ${cfg.table} SET name=?,slug=?,logo=?,description=?,is_active=? WHERE id=?`, [req.body.name ?? old.name, slug, logo, sanitizeRichHtml(req.body.description ?? old.description ?? ''), bool(req.body.active ?? old.is_active) ? 1 : 0, req.params.id]); await audit(req, 'update', cfg.table.slice(0, -1), req.params.id, old, req.body); res.json({ success: true }) }));
  r.delete('/' + cfg.path + '/:id', requirePermission('products.delete'), asyncHandler(async (req, res) => { if (cfg.table === 'brands') await query('UPDATE brands SET deleted_at=NOW(),is_active=0 WHERE id=?', [req.params.id]); else await query('UPDATE manufacturers SET is_active=0 WHERE id=?', [req.params.id]); res.json({ success: true }) }));
}

export default r;
