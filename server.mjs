import "dotenv/config";
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createDbPool, dbConfig, ensureDatabaseSchema, hashPassword, seedDefaultUsers } from "./scripts/db-utils.mjs";

const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const rootDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(rootDir, "dist");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const seedChildren = [
  ["1", "Maria", null, "Santos", "Maria Santos", "2020-07-01", 5, "5 years & 11 months", "Female", 17.2, 108, 14.7, "Normal", "MS", "Ana Santos", null, "2026-03-20"],
  ["2", "Juan", "dela", "Cruz", "Juan dela Cruz", "2022-07-01", 3, "3 years & 11 months", "Male", 11.8, 92, 13.9, "Underweight", "JC", "Rosa dela Cruz", null, "2026-03-20"],
  ["3", "Sofia", null, "Reyes", "Sofia Reyes", "2018-07-01", 7, "7 years & 11 months", "Female", 28.5, 125, 18.2, "Overweight", "SR", "Elena Reyes", null, "2026-03-19"],
  ["4", "Miguel", null, "Garcia", "Miguel Garcia", "2021-07-01", 4, "4 years & 11 months", "Male", 14.1, 96, 15.3, "Normal", "MG", "Pedro Garcia", null, "2026-03-18"],
  ["5", "Isabella", null, "Cruz", "Isabella Cruz", "2019-07-01", 6, "6 years & 11 months", "Female", 16.5, 105, 15, "Stunted", "IC", "Lorna Cruz", null, "2026-03-18"],
  ["6", "Carlos", null, "Mendoza", "Carlos Mendoza", "2023-07-01", 2, "2 years & 11 months", "Male", 10.2, 82, 15.2, "Normal", "CM", "Margie Mendoza", null, "2026-03-17"],
];

const seedMeals = [
  ["m1", "1", "2026-03-20", "Breakfast", ["Rice porridge", "Boiled egg", "Banana"], 320, 12, 48, 8],
  ["m2", "1", "2026-03-20", "Lunch", ["Rice", "Chicken adobo", "Mung beans"], 450, 22, 55, 14],
  ["m3", "2", "2026-03-20", "Breakfast", ["Bread", "Milk"], 200, 8, 30, 5],
  ["m4", "3", "2026-03-20", "Lunch", ["Rice", "Fried chicken", "Soda"], 680, 25, 72, 28],
  ["m5", "4", "2026-03-20", "Breakfast", ["Oatmeal", "Papaya", "Milk"], 280, 10, 42, 6],
];

const seedGrowth = [
  ["1", "2025-09", 15.8, 104],
  ["1", "2025-11", 16.2, 105],
  ["1", "2026-01", 16.8, 107],
  ["1", "2026-03", 17.2, 108],
  ["2", "2025-09", 10.5, 88],
  ["2", "2025-11", 11, 89],
  ["2", "2026-01", 11.4, 91],
  ["2", "2026-03", 11.8, 92],
];

let pool;

async function initializeDatabase() {
  pool = await createDbPool();
  await ensureDatabaseSchema(pool);
  await seedDatabase();
}

async function seedDatabase() {
  await seedDefaultUsers(pool);

  if (process.env.SEED_DEMO_NUTRITION_DATA !== "true") {
    return;
  }

  const [[{ totalChildren }]] = await pool.query("SELECT COUNT(*) AS totalChildren FROM children");
  if (totalChildren === 0) {
    await pool.query(
      `INSERT INTO children (
        id, first_name, middle_name, last_name, name, birth_date, age, age_display, gender,
        weight, height, bmi, status, avatar, parent_name, created_by_email, updated_at
      ) VALUES ?`,
      [seedChildren],
    );
  }

  const [[{ totalMeals }]] = await pool.query("SELECT COUNT(*) AS totalMeals FROM meal_entries");
  if (totalMeals === 0) {
    await pool.query(
      `INSERT INTO meal_entries (id, child_id, date_value, meal_type, foods, calories, protein, carbs, fat) VALUES ?`,
      [seedMeals.map((meal) => [meal[0], meal[1], meal[2], meal[3], JSON.stringify(meal[4]), meal[5], meal[6], meal[7], meal[8]])],
    );
  }

  const [[{ totalGrowth }]] = await pool.query("SELECT COUNT(*) AS totalGrowth FROM growth_records");
  if (totalGrowth === 0) {
    await pool.query("INSERT INTO growth_records (child_id, date_value, weight, height) VALUES ?", [seedGrowth]);
  }
}

function formatDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function toChild(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    middleName: row.middle_name || undefined,
    lastName: row.last_name,
    name: row.name,
    birthDate: formatDate(row.birth_date),
    age: Number(row.age),
    ageDisplay: row.age_display,
    gender: row.gender,
    weight: Number(row.weight),
    height: Number(row.height),
    bmi: Number(row.bmi),
    status: row.status,
    avatar: row.avatar,
    parentName: row.parent_name,
    createdByEmail: row.created_by_email || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

function toMeal(row) {
  return {
    id: row.id,
    childId: row.child_id,
    date: formatDate(row.date_value),
    mealType: row.meal_type,
    foods: typeof row.foods === "string" ? JSON.parse(row.foods) : row.foods,
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
  };
}

function toGrowth(row) {
  return {
    date: row.date_value,
    weight: Number(row.weight),
    height: Number(row.height),
  };
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function getNutritionData() {
  const [childRows] = await pool.query("SELECT * FROM children ORDER BY created_at DESC, id DESC");
  const [mealRows] = await pool.query("SELECT * FROM meal_entries ORDER BY date_value DESC, created_at DESC");
  const [growthRows] = await pool.query("SELECT * FROM growth_records ORDER BY date_value ASC, id ASC");

  const growthData = {};
  for (const row of growthRows) {
    if (!growthData[row.child_id]) growthData[row.child_id] = [];
    growthData[row.child_id].push(toGrowth(row));
  }

  return {
    children: childRows.map(toChild),
    mealEntries: mealRows.map(toMeal),
    growthData,
  };
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/health") {
    await pool.query("SELECT 1");
    sendJson(response, 200, { ok: true, database: dbConfig.database });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/nutrition") {
    sendJson(response, 200, await getNutritionData());
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/admin-login") {
    const { email, password } = await readRequestBody(request);
    const [rows] = await pool.query("SELECT name, email FROM users WHERE email = ? AND password_hash = ? AND role = 'admin' LIMIT 1", [
      String(email || "").trim().toLowerCase(),
      hashPassword(String(password || "")),
    ]);
    sendJson(response, rows.length ? 200 : 401, rows.length ? { success: true, user: rows[0] } : { success: false, message: "Invalid email or password." });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/user-login") {
    const { email, password } = await readRequestBody(request);
    const [rows] = await pool.query("SELECT name, email FROM users WHERE email = ? AND password_hash = ? AND role = 'user' LIMIT 1", [
      String(email || "").trim().toLowerCase(),
      hashPassword(String(password || "")),
    ]);
    sendJson(response, rows.length ? 200 : 401, rows.length ? { success: true, user: rows[0] } : { success: false, message: "Invalid email or password." });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/register") {
    const { name, email, password } = await readRequestBody(request);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    try {
      await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')", [
        String(name || "").trim(),
        normalizedEmail,
        hashPassword(String(password || "")),
      ]);
      sendJson(response, 201, { success: true, user: { name: String(name || "").trim(), email: normalizedEmail } });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        sendJson(response, 409, { success: false, message: "An account with this email already exists." });
        return true;
      }
      throw error;
    }
    return true;
  }

  if (request.method === "POST" && pathname === "/api/children") {
    const { child, growthRecord } = await readRequestBody(request);
    await pool.query(
      `INSERT INTO children (
        id, first_name, middle_name, last_name, name, birth_date, age, age_display, gender,
        weight, height, bmi, status, avatar, parent_name, created_by_email, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        child.id,
        child.firstName,
        child.middleName || null,
        child.lastName,
        child.name,
        child.birthDate,
        child.age,
        child.ageDisplay,
        child.gender,
        child.weight,
        child.height,
        child.bmi,
        child.status,
        child.avatar,
        child.parentName,
        child.createdByEmail || null,
        child.updatedAt || null,
      ],
    );
    if (growthRecord) {
      await pool.query("INSERT INTO growth_records (child_id, date_value, weight, height) VALUES (?, ?, ?, ?)", [
        child.id,
        growthRecord.date,
        growthRecord.weight,
        growthRecord.height,
      ]);
    }
    sendJson(response, 201, { child });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/meals") {
    const { meal } = await readRequestBody(request);
    await pool.query(
      "INSERT INTO meal_entries (id, child_id, date_value, meal_type, foods, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [meal.id, meal.childId, meal.date, meal.mealType, JSON.stringify(meal.foods), meal.calories, meal.protein, meal.carbs, meal.fat],
    );
    sendJson(response, 201, { meal });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/growth-records") {
    const { childId, record, child } = await readRequestBody(request);
    await pool.query("INSERT INTO growth_records (child_id, date_value, weight, height) VALUES (?, ?, ?, ?)", [
      childId,
      record.date,
      record.weight,
      record.height,
    ]);
    await pool.query("UPDATE children SET age = ?, age_display = ?, weight = ?, height = ?, bmi = ?, status = ?, updated_at = ? WHERE id = ?", [
      child.age,
      child.ageDisplay,
      child.weight,
      child.height,
      child.bmi,
      child.status,
      child.updatedAt,
      childId,
    ]);
    sendJson(response, 201, { record, child });
    return true;
  }

  return false;
}

function safeResolve(requestPath) {
  const pathname = decodeURIComponent((requestPath || "/").split("?")[0]);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const absolutePath = normalize(join(distDir, relativePath));

  if (!absolutePath.startsWith(distDir)) {
    return null;
  }

  return absolutePath;
}

function sendFile(response, filePath) {
  const extension = extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (pathname.startsWith("/api/")) {
      const handled = await handleApi(request, response, pathname);
      if (!handled) sendJson(response, 404, { message: "API route not found." });
      return;
    }

    if (!existsSync(distDir)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("API server is running. Build output not found for static files.");
      return;
    }

    const resolvedPath = safeResolve(request.url);
    if (!resolvedPath) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Invalid request path.");
      return;
    }

    if (existsSync(resolvedPath)) {
      const stats = statSync(resolvedPath);
      if (stats.isDirectory()) {
        const indexPath = join(resolvedPath, "index.html");
        if (existsSync(indexPath)) {
          sendFile(response, indexPath);
          return;
        }
      } else {
        sendFile(response, resolvedPath);
        return;
      }
    }

    if (!extname(resolvedPath)) {
      sendFile(response, join(distDir, "index.html"));
      return;
    }

    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found.");
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { message: "Server error.", detail: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
});

initializeDatabase()
  .then(() => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`Nutri-Track API connected to MySQL database "${dbConfig.database}" on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to MySQL. Check your .env database settings.");
    console.error(error);
    process.exit(1);
  });
