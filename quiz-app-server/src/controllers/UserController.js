const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../auth/jwt");
const UserRepository = require("./UserRepository");

class UserController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await UserRepository.findByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Пароль неверен" });
      }

      const token = generateAccessToken(user.id, user.role);

      return res.json({
        token,
        role: user.role,
        group: user.group_name,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.userId; // set by verifyToken middleware
      const user = await UserRepository.findById(userId);

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json({
        id: user.id,
        username: user.username,
        group: user.group_name,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = UserController;