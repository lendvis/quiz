import fs from "fs";
import path from "path";
import pkg from 'pg';
import { fileURLToPath } from "url";
import { newDb } from "pg-mem";
const { Pool } = pkg;

let pool;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveSchemaSql = () => {
  return fs.readFileSync(path.join(__dirname, "../sql/init.sql"), "utf8");
};

const createInMemoryPool = () => {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });

  db.public.none(resolveSchemaSql());

  const adapter = db.adapters.createPg();
  return new adapter.Pool();
};

export const connectDatabase = (dbUrl) => {
  if (!dbUrl) {
    throw new Error("DB_URL is not set");
  }

  if (dbUrl.startsWith("memory://")) {
    pool = createInMemoryPool();
    console.log("✅ Using in-memory PostgreSQL-compatible database");
    return;
  }

  pool = new Pool({
    connectionString: dbUrl,
  });
};

export const query = (text, params) => {
  if (!pool) throw new Error("Database not connected! Call connectDatabase() first.");
  return pool.query(text, params);
};

export const getClient = async () => {
  if (!pool) throw new Error("Database not connected! Call connectDatabase() first.");
  return pool.connect();
};

query.getClient = getClient;

export const checkConnection = async () => {
  try {
    await query("SELECT 1");
    console.log("✅ DB Connected successfully");
  } catch (e) {
    throw new Error('❌ Failed to connect to DB: ' + e.message);
  }
};
