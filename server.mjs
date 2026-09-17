import "dotenv/config";
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, dirname, resolve } from "node:path";
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
  ["1", "Maria", null, "Santos", "Maria Santos", "2020-07-01", 5, "5 years & 11 months", "Female", 17.2, 108, 14.7, "Normal", "MS", "Ana Santos", "Ana Santos", "Not recorded", "Barangay Tinampa-an, Cadiz City", "Purok 1 - Riverside", "BHW Demo", "bhw@nutritrack.gov.ph", "", null, "2026-03-20"],
  ["2", "Juan", "dela", "Cruz", "Juan dela Cruz", "2022-07-01", 3, "3 years & 11 months", "Male", 11.8, 92, 13.9, "Underweight", "JC", "Rosa dela Cruz", "Rosa dela Cruz", "Not recorded", "Barangay Tinampa-an, Cadiz City", "Purok 1 - Riverside", "BHW Demo", "bhw@nutritrack.gov.ph", "", null, "2026-03-20"],
  ["3", "Sofia", null, "Reyes", "Sofia Reyes", "2018-07-01", 7, "7 years & 11 months", "Female", 28.5, 125, 18.2, "Overweight", "SR", "Elena Reyes", "Elena Reyes", "Not recorded", "Barangay Tinampa-an, Cadiz City", "Purok 2 - Proper", "Liza Montemayor", "bhw.proper@nutritrack.gov.ph", "", null, "2026-03-19"],
  ["4", "Miguel", null, "Garcia", "Miguel Garcia", "2021-07-01", 4, "4 years & 11 months", "Male", 14.1, 96, 15.3, "Normal", "MG", "Pedro Garcia", "Mila Garcia", "Pedro Garcia", "Barangay Tinampa-an, Cadiz City", "Purok 2 - Proper", "Liza Montemayor", "bhw.proper@nutritrack.gov.ph", "", null, "2026-03-18"],
  ["5", "Isabella", null, "Cruz", "Isabella Cruz", "2019-07-01", 6, "6 years & 11 months", "Female", 16.5, 105, 15, "Stunted", "IC", "Lorna Cruz", "Lorna Cruz", "Not recorded", "Barangay Tinampa-an, Cadiz City", "Purok 3 - Hillside", "Nora Villanueva", "bhw.hillside@nutritrack.gov.ph", "", null, "2026-03-18"],
  ["6", "Carlos", null, "Mendoza", "Carlos Mendoza", "2023-07-01", 2, "2 years & 11 months", "Male", 10.2, 82, 15.2, "Normal", "CM", "Margie Mendoza", "Margie Mendoza", "Not recorded", "Barangay Tinampa-an, Cadiz City", "Purok 3 - Hillside", "Nora Villanueva", "bhw.hillside@nutritrack.gov.ph", "", null, "2026-03-17"],
];

const guardianTypes = new Set(["Mother", "Father", "Aunt", "Uncle", "Grandmother", "Grandfather"]);

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
let usingMemoryStore = false;
let dataStoreReady;

const memoryStore = {
  users: [
    { name: "System Admin", email: "admin@nutritrack.gov.ph", passwordHash: hashPassword("admin123"), role: "admin", designation: "", residentAddress: "", contactNumber: "", residencyConfirmed: false },
    { name: "BHW Demo", email: "bhw@nutritrack.gov.ph", passwordHash: hashPassword("bhw12345"), role: "bhw", designation: "Barangay Health Worker", assignedArea: "Purok 1 - Riverside", residentAddress: "", contactNumber: "", residencyConfirmed: false },
    { name: "Liza Montemayor", email: "bhw.proper@nutritrack.gov.ph", passwordHash: hashPassword("bhwproper123"), role: "bhw", designation: "Barangay Health Worker", assignedArea: "Purok 2 - Proper", residentAddress: "", contactNumber: "", residencyConfirmed: false },
    { name: "Nora Villanueva", email: "bhw.hillside@nutritrack.gov.ph", passwordHash: hashPassword("bhwhillside123"), role: "bhw", designation: "Barangay Health Worker", assignedArea: "Purok 3 - Hillside", residentAddress: "", contactNumber: "", residencyConfirmed: false },
    { name: "Maria Santos", email: "user@nutritrack.app", passwordHash: hashPassword("user12345"), role: "user", designation: "", residentAddress: "Barangay Tinampa-an, Cadiz City", contactNumber: "", residencyConfirmed: true, verificationStatus: "approved", idDocumentName: "", idDocumentType: "", idDocumentData: "" },
  ],
  children: seedChildren.map((child) => ({
    id: child[0],
    firstName: child[1],
    middleName: child[2] || undefined,
    lastName: child[3],
    name: child[4],
    birthDate: child[5],
    age: child[6],
    ageDisplay: child[7],
    gender: child[8],
    weight: child[9],
    height: child[10],
    bmi: child[11],
    status: child[12],
    avatar: child[13],
    parentName: child[14],
    motherName: child[15],
    fatherName: child[16],
    address: child[17] || "",
    assignedArea: child[18] || "Purok 1 - Riverside",
    assignedBhwName: child[19] || "BHW Demo",
    assignedBhwEmail: child[20] || "bhw@nutritrack.gov.ph",
    allergies: child[21] || "",
    createdByEmail: child[22] || undefined,
    updatedAt: child[23] || undefined,
  })),
  mealEntries: seedMeals.map((meal) => ({
    id: meal[0],
    childId: meal[1],
    date: meal[2],
    mealType: meal[3],
    foods: [...meal[4]],
    calories: meal[5],
    protein: meal[6],
    carbs: meal[7],
    fat: meal[8],
  })),
  growthData: seedGrowth.reduce((records, growth) => {
    const [childId, date, weight, height] = growth;
    records[childId] = records[childId] || [];
    records[childId].push({ date, weight, height });
    return records;
  }, {}),
};

async function initializeDatabase() {
  pool = await createDbPool();
  await ensureDatabaseSchema(pool);
  await seedDatabase();
}

async function initializeDataStore() {
  try {
    await initializeDatabase();
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    usingMemoryStore = true;
    console.warn("MySQL is unavailable. Starting API with in-memory demo data for this development session.");
    console.warn(`MySQL error: ${error.code || error.message}`);
  }
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
        weight, height, bmi, status, avatar, parent_name, mother_name, father_name, parent_address, assigned_area, assigned_bhw_name, assigned_bhw_email, allergies, created_by_email, updated_at
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
    guardianType: row.guardian_type || undefined,
    motherName: row.mother_name || row.parent_name,
    fatherName: row.father_name || row.parent_name,
    address: row.parent_address || "",
    guardianAddress: {
      purok: row.guardian_purok || "",
      hacienda: row.guardian_hacienda || "",
      street: row.guardian_street || "",
      barangay: row.guardian_barangay || "",
      cityMunicipality: row.guardian_city_municipality || "",
      province: row.guardian_province || "",
    },
    assignedArea: row.assigned_area || "Purok 1 - Riverside",
    assignedBhwName: row.assigned_bhw_name || "BHW Demo",
    assignedBhwEmail: row.assigned_bhw_email || "bhw@nutritrack.gov.ph",
    allergies: row.allergies || "",
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

function isPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function isNonAdminRole(value) {
  return ["bhw", "user"].includes(String(value || "").trim().toLowerCase());
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
  if (usingMemoryStore) {
    return {
      children: memoryStore.children,
      mealEntries: memoryStore.mealEntries,
      growthData: memoryStore.growthData,
    };
  }

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

function findMemoryUser(email, password, role) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const passwordHash = hashPassword(String(password || ""));

  return memoryStore.users.find((user) => user.email === normalizedEmail && user.passwordHash === passwordHash && user.role === role);
}

function toPublicUser(user) {
  return {
    name: user.name,
    email: user.email,
    designation: user.designation ?? "",
    assignedArea: user.assignedArea ?? user.assigned_area ?? "",
    residentAddress: user.residentAddress ?? user.resident_address ?? "",
    contactNumber: user.contactNumber ?? user.contact_number ?? "",
    residencyConfirmed: Boolean(user.residencyConfirmed ?? user.residency_confirmed),
    verificationStatus: user.verificationStatus ?? user.verification_status ?? "pending",
  };
}

function toBhwUser(user) {
  return {
    id: user.id ?? user.email,
    name: user.name,
    email: user.email,
    designation: user.designation ?? "",
    assignedArea: user.assignedArea ?? user.assigned_area ?? "",
    contactNumber: user.contactNumber ?? user.contact_number ?? "",
  };
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/health") {
    if (!usingMemoryStore) {
      await pool.query("SELECT 1");
    }
    sendJson(response, 200, { ok: true, database: usingMemoryStore ? "memory" : dbConfig.database });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/nutrition") {
    sendJson(response, 200, await getNutritionData());
    return true;
  }

  if (request.method === "GET" && pathname === "/api/bhws") {
    if (usingMemoryStore) {
      sendJson(response, 200, {
        bhws: memoryStore.users.filter((user) => user.role === "bhw").map(toBhwUser),
      });
      return true;
    }

    const [rows] = await pool.query("SELECT id, name, email, designation, assigned_area, contact_number FROM users WHERE role = 'bhw' ORDER BY assigned_area ASC, name ASC");
    sendJson(response, 200, { bhws: rows.map(toBhwUser) });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/bhws") {
    const { name, email, password, designation, assignedArea, contactNumber } = await readRequestBody(request);
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedDesignation = String(designation || "").trim();
    const normalizedAssignedArea = String(assignedArea || "").trim();
    const normalizedContactNumber = String(contactNumber || "").trim();

    if (!normalizedName || !normalizedEmail || !String(password || "").trim() || !normalizedDesignation || !normalizedAssignedArea) {
      sendJson(response, 400, { message: "BHW name, email, password, designation, and assigned area are required." });
      return true;
    }

    const bhw = {
      name: normalizedName,
      email: normalizedEmail,
      passwordHash: hashPassword(String(password)),
      role: "bhw",
      designation: normalizedDesignation,
      assignedArea: normalizedAssignedArea,
      residentAddress: "",
      contactNumber: normalizedContactNumber,
      residencyConfirmed: false,
    };

    if (usingMemoryStore) {
      if (memoryStore.users.some((user) => user.email === normalizedEmail)) {
        sendJson(response, 409, { message: "An account with this email already exists." });
        return true;
      }

      memoryStore.users.push(bhw);
      sendJson(response, 201, { bhw: toBhwUser(bhw) });
      return true;
    }

    try {
      await pool.query(
        "INSERT INTO users (name, email, password_hash, role, designation, assigned_area, contact_number, residency_confirmed) VALUES (?, ?, ?, 'bhw', ?, ?, ?, 0)",
        [normalizedName, normalizedEmail, hashPassword(String(password)), normalizedDesignation, normalizedAssignedArea, normalizedContactNumber || null],
      );
      const [rows] = await pool.query("SELECT id, name, email, designation, assigned_area, contact_number FROM users WHERE email = ? AND role = 'bhw' LIMIT 1", [normalizedEmail]);
      sendJson(response, 201, { bhw: toBhwUser(rows[0]) });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        sendJson(response, 409, { message: "An account with this email already exists." });
        return true;
      }
      throw error;
    }
    return true;
  }

  const bhwMatch = pathname.match(/^\/api\/bhws\/([^/]+)$/);
  if (bhwMatch && request.method === "PUT") {
    const emailKey = decodeURIComponent(bhwMatch[1]).trim().toLowerCase();
    const { name, email, password, designation, assignedArea, contactNumber } = await readRequestBody(request);
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedDesignation = String(designation || "").trim();
    const normalizedAssignedArea = String(assignedArea || "").trim();
    const normalizedContactNumber = String(contactNumber || "").trim();

    if (!emailKey || !normalizedName || !normalizedEmail || !normalizedDesignation || !normalizedAssignedArea) {
      sendJson(response, 400, { message: "BHW name, email, designation, and assigned area are required." });
      return true;
    }

    if (usingMemoryStore) {
      const bhw = memoryStore.users.find((user) => user.email === emailKey && user.role === "bhw");
      if (!bhw) {
        sendJson(response, 404, { message: "BHW account not found." });
        return true;
      }
      if (normalizedEmail !== emailKey && memoryStore.users.some((user) => user.email === normalizedEmail)) {
        sendJson(response, 409, { message: "An account with this email already exists." });
        return true;
      }

      bhw.name = normalizedName;
      bhw.email = normalizedEmail;
      bhw.designation = normalizedDesignation;
      bhw.assignedArea = normalizedAssignedArea;
      bhw.contactNumber = normalizedContactNumber;
      if (String(password || "").trim()) {
        bhw.passwordHash = hashPassword(String(password));
      }
      sendJson(response, 200, { bhw: toBhwUser(bhw) });
      return true;
    }

    const params = [normalizedName, normalizedEmail, normalizedDesignation, normalizedAssignedArea, normalizedContactNumber || null];
    let passwordClause = "";
    if (String(password || "").trim()) {
      passwordClause = ", password_hash = ?";
      params.push(hashPassword(String(password)));
    }
    params.push(emailKey);

    try {
      const [result] = await pool.query(
        `UPDATE users SET name = ?, email = ?, designation = ?, assigned_area = ?, contact_number = ?${passwordClause} WHERE email = ? AND role = 'bhw'`,
        params,
      );
      if (result.affectedRows === 0) {
        sendJson(response, 404, { message: "BHW account not found." });
        return true;
      }
      const [rows] = await pool.query("SELECT id, name, email, designation, assigned_area, contact_number FROM users WHERE email = ? AND role = 'bhw' LIMIT 1", [normalizedEmail]);
      sendJson(response, 200, { bhw: toBhwUser(rows[0]) });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        sendJson(response, 409, { message: "An account with this email already exists." });
        return true;
      }
      throw error;
    }
    return true;
  }

  if (bhwMatch && request.method === "DELETE") {
    const emailKey = decodeURIComponent(bhwMatch[1]).trim().toLowerCase();
    if (!emailKey) {
      sendJson(response, 400, { message: "BHW email is required." });
      return true;
    }

    if (usingMemoryStore) {
      const existingCount = memoryStore.users.length;
      memoryStore.users = memoryStore.users.filter((user) => !(user.email === emailKey && user.role === "bhw"));
      sendJson(response, existingCount === memoryStore.users.length ? 404 : 200, existingCount === memoryStore.users.length ? { message: "BHW account not found." } : { success: true });
      return true;
    }

    const [result] = await pool.query("DELETE FROM users WHERE email = ? AND role = 'bhw'", [emailKey]);
    sendJson(response, result.affectedRows === 0 ? 404 : 200, result.affectedRows === 0 ? { message: "BHW account not found." } : { success: true });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/admin-login") {
    const { email, password } = await readRequestBody(request);
    if (usingMemoryStore) {
      const user = findMemoryUser(email, password, "admin");
      sendJson(response, user ? 200 : 401, user ? { success: true, user: toPublicUser(user) } : { success: false, message: "Invalid email or password." });
      return true;
    }

    const [rows] = await pool.query("SELECT name, email, designation, assigned_area, resident_address, contact_number, residency_confirmed, verification_status FROM users WHERE email = ? AND password_hash = ? AND role = 'admin' LIMIT 1", [
      String(email || "").trim().toLowerCase(),
      hashPassword(String(password || "")),
    ]);
    sendJson(response, rows.length ? 200 : 401, rows.length ? { success: true, user: toPublicUser(rows[0]) } : { success: false, message: "Invalid email or password." });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/bhw-login") {
    const { email, password } = await readRequestBody(request);
    if (usingMemoryStore) {
      const user = findMemoryUser(email, password, "bhw");
      sendJson(response, user ? 200 : 401, user ? { success: true, user: toPublicUser(user) } : { success: false, message: "Invalid email or password." });
      return true;
    }

    const [rows] = await pool.query("SELECT name, email, designation, assigned_area, resident_address, contact_number, residency_confirmed, verification_status FROM users WHERE email = ? AND password_hash = ? AND role = 'bhw' LIMIT 1", [
      String(email || "").trim().toLowerCase(),
      hashPassword(String(password || "")),
    ]);
    sendJson(response, rows.length ? 200 : 401, rows.length ? { success: true, user: toPublicUser(rows[0]) } : { success: false, message: "Invalid email or password." });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/user-login") {
    const { email, password } = await readRequestBody(request);
    if (usingMemoryStore) {
      const user = findMemoryUser(email, password, "user");
      sendJson(response, user ? 200 : 401, user ? { success: true, user: toPublicUser(user) } : { success: false, message: "Invalid email or password." });
      return true;
    }

    const [rows] = await pool.query("SELECT name, email, designation, assigned_area, resident_address, contact_number, residency_confirmed, verification_status FROM users WHERE email = ? AND password_hash = ? AND role = 'user' LIMIT 1", [
      String(email || "").trim().toLowerCase(),
      hashPassword(String(password || "")),
    ]);
    sendJson(response, rows.length ? 200 : 401, rows.length ? { success: true, user: toPublicUser(rows[0]) } : { success: false, message: "Invalid email or password." });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/register") {
    const { name, email, password, residentAddress, contactNumber, residencyConfirmed, faceVerified, idDocument } = await readRequestBody(request);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedAddress = String(residentAddress || "").trim();
    const normalizedContactNumber = String(contactNumber || "").trim();

    if (!normalizedAddress || residencyConfirmed !== true || faceVerified !== true || !idDocument?.name || !idDocument?.type || !idDocument?.data || !idDocument?.ocrText) {
      sendJson(response, 400, { success: false, message: "A Tinampa-an address, confirmation, and ID document are required before registration." });
      return true;
    }

    const normalizedOcrText = String(idDocument.ocrText).toLowerCase().replace(/[–—]/g, "-");
    const idShowsTinampaan = normalizedOcrText.includes("tinampa-an") || normalizedOcrText.includes("tinampa an") || normalizedOcrText.includes("tinampaan");
    if (!idShowsTinampaan) {
      sendJson(response, 400, { success: false, message: "Registration cannot continue because the uploaded ID address does not match Barangay Tinampa-an." });
      return true;
    }

    const allowedDocumentTypes = new Set(["image/jpeg", "image/png", "application/pdf"]);
    const documentData = String(idDocument.data);
    const documentSize = Math.ceil((documentData.length * 3) / 4);
    const expectedDataPrefix = `data:${String(idDocument.type)};base64,`;
    if (!allowedDocumentTypes.has(String(idDocument.type)) || !documentData.startsWith(expectedDataPrefix) || documentSize > 5 * 1024 * 1024) {
      sendJson(response, 400, { success: false, message: "Upload a JPG, PNG, or PDF ID up to 5 MB." });
      return true;
    }

    if (!normalizedAddress.toLowerCase().includes("tinampa-an")) {
      sendJson(response, 400, { success: false, message: "Address must confirm residency in Barangay Tinampa-an." });
      return true;
    }

    if (usingMemoryStore) {
      if (memoryStore.users.some((user) => user.email === normalizedEmail)) {
        sendJson(response, 409, { success: false, message: "An account with this email already exists." });
        return true;
      }

      const normalizedName = String(name || "").trim();
      memoryStore.users.push({
        name: normalizedName,
        email: normalizedEmail,
        passwordHash: hashPassword(String(password || "")),
        role: "user",
        residentAddress: normalizedAddress,
        contactNumber: normalizedContactNumber || null,
        residencyConfirmed: true,
        verificationStatus: "pending",
        idDocumentName: String(idDocument.name).slice(0, 255),
        idDocumentType: String(idDocument.type),
        idDocumentData: documentData,
      });
      sendJson(response, 201, { success: true, user: toPublicUser(memoryStore.users.at(-1)) });
      return true;
    }

    try {
      await pool.query(
        `INSERT INTO users (
          name, email, password_hash, role, resident_address, contact_number, residency_confirmed,
          verification_status, id_document_name, id_document_type, id_document_data
        ) VALUES (?, ?, ?, 'user', ?, ?, 1, 'pending', ?, ?, ?, ?)`,
        [
        String(name || "").trim(),
        normalizedEmail,
        hashPassword(String(password || "")),
        normalizedAddress,
        normalizedContactNumber || null,
        String(idDocument.name).slice(0, 255),
        String(idDocument.type),
        documentData,
        ],
      );
      sendJson(response, 201, {
        success: true,
        user: {
          name: String(name || "").trim(),
          email: normalizedEmail,
          residentAddress: normalizedAddress,
          contactNumber: normalizedContactNumber,
          residencyConfirmed: true,
          verificationStatus: "pending",
        },
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        sendJson(response, 409, { success: false, message: "An account with this email already exists." });
        return true;
      }
      throw error;
    }
    return true;
  }

  if (request.method === "PUT" && pathname === "/api/auth/profile") {
    const { email, name, residentAddress, contactNumber } = await readRequestBody(request);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();
    const normalizedAddress = String(residentAddress || "").trim();
    const normalizedContactNumber = String(contactNumber || "").trim();

    if (!normalizedName || !normalizedAddress) {
      sendJson(response, 400, { success: false, message: "Name and address are required." });
      return true;
    }

    if (!normalizedAddress.toLowerCase().includes("tinampa-an")) {
      sendJson(response, 400, { success: false, message: "Address must confirm residency in Barangay Tinampa-an." });
      return true;
    }

    if (usingMemoryStore) {
      const user = memoryStore.users.find((item) => item.email === normalizedEmail && item.role === "user");
      if (!user) {
        sendJson(response, 404, { success: false, message: "User account not found." });
        return true;
      }

      user.name = normalizedName;
      user.residentAddress = normalizedAddress;
      user.contactNumber = normalizedContactNumber;
      user.residencyConfirmed = true;
      sendJson(response, 200, { success: true, message: "Profile updated successfully.", user: toPublicUser(user) });
      return true;
    }

    const [result] = await pool.query(
      `UPDATE users
       SET name = ?, resident_address = ?, contact_number = ?, residency_confirmed = 1
       WHERE email = ? AND role = 'user'`,
      [normalizedName, normalizedAddress, normalizedContactNumber || null, normalizedEmail],
    );

    if (result.affectedRows === 0) {
      sendJson(response, 404, { success: false, message: "User account not found." });
      return true;
    }

    sendJson(response, 200, {
      success: true,
      message: "Profile updated successfully.",
      user: {
        name: normalizedName,
        email: normalizedEmail,
        residentAddress: normalizedAddress,
        contactNumber: normalizedContactNumber,
        residencyConfirmed: true,
      },
    });
    return true;
  }

  if (request.method === "PUT" && pathname === "/api/auth/staff-profile") {
    const { email, role, name, contactNumber } = await readRequestBody(request);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = String(role || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();
    const normalizedContactNumber = String(contactNumber || "").trim();

    if (!normalizedEmail || normalizedRole !== "bhw" || !normalizedName) {
      sendJson(response, 400, { success: false, message: "BHW name and account type are required." });
      return true;
    }

    if (usingMemoryStore) {
      const user = memoryStore.users.find((item) => item.email === normalizedEmail && item.role === "bhw");
      if (!user) {
        sendJson(response, 404, { success: false, message: "BHW account not found." });
        return true;
      }

      user.name = normalizedName;
      user.contactNumber = normalizedContactNumber;
      memoryStore.children = memoryStore.children.map((child) =>
        child.assignedBhwEmail === normalizedEmail ? { ...child, assignedBhwName: normalizedName } : child,
      );
      sendJson(response, 200, { success: true, message: "Profile updated successfully.", user: toPublicUser(user) });
      return true;
    }

    const [result] = await pool.query(
      "UPDATE users SET name = ?, contact_number = ? WHERE email = ? AND role = 'bhw'",
      [normalizedName, normalizedContactNumber || null, normalizedEmail],
    );

    if (result.affectedRows === 0) {
      sendJson(response, 404, { success: false, message: "BHW account not found." });
      return true;
    }

    await pool.query("UPDATE children SET assigned_bhw_name = ? WHERE assigned_bhw_email = ?", [normalizedName, normalizedEmail]);

    const [rows] = await pool.query("SELECT name, email, designation, assigned_area, resident_address, contact_number, residency_confirmed, verification_status FROM users WHERE email = ? AND role = 'bhw' LIMIT 1", [normalizedEmail]);
    sendJson(response, 200, { success: true, message: "Profile updated successfully.", user: toPublicUser(rows[0]) });
    return true;
  }

  if (request.method === "DELETE" && pathname === "/api/auth/profile") {
    const { email, currentPassword, role } = await readRequestBody(request);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = String(role || "").trim().toLowerCase();

    if (!normalizedEmail || !currentPassword || !isNonAdminRole(normalizedRole)) {
      sendJson(response, 400, { success: false, message: "Email, current password, and a non-admin account type are required." });
      return true;
    }

    if (usingMemoryStore) {
      const user = findMemoryUser(normalizedEmail, currentPassword, normalizedRole);
      if (!user) {
        sendJson(response, 401, { success: false, message: "Current email or password is incorrect." });
        return true;
      }

      memoryStore.users = memoryStore.users.filter((item) => !(item.email === normalizedEmail && item.role === normalizedRole));
      sendJson(response, 200, { success: true, message: "Profile deleted successfully." });
      return true;
    }

    const [result] = await pool.query(
      "DELETE FROM users WHERE email = ? AND password_hash = ? AND role = ?",
      [normalizedEmail, hashPassword(String(currentPassword)), normalizedRole],
    );

    if (result.affectedRows === 0) {
      sendJson(response, 401, { success: false, message: "Current email or password is incorrect." });
      return true;
    }

    sendJson(response, 200, { success: true, message: "Profile deleted successfully." });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/reset-password") {
    const { email, currentPassword, newPassword, role } = await readRequestBody(request);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = String(role || "").trim().toLowerCase();

    if (!normalizedEmail || !currentPassword || !isNonAdminRole(normalizedRole)) {
      sendJson(response, 400, { success: false, message: "Email, current password, new password, and a non-admin account type are required." });
      return true;
    }

    if (String(newPassword).length < 8) {
      sendJson(response, 400, { success: false, message: "Use at least 8 characters for your new password." });
      return true;
    }

    if (usingMemoryStore) {
      const user = findMemoryUser(normalizedEmail, currentPassword, normalizedRole);
      if (!user) {
        sendJson(response, 401, { success: false, message: "Current email or password is incorrect." });
        return true;
      }

      user.passwordHash = hashPassword(String(newPassword));
      sendJson(response, 200, { success: true, message: "Password reset successfully." });
      return true;
    }

    const [result] = await pool.query(
      "UPDATE users SET password_hash = ? WHERE email = ? AND password_hash = ? AND role = ?",
      [hashPassword(String(newPassword)), normalizedEmail, hashPassword(String(currentPassword)), normalizedRole],
    );

    if (result.affectedRows === 0) {
      sendJson(response, 401, { success: false, message: "Current email or password is incorrect." });
      return true;
    }

    sendJson(response, 200, { success: true, message: "Password reset successfully." });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/children") {
    const { child, growthRecord } = await readRequestBody(request);
    if (!child?.id || !child?.firstName || !child?.lastName || !child?.birthDate || !child?.gender || !isPositiveNumber(child.weight) || !isPositiveNumber(child.height)) {
      sendJson(response, 400, { message: "Child name, birthdate, gender, weight, and height are required." });
      return true;
    }

    if (!guardianTypes.has(child.guardianType) || !child.motherName || !child.guardianAddress?.purok || !child.guardianAddress?.barangay || !child.guardianAddress?.cityMunicipality || !child.guardianAddress?.province) {
      sendJson(response, 400, { message: "Guardian type, guardian name, and complete guardian address are required." });
      return true;
    }

    if (usingMemoryStore) {
      memoryStore.children.unshift(child);
      if (growthRecord) {
        memoryStore.growthData[child.id] = memoryStore.growthData[child.id] || [];
        memoryStore.growthData[child.id].push(growthRecord);
      }
      sendJson(response, 201, { child });
      return true;
    }

    await pool.query(
      `INSERT INTO children (
        id, first_name, middle_name, last_name, name, birth_date, age, age_display, gender,
        weight, height, bmi, status, avatar, parent_name, guardian_type, mother_name, father_name, parent_address,
        guardian_purok, guardian_hacienda, guardian_street, guardian_barangay, guardian_city_municipality, guardian_province,
        assigned_area, assigned_bhw_name, assigned_bhw_email, allergies, created_by_email, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        child.guardianType || null,
        child.motherName || child.parentName,
        child.fatherName || "Not recorded",
        child.address || "",
        child.guardianAddress?.purok || "",
        child.guardianAddress?.hacienda || "",
        child.guardianAddress?.street || "",
        child.guardianAddress?.barangay || "",
        child.guardianAddress?.cityMunicipality || "",
        child.guardianAddress?.province || "",
        child.assignedArea || "Purok 1 - Riverside",
        child.assignedBhwName || "BHW Demo",
        child.assignedBhwEmail || "bhw@nutritrack.gov.ph",
        child.allergies || "",
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

  const childUpdateMatch = pathname.match(/^\/api\/children\/([^/]+)$/);
  if (request.method === "PUT" && childUpdateMatch) {
    const childId = decodeURIComponent(childUpdateMatch[1]);
    const { child } = await readRequestBody(request);

    if (!child?.id || child.id !== childId || !child?.firstName || !child?.lastName || !child?.birthDate || !child?.gender || !isPositiveNumber(child.weight) || !isPositiveNumber(child.height)) {
      sendJson(response, 400, { message: "Child name, birthdate, gender, weight, and height are required." });
      return true;
    }

    if (!guardianTypes.has(child.guardianType) || !child.motherName || !child.guardianAddress?.purok || !child.guardianAddress?.barangay || !child.guardianAddress?.cityMunicipality || !child.guardianAddress?.province) {
      sendJson(response, 400, { message: "Guardian type, guardian name, and complete guardian address are required." });
      return true;
    }

    if (usingMemoryStore) {
      const existingIndex = memoryStore.children.findIndex((existingChild) => existingChild.id === childId);
      if (existingIndex === -1) {
        sendJson(response, 404, { message: "Child record not found." });
        return true;
      }

      memoryStore.children[existingIndex] = child;
      sendJson(response, 200, { child });
      return true;
    }

    const [result] = await pool.query(
      `UPDATE children SET
        first_name = ?, middle_name = ?, last_name = ?, name = ?, birth_date = ?, age = ?, age_display = ?, gender = ?,
        weight = ?, height = ?, bmi = ?, status = ?, avatar = ?, parent_name = ?, guardian_type = ?, mother_name = ?, father_name = ?, parent_address = ?,
        guardian_purok = ?, guardian_hacienda = ?, guardian_street = ?, guardian_barangay = ?, guardian_city_municipality = ?, guardian_province = ?,
        assigned_area = ?, assigned_bhw_name = ?, assigned_bhw_email = ?, allergies = ?, updated_at = ?
      WHERE id = ?`,
      [
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
        child.guardianType || null,
        child.motherName || child.parentName,
        child.fatherName || "Not recorded",
        child.address || "",
        child.guardianAddress?.purok || "",
        child.guardianAddress?.hacienda || "",
        child.guardianAddress?.street || "",
        child.guardianAddress?.barangay || "",
        child.guardianAddress?.cityMunicipality || "",
        child.guardianAddress?.province || "",
        child.assignedArea || "Purok 1 - Riverside",
        child.assignedBhwName || "BHW Demo",
        child.assignedBhwEmail || "bhw@nutritrack.gov.ph",
        child.allergies || "",
        child.updatedAt || null,
        childId,
      ],
    );

    if (result.affectedRows === 0) {
      sendJson(response, 404, { message: "Child record not found." });
      return true;
    }

    sendJson(response, 200, { child });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/meals") {
    const { meal } = await readRequestBody(request);
    if (usingMemoryStore) {
      memoryStore.mealEntries.unshift(meal);
      sendJson(response, 201, { meal });
      return true;
    }

    await pool.query(
      "INSERT INTO meal_entries (id, child_id, date_value, meal_type, foods, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [meal.id, meal.childId, meal.date, meal.mealType, JSON.stringify(meal.foods), meal.calories, meal.protein, meal.carbs, meal.fat],
    );
    sendJson(response, 201, { meal });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/growth-records") {
    const { childId, record, child } = await readRequestBody(request);
    if (!childId || !record?.date || !isPositiveNumber(record.weight) || !isPositiveNumber(record.height) || !child) {
      sendJson(response, 400, { message: "Child, date, weight, and height are required for a growth update." });
      return true;
    }

    if (usingMemoryStore) {
      memoryStore.growthData[childId] = memoryStore.growthData[childId] || [];
      memoryStore.growthData[childId].push(record);
      memoryStore.children = memoryStore.children.map((existingChild) => (existingChild.id === childId ? child : existingChild));
      sendJson(response, 201, { record, child });
      return true;
    }

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

export async function requestHandler(request, response) {
  try {
    if (!dataStoreReady) dataStoreReady = initializeDataStore();
    await dataStoreReady;
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
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  dataStoreReady = initializeDataStore();
  dataStoreReady
  .then(() => {
    const server = createServer(requestHandler);
    server.listen(port, "0.0.0.0", () => {
      if (usingMemoryStore) {
        console.log(`Nutri-Track API running with in-memory data on port ${port}`);
      } else {
        console.log(`Nutri-Track API connected to MySQL database "${dbConfig.database}" on port ${port}`);
      }
    });
  })
  .catch((error) => {
    console.error("Unable to connect to MySQL. Check your .env database settings.");
    console.error(error);
    process.exit(1);
  });
}
