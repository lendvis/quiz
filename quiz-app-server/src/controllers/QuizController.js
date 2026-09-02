import quizService from "../services/quizService.js";

class QuizController {

    async create(req, res) {
        const result = await quizService.createQuiz(req.body, req.user.id);
        res.status(201).json(result.rows[0]);
    }

    async getAll(req, res) {
        const result = await quizService.getQuizzes(req.query);
        res.json(result.rows);
    }

    async getOne(req, res) {
        const quiz = await quizService.getQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ message: "Тест не найден" });
        res.json(quiz);
    }


    async getAnalytics(req, res) {
        try {
            const analytics = await quizService.getQuizAnalytics(req.user, req.params.quizId);
            res.json(analytics);
        } catch (err) {
            res.status(err.statusCode || 500).json({ message: err.message || "Не удалось собрать аналитику" });
        }
    }

    async submitResult(req, res) {
        await quizService.submitResult(
            req.user.id,
            req.body.quizId,
            req.body.answers
        );
        res.status(200).json({ message: "Результат сохранён" });
    }

    async createQuizStats(req, res) {
        try {
            const newQuizStatsId = await quizService.createQuizStats(req.user.id, req.params.quizId);
            res.status(200).json({ quiz_stats_id: newQuizStatsId });
        } catch (err) {
            console.error(err);
            res.status(err.statusCode || 500).json({ message: err.message || "Ошибка при старте прохождения" });
        }
    }

    async getQuizByQuizStatsId(req, res) {
        const quizId = await quizService.getQuizByQuizStatsId(req.params.quizStatsId);
        res.status(200).json({ quiz_id: quizId });
    }

    async submitQuestionResult(req, res) {
        try {
            await quizService.submitQuestionResult(
                req.user.id,
                req.body.quizStatsId,
                req.body.questionId,
                req.body.answerOptionId
            );
            res.status(200).json({ message: "Ответ записан" });
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: err.message || "Ошибка при сохранении ответа" });
        }
    }

    async getLastAnsweredQuestionId(req, res) {
        const questionId = await quizService.getLastAnsweredQuestionId(req.params.quizStatsId)
        res.status(200).json({ question_id: questionId })
    }

    async getLastQuizStats(req, res) {
        const lastQuizStatsId = await quizService.getLastQuizStats(req.user.id, req.params.quizId);
        res.status(200).json({ last_quiz_stats_id: lastQuizStatsId })
    }

    async getQuizStatsSummary(req, res) {
        try {
            const response = await quizService.getQuizStatsSummary(req.params.quizStatsId, req.user);
            if (!response) {
                return res.status(404).json({ message: "Статистика прохождения не найдена" });
            }
            res.status(200).json(response);
        } catch (err) {
            console.error(err);
            res.status(err.statusCode || 500).json({ message: err.message || "Ошибка при получении статистики" });
        }
    }

    async getQuizSummaryList(req, res) {
        try {
            const targetUserId = req.query.userId !== undefined
                ? Number(req.query.userId)
                : null;

            const response = await quizService.getQuizSummaryList(
                req.user,
                req.params.quizId,
                targetUserId
            );
            res.status(200).json(response);
        } catch (err) {
            console.error(err);
            res.status(err.statusCode || 500).json({ message: err.message || "Ошибка при получении списка попыток" });
        }
    }

    async getResult(req, res) {
        const result = await quizService.getResult(
            req.user.id,
            req.query.quizId
        );

        if (!result.rows.length)
            return res.status(404).json({ message: "Результат не найден" });

        res.json(result.rows[0]);
    }

    async isPassed(req, res) {
        const passed = await quizService.isPassed(
            req.user.id,
            req.params.id
        );
        res.json({ passed });
    }

    async getCards(req, res) {
        try {
            const name = typeof req.query.name === "string"
                ? req.query.name
                : undefined;

            const authorId = req.query.authorId
                ? Number(req.query.authorId)
                : undefined;

            const passed = req.query.passed !== undefined
                ? req.query.passed === "true"
                : undefined;

            const assigned = req.query.assigned !== undefined
                ? req.query.assigned === "true"
                : undefined;

            const self = req.query.self !== undefined
                ? req.query.self === "true"
                : undefined;


            let userId = undefined;
            if (req.user != undefined) userId = req.user.id;

            const cards = await quizService.getQuizCards(name, authorId, userId, passed, self, assigned);

            res.json(cards);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Ошибка при получении карточек тестов"
            });
        }
    }

    async getPassedCards(req, res) {
        req.query.passed = true;
        await this.getCards(req, res);
    }

    async updateQuestion(req, res) {
        const { quizId, questionId } = req.params;
        try {
            await quizService.updateQuestion(quizId, questionId, req.body, req.user);
            res.status(200).json({ message: "Вопрос обновлён" });
        } catch (err) {
            console.error(err);
            res.status(err.statusCode || 500).json({ message: err.message || "Ошибка при обновлении вопроса" });
        }
    }

    async updateQuiz(req, res) {
        const { id } = req.params

        try {
            await quizService.updateFullQuiz(id, req.body, req.user)
            res.status(200).json({ message: "Quiz обновлён" })
        } catch (err) {
            console.error(err)
            res.status(err.statusCode || 500).json({ message: err.message || "Ошибка при обновлении quiz" })
        }
    }


    async assignQuizToGroups(req, res) {
        try {
            await quizService.assignQuizToGroups(req.body.quizId, req.body.groupIds, req.user);
            res.status(200).json({ message: "Quiz обновлён" })
        } catch (err) {
            console.error(err)
            res.status(err.statusCode || 500).json({ message: err.message || "Ошибка при обновлении quiz" })
        }
    }

    async getStudentQuizResults(req, res) {
        try {
            const results = await quizService.getStudentsQuizResults(req.params.quizId, req.user);
            res.status(200).json(results);
        } catch (err) {
            console.error(err);
            res.status(err.statusCode || 500).json({ message: err.message || "Ошибка при получении результатов учеников" });
        }
    }
}

export default new QuizController();
