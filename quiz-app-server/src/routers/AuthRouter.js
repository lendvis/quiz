import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { check } from "express-validator";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const authRouter = new Router();

const authLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 20),
    standardHeaders: true,
    legacyHeaders: false,
});

const registrationMiddleware = [
    check("username", "Имя пользователя не может быть пустым").notEmpty(),
    check("username", "Имя пользователя должено состоять не менее чем из 4 символов и не более чем 16").isLength({ min: 4, max: 16 }),
    check("password", "Пароль должен состоять не менее чем из 4 символов и не более чем 16").isLength({ min: 4, max: 16 }),
    check("username", "Имя пользователя должено состоять из только из строчных латинских букв и не содержать пробелы").matches(/^[a-z0-9]+$/),
    check("password", "Пароль должен содержать хотя бы одну цифру").matches(/\d/),
    check("password", "Пароль должен состоять из только из латинских букв и не содержать пробелы").matches(/^[A-Za-z0-9]+$/),
    check("displayName", "Введите имя пользователя (минимум 2 символа)").isLength({ min: 2, max: 80 }),
    check("role", "Недопустимая роль").optional().isIn(["student", "leadership"]),
    check("groupId").custom((value, { req }) => {
        const role = typeof req.body.role === "string" ? req.body.role : "student";
        if (role === "student" && (value === undefined || value === null || value === "")) {
            throw new Error("Для ученика нужно выбрать группу");
        }
        return true;
    }),
];

const groupCreateMiddleware = [
    check("name", "Название группы не может быть пустым").notEmpty(),
    check("name", "Название группы должно быть от 2 до 80 символов").isLength({ min: 2, max: 80 }),
];

const teacherCreateMiddleware = [
    check("displayName", "Введите имя преподавателя (минимум 2 символа)").isLength({ min: 2, max: 80 }),
    check("username", "Логин преподавателя не может быть пустым").notEmpty(),
    check("username", "Логин должен быть от 4 до 16 символов").isLength({ min: 4, max: 16 }),
    check("username", "Логин должен содержать только строчные латинские буквы и цифры").matches(/^[a-z0-9]+$/),
    check("password", "Пароль должен быть от 4 до 16 символов").isLength({ min: 4, max: 16 }),
    check("password", "Пароль должен содержать хотя бы одну цифру").matches(/\d/),
    check("password", "Пароль должен содержать только латинские буквы и цифры").matches(/^[A-Za-z0-9]+$/),
    check("groupIds").optional().isArray(),
];

authRouter.post("/register", authLimiter, registrationMiddleware, AuthController.registration);
authRouter.post("/login", authLimiter, AuthController.login);
authRouter.get("/groups/public", AuthController.getPublicGroups);
authRouter.get("/getUserGroup", authMiddleware, AuthController.getUserGroup);
authRouter.get("/getAssignedGroups", authMiddleware, AuthController.getAssignedGroups);
authRouter.get("/profile", authMiddleware, AuthController.getProfile);
authRouter.get(
    "/admin/groups",
    authMiddleware,
    roleMiddleware("leadership"),
    AuthController.listGroups
);
authRouter.post(
    "/admin/groups",
    authMiddleware,
    roleMiddleware("leadership"),
    groupCreateMiddleware,
    AuthController.createGroup
);
authRouter.get(
    "/admin/teachers",
    authMiddleware,
    roleMiddleware("leadership"),
    AuthController.listTeachers
);
authRouter.post(
    "/admin/teachers",
    authMiddleware,
    roleMiddleware("leadership"),
    teacherCreateMiddleware,
    AuthController.createTeacher
);


export default authRouter;
