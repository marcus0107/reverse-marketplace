CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category ENUM('Products','Services','Custom Work','Business') NOT NULL DEFAULT 'Products',
  location VARCHAR(100) NOT NULL DEFAULT 'Nairobi',
  description TEXT,
  tags TEXT,
  price INT NOT NULL DEFAULT 0,
  delivery VARCHAR(50) DEFAULT '3-5 days',
  item_condition VARCHAR(50) DEFAULT 'New',
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  image_url VARCHAR(500),
  subscription_status ENUM('trial','active','expired') NOT NULL DEFAULT 'trial',
  subscription_ends DATE NULL,
  suspended TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  public_token CHAR(32) NOT NULL UNIQUE,
  buyer_name VARCHAR(120) NOT NULL,
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(30),
  title VARCHAR(200) NOT NULL,
  category ENUM('Products','Services','Custom Work','Business') NOT NULL,
  budget INT NOT NULL,
  deadline VARCHAR(40) DEFAULT 'Flexible',
  location VARCHAR(100) DEFAULT 'Any',
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  company_id INT NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  status ENUM('new','contacted','won','lost') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_match (request_id, company_id),
  INDEX idx_company (company_id, score),
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  plan ENUM('monthly','quarterly','yearly') NOT NULL,
  amount INT NOT NULL,
  phone VARCHAR(15) NOT NULL,
  checkout_request_id VARCHAR(100) UNIQUE,
  merchant_request_id VARCHAR(100),
  status ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  mpesa_receipt VARCHAR(30),
  result_desc VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  INDEX idx_company (company_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
