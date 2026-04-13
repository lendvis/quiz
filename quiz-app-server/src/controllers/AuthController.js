import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { getClient, query } from "../db.js";

const PUBLIC_REGISTRATION_ROLES = new Set(["student", "leadership"]);

const normalizeRole = (value) => {
  if (typeof value !== "string") {
    return "student";
  }

  const normalized = value.trim().toLowerCase();
  return normalized || "student";
};

const trimString = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const collectFieldErrors = (errors) => {
  const fieldErrors = {};
  for (const err of errors.array()) {
    if (!fieldErrors[err.path]) {
      fieldErrors[err.path] = err.msg;
    }
  }
  return fieldErrors;
};

const mapGroup = (row) => ({
  id: Number(row.id),
  name: row.name,
});

const mapUser = (row) => ({
  id: Number(row.id),
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  group: row.group_id ? { id: Number(row.group_id), name: row.group_name } : null,
});

const getRoleIdByName = async (roleName) => {
  const result = await query(`SELECT id FROM public."role" WHERE name = $1`, [roleName]);
  return result.rows[0]?.id ?? null;
};

const getUserById = async (userId) => {
  const result = await query(
    `
      SELECT
        u.id,
        u.username,
        u.display_name,
        r.name AS role,
        g.id AS group_id,
        g.name AS group_name
      FROM public."user" u
      JOIN public."role" r ON r.id = u.role_id
      LEFT JOIN public."group" g ON g.id = u.group_id
      WHERE u.id = $1
    `,
    [userId],
  );

  return result.rows[0] || null;
};

const buildTokenPayload = (user) => ({
  id: user.id,
  role: user.role,
  displayName: user.display_name,
  username: user.username,
});

const generateAccessToken = (user) => {
  return jwt.sign(buildTokenPayload(user), process.env.SECRET, { expiresIn: "24h" });
};

const toIntArray = (raw) => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return [...new Set(raw.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))];
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Ошибка регистрации", errors: collectFieldErrors(errors) });
      }

      const username = trimString(req.body.username);
      const password = req.body.password;
      const displayName = trimString(req.body.displayName);
      const normalizedRole = normalizeRole(req.body.role);
      const leadershipRegistrationCode = trimString(req.body.leadershipRegistrationCode);
      const groupId = req.body.groupId;

      if (!PUBLIC_REGISTRATION_ROLES.has(normalizedRole)) {
        return res.status(403).json({
          message: "Публичная регистрация недоступна для выбранной роли",
          errors: { role: "Роль преподавателя может создать только руководство" },
        });
      }

      if (normalizedRole === "leadership") {
        const configuredLeadershipCode = trimString(process.env.LEADERSHIP_REGISTRATION_CODE);
        if (!configuredLeadershipCode) {
          return res.status(403).json({
            message: "Регистрация руководства отключена",
            errors: { leadershipRegistrationCode: "Код регистрации руководства не настроен" },
          });
        }

        if (leadershipRegistrationCode !== configuredLeadershipCode) {
          return res.status(403).json({
            message: "Ошибка регистрации",
            errors: { leadershipRegistrationCode: "Неверный код регистрации руководства" },
          });
        }
      }

      const roleId = await getRoleIdByName(normalizedRole);
      if (!roleId) {
        return res.status(400).json({
          message: "Ошибка регистрации",
          errors: { role: "Роль не найдена" },
        });
      }

      let normalizedGroupId = null;
      if (normalizedRole === "student") {
        normalizedGroupId = Number(groupId);
        if (!Number.isInteger(normalizedGroupId) || normalizedGroupId <= 0) {
          return res.status(400).json({
            message: "Ошибка регистрации",
            errors: { groupId: "Для ученика необходимо указать корректную группу" },
          });
        }

        const groupResult = await query(`SELECT id FROM public."group" WHERE id = $1`, [normalizedGroupId]);
        if (!groupResult.rows.length) {
          return res.status(400).json({
            message: "Ошибка регистрации",
            errors: { groupId: "Выбранная группа не существует" },
          });
        }
      }

      const existingUser = await query(`SELECT id FROM public."user" WHERE username = $1`, [username]);
      if (existingUser.rows.length) {
        return res.status(400).json({
          message: "Ошибка регистрации",
          errors: { username: "Это имя уже используется" },
        });
      }

      const hashPassword = await bcrypt.hash(password, 7);

      const createdUserResult = await query(
        `
          INSERT INTO public."user" (display_name, username, password, role_id, group_id, created_by)
          VALUES ($1, $2, $3, $4, $5, NULL)
          RETURNING id
        `,
        [displayName, username, hashPassword, roleId, normalizedGroupId],
      );

      const createdUser = await getUserById(createdUserResult.rows[0].id);
      if (!createdUser) {
        return res.status(500).json({ message: "Не удалось получить данные зарегистрированного пользователя" });
      }

      const token = generateAccessToken(createdUser);
      const user = mapUser(createdUser);

      return res.status(201).json({
        message: "OK",
        token,
        role: user.role,
        user,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "При регистрации произошла неизвестная ошибка" });
    }
  }

  async login(req, res) {
    try {
      const username = trimString(req.body.username);
      const password = req.body.password;

      const userQuery = await query(
        `
          SELECT
            u.id,
            u.username,
            u.display_name,
            u.password,
            r.name AS role,
            g.id AS group_id,
            g.name AS group_name
          FROM public."user" u
          JOIN public."role" r ON u.role_id = r.id
          LEFT JOIN public."group" g ON u.group_id = g.id
          WHERE u.username = $1
        `,
        [username],
      );

      if (!userQuery.rows.length) {
        return res.status(400).json({
          message: "Ошибка входа",
          errors: { username: "Пользователь не найден" },
        });
      }

      const user = userQuery.rows[0];

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({
          message: "Ошибка входа",
          errors: { password: "Пароль не верен" },
        });
      }

      const token = generateAccessToken(user);
      const mappedUser = mapUser(user);

      return res.json({
        message: "OK",
        token,
        role: mappedUser.role,
        user: mappedUser,
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: "При входе произошла неизвестная ошибка" });
    }
  }

  async getUserGroup(req, res) {
    try {
      const result = await query(
        `
          SELECT g.id, g.name
          FROM public."user" u
          LEFT JOIN public."group" g ON u.group_id = g.id
          WHERE u.id = $1
        `,
        [req.user.id],
      );

      if (!result.rows.length || !result.rows[0].id) {
        return res.status(404).json({ message: "Группа пользователя не найдена" });
      }

      return res.json({ group: mapGroup(result.rows[0]) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка при получении группы пользователя" });
    }
  }

  async getAssignedGroups(req, res) {
    try {
      const userRole = req.user.role;
      let groups = [];

      if (userRole === "leadership") {
        const allGroups = await query(
          `
            SELECT g.id, g.name
            FROM public."group" g
            ORDER BY g.name
          `,
        );
        groups = allGroups.rows;
      } else if (userRole === "teacher") {
        const teacherGroups = await query(
          `
            SELECT g.id, g.name
            FROM public.teacher_group tg
            JOIN public."group" g ON g.id = tg.group_id
            WHERE tg.teacher_id = $1
            ORDER BY g.name
          `,
          [req.user.id],
        );
        groups = teacherGroups.rows;
      } else {
        return res.status(403).json({ message: "Доступ только для преподавателей и руководства" });
      }

      return res.json({ groups: groups.map(mapGroup) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка при получении доступных групп" });
    }
  }

  async getProfile(req, res) {
    try {
      const userRow = await getUserById(req.user.id);

      if (!userRow) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const user = mapUser(userRow);

      return res.json({
        ...user,
        user,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка при получении профиля пользователя" });
    }
  }

  async getPublicGroups(req, res) {
    try {
      const result = await query(
        `
          SELECT id, name
          FROM public."group"
          ORDER BY name
        `,
      );

      return res.json({ groups: result.rows.map(mapGroup) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка при получении списка групп" });
    }
  }

  async listGroups(req, res) {
    try {
      const result = await query(
        `
          SELECT
            g.id,
            g.name,
            (
              SELECT COUNT(*)::int
              FROM public."user" u
              JOIN public."role" r ON r.id = u.role_id
              WHERE u.group_id = g.id AND r.name = 'student'
            ) AS students_count,
            (
              SELECT COUNT(*)::int
              FROM public.teacher_group tg
              WHERE tg.group_id = g.id
            ) AS teachers_count
          FROM public."group" g
          ORDER BY g.name
        `,
      );

      const groups = result.rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        studentsCount: Number(row.students_count || 0),
        teachersCount: Number(row.teachers_count || 0),
      }));

      return res.json({ groups });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка при получении списка групп" });
    }
  }

  async createGroup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Ошибка создания группы", errors: collectFieldErrors(errors) });
      }

      const name = trimString(req.body.name);

      const created = await query(
        `
          INSERT INTO public."group" (name)
          VALUES ($1)
          RETURNING id, name
        `,
        [name],
      );

      return res.status(201).json({
        message: "Группа успешно создана",
        group: mapGroup(created.rows[0]),
      });
    } catch (err) {
      console.error(err);
      if (err.code === "23505") {
        return res.status(400).json({
          message: "Ошибка создания группы",
          errors: { name: "Группа с таким названием уже существует" },
        });
      }
      return res.status(500).json({ message: "Ошибка при создании группы" });
    }
  }

  async listTeachers(req, res) {
    try {
      const result = await query(
        `
          SELECT
            u.id,
            u.username,
            u.display_name,
            u.created_at,
            g.id AS group_id,
            g.name AS group_name
          FROM public."user" u
          JOIN public."role" r ON r.id = u.role_id
          LEFT JOIN public.teacher_group tg ON tg.teacher_id = u.id
          LEFT JOIN public."group" g ON g.id = tg.group_id
          WHERE r.name = 'teacher'
          ORDER BY u.display_name, u.username, g.name
        `,
      );

      const teachersById = new Map();
      for (const row of result.rows) {
        const teacherId = Number(row.id);
        if (!teachersById.has(teacherId)) {
          teachersById.set(teacherId, {
            id: teacherId,
            username: row.username,
            displayName: row.display_name,
            createdAt: row.created_at,
            groups: [],
          });
        }

        if (row.group_id) {
          teachersById.get(teacherId).groups.push({
            id: Number(row.group_id),
            name: row.group_name,
          });
        }
      }

      return res.json({ teachers: Array.from(teachersById.values()) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка при получении списка преподавателей" });
    }
  }

  async createTeacher(req, res) {
    const client = await getClient();
    let transactionStarted = false;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Ошибка создания преподавателя", errors: collectFieldErrors(errors) });
      }

      const username = trimString(req.body.username);
      const password = req.body.password;
      const displayName = trimString(req.body.displayName);
      const groupIds = toIntArray(req.body.groupIds);

      const roleId = await getRoleIdByName("teacher");
      if (!roleId) {
        return res.status(500).json({ message: "Роль преподавателя не настроена в системе" });
      }

      const existingUser = await query(`SELECT id FROM public."user" WHERE username = $1`, [username]);
      if (existingUser.rows.length) {
        return res.status(400).json({
          message: "Ошибка создания преподавателя",
          errors: { username: "Это имя уже используется" },
        });
      }

      if (groupIds.length > 0) {
        const placeholders = groupIds.map((_, index) => `$${index + 1}`).join(", ");
        const groupsResult = await query(
          `SELECT id FROM public."group" WHERE id IN (${placeholders})`,
          groupIds,
        );

        if (groupsResult.rows.length !== groupIds.length) {
          return res.status(400).json({
            message: "Ошибка создания преподавателя",
            errors: { groupIds: "Одна или несколько групп не найдены" },
          });
        }
      }

      const hashPassword = await bcrypt.hash(password, 7);

      await client.query("BEGIN");
      transactionStarted = true;

      const createdTeacher = await client.query(
        `
          INSERT INTO public."user" (display_name, username, password, role_id, group_id, created_by)
          VALUES ($1, $2, $3, $4, NULL, $5)
          RETURNING id
        `,
        [displayName, username, hashPassword, roleId, req.user.id],
      );

      const teacherId = createdTeacher.rows[0].id;

      for (const groupId of groupIds) {
        await client.query(
          `
            INSERT INTO public.teacher_group (teacher_id, group_id)
            VALUES ($1, $2)
            ON CONFLICT (teacher_id, group_id) DO NOTHING
          `,
          [teacherId, groupId],
        );
      }

      await client.query("COMMIT");
      transactionStarted = false;

      const teacherRow = await getUserById(teacherId);
      if (!teacherRow) {
        return res.status(500).json({ message: "Не удалось получить данные преподавателя" });
      }

      let groups = [];
      if (groupIds.length > 0) {
        const placeholders = groupIds.map((_, index) => `$${index + 1}`).join(", ");
        const groupsResult = await query(
          `SELECT id, name FROM public."group" WHERE id IN (${placeholders}) ORDER BY name`,
          groupIds,
        );
        groups = groupsResult.rows.map(mapGroup);
      }

      return res.status(201).json({
        message: "Преподаватель успешно создан",
        teacher: {
          ...mapUser(teacherRow),
          groups,
        },
      });
    } catch (err) {
      if (transactionStarted) {
        await client.query("ROLLBACK");
      }
      console.error(err);
      if (err.code === "23505") {
        return res.status(400).json({
          message: "Ошибка создания преподавателя",
          errors: { username: "Это имя уже используется" },
        });
      }
      return res.status(500).json({ message: "Ошибка при создании преподавателя" });
    } finally {
      client.release();
    }
  }
}

export default new authController();
