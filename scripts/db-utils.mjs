import "dotenv/config";
import { createHash } from "node:crypto";
import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "nutri_buddy",
  charset: "utf8mb4",
  timezone: "Z",
};

export const baseConnectionConfig = {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  charset: dbConfig.charset,
  timezone: dbConfig.timezone,
};

export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
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
    verification_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    id_document_name VARCHAR(255) NULL,
    id_document_type VARCHAR(100) NULL,
    id_document_data LONGTEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS children (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS meal_entries (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS growth_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id VARCHAR(64) NOT NULL,
    date_value VARCHAR(10) NOT NULL,
    weight DECIMAL(6,2) NOT NULL,
    height DECIMAL(6,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_growth_child (child_id),
    CONSTRAINT fk_growth_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

export function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

export function escapeIdentifier(identifier) {
  if (!identifier || typeof identifier !== "string") {
    throw new Error("MYSQL_DATABASE must be a non-empty string.");
  }
  return `\`${identifier.replaceAll("`", "``")}\``;
}

export async function ensureDatabaseExists(config = dbConfig) {
  const connection = await mysql.createConnection(baseConnectionConfig);
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(config.database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await connection.end();
  }
}

export async function createDbConnection(config = dbConfig) {
  await ensureDatabaseExists(config);
  return mysql.createConnection({
    ...config,
    multipleStatements: false,
    namedPlaceholders: true,
  });
}

export async function createDbPool(config = dbConfig) {
  await ensureDatabaseExists(config);
  return mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
    multipleStatements: false,
    namedPlaceholders: true,
  });
}

export async function ensureSchema(connection) {
  for (const statement of schemaStatements) {
    await connection.query(statement);
  }

  await ensureChildrenColumns(connection);
  await ensureUserColumns(connection);
  await ensureUserRoleEnum(connection);
}

export async function ensureDatabaseSchema(connectionOrPool) {
  await ensureSchema(connectionOrPool);
}

async function ensureChildrenColumns(connection) {
  const [columns] = await connection.query(
    `SELECT column_name AS columnName
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'children'`,
    [dbConfig.database],
  );
  const existingColumns = new Set(columns.map((column) => column.columnName));

  if (!existingColumns.has("mother_name")) {
    await connection.query("ALTER TABLE children ADD COLUMN mother_name VARCHAR(150) NULL AFTER parent_name");
    await connection.query("UPDATE children SET mother_name = parent_name WHERE mother_name IS NULL OR mother_name = ''");
    await connection.query("ALTER TABLE children MODIFY mother_name VARCHAR(150) NOT NULL");
  }

  if (!existingColumns.has("guardian_type")) {
    await connection.query("ALTER TABLE children ADD COLUMN guardian_type ENUM('Mother', 'Father', 'Aunt', 'Uncle', 'Grandmother', 'Grandfather') NULL AFTER parent_name");
  }

  if (!existingColumns.has("father_name")) {
    await connection.query("ALTER TABLE children ADD COLUMN father_name VARCHAR(150) NULL AFTER mother_name");
    await connection.query("UPDATE children SET father_name = parent_name WHERE father_name IS NULL OR father_name = ''");
    await connection.query("ALTER TABLE children MODIFY father_name VARCHAR(150) NOT NULL");
  }

  if (!existingColumns.has("parent_address")) {
    await connection.query("ALTER TABLE children ADD COLUMN parent_address TEXT NULL AFTER father_name");
  }

  if (!existingColumns.has("guardian_purok")) {
    await connection.query("ALTER TABLE children ADD COLUMN guardian_purok VARCHAR(120) NULL AFTER parent_address");
  }

  if (!existingColumns.has("guardian_hacienda")) {
    await connection.query("ALTER TABLE children ADD COLUMN guardian_hacienda VARCHAR(120) NULL AFTER guardian_purok");
  }

  if (!existingColumns.has("guardian_street")) {
    await connection.query("ALTER TABLE children ADD COLUMN guardian_street VARCHAR(160) NULL AFTER guardian_hacienda");
  }

  if (!existingColumns.has("guardian_barangay")) {
    await connection.query("ALTER TABLE children ADD COLUMN guardian_barangay VARCHAR(120) NULL AFTER guardian_street");
  }

  if (!existingColumns.has("guardian_city_municipality")) {
    await connection.query("ALTER TABLE children ADD COLUMN guardian_city_municipality VARCHAR(120) NULL AFTER guardian_barangay");
  }

  if (!existingColumns.has("guardian_province")) {
    await connection.query("ALTER TABLE children ADD COLUMN guardian_province VARCHAR(120) NULL AFTER guardian_city_municipality");
  }

  if (!existingColumns.has("allergies")) {
    await connection.query("ALTER TABLE children ADD COLUMN allergies TEXT NULL AFTER parent_address");
  }

  if (!existingColumns.has("assigned_area")) {
    await connection.query("ALTER TABLE children ADD COLUMN assigned_area VARCHAR(120) NULL AFTER parent_address");
    await connection.query("UPDATE children SET assigned_area = 'Purok 1 - Riverside' WHERE assigned_area IS NULL OR assigned_area = ''");
  }

  if (!existingColumns.has("assigned_bhw_name")) {
    await connection.query("ALTER TABLE children ADD COLUMN assigned_bhw_name VARCHAR(150) NULL AFTER assigned_area");
    await connection.query("UPDATE children SET assigned_bhw_name = 'BHW Demo' WHERE assigned_bhw_name IS NULL OR assigned_bhw_name = ''");
  }

  if (!existingColumns.has("assigned_bhw_email")) {
    await connection.query("ALTER TABLE children ADD COLUMN assigned_bhw_email VARCHAR(190) NULL AFTER assigned_bhw_name");
    await connection.query("UPDATE children SET assigned_bhw_email = 'bhw@nutritrack.gov.ph' WHERE assigned_bhw_email IS NULL OR assigned_bhw_email = ''");
  }
}

async function ensureUserColumns(connection) {
  const [columns] = await connection.query(
    `SELECT column_name AS columnName
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'users'`,
    [dbConfig.database],
  );
  const existingColumns = new Set(columns.map((column) => column.columnName));

  if (!existingColumns.has("resident_address")) {
    await connection.query("ALTER TABLE users ADD COLUMN resident_address TEXT NULL AFTER role");
  }

  if (!existingColumns.has("designation")) {
    await connection.query("ALTER TABLE users ADD COLUMN designation VARCHAR(120) NULL AFTER role");
    await connection.query("UPDATE users SET designation = 'Barangay Health Worker' WHERE role = 'bhw' AND (designation IS NULL OR designation = '')");
  }

  if (!existingColumns.has("assigned_area")) {
    await connection.query("ALTER TABLE users ADD COLUMN assigned_area VARCHAR(120) NULL AFTER designation");
  }

  if (!existingColumns.has("contact_number")) {
    await connection.query("ALTER TABLE users ADD COLUMN contact_number VARCHAR(40) NULL AFTER resident_address");
  }

  if (!existingColumns.has("residency_confirmed")) {
    await connection.query("ALTER TABLE users ADD COLUMN residency_confirmed TINYINT(1) NOT NULL DEFAULT 0 AFTER contact_number");
  }

  if (!existingColumns.has("verification_status")) {
    await connection.query("ALTER TABLE users ADD COLUMN verification_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' AFTER residency_confirmed");
  }

  if (!existingColumns.has("id_document_name")) {
    await connection.query("ALTER TABLE users ADD COLUMN id_document_name VARCHAR(255) NULL AFTER verification_status");
  }

  if (!existingColumns.has("id_document_type")) {
    await connection.query("ALTER TABLE users ADD COLUMN id_document_type VARCHAR(100) NULL AFTER id_document_name");
  }

  if (!existingColumns.has("id_document_data")) {
    await connection.query("ALTER TABLE users ADD COLUMN id_document_data LONGTEXT NULL AFTER id_document_type");
  }
}

async function ensureUserRoleEnum(connection) {
  const [columns] = await connection.query(
    `SELECT column_type AS columnType
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'users' AND column_name = 'role'`,
    [dbConfig.database],
  );

  if (!columns[0]?.columnType?.includes("'bhw'")) {
    await connection.query("ALTER TABLE users MODIFY role ENUM('admin', 'bhw', 'user') NOT NULL DEFAULT 'user'");
  }
}

export async function seedDefaultUsers(connectionOrPool) {
  await connectionOrPool.query(
    `INSERT INTO users (name, email, password_hash, role, designation, assigned_area)
     VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       password_hash = VALUES(password_hash),
       role = VALUES(role),
       designation = VALUES(designation),
       assigned_area = VALUES(assigned_area)`,
    [
      "System Admin",
      "admin@nutritrack.gov.ph",
      hashPassword("admin123"),
      "admin",
      null,
      null,
      "BHW Demo",
      "bhw@nutritrack.gov.ph",
      hashPassword("bhw12345"),
      "bhw",
      "Barangay Health Worker",
      "Purok 1 - Riverside",
      "Liza Montemayor",
      "bhw.proper@nutritrack.gov.ph",
      hashPassword("bhwproper123"),
      "bhw",
      "Barangay Health Worker",
      "Purok 2 - Proper",
      "Nora Villanueva",
      "bhw.hillside@nutritrack.gov.ph",
      hashPassword("bhwhillside123"),
      "bhw",
      "Barangay Health Worker",
      "Purok 3 - Hillside",
      "Maria Santos",
      "user@nutritrack.app",
      hashPassword("user12345"),
      "user",
      null,
      null,
    ],
  );
}
