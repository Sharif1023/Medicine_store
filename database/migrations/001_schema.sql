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
  status ENUM('uploaded','under_review','approved','rejected','expired') DEFAULT 'uploaded',
  reviewed_by BIGINT UNSIGNED,
  reviewed_at DATETIME,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

SET FOREIGN_KEY_CHECKS=1;
