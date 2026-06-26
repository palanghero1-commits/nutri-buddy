import { createDbConnection, dbConfig, ensureDatabaseSchema, seedDefaultUsers } from "./db-utils.mjs";

const connection = await createDbConnection();
const testId = `db-check-${Date.now()}`;
const testEmail = `${testId}@example.local`;

try {
  await ensureDatabaseSchema(connection);
  await seedDefaultUsers(connection);

  const [[versionRow]] = await connection.query("SELECT VERSION() AS version, DATABASE() AS databaseName");
  const [tableRows] = await connection.query(
    `SELECT table_name AS tableName
     FROM information_schema.tables
     WHERE table_schema = ?
     ORDER BY table_name`,
    [dbConfig.database],
  );

  const requiredTables = ["children", "growth_records", "meal_entries", "users"];
  const existingTables = new Set(tableRows.map((row) => row.tableName));
  const missingTables = requiredTables.filter((tableName) => !existingTables.has(tableName));

  if (missingTables.length > 0) {
    throw new Error(`Missing database tables: ${missingTables.join(", ")}`);
  }

  await connection.beginTransaction();

  await connection.query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, REPEAT('0', 64), 'user')", [
    "Database Check User",
    testEmail,
  ]);

  await connection.query(
    `INSERT INTO children (
      id, first_name, middle_name, last_name, name, birth_date, age, age_display, gender,
      weight, height, bmi, status, avatar, parent_name, created_by_email, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      testId,
      "Database",
      null,
      "Check",
      "Database Check",
      "2020-01-01",
      6,
      "6 years",
      "Female",
      20,
      112,
      15.94,
      "Normal",
      "DC",
      "Check Parent",
      testEmail,
      "2026-06-26",
    ],
  );

  await connection.query(
    "INSERT INTO meal_entries (id, child_id, date_value, meal_type, foods, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [`${testId}-meal`, testId, "2026-06-26", "Breakfast", JSON.stringify(["Rice", "Egg"]), 300, 12, 40, 8],
  );

  await connection.query("INSERT INTO growth_records (child_id, date_value, weight, height) VALUES (?, ?, ?, ?)", [
    testId,
    "2026-06",
    20,
    112,
  ]);

  const [[writeCheck]] = await connection.query(
    `SELECT
      (SELECT COUNT(*) FROM children WHERE id = ?) AS children,
      (SELECT COUNT(*) FROM meal_entries WHERE child_id = ?) AS meals,
      (SELECT COUNT(*) FROM growth_records WHERE child_id = ?) AS growth`,
    [testId, testId, testId],
  );

  if (Number(writeCheck.children) !== 1 || Number(writeCheck.meals) !== 1 || Number(writeCheck.growth) !== 1) {
    throw new Error("Database write/read check failed.");
  }

  await connection.query("DELETE FROM children WHERE id = ?", [testId]);

  const [[cascadeCheck]] = await connection.query(
    `SELECT
      (SELECT COUNT(*) FROM meal_entries WHERE child_id = ?) AS meals,
      (SELECT COUNT(*) FROM growth_records WHERE child_id = ?) AS growth`,
    [testId, testId],
  );

  if (Number(cascadeCheck.meals) !== 0 || Number(cascadeCheck.growth) !== 0) {
    throw new Error("Foreign key cascade delete check failed.");
  }

  await connection.query("DELETE FROM users WHERE email = ?", [testEmail]);
  await connection.commit();

  const [[counts]] = await connection.query(
    `SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM children) AS children,
      (SELECT COUNT(*) FROM meal_entries) AS mealEntries,
      (SELECT COUNT(*) FROM growth_records) AS growthRecords`,
  );

  console.log(`MySQL connection OK: ${versionRow.version}`);
  console.log(`Database OK: ${versionRow.databaseName}`);
  console.log(`Tables OK: ${requiredTables.join(", ")}`);
  console.log("Write/read/delete check OK.");
  console.log(
    `Current rows: users=${counts.users}, children=${counts.children}, meal_entries=${counts.mealEntries}, growth_records=${counts.growthRecords}`,
  );
} catch (error) {
  try {
    await connection.rollback();
  } catch {
    // The failing operation may have happened before a transaction started.
  }
  throw error;
} finally {
  await connection.end();
}
