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
