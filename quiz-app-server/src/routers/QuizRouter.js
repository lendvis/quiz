import { Router } from "express";
import quizController from "../controllers/QuizController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import imageRouter from "./imageRouter.js";

const router = Router();

router.post("/", authMiddleware, roleMiddleware("teacher", "leadership"), quizController.create);
router.get("/", quizController.getAll);
router.get('/cards', (req, res, next) => {
    const passed = req.query.passed === "true";
    const assigned = req.query.assigned === "true";
    const hasAuthHeader = typeof req.headers.authorization === "string" && req.headers.authorization.trim().length > 0;

    if (passed || assigned || hasAuthHeader) {
        return authMiddleware(req, res, next);
    }

    return next();
}, quizController.getCards);
//router.get("/cards/passed", authMiddleware,  quizController.getPassedCards.bind(quizController));
router.get(
    "/:quizId/analytics",
    authMiddleware,
    roleMiddleware("teacher", "leadership"),
    quizController.getAnalytics
);

router.get(
    "/:quizId/student-results",
    authMiddleware,
    roleMiddleware("teacher", "leadership"),
    quizController.getStudentQuizResults
);
router.get("/:id", quizController.getOne);

router.post("/begin/:quizId", authMiddleware, quizController.createQuizStats);
router.get("/getQuizByQuizStatsId/:quizStatsId", authMiddleware, quizController.getQuizByQuizStatsId);

router.get("/getLastAnsweredQuestionId/:quizStatsId", authMiddleware, quizController.getLastAnsweredQuestionId);
router.get("/getQuizStatsSummary/:quizStatsId", authMiddleware, quizController.getQuizStatsSummary);
router.get("/getLastQuizStats/:quizId", authMiddleware, quizController.getLastQuizStats);

router.get("/summary/:quizStatsId", authMiddleware, quizController.getQuizStatsSummary);
router.get("/summaryList/:quizId", authMiddleware, quizController.getQuizSummaryList);

router.post("/result/question", authMiddleware, quizController.submitQuestionResult);
router.get("/result/check/:id", authMiddleware, quizController.isPassed);
router.get("/result", authMiddleware, quizController.getResult);
router.put(
    "/:quizId/question/:questionId",
    authMiddleware,
    roleMiddleware("teacher", "leadership"),
    quizController.updateQuestion.bind(quizController)
);

router.post(
    "/assignQuizToGroups",
    authMiddleware,
    roleMiddleware("teacher", "leadership"),
    quizController.assignQuizToGroups
);

router.use("/image/", imageRouter);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("teacher", "leadership"),
    quizController.updateQuiz.bind(quizController)
)

export default router;
