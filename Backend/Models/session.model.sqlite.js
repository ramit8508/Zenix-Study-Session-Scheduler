import { getDB } from "../Db/sqlite.js";

export class Session {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.subject = data.subject;
    this.type = data.type;
    this.duration = data.duration;
    this.date = data.date;
    this.notes = data.notes;
    this.created_at = data.created_at;
  }

  // Create a new session
  static async create({ user_id, subject, type, duration, date, notes }) {
    const db = getDB();

    const result = await db.run(
      `INSERT INTO study_sessions (user_id, subject, type, duration, date, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, subject, type || 'Study', duration, date, notes || '']
    );

    return await Session.findById(result.lastID);
  }

  // Find session by ID
  static async findById(id) {
    const db = getDB();
    const session = await db.get(`SELECT * FROM study_sessions WHERE id = ?`, [id]);
    return session ? new Session(session) : null;
  }

  // Get all sessions for a user
  static async findByUserId(user_id) {
    const db = getDB();
    const sessions = await db.all(
      `SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date DESC, created_at DESC`,
      [user_id]
    );
    return sessions.map(s => new Session(s));
  }

  // Get sessions for a user with date filter
  static async findByUserIdAndDateRange(user_id, startDate, endDate) {
    const db = getDB();
    const sessions = await db.all(
      `SELECT * FROM study_sessions 
       WHERE user_id = ? AND date >= ? AND date <= ? 
       ORDER BY date DESC`,
      [user_id, startDate, endDate]
    );
    return sessions.map(s => new Session(s));
  }

  // Delete session
  static async deleteById(id, user_id) {
    const db = getDB();
    await db.run(
      `DELETE FROM study_sessions WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );
  }

  // Get analytics for a user
  static async getAnalytics(user_id) {
    const db = getDB();
    
    // Total statistics
    const stats = await db.get(
      `SELECT 
        COUNT(*) as totalSessions,
        SUM(duration) as totalTime,
        AVG(duration) as avgSession
       FROM study_sessions WHERE user_id = ?`,
      [user_id]
    );

    // Weekly data (last 7 days)
    const weeklyData = await db.all(
      `SELECT date, SUM(duration) as totalDuration, COUNT(*) as sessionCount
       FROM study_sessions 
       WHERE user_id = ? AND date >= date('now', '-7 days')
       GROUP BY date
       ORDER BY date ASC`,
      [user_id]
    );

    // Monthly data (last 30 days)
    const monthlyData = await db.all(
      `SELECT date, SUM(duration) as totalDuration, COUNT(*) as sessionCount
       FROM study_sessions 
       WHERE user_id = ? AND date >= date('now', '-30 days')
       GROUP BY date
       ORDER BY date ASC`,
      [user_id]
    );

    // Subject breakdown
    const subjectBreakdown = await db.all(
      `SELECT subject, SUM(duration) as totalDuration, COUNT(*) as sessionCount
       FROM study_sessions 
       WHERE user_id = ?
       GROUP BY subject
       ORDER BY totalDuration DESC`,
      [user_id]
    );

    return {
      totalSessions: stats.totalSessions || 0,
      totalTime: stats.totalTime || 0,
      avgSession: stats.avgSession || 0,
      weeklyData: weeklyData || [],
      monthlyData: monthlyData || [],
      subjectBreakdown: subjectBreakdown || []
    };
  }

  // Get today's total study time for a user
  static async getTodayStudyTime(user_id) {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];
    
    const result = await db.get(
      `SELECT SUM(duration) as totalTime
       FROM study_sessions 
       WHERE user_id = ? AND date = ?`,
      [user_id, today]
    );

    return result.totalTime || 0;
  }
}
