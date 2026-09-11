import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const root=path.resolve(process.cwd(),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

test('admin routes cover all major control modules',()=>{
  const app=read('client/src/App.jsx');
  for(const route of ['path="products"','path="categories"','path="inventory"','path="purchase-orders"','path="orders"','path="payments"','path="prescriptions"','path="customers"','path="coupons"','path="banners"','path="homepage"','path="navigation"','path="pages"','path="reports"','path="staff"','path="roles"','path="audit-logs"','path="settings"'])assert.ok(app.includes(route),route);
});

test('rich text toolbar includes requested formatting',()=>{
  const editor=read('client/src/components/admin/RichTextEditor.jsx');
  for(const cmd of ['bold','italic','underline','foreColor','hiliteColor','insertUnorderedList','insertOrderedList','justifyCenter','createLink'])assert.ok(editor.includes(cmd),cmd);
});

test('four switchable themes are present',()=>{
  const css=read('client/src/index.css');
  for(const theme of ['clinical-teal','ocean-blue','emerald-care','violet-wellness'])assert.ok(css.includes(`data-theme="${theme}"`),theme);
});

test('product editor supports JSON, cover and extra images',()=>{
  const form=read('client/src/pages/admin/ProductForm.jsx');
  for(const token of ['Add product from JSON','Cover / Primary image','Extra images','RichTextEditor','batches'])assert.ok(form.includes(token),token);
});
