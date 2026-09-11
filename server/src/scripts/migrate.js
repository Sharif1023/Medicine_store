import mysql from 'mysql2/promise';
import fs from 'fs';
import {env} from '../config/env.js';

const c=await mysql.createConnection({host:env.db.host,port:env.db.port,user:env.db.user,password:env.db.password,multipleStatements:true});
await c.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await c.query(`USE \`${env.db.name}\``);
await c.query(fs.readFileSync(new URL('../../../database/schema.sql',import.meta.url),'utf8'));

async function ensureColumn(table,column,definition){
  const [rows]=await c.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`,[column]);
  if(!rows.length)await c.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function modifyColumn(table,column,definition){
  const [rows]=await c.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`,[column]);
  if(rows.length)await c.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${column}\` ${definition}`);
}

const upgrades=[
  ['roles','description','VARCHAR(255) NULL'],['roles','is_active','TINYINT DEFAULT 1'],
  ['permissions','label','VARCHAR(160) NULL'],
  ['categories','image','VARCHAR(255) NULL'],
  ['product_images','created_at','TIMESTAMP DEFAULT CURRENT_TIMESTAMP'],
  ['suppliers','notes','TEXT NULL'],
  ['orders','admin_note','TEXT NULL'],['orders','tracking_code','VARCHAR(120) NULL'],['orders','courier_name','VARCHAR(120) NULL'],
  ['returns','admin_note','TEXT NULL'],['returns','refund_amount','DECIMAL(12,2) DEFAULT 0'],['returns','updated_at','TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ['services','image','VARCHAR(500) NULL'],['services','sort_order','INT DEFAULT 0'],
  ['service_bookings','notes','TEXT NULL'],
  ['banners','content','LONGTEXT NULL'],
  ['cms_pages','seo_title','VARCHAR(190) NULL'],['cms_pages','seo_description','VARCHAR(255) NULL'],
  ['newsletter_subscribers','is_active','TINYINT DEFAULT 1'],
  ['products','unit_label',"VARCHAR(60) DEFAULT 'Unit'"],['products','unit_price','DECIMAL(12,2) DEFAULT 0'],['products','units_per_strip','INT DEFAULT 1'],['products','strip_price','DECIMAL(12,2) DEFAULT 0'],['products','strips_per_box','INT DEFAULT 1'],['products','units_per_box','INT DEFAULT 1'],['products','box_price','DECIMAL(12,2) DEFAULT 0'],['products','discount_percent','DECIMAL(5,2) DEFAULT 20.00'],
  ['cart_items','price_type',"ENUM('unit','strip','box') DEFAULT 'unit'"],['cart_items','unit_multiplier','INT DEFAULT 1'],
  ['orders','payment_sender_last4','VARCHAR(4) NULL'],['orders','payment_transaction_id','VARCHAR(120) NULL'],
  ['order_items','price_type',"VARCHAR(20) DEFAULT 'unit'"],['order_items','units_per_pack','INT DEFAULT 1'],['order_items','total_units','INT DEFAULT 1']
];
for(const [table,column,definition] of upgrades)await ensureColumn(table,column,definition);

// Earlier releases used shorter text/URL columns. Upgrade them so admin rich text and image URLs are not truncated.
const typeUpgrades=[
  ['products','short_description','TEXT NULL'],
  ['products','description','LONGTEXT NULL'],
  ['products','ingredients','LONGTEXT NULL'],
  ['products','usage_info','LONGTEXT NULL'],
  ['products','warnings','LONGTEXT NULL'],
  ['products','storage_info','LONGTEXT NULL'],
  ['product_images','image_url','VARCHAR(500) NOT NULL'],
  ['order_items','image_url','VARCHAR(500) NULL'],
  ['coupons','description','TEXT NULL'],
  ['services','description','LONGTEXT NULL'],
  ['banners','subtitle','LONGTEXT NULL']
];
for(const [table,column,definition] of typeUpgrades)await modifyColumn(table,column,definition);

try{await c.query('ALTER TABLE cart_items ADD UNIQUE KEY uniq_cart_variant(user_id,product_id,price_type)');}catch{}
try{const [idx]=await c.query('SHOW INDEX FROM cart_items');const grouped={};for(const x of idx){if(x.Key_name==='PRIMARY'||x.Key_name==='uniq_cart_variant'||Number(x.Non_unique)!==0)continue;(grouped[x.Key_name]??=[]).push([Number(x.Seq_in_index),x.Column_name])}for(const [name,parts] of Object.entries(grouped)){const cols=parts.sort((a,b)=>a[0]-b[0]).map(x=>x[1]);if(cols.length===2&&cols[0]==='user_id'&&cols[1]==='product_id')await c.query('ALTER TABLE cart_items DROP INDEX `'+String(name).replaceAll('`','')+'`')} }catch{}
console.log('Database migrated/upgraded.');
await c.end();
