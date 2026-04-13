// src/config.js
import dotenv from "dotenv";
import path from "path";

const envFile = process.env.NODE_ENV === "production"
  ? ".env.production"
  : ".env.development";

dotenv.config({ path: path.join(process.cwd(), envFile) });

console.log(`Environment loaded: ${envFile}`);
console.log(`DB_URL is ${process.env.DB_URL ? 'set' : 'NOT SET'}`);