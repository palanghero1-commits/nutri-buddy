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
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
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
}

export async function ensureDatabaseSchema(connectionOrPool) {
  await ensureSchema(connectionOrPool);
}

export async function seedDefaultUsers(connectionOrPool) {
  await connectionOrPool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, ?), (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       password_hash = VALUES(password_hash),
       role = VALUES(role)`,
    [
      "System Admin",
      "admin@nutritrack.gov.ph",
      hashPassword("admin123"),
      "admin",
      "Maria Santos",
      "user@nutritrack.app",
      hashPassword("user12345"),
      "user",
    ],
  );
}
