CREATE DATABASE IF NOT EXISTS `nutri_buddy`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `nutri_buddy`;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  role ENUM('admin', 'bhw', 'user') NOT NULL DEFAULT 'user',
  designation VARCHAR(120) NULL,
  assigned_area VARCHAR(120) NULL,
  resident_address TEXT NULL,
  contact_number VARCHAR(40) NULL,
  residency_confirmed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS children (
  id VARCHAR(64) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  name VARCHAR(220) NOT NULL,
  birth_date DATE NOT NULL,
  age INT NOT NULL DEFAULT 0,
  age_display VARCHAR(80) NOT NULL,
  gender ENUM('Male', 'Female') NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  height DECIMAL(6,2) NOT NULL,
  bmi DECIMAL(5,2) NOT NULL,
  status ENUM('Normal', 'Underweight', 'Overweight', 'Stunted') NOT NULL,
  avatar VARCHAR(12) NOT NULL,
  parent_name VARCHAR(150) NOT NULL,
  guardian_type ENUM('Mother', 'Father', 'Aunt', 'Uncle', 'Grandmother', 'Grandfather') NULL,
  mother_name VARCHAR(150) NOT NULL,
  father_name VARCHAR(150) NOT NULL,
  parent_address TEXT NULL,
  guardian_purok VARCHAR(120) NULL,
  guardian_hacienda VARCHAR(120) NULL,
  guardian_street VARCHAR(160) NULL,
  guardian_barangay VARCHAR(120) NULL,
  guardian_city_municipality VARCHAR(120) NULL,
  guardian_province VARCHAR(120) NULL,
  assigned_area VARCHAR(120) NULL,
  assigned_bhw_name VARCHAR(150) NULL,
  assigned_bhw_email VARCHAR(190) NULL,
  allergies TEXT NULL,
  created_by_email VARCHAR(190) NULL,
  updated_at VARCHAR(10) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meal_entries (
  id VARCHAR(64) PRIMARY KEY,
  child_id VARCHAR(64) NOT NULL,
  date_value DATE NOT NULL,
  meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
  foods JSON NOT NULL,
  calories INT NOT NULL,
  protein DECIMAL(6,2) NOT NULL,
  carbs DECIMAL(6,2) NOT NULL,
  fat DECIMAL(6,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_meal_child (child_id),
  CONSTRAINT fk_meal_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS growth_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id VARCHAR(64) NOT NULL,
  date_value VARCHAR(10) NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  height DECIMAL(6,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_growth_child (child_id),
  CONSTRAINT fk_growth_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
