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
