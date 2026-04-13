// handles database queries
const { query } = require("../db");

class UserRepository {
  static async findById(userId) {
    const result = await query(
      `SELECT u.id, u.username, g.name AS group_name
       FROM "user" u
       LEFT JOIN "group" g ON u.group_id = g.id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async findByUsername(username) {
    const result = await query(
      `SELECT u.id, u.username, u.password, r.name AS role, g.name AS group_name
       FROM "user" u
       LEFT JOIN "role" r ON u.role_id = r.id
       LEFT JOIN "group" g ON u.group_id = g.id
       WHERE u.username = $1`,
      [username]
    );
    return result.rows[0] || null;
  }
}

module.exports = UserRepository;