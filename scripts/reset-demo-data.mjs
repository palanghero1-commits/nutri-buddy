import { createDbConnection, ensureDatabaseSchema, seedDefaultUsers } from "./db-utils.mjs";

const connection = await createDbConnection();

try {
  await ensureDatabaseSchema(connection);

  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  await connection.query("TRUNCATE TABLE meal_entries");
  await connection.query("TRUNCATE TABLE growth_records");
  await connection.query("TRUNCATE TABLE children");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");

  await seedDefaultUsers(connection);

  const [[users]] = await connection.query("SELECT COUNT(*) AS count FROM users");
  const [[children]] = await connection.query("SELECT COUNT(*) AS count FROM children");
  const [[meals]] = await connection.query("SELECT COUNT(*) AS count FROM meal_entries");
  const [[growth]] = await connection.query("SELECT COUNT(*) AS count FROM growth_records");

  console.log("Database cleaned.");
  console.log(`Users remaining: ${users.count}`);
  console.log(`Children remaining: ${children.count}`);
  console.log(`Meal entries remaining: ${meals.count}`);
  console.log(`Growth records remaining: ${growth.count}`);
} finally {
  await connection.end();
}
