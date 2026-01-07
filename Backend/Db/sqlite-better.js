import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { app } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

const getDBPath = () => {
  // Use electron's userData path for the database
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "zenix-study-tracker.db");
};

export const connectDB = async () => {
  try {
    const dbPath = getDBPath();
    console.log(`📂 Database path: ${dbPath}`);

    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    console.log("✅ Database connected successfully!");
    return db;
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
};

export const closeDB = async () => {
  if (db) {
    db.close();
    db = null;
    console.log("✅ Database connection closed");
  }
};
