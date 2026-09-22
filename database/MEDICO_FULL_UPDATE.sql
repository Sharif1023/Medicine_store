-- Complete current schema; use npm run db:migrate for existing installations.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_verified TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX(user_id)
);

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  description VARCHAR(255),
  is_active TINYINT DEFAULT 1
);
CREATE TABLE IF NOT EXISTS permissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(160)
);
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  PRIMARY KEY(user_id,role_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY(role_id,permission_id),
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(30),
  full_name VARCHAR(160),
  phone VARCHAR(30),
  division VARCHAR(100),
  district VARCHAR(100),
  area VARCHAR(120),
  postal_code VARCHAR(20),
  address_line VARCHAR(255),
  landmark VARCHAR(255),
  is_default TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(80),
  image VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_featured TINYINT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY(parent_id) REFERENCES categories(id),
  INDEX(slug), INDEX(parent_id)
);

CREATE TABLE IF NOT EXISTS brands (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) UNIQUE NOT NULL,
  logo VARCHAR(255),
  description TEXT,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX(slug)
);

CREATE TABLE IF NOT EXISTS manufacturers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  logo VARCHAR(255),
  description TEXT,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(slug)
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(210) UNIQUE NOT NULL,
  sku VARCHAR(80) UNIQUE NOT NULL,
  barcode VARCHAR(100),
  generic_name VARCHAR(190),
  brand_id INT UNSIGNED,
  manufacturer_id INT UNSIGNED,
  category_id INT UNSIGNED,
  product_type VARCHAR(80),
  dosage_form VARCHAR(80),
  strength VARCHAR(80),
  pack_size VARCHAR(100),
  unit_label VARCHAR(60) DEFAULT 'Unit',
  unit_price DECIMAL(12,2) DEFAULT 0,
  units_per_strip INT DEFAULT 1,
  strip_price DECIMAL(12,2) DEFAULT 0,
  strips_per_box INT DEFAULT 1,
  units_per_box INT DEFAULT 1,
  box_price DECIMAL(12,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 20.00,
  short_description TEXT,
  description LONGTEXT,
  ingredients LONGTEXT,
  usage_info LONGTEXT,
  warnings LONGTEXT,
  storage_info LONGTEXT,
  regular_price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  cost_price DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  prescription_required TINYINT DEFAULT 0,
  is_featured TINYINT DEFAULT 0,
  is_best_seller TINYINT DEFAULT 0,
  is_new_arrival TINYINT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  low_stock_threshold INT DEFAULT 10,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  seo_title VARCHAR(190),
  seo_description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY(brand_id) REFERENCES brands(id),
  FOREIGN KEY(manufacturer_id) REFERENCES manufacturers(id),
  FOREIGN KEY(category_id) REFERENCES categories(id),
  INDEX(name), INDEX(generic_name), INDEX(slug), INDEX(sku), INDEX(category_id), INDEX(brand_id)
);

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(190),
  sort_order INT DEFAULT 0,
  is_primary TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX(product_id)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  company VARCHAR(160),
  phone VARCHAR(30),
  email VARCHAR(190),
  address VARCHAR(255),
  notes TEXT,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS purchase_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(80) NOT NULL UNIQUE,
  supplier_id INT UNSIGNED NOT NULL,
  status ENUM('draft','ordered','partially_received','received','cancelled') DEFAULT 'draft',
  expected_date DATE NULL,
  subtotal DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_by BIGINT UNSIGNED NULL,
  received_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY(created_by) REFERENCES users(id),
  INDEX(supplier_id), INDEX(status), INDEX(expected_date)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  received_quantity INT DEFAULT 0,
  purchase_price DECIMAL(12,2) DEFAULT 0,
  batch_number VARCHAR(100),
  manufacturing_date DATE NULL,
  expiry_date DATE NULL,
  FOREIGN KEY(purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id),
  INDEX(purchase_order_id), INDEX(product_id)
);

CREATE TABLE IF NOT EXISTS inventory_batches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  supplier_id INT UNSIGNED,
  batch_number VARCHAR(100) NOT NULL,
  manufacturing_date DATE,
  expiry_date DATE NOT NULL,
  purchase_price DECIMAL(12,2) DEFAULT 0,
  selling_price DECIMAL(12,2),
  quantity INT NOT NULL,
  remaining_quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
  INDEX(product_id), INDEX(expiry_date), INDEX(batch_number)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  batch_id BIGINT UNSIGNED,
  type VARCHAR(40) NOT NULL,
  quantity INT NOT NULL,
  reference_type VARCHAR(40),
  reference_id BIGINT UNSIGNED,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(batch_id) REFERENCES inventory_batches(id),
  INDEX(product_id), INDEX(batch_id), INDEX(created_at)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price_type ENUM('unit','strip','box') DEFAULT 'unit',
  unit_multiplier INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id,product_id,price_type),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id,product_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(120),
  description TEXT,
  discount_type ENUM('percentage','fixed') NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  minimum_order DECIMAL(12,2) DEFAULT 0,
  maximum_discount DECIMAL(12,2),
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  usage_limit INT,
  usage_per_user INT DEFAULT 1,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipping_zones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  division VARCHAR(120),
  district VARCHAR(120),
  fee DECIMAL(12,2) DEFAULT 0,
  estimated_days VARCHAR(80),
  free_shipping_threshold DECIMAL(12,2),
  is_active TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(60) UNIQUE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  shipping_fee DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(40),
  payment_sender_last4 VARCHAR(4),
  payment_transaction_id VARCHAR(120),
  payment_status VARCHAR(40) DEFAULT 'pending',
  status VARCHAR(40) DEFAULT 'pending',
  address_json JSON,
  admin_note TEXT,
  tracking_code VARCHAR(120),
  courier_name VARCHAR(120),
  cancel_reason VARCHAR(500),
  cancelled_at DATETIME NULL,
  hidden_by_user TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  INDEX(order_number), INDEX(user_id), INDEX(status), INDEX(payment_status)
);


CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(40) NOT NULL,
  transaction_ref VARCHAR(120),
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('pending','processing','paid','failed','cancelled','refunded','partially_refunded') DEFAULT 'pending',
  payload_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX(order_id), INDEX(status), INDEX(transaction_ref)
);


CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED,
  product_name VARCHAR(190) NOT NULL,
  sku VARCHAR(80),
  image_url VARCHAR(500),
  unit_price DECIMAL(12,2) NOT NULL,
  price_type VARCHAR(20) DEFAULT 'unit',
  units_per_pack INT DEFAULT 1,
  total_units INT DEFAULT 1,
  discount DECIMAL(12,2) DEFAULT 0,
  quantity INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX(order_id)
);

CREATE TABLE IF NOT EXISTS coupon_usages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(coupon_id) REFERENCES coupons(id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX(coupon_id), INDEX(user_id), INDEX(order_id)
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL,
  note VARCHAR(255),
  changed_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(changed_by) REFERENCES users(id),
  INDEX(order_id)
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  doctor_name VARCHAR(160),
  clinic_name VARCHAR(160),
  prescription_date DATE,
  notes TEXT,
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NULL,
  mime_type VARCHAR(120) NULL,
  file_size BIGINT UNSIGNED NULL,
  status ENUM('uploaded','under_review','approved','rejected','expired') DEFAULT 'uploaded',
  reviewed_by BIGINT UNSIGNED,
  reviewed_at DATETIME,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(reviewed_by) REFERENCES users(id),
  INDEX(user_id), INDEX(status)
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT NOT NULL,
  title VARCHAR(160),
  review TEXT,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  verified_purchase TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id,product_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(product_id) REFERENCES products(id),
  INDEX(status)
);

CREATE TABLE IF NOT EXISTS returns (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(80),
  comments TEXT,
  status VARCHAR(40) DEFAULT 'requested',
  admin_note TEXT,
  refund_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  INDEX(status)
);

CREATE TABLE IF NOT EXISTS refunds (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  return_id BIGINT UNSIGNED NULL,
  payment_id BIGINT UNSIGNED NULL,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(40),
  status ENUM('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
  reference VARCHAR(120),
  note TEXT,
  processed_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(return_id) REFERENCES returns(id) ON DELETE SET NULL,
  FOREIGN KEY(payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  FOREIGN KEY(processed_by) REFERENCES users(id),
  INDEX(order_id), INDEX(status)
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(40),
  title VARCHAR(160),
  message VARCHAR(500),
  is_read TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX(user_id), INDEX(is_read)
);

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160),
  slug VARCHAR(180) UNIQUE,
  description TEXT,
  icon VARCHAR(80),
  image VARCHAR(500),
  price DECIMAL(12,2) DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_active TINYINT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS service_bookings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  service_id INT UNSIGNED,
  booking_date DATE,
  booking_time TIME,
  contact_phone VARCHAR(30),
  notes TEXT,
  status VARCHAR(40) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(service_id) REFERENCES services(id),
  INDEX(status)
);

CREATE TABLE IF NOT EXISTS banners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190),
  subtitle TEXT,
  content LONGTEXT,
  button_text VARCHAR(80),
  button_url VARCHAR(255),
  image VARCHAR(500),
  mobile_image VARCHAR(500),
  position VARCHAR(50) DEFAULT 'hero',
  sort_order INT DEFAULT 0,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  is_active TINYINT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(80) UNIQUE NOT NULL,
  title VARCHAR(190),
  subtitle TEXT,
  is_enabled TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  config_json JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  url VARCHAR(255) NOT NULL,
  location ENUM('header','footer_company','footer_shop','footer_help','footer_legal') NOT NULL DEFAULT 'header',
  parent_id INT UNSIGNED NULL,
  open_new_tab TINYINT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(parent_id) REFERENCES navigation_items(id) ON DELETE SET NULL,
  INDEX(location), INDEX(parent_id), INDEX(sort_order)
);

CREATE TABLE IF NOT EXISTS cms_pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) UNIQUE,
  title VARCHAR(190),
  content LONGTEXT,
  seo_title VARCHAR(190),
  seo_description VARCHAR(255),
  is_active TINYINT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_settings (
  setting_key VARCHAR(160) PRIMARY KEY,
  setting_value LONGTEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) UNIQUE NOT NULL,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30),
  subject VARCHAR(190),
  message TEXT NOT NULL,
  status VARCHAR(40) DEFAULT 'new',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(status)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED,
  action VARCHAR(80),
  entity_type VARCHAR(80),
  entity_id BIGINT UNSIGNED,
  old_values JSON,
  new_values JSON,
  ip VARCHAR(64),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(admin_id) REFERENCES users(id),
  INDEX(admin_id), INDEX(entity_type), INDEX(created_at)
);

-- Medico production-safe upgrade. Does not drop production data.


CREATE TABLE IF NOT EXISTS password_reset_otps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX(user_id), INDEX(expires_at)
);

CREATE TABLE IF NOT EXISTS email_change_otps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  new_email VARCHAR(190) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX(user_id), INDEX(new_email)
);

CREATE TABLE IF NOT EXISTS offers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  slug VARCHAR(210) NOT NULL UNIQUE,
  description TEXT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  banner_image VARCHAR(500) NULL,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(is_active), INDEX(start_at), INDEX(end_at)
);

CREATE TABLE IF NOT EXISTS offer_products (
  offer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(offer_id,product_id),
  FOREIGN KEY(offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_message_replies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_message_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  recipient_email VARCHAR(190) NOT NULL,
  smtp_message_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(contact_message_id) REFERENCES contact_messages(id) ON DELETE CASCADE,
  FOREIGN KEY(admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX(contact_message_id)
);

CREATE TABLE IF NOT EXISTS mailbox_sync_state (
  mailbox VARCHAR(190) PRIMARY KEY,
  last_uid BIGINT UNSIGNED DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_templates (
  template_key VARCHAR(120) PRIMARY KEY,
  subject VARCHAR(190) NOT NULL,
  html_body LONGTEXT NULL,
  text_body LONGTEXT NULL,
  is_active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO store_settings(setting_key,setting_value) VALUES
('whatsapp.enabled','1'),
('whatsapp.number','+8801XXXXXXXXX'),
('whatsapp.message','Hello Medico, I need help with my medicine/order.'),
('whatsapp.position','bottom-right'),
('mail.sender_name','Medico'),
('mail.sender_email','medicine@medico.sharuu.com'),
('mail.smtp_host','medico.sharuu.com'),
('mail.smtp_port','465'),
('mail.imap_host','medico.sharuu.com'),
('mail.imap_port','993')
ON DUPLICATE KEY UPDATE setting_value=setting_value;


SET FOREIGN_KEY_CHECKS=1;

-- Medico production-safe upgrade. Does not drop production data.
SET NAMES utf8mb4;

SET @sql = (SELECT IF(COUNT(*)=0, 'ALTER TABLE `prescriptions` ADD COLUMN `deleted_at` DATETIME NULL', 'SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='prescriptions' AND COLUMN_NAME='deleted_at');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*)=0, 'ALTER TABLE `prescriptions` ADD COLUMN `original_name` VARCHAR(255) NULL', 'SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='prescriptions' AND COLUMN_NAME='original_name');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*)=0, 'ALTER TABLE `prescriptions` ADD COLUMN `mime_type` VARCHAR(120) NULL', 'SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='prescriptions' AND COLUMN_NAME='mime_type');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*)=0, 'ALTER TABLE `prescriptions` ADD COLUMN `file_size` BIGINT UNSIGNED NULL', 'SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='prescriptions' AND COLUMN_NAME='file_size');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*)=0, 'ALTER TABLE `orders` ADD COLUMN `cancel_reason` VARCHAR(500) NULL', 'SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='cancel_reason');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*)=0, 'ALTER TABLE `orders` ADD COLUMN `cancelled_at` DATETIME NULL', 'SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='cancelled_at');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*)=0, 'ALTER TABLE `orders` ADD COLUMN `hidden_by_user` TINYINT(1) DEFAULT 0', 'SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='hidden_by_user');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX(user_id), INDEX(expires_at)
);

CREATE TABLE IF NOT EXISTS email_change_otps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  new_email VARCHAR(190) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX(user_id), INDEX(new_email)
);

CREATE TABLE IF NOT EXISTS offers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  slug VARCHAR(210) NOT NULL UNIQUE,
  description TEXT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  banner_image VARCHAR(500) NULL,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(is_active), INDEX(start_at), INDEX(end_at)
);

CREATE TABLE IF NOT EXISTS offer_products (
  offer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(offer_id,product_id),
  FOREIGN KEY(offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_message_replies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_message_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  recipient_email VARCHAR(190) NOT NULL,
  smtp_message_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(contact_message_id) REFERENCES contact_messages(id) ON DELETE CASCADE,
  FOREIGN KEY(admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX(contact_message_id)
);

CREATE TABLE IF NOT EXISTS mailbox_sync_state (
  mailbox VARCHAR(190) PRIMARY KEY,
  last_uid BIGINT UNSIGNED DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_templates (
  template_key VARCHAR(120) PRIMARY KEY,
  subject VARCHAR(190) NOT NULL,
  html_body LONGTEXT NULL,
  text_body LONGTEXT NULL,
  is_active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO store_settings(setting_key,setting_value) VALUES
('whatsapp.enabled','1'),
('whatsapp.number','+8801XXXXXXXXX'),
('whatsapp.message','Hello Medico, I need help with my medicine/order.'),
('whatsapp.position','bottom-right'),
('mail.sender_name','Medico'),
('mail.sender_email','medicine@medico.sharuu.com'),
('mail.smtp_host','medico.sharuu.com'),
('mail.smtp_port','465'),
('mail.imap_host','medico.sharuu.com'),
('mail.imap_port','993')
ON DUPLICATE KEY UPDATE setting_value=setting_value;

CREATE TABLE IF NOT EXISTS payment_settings (
 id INT PRIMARY KEY AUTO_INCREMENT, gateway_name VARCHAR(100) NOT NULL, gateway_type VARCHAR(30) NOT NULL UNIQUE,
 status BOOLEAN NOT NULL DEFAULT 0, api_url VARCHAR(500) DEFAULT '', merchant_id VARCHAR(190) DEFAULT '', api_key TEXT, secret_key TEXT,
 success_url VARCHAR(500) DEFAULT '', fail_url VARCHAR(500) DEFAULT '', cancel_url VARCHAR(500) DEFAULT '', mode VARCHAR(10) DEFAULT 'sandbox',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS email_settings (
 id INT PRIMARY KEY, status BOOLEAN DEFAULT 0, driver VARCHAR(20) DEFAULT 'smtp', smtp_host VARCHAR(190) DEFAULT '', smtp_port INT DEFAULT 587,
 encryption VARCHAR(20) DEFAULT 'starttls', username VARCHAR(190) DEFAULT '', password TEXT, sender_name VARCHAR(190) DEFAULT '', sender_email VARCHAR(190) DEFAULT '',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sms_settings (
 id INT PRIMARY KEY, status BOOLEAN DEFAULT 0, provider_name VARCHAR(100) DEFAULT 'generic_json', api_url VARCHAR(500) DEFAULT '', api_key TEXT, secret_key TEXT,
 sender_id VARCHAR(100) DEFAULT '', country_code VARCHAR(8) DEFAULT '880', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notification_settings (
 id INT PRIMARY KEY, email_enabled BOOLEAN DEFAULT 1, sms_enabled BOOLEAN DEFAULT 1, in_app_enabled BOOLEAN DEFAULT 1,
 admin_email VARCHAR(190) DEFAULT '', admin_phone VARCHAR(30) DEFAULT '', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS message_templates (
 id INT AUTO_INCREMENT PRIMARY KEY, event_name VARCHAR(40) NOT NULL, channel VARCHAR(10) NOT NULL, subject VARCHAR(250) DEFAULT '', body TEXT NOT NULL, status BOOLEAN DEFAULT 1,
 UNIQUE KEY template_event(event_name,channel)
);
CREATE TABLE IF NOT EXISTS notification_outbox (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL, event_key VARCHAR(190) NOT NULL, channel VARCHAR(10) NOT NULL,
 recipient VARCHAR(190) NOT NULL, subject VARCHAR(250), body TEXT NOT NULL, status VARCHAR(20) DEFAULT 'pending', attempts INT DEFAULT 0,
 available_at DATETIME DEFAULT CURRENT_TIMESTAMP, locked_at DATETIME NULL, last_error VARCHAR(190) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY event_delivery(event_key,channel,recipient), INDEX delivery_queue(status,available_at)
);
CREATE TABLE IF NOT EXISTS verification_otps (
 user_id BIGINT UNSIGNED PRIMARY KEY, code_hash CHAR(64) NOT NULL, attempts INT DEFAULT 0, expires_at DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS analytics_settings (
 id INT PRIMARY KEY, status BOOLEAN DEFAULT 0, meta_pixel_status BOOLEAN DEFAULT 0, meta_pixel_id VARCHAR(40) DEFAULT '',
 google_analytics_status BOOLEAN DEFAULT 0, ga_measurement_id VARCHAR(40) DEFAULT '', gtm_status BOOLEAN DEFAULT 0, gtm_container_id VARCHAR(40) DEFAULT '',
 custom_header_script TEXT, custom_footer_script TEXT, retention_days INT DEFAULT 90,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_activity_logs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, event_id CHAR(36) NOT NULL UNIQUE, purchase_key VARCHAR(40) NULL UNIQUE, user_id BIGINT UNSIGNED NULL,
 visitor_id CHAR(36) NOT NULL, session_id CHAR(36) NOT NULL, event_name VARCHAR(40) NOT NULL, page_url VARCHAR(500) NOT NULL,
 product_id BIGINT UNSIGNED NULL, order_id BIGINT UNSIGNED NULL, search_term VARCHAR(120) NULL, ip_address VARCHAR(45) NULL,
 device_type VARCHAR(20), browser VARCHAR(40), country VARCHAR(80) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX activity_time(created_at), INDEX activity_session(session_id,created_at), INDEX activity_product(product_id,event_name), INDEX activity_user(user_id,created_at)
);
CREATE TABLE IF NOT EXISTS quantity_offers (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(190) NOT NULL, product_id BIGINT UNSIGNED NOT NULL,
 price_type VARCHAR(10) NOT NULL, minimum_quantity INT NOT NULL, bundle_price DECIMAL(12,2) NOT NULL,
 start_date DATETIME NOT NULL, end_date DATETIME NOT NULL, is_active BOOLEAN DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(product_id) REFERENCES products(id), INDEX offer_product(product_id,price_type,is_active)
);
CREATE TABLE IF NOT EXISTS payment_sessions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_id BIGINT UNSIGNED NOT NULL UNIQUE, gateway_id INT NOT NULL,
 transaction_id VARCHAR(40) NOT NULL UNIQUE, checkout_url TEXT NULL, status VARCHAR(20) DEFAULT 'creating',
 gateway_snapshot TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(gateway_id) REFERENCES payment_settings(id)
);
INSERT IGNORE INTO email_settings(id) VALUES(1);
INSERT IGNORE INTO sms_settings(id) VALUES(1);
INSERT IGNORE INTO notification_settings(id) VALUES(1);
INSERT IGNORE INTO analytics_settings(id) VALUES(1);
INSERT IGNORE INTO payment_settings(gateway_name,gateway_type) VALUES ('SSLCOMMERZ','sslcommerz'),('Stripe','stripe'),('PayPal','paypal'),('bKash','bkash'),('Nagad','nagad');
INSERT IGNORE INTO message_templates(event_name,channel,subject,body) VALUES
 ('welcome','email','Welcome, {{name}}','Hello {{name}}, welcome to our store.'),('welcome','sms','','Welcome {{name}}! Your account is ready.'),
 ('order_created','email','Order {{order_id}} confirmed','Hello {{name}}, your order {{order_id}} for {{amount}} has been placed. Status: {{status}}.'),
 ('order_created','sms','','Order {{order_id}} placed. Amount: {{amount}}. Status: {{status}}.'),
 ('order_status','email','Order {{order_id}}: {{status}}','Hello {{name}}, order {{order_id}} is now {{status}}.'),
 ('order_status','sms','','Order {{order_id}} is now {{status}}.'),
 ('admin_order','email','New order {{order_id}}','New order from {{name}}: {{order_id}}, amount {{amount}}.'),
 ('admin_order','sms','','New order {{order_id}}, amount {{amount}}.'),
 ('otp','sms','','Your verification code is {{otp}}. It expires in 5 minutes.');

-- Phone verification is separate from the existing email-verified flag.
SET @sql = (SELECT IF(COUNT(*)=0, 'ALTER TABLE users ADD COLUMN phone_verified_at DATETIME NULL', 'SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='phone_verified_at');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Preserve existing edited account templates; seed only missing keys.
INSERT IGNORE INTO email_templates(template_key,subject,text_body,is_active) VALUES
('welcome','Welcome to Medico','Hello {{name}}, welcome to Medico. Your account is ready.',1),
('password_reset_otp','Medico password reset OTP','Hello {{name}}, your password reset OTP is {{otp}}. It expires in 10 minutes.',1),
('password_changed','Your Medico password has changed','Hello {{name}}, your password has changed. If this was not you, contact support immediately.',1),
('email_change_otp','Verify your Medico email','Hello {{name}}, your email verification OTP is {{otp}}. It expires in 10 minutes.',1);

-- Optional mailbox settings reuse the encrypted SMTP account.
SET @sql=(SELECT IF(COUNT(*)=0,'ALTER TABLE email_settings ADD COLUMN imap_enabled BOOLEAN DEFAULT 0','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='email_settings' AND COLUMN_NAME='imap_enabled');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql=(SELECT IF(COUNT(*)=0,'ALTER TABLE email_settings ADD COLUMN imap_host VARCHAR(190) DEFAULT ''''','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='email_settings' AND COLUMN_NAME='imap_host');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql=(SELECT IF(COUNT(*)=0,'ALTER TABLE email_settings ADD COLUMN imap_port INT DEFAULT 993','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='email_settings' AND COLUMN_NAME='imap_port');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql=(SELECT IF(COUNT(*)=0,'ALTER TABLE email_settings ADD COLUMN imap_sent_mailbox VARCHAR(190) DEFAULT ''Sent''','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='email_settings' AND COLUMN_NAME='imap_sent_mailbox');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
-- Link supplied catalog images only by exact product name, only when no image exists.
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/01-paracetamol-500-mg-tablet.png',p.name,1,0 FROM products p WHERE p.name='Paracetamol 500 mg Tablet' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/02-oral-rehydration-salts-sachet.png',p.name,1,0 FROM products p WHERE p.name='Oral Rehydration Salts Sachet' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/03-antacid-chewable-tablet.png',p.name,1,0 FROM products p WHERE p.name='Antacid Chewable Tablet' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/04-allergy-relief-tablet-10-mg.png',p.name,1,0 FROM products p WHERE p.name='Allergy Relief Tablet 10 mg' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/05-prescription-antibiotic-demo-500-mg.png',p.name,1,0 FROM products p WHERE p.name='Prescription Antibiotic Demo 500 mg' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/06-vitamin-c-1000-mg-effervescent.png',p.name,1,0 FROM products p WHERE p.name='Vitamin C 1000 mg Effervescent' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/07-vitamin-d3-2000-iu-softgel.png',p.name,1,0 FROM products p WHERE p.name='Vitamin D3 2000 IU Softgel' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/08-calcium-plus-vitamin-d3-tablet.png',p.name,1,0 FROM products p WHERE p.name='Calcium + Vitamin D3 Tablet' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/09-omega-3-fish-oil-1000-mg.png',p.name,1,0 FROM products p WHERE p.name='Omega-3 Fish Oil 1000 mg' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/10-zinc-20-mg-tablet.png',p.name,1,0 FROM products p WHERE p.name='Zinc 20 mg Tablet' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/11-daily-multivitamin.png',p.name,1,0 FROM products p WHERE p.name='Daily Multivitamin' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/12-gentle-skin-cleanser-250-ml.png',p.name,1,0 FROM products p WHERE p.name='Gentle Skin Cleanser 250 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/13-alcohol-hand-sanitizer-200-ml.png',p.name,1,0 FROM products p WHERE p.name='Alcohol Hand Sanitizer 200 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/14-sensitive-toothpaste-100-g.png',p.name,1,0 FROM products p WHERE p.name='Sensitive Toothpaste 100 g' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/15-mild-body-wash-300-ml.png',p.name,1,0 FROM products p WHERE p.name='Mild Body Wash 300 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/16-baby-moisturizing-lotion-200-ml.png',p.name,1,0 FROM products p WHERE p.name='Baby Moisturizing Lotion 200 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/17-baby-shampoo-200-ml.png',p.name,1,0 FROM products p WHERE p.name='Baby Shampoo 200 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/18-baby-diapers-medium-32-pcs.png',p.name,1,0 FROM products p WHERE p.name='Baby Diapers Medium 32 pcs' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/19-digital-blood-pressure-monitor.png',p.name,1,0 FROM products p WHERE p.name='Digital Blood Pressure Monitor' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/20-digital-glucose-meter-kit.png',p.name,1,0 FROM products p WHERE p.name='Digital Glucose Meter Kit' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/21-pulse-oximeter.png',p.name,1,0 FROM products p WHERE p.name='Pulse Oximeter' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/22-digital-thermometer.png',p.name,1,0 FROM products p WHERE p.name='Digital Thermometer' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/23-nebulizer-machine.png',p.name,1,0 FROM products p WHERE p.name='Nebulizer Machine' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/24-first-aid-kit-24-pieces.png',p.name,1,0 FROM products p WHERE p.name='First Aid Kit 24 Pieces' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/25-sterile-gauze-pads-10-pcs.png',p.name,1,0 FROM products p WHERE p.name='Sterile Gauze Pads 10 pcs' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/26-elastic-crepe-bandage.png',p.name,1,0 FROM products p WHERE p.name='Elastic Crepe Bandage' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/27-antiseptic-solution-100-ml.png',p.name,1,0 FROM products p WHERE p.name='Antiseptic Solution 100 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/28-spf-50-broad-spectrum-sunscreen.png',p.name,1,0 FROM products p WHERE p.name='SPF 50 Broad Spectrum Sunscreen' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/29-moisturizing-cream-100-g.png',p.name,1,0 FROM products p WHERE p.name='Moisturizing Cream 100 g' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/30-acne-care-face-wash-100-ml.png',p.name,1,0 FROM products p WHERE p.name='Acne Care Face Wash 100 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/31-hair-nutrition-serum-60-ml.png',p.name,1,0 FROM products p WHERE p.name='Hair Nutrition Serum 60 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/32-nutrition-drink-vanilla-400-g.png',p.name,1,0 FROM products p WHERE p.name='Nutrition Drink Vanilla 400 g' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/33-protein-nutrition-powder-500-g.png',p.name,1,0 FROM products p WHERE p.name='Protein Nutrition Powder 500 g' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/34-electrolyte-drink-powder.png',p.name,1,0 FROM products p WHERE p.name='Electrolyte Drink Powder' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/35-iron-plus-folic-acid-tablet.png',p.name,1,0 FROM products p WHERE p.name='Iron + Folic Acid Tablet' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/36-probiotic-capsules.png',p.name,1,0 FROM products p WHERE p.name='Probiotic Capsules' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/37-saline-nasal-spray-30-ml.png',p.name,1,0 FROM products p WHERE p.name='Saline Nasal Spray 30 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/38-lubricating-eye-drops-10-ml.png',p.name,1,0 FROM products p WHERE p.name='Lubricating Eye Drops 10 ml' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/39-pain-relief-gel-30-g.png',p.name,1,0 FROM products p WHERE p.name='Pain Relief Gel 30 g' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/40-hot-water-bag-2-l.png',p.name,1,0 FROM products p WHERE p.name='Hot Water Bag 2 L' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
INSERT INTO product_images(product_id,image_url,alt_text,is_primary,sort_order) SELECT p.id,'/uploads/products/41-glucose-test-strips-50-pcs.png',p.name,1,0 FROM products p WHERE p.name='Glucose Test Strips 50 pcs' AND NOT EXISTS(SELECT 1 FROM product_images pi WHERE pi.product_id=p.id);
