import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(403).json({ message: "Пользователь не авторизован" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(403).json({ message: "Пользователь не авторизован" });
        }

        const decodedData = jwt.verify(token, process.env.SECRET);
        req.user = decodedData;

        next();
    } catch (e) {
        console.error(e);
        return res.status(401).json({ message: "Неверный токен" });
    }
};
