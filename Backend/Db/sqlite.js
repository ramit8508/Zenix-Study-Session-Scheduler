import sqlite3 from "sqlite3";
import { open } from "sqlite";
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

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON;");

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        type TEXT DEFAULT 'Study',
        duration INTEGER NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_date ON study_sessions(date);
    `);

    console.log("✅ SQLite database connected and tables initialized!");
    return db;
  } catch (error) {
    console.error("❌ SQLite connection FAILED:", error);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};

export const closeDB = async () => {
  if (db) {
    await db.close();
    db = null;
    console.log("🔌 Database connection closed");
  }
};
