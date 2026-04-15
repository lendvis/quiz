import { query } from "../db.js";
import quizRepository from "../respository/quizRepository.js";
import { normalizeQuizSettings } from "../utils/quizSettings.js";

const createHttpError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

class QuizService {
    async resolveUserRole(user) {
        if (user?.role) {
            return user.role;
        }

        if (!user?.id) {
            return null;
        }

        const roleResult = await query(
            `SELECT r.name AS role
             FROM public."user" u
             JOIN public."role" r ON r.id = u.role_id
             WHERE u.id = $1`,
            [user.id]
        );

        const role = roleResult.rows[0]?.role || null;
        if (role) {
            user.role = role;
        }
        return role;
    }

    async assertCanManageQuiz(quizId, user) {
        const quizMeta = await quizRepository.getQuizMeta(quizId);
        if (!quizMeta) {
            throw createHttpError("Тест не найден", 404);
        }

        const role = await this.resolveUserRole(user);

        if (role === "leadership") {
            return quizMeta;
        }

        if (Number(quizMeta.author_id) !== Number(user?.id)) {
            throw createHttpError("Недостаточно прав для изменения этого теста", 403);
        }

        return quizMeta;
    }

    async createQuiz(data, authorId) {
        const { name, description, image } = data;
        const settings = normalizeQuizSettings(data?.settings);
        return quizRepository.create(name, description, image, authorId, settings);
    }

    async getQuizzes(filters) {
        return quizRepository.findAll(filters);
    }

    async getQuizById(id) {
        const quizResult = await quizRepository.findById(id);
        if (!quizResult.rows.length) return null;

        const questionsRaw = await quizRepository.getQuestionsWithAnswers(id);
        const questionsMap = new Map();

        for (const row of questionsRaw.rows) {
            if (!questionsMap.has(row.question_id)) {
                questionsMap.set(row.question_id, {
                    id: row.question_id,
                    text: row.question_text,
                    image: row.question_image,
                    answers: []
                });
            }

            if (row.answer_id) {
                questionsMap.get(row.question_id).answers.push({
                    id: row.answer_id,
                    text: row.answer_text,
                    // Принудительно приводим к Boolean, если из БД пришло что-то иное
                    is_correct: !!row.is_correct
                });
            }
        }

        return {
            ...quizResult.rows[0],
            settings: normalizeQuizSettings(quizResult.rows[0].settings),
            questions: Array.from(questionsMap.values())
        };
    }

    /**
     * Исправлено: теперь корректно находит вопрос по его порядковому номеру
     */
    async getQuestionByNumber(quizId, questionNumber) {
        // Сначала получаем весь квиз со всеми вопросами и ответами
        const fullQuiz = await this.getQuizById(quizId);
        if (!fullQuiz || !fullQuiz.questions) return null;

        // Номер вопроса обычно передается с 1 (человеческий вид), 
        // поэтому берем индекс [questionNumber - 1]
        const question = fullQuiz.questions[questionNumber - 1];

        return question || null;
    }

    async submitResult(userId, quizId, answers) {
        return quizRepository.upsertResult(userId, quizId, answers);
    }

    async createQuizStats(userId, quizId) {
        const quizMeta = await quizRepository.getQuizMeta(quizId);
        if (!quizMeta) {
            throw createHttpError("Тест не найден", 404);
        }

        const settings = normalizeQuizSettings(quizMeta.settings);
        if (!settings.allowRetake) {
            const existingQuizStatsId = await quizRepository.getLastQuizStats(userId, quizId);
            if (existingQuizStatsId !== -1) {
                return existingQuizStatsId;
            }
        }

        return quizRepository.createQuizStats(userId, quizId);
    }

    async getQuizByQuizStatsId(quizStatsId) {
        return await quizRepository.getQuizByQuizStatsId(quizStatsId);
    }

    async submitQuestionResult(userId, quizStatsId, questionId, answerOptionId) {
        const result = await quizRepository.upsertQuestionResult(userId, quizStatsId, questionId, answerOptionId);

        if (!result.rowCount) {
            throw new Error("Попытка прохождения не найдена или не принадлежит пользователю");
        }

        return result;
    }

    async getLastAnsweredQuestionId(quizStatsId) {
        return await quizRepository.getLastAnsweredQuestionId(quizStatsId);
    }

    async getLastQuizStats(userId, quizId) {
        return await quizRepository.getLastQuizStats(userId, quizId);
    }

    async getQuizStatsSummary(quizStatsId, requester = null) {
        if (requester?.id) {
            const statsMeta = await quizRepository.getQuizStatsMeta(quizStatsId);
            if (!statsMeta) {
                return null;
            }

            const role = await this.resolveUserRole(requester);
            const isOwner = Number(statsMeta.user_id) === Number(requester.id);
            const isAuthor = Number(statsMeta.author_id) === Number(requester.id);
            let canRead = isOwner || role === "leadership";

            if (!canRead && role === "teacher") {
                if (isAuthor) {
                    canRead = true;
                } else {
                    canRead = await quizRepository.canTeacherAccessStudent(
                        requester.id,
                        statsMeta.user_id
                    );
                }
            }

            if (!canRead) {
                throw createHttpError("Недостаточно прав для просмотра статистики", 403);
            }
        }

        const summary = await quizRepository.getQuizStatsSummary(quizStatsId);

        if (!summary) {
            return null;
        }

        const totalQuestions = Number(summary.totalQuestions) || 0;
        const correctAnswers = Number(summary.correctAnswers) || 0;
        const passPercent = Number(summary.passPercent) || 60;

        const rawAccuracy = totalQuestions > 0
            ? (correctAnswers / totalQuestions) * 100
            : 0;

        const accuracy = Number(rawAccuracy.toFixed(2));
        const isPassed = totalQuestions > 0 && accuracy >= passPercent;

        return {
            ...summary,
            accuracy,
            passPercent,
            isPassed
        };
    }

    async getQuizSummaryList(requester, quizId, targetUserId = null) {
        if (!requester?.id) {
            throw createHttpError("Пользователь не авторизован", 401);
        }

        const requestedUserId = Number(targetUserId);
        const hasRequestedUser = Number.isInteger(requestedUserId) && requestedUserId > 0;
        const actualTargetUserId = hasRequestedUser ? requestedUserId : Number(requester.id);

        if (actualTargetUserId !== Number(requester.id)) {
            const role = await this.resolveUserRole(requester);
            if (role === "leadership") {
                return await quizRepository.getQuizSummaryList(actualTargetUserId, quizId);
            }

            if (role !== "teacher") {
                throw createHttpError("Недостаточно прав для просмотра статистики", 403);
            }

            const canAccessStudent = await quizRepository.canTeacherAccessStudent(
                requester.id,
                actualTargetUserId
            );

            if (!canAccessStudent) {
                throw createHttpError("Преподаватель может просматривать только своих учеников", 403);
            }
        }

        return await quizRepository.getQuizSummaryList(actualTargetUserId, quizId);
    }

    async getResult(userId, quizId) {
        return quizRepository.getResult(userId, quizId);
    }

    async isPassed(userId, quizId) {
        const statsIds = await quizRepository.getQuizSummaryList(userId, quizId);
        if (!statsIds.length) {
            return false;
        }

        for (const statsId of statsIds) {
            const summary = await this.getQuizStatsSummary(statsId);
            if (summary?.isPassed) {
                return true;
            }
        }

        return false;
    }

    async getQuizCards(name, authorId, userId, passed, self, assigned) {
        const params = [];
        const conditions = [];
        const joins = [
            `LEFT JOIN question ON question.quiz_id = qz.id`,
        ];

        if (self && userId) {
            authorId = userId;
        }

        if (typeof name === 'string' && name.trim().length > 0) {
            params.push(`%${name.trim()}%`);
            conditions.push(`qz.name ILIKE $${params.length}`);
        }

        if (authorId !== undefined && authorId !== null) {
            params.push(Number(authorId));
            conditions.push(`qz.author_id = $${params.length}`);
        }
        if (assigned && userId) {
            params.push(userId);
            joins.push(
                `JOIN assigned_quiz aq ON aq.quiz_id = qz.id`,
                `JOIN public."user" u_assigned ON u_assigned.group_id = aq.group_id AND u_assigned.id = $${params.length}`
            );
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const result = await query(`
            SELECT 
                qz.id,
                qz.name,
                qz.description,
                qz.image,
                COUNT(question.id) AS question_count
            FROM quiz qz
            ${joins.join("\n")}
            ${whereClause}
            GROUP BY qz.id, qz.name, qz.description, qz.image
            ORDER BY qz.id DESC
        `, params);

        const cards = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            image: row.image,
            questionCount: Number(row.question_count)
        }));

        if (!userId) {
            return cards;
        }

        const quizIds = cards.map((card) => Number(card.id)).filter((quizId) => Number.isInteger(quizId));
        const statusRows = await quizRepository.getUserQuizStatuses(userId, quizIds);
        const statusByQuizId = new Map(
            statusRows.map((statusRow) => [statusRow.quizId, statusRow])
        );

        const cardsWithStatus = cards.map((card) => {
            const quizId = Number(card.id);
            const statusRow = statusByQuizId.get(quizId);

            return {
                ...card,
                isAssigned: statusRow ? statusRow.isAssigned : false,
                hasAttempt: statusRow ? statusRow.attemptCount > 0 : false,
                isPassed: statusRow ? statusRow.hasPassed : false,
                attemptCount: statusRow ? statusRow.attemptCount : 0
            };
        });

        if (passed === undefined) {
            return cardsWithStatus;
        }

        const expectedPassed = passed === "true" || passed === true;
        return cardsWithStatus.filter((card) => Boolean(card.isPassed) === expectedPassed);
    }

    async updateQuestion(quizId, questionId, data, user) {
        await this.assertCanManageQuiz(quizId, user);
        const { text, answers } = data;
        return quizRepository.updateQuestion(quizId, questionId, text, answers);
    }

    async updateFullQuiz(quizId, data, user) {
        await this.assertCanManageQuiz(quizId, user);

        const payload = {
            ...data,
        };

        if (Object.prototype.hasOwnProperty.call(data, "settings")) {
            payload.settings = normalizeQuizSettings(data.settings);
        }

        return quizRepository.updateFullQuiz(quizId, payload);
    }

    async getAssignedQuizCards(groupId) {

    }

    async assignQuizToGroups(quizId, groupIds, user) {
        const quizMeta = await quizRepository.getQuizMeta(quizId);
        if (!quizMeta) {
            throw createHttpError("Тест не найден", 404);
        }

        if (!Array.isArray(groupIds) || groupIds.length === 0) {
            throw createHttpError("Нет выбранных групп");
        }

        const normalizedGroupIds = [...new Set(
            groupIds
                .map((groupId) => Number(groupId))
                .filter((groupId) => Number.isInteger(groupId) && groupId > 0)
        )];

        if (!normalizedGroupIds.length) {
            throw createHttpError("Нет корректных групп для назначения");
        }

        const role = await this.resolveUserRole(user);
        if (role !== "teacher" && role !== "leadership") {
            throw createHttpError("Недостаточно прав для назначения теста", 403);
        }

        if (role === "teacher") {
            const allowedGroupIds = new Set(await quizRepository.getTeacherGroupIds(user.id));
            const deniedGroups = normalizedGroupIds.filter((groupId) => !allowedGroupIds.has(groupId));
            if (deniedGroups.length > 0) {
                throw createHttpError("Преподаватель может назначать тест только своим группам", 403);
            }
        }

        const values = [];
        const params = [];

        normalizedGroupIds.forEach((groupId, index) => {
            const base = index * 3;
            params.push(quizId, user.id, groupId);
            values.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
        });

        const sql = `
      INSERT INTO assigned_quiz (quiz_id, appointor_id, group_id)
      VALUES ${values.join(', ')}
      ON CONFLICT (quiz_id, group_id) DO NOTHING
      RETURNING *;
    `;

        const result = await query(sql, params);
        return result.rows;
    }

    async getStudentsQuizResults(quizId, requester) {
        const quizMeta = await quizRepository.getQuizMeta(quizId);
        if (!quizMeta) {
            throw createHttpError("Тест не найден", 404);
        }

        const role = await this.resolveUserRole(requester);
        if (role !== "teacher" && role !== "leadership") {
            throw createHttpError("Недостаточно прав для просмотра результатов", 403);
        }

        let allowedGroupIds = null;

        if (role === "teacher") {
            allowedGroupIds = await quizRepository.getTeacherGroupIds(requester.id);
            if (!allowedGroupIds.length) {
                return [];
            }
        }

        const results = await quizRepository.getStudentsQuizResults(quizId, allowedGroupIds);

        return results.map((attempt) => {
            const totalQuestions = Number(attempt.totalQuestions || 0);
            const answeredQuestions = Number(attempt.answeredQuestions || 0);
            const correctAnswers = Number(attempt.correctAnswers || 0);
            const passPercent = Number(attempt.passPercent || 60);
            const wrongAnswers = Math.max(0, answeredQuestions - correctAnswers);
            const unanswered = Math.max(0, totalQuestions - answeredQuestions);
            const rawAccuracy = totalQuestions > 0
                ? (correctAnswers / totalQuestions) * 100
                : 0;
            const accuracy = Number(rawAccuracy.toFixed(2));
            const isPassed = totalQuestions > 0 && accuracy >= passPercent;

            return {
                ...attempt,
                totalQuestions,
                answeredQuestions,
                correctAnswers,
                wrongAnswers,
                unanswered,
                passPercent,
                accuracy,
                isPassed,
            };
        });
    }
}

export default new QuizService();
