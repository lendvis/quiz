import express from "express";
import { getImage, publishImage } from "../controllers/ImageController.js";
import { uploadSingle } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const imageRouter = express.Router();

// Картинки меняют содержимое теста, поэтому доступ такой же, как у остальных операций
// редактирования: только преподаватель и руководство. Чтение остаётся открытым.
const canEditImages = [authMiddleware, roleMiddleware("teacher", "leadership")];

imageRouter.post("/quiz/:id", canEditImages, uploadSingle("quiz", "image"), publishImage("quiz"));
imageRouter.get("/quiz/:id", getImage("quiz"));

imageRouter.post("/question/:id", canEditImages, uploadSingle("question", "image"), publishImage("question"));
imageRouter.get("/question/:id", getImage("question"));

export default imageRouter;
