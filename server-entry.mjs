import { createServer } from "node:http";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });
const isVercelDeployment = Boolean(process.env.VERCEL);
if (!isVercelDeployment) dotenv.config({ path: "local.env" });

// local.env is intentionally never loaded by Vercel. Deployment always uses
// Supabase, while local development can select MySQL or Supabase explicitly.
const provider = isVercelDeployment ? "supabase" : String(process.env.DATA_PROVIDER || "mysql").toLowerCase();
const useSupabase = provider === "supabase";
export const { requestHandler } = await import(useSupabase ? "./server-supabase.mjs" : "./server.mjs");
const port = Number(process.env.API_PORT || process.env.PORT || 3001);

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer(requestHandler).listen(port, "0.0.0.0", () => {
    console.log(`Nutri-Track ${useSupabase ? "Supabase" : "MySQL"} API running on port ${port}`);
  });
}
