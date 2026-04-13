import { query } from "../db.js";

export const roleMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      let role = req.user?.role;

      // Current JWT payload may contain only user id, so we lazily resolve role from DB.
      if (!role && req.user?.id) {
        const roleResult = await query(
          `SELECT r.name AS role
           FROM public."user" u
           JOIN public."role" r ON r.id = u.role_id
           WHERE u.id = $1`,
          [req.user.id]
        );

        role = roleResult.rows[0]?.role;
        if (role) {
          req.user.role = role;
        }
      }

      if (!role) {
        return res.status(403).json({ message: "Роль пользователя не определена" });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Недостаточно прав для выполнения действия" });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Ошибка при проверке прав доступа" });
    }
  };
};
