import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const failures=[];
const pass=msg=>console.log(`PASS  ${msg}`);
const fail=msg=>{failures.push(msg);console.error(`FAIL  ${msg}`)};
const mustFile=rel=>{const p=path.join(root,rel);fs.existsSync(p)?pass(`file ${rel}`):fail(`missing ${rel}`);return p};
const mustContain=(rel,needles)=>{const p=mustFile(rel);if(!fs.existsSync(p))return;const s=fs.readFileSync(p,'utf8');for(const needle of needles)(s.includes(needle)?pass:fail)(`${rel} contains ${needle}`)};

for(const rel of [
  'client/src/App.jsx','client/src/pages/admin/AdminLayout.jsx','client/src/pages/admin/ProductForm.jsx','client/src/pages/admin/Settings.jsx','client/src/pages/admin/HomepageManager.jsx','client/src/pages/admin/Resources.jsx','client/src/pages/admin/OperationalPages.jsx','client/src/pages/admin/SystemPages.jsx','client/src/pages/admin/Procurement.jsx','client/src/pages/admin/Payments.jsx','client/src/components/admin/RichTextEditor.jsx','server/src/routes/admin.routes.js','server/src/routes/admin/catalog.routes.js','server/src/routes/admin/operations.routes.js','server/src/routes/admin/content.routes.js','server/src/routes/admin/system.routes.js','database/schema.sql','database/migrations/001_schema.sql','database/seed.sql','server/src/scripts/seed-sql.js','SETUP.md','docs/ADMIN.md','docs/product-import-example.json'
]) mustFile(rel);

mustContain('client/src/index.css',['data-theme="clinical-teal"','data-theme="ocean-blue"','data-theme="emerald-care"','data-theme="violet-wellness"']);
mustContain('client/src/components/admin/RichTextEditor.jsx',['bold','italic','underline','foreColor','insertUnorderedList','insertOrderedList']);
mustContain('client/src/pages/admin/ProductForm.jsx',['JSON','cover','Extra images','RichTextEditor']);
mustContain('client/src/pages/admin/Settings.jsx',['admin.panel_slug','Admin email / Gmail','New password','theme.active','applyTheme','payment.bkash.number','payment.nagad.instructions']);
mustContain('server/src/routes/auth.routes.js',['hydrateRole','isAdmin','refresh_tokens']);
mustContain('server/src/routes/admin/catalog.routes.js',["/products/import-json","/products/:id/images",'inventory_batches','discountPercent','unitsPerStrip','boxPrice']);
mustContain('server/src/routes/admin/content.routes.js',["/navigation","/homepage-sections","/banners","/pages"]);
mustContain('server/src/routes/admin/system.routes.js',["/settings","/profile","/roles","/staff","/shipping-zones"]);
mustContain('server/src/routes/admin/operations.routes.js',["/orders","/inventory","/purchase-orders","/payments","/prescriptions","/customers","/returns","/reports/sales"]);

mustContain('client/src/pages/Invoice.jsx',['Print / Save PDF','Product markdown savings','Sender last 4 digits']);
mustContain('client/src/pages/account/Dashboard.jsx',['/user/dashboard']);
mustContain('client/src/components/ProductCard.jsx',["fill={wished?'currentColor':'none'}",'text-rose-600']);
mustContain('server/src/routes/user.routes.js',['payment_sender_last4','payment_transaction_id','price_type','units_per_pack']);

const schema=fs.readFileSync(path.join(root,'database/schema.sql'),'utf8').toLowerCase();
for(const table of ['users','roles','permissions','products','product_images','inventory_batches','inventory_movements','orders','order_items','payments','refunds','prescriptions','reviews','returns','services','service_bookings','banners','homepage_sections','navigation_items','cms_pages','store_settings','audit_logs']){
  (schema.includes(`create table if not exists ${table}`)?pass:fail)(`schema table ${table}`);
}

const migration=fs.readFileSync(path.join(root,'database/migrations/001_schema.sql'),'utf8');
(schema===migration.toLowerCase()?pass:fail)('schema.sql and 001_schema.sql are synchronized');

try{JSON.parse(fs.readFileSync(path.join(root,'docs/product-import-example.json'),'utf8'));pass('product import example JSON is valid')}catch(e){fail(`product import example JSON invalid: ${e.message}`)}

if(failures.length){console.error(`\nVerification failed: ${failures.length} issue(s).`);process.exit(1)}
console.log('\nProject structure verification completed successfully.');
