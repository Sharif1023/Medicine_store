import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const root=path.resolve(process.cwd(),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

test('database includes complete admin/store domains',()=>{
  const schema=read('database/schema.sql').toLowerCase();
  for(const table of ['products','product_images','inventory_batches','inventory_movements','orders','payments','refunds','prescriptions','banners','homepage_sections','navigation_items','store_settings','audit_logs']){
    assert.match(schema,new RegExp(`create table if not exists ${table}\\b`));
  }
});

test('admin API modules expose required control areas',()=>{
  const catalog=read('server/src/routes/admin/catalog.routes.js');
  const operations=read('server/src/routes/admin/operations.routes.js');
  const content=read('server/src/routes/admin/content.routes.js');
  const system=read('server/src/routes/admin/system.routes.js');
  for(const token of ['/products/import-json','/products/:id/images',"/categories","path:'brands'","path:'manufacturers'"])assert.ok(catalog.replace(/\s+/g,'').includes(token.replace(/\s+/g,'')),token);
  for(const token of ['/orders','/inventory','/purchase-orders','/payments','/prescriptions','/customers','/returns','/reports/sales'])assert.ok(operations.includes(token),token);
  for(const token of ['/banners','/services','/coupons','/pages','/homepage-sections','/navigation'])assert.ok(content.includes(token),token);
  for(const token of ['/settings','/profile','/roles','/staff','/shipping-zones','/audit-logs'])assert.ok(system.includes(token),token);
});

test('auth hydrates admin roles and permissions',()=>{
  const auth=read('server/src/routes/auth.routes.js');
  assert.ok(auth.includes('hydrateRole'));
  assert.ok(auth.includes('permissions'));
  assert.ok(auth.includes('isAdmin'));
});
