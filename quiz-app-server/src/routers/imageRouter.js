import express from "express";
import { getImage, publishImage } from "../controllers/ImageController.js";
import { uploadSingle } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const imageRouter = express.Router();

imageRouter.post("/quiz/:id", authMiddleware, uploadSingle("quiz", "image"), publishImage("quiz"));
imageRouter.get("/quiz/:id", getImage("quiz"));

imageRouter.post("/question/:id", authMiddleware, uploadSingle("question", "image"), publishImage("question"));
imageRouter.get("/question/:id", getImage("question"));

export default imageRouter;
