import dotenv from "dotenv";
import { connectDB } from "./Db/sqlite.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1'; // Bind only to localhost for security

// Initialize SQLite database
export const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`⚙️  Server is running at ${HOST}:${PORT} (localhost only - OFFLINE MODE)`);
    });
    
    return server;
  } catch (err) {
    console.log("Database connection failed !!! ", err);
    throw err;
  }
};

// Only start server if not being imported (for Electron integration)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
