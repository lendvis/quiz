import { Router } from "express";
import QuizController from "../controllers/QuizController.js"
import ImageController from "../controllers/ImageControllerOld.js"
import { authMiddleware } from "../middleware/authMiddleware.js";

const apiRouter = new Router();

//apiRouter.post("/createQuiz", QuizController.createQuiz)
//apiRouter.get("/quizcards", QuizController.getQuizCards)
//apiRouter.get("/quizcardsPassed", QuizController.getQuizCards)
//apiRouter.get("/quiz/:id", QuizController.getOne)
//apiRouter.post("/postResults", authMiddleware, QuizController.postResults)
//apiRouter.get("/results", authMiddleware, QuizController.getResults)
//apiRouter.get("/isPassed/:id", authMiddleware, QuizController.getResults)
//apiRouter.get("/image/quiz/:id", ImageController.getQuizImage)
//apiRouter.get("/image/question/:id", ImageController.getQuestionImage)
//apiRouter.get("/getUsername", authMiddleware, QuizController.getUsernameByToken)

export default apiRouter;