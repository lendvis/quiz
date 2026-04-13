import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRouter from './routers/AuthRouter.js';
import quizRouter from './routers/QuizRouter.js';
import { checkConnection, connectDatabase } from './db.js';
import imageRouter from './routers/imageRouter.js';

// === Получение __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Подгрузка env файла
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: path.join(__dirname, `../.env.${env}`) });
console.log("Loaded env file:", env);

const requiredEnvVars = ["DB_URL", "SECRET"];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// === Создаем Express
const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// === Middleware
app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// === Роуты API
app.use('/api/auth', authRouter);
app.use('/api/quizzes', quizRouter);
app.use('/api/image', imageRouter);

// === Подключение к базе
connectDatabase(process.env.DB_URL);

// === Проверка соединения и запуск сервера
async function startApp() {
    try {
        await checkConnection();

        const port = process.env.PORT || 5000;

        // Важно слушать 0.0.0.0, чтобы был доступ с внешнего IP
        app.listen(port, '0.0.0.0', () => {
            console.log(`SERVER STARTED AT PORT ${port}`);
        });
    } catch (e) {
        console.error("Failed to start server:", e);
        process.exit(1);
    }
}

startApp();
