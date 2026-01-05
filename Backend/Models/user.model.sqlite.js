import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../Db/sqlite.js";

export class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create({ name, email, password }) {
    const db = getDB();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hashedPassword]
    );

    return await User.findById(result.lastID);
  }

  // Find user by ID
  static async findById(id) {
    const db = getDB();
    const user = await db.get(`SELECT * FROM users WHERE id = ?`, [id]);
    return user ? new User(user) : null;
  }

  // Find user by email
  static async findOne(query) {
    const db = getDB();
    if (query.email) {
      const user = await db.get(`SELECT * FROM users WHERE email = ?`, [
        query.email,
      ]);
      return user ? new User(user) : null;
    }
    return null;
  }

  // Compare password
  async isPasswordCorrect(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Generate access token
  generateAccessToken() {
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
        name: this.name,
      },
      process.env.JWT_SECRET || "your-secret-key-change-this",
      {
        expiresIn: "7d",
      }
    );
  }

  // Get user without password
  static async findByIdWithoutPassword(id) {
    const db = getDB();
    const user = await db.get(
      `SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?`,
      [id]
    );
    return user;
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
