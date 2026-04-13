import { getClient, query } from "../db.js";

class QuizRepository {
    async create(name, description, image, authorId, settings) {
        return query(
            `INSERT INTO quiz (name, description, image, author_id, settings)
             VALUES ($1, $2, $3, $4, $5::jsonb)
             RETURNING id, name, description, image, settings`,
            [name, description, image, authorId, JSON.stringify(settings)]
        );
    }

    async findAll(filters) {
        const { search, authorId, limit = 20, offset = 0 } = filters;

        let sql = `
            SELECT 
                q.id,
                q.name,
                q.image,
                COUNT(ques.id) AS questions_count
            FROM quiz q
            LEFT JOIN question ques ON ques.quiz_id = q.id AND ques.is_deleted = FALSE
        `;

        const conditions = [];
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`q.name ILIKE $${params.length}`);
        }

        if (authorId) {
            params.push(authorId);
            conditions.push(`q.author_id = $${params.length}`);
        }

        if (conditions.length) {
            sql += ` WHERE ` + conditions.join(" AND ");
        }

        sql += `
            GROUP BY q.id
            ORDER BY q.id DESC
            LIMIT $${params.length + 1}
            OFFSET $${params.length + 2}
        `;

        params.push(limit, offset);

        return query(sql, params);
    }

    async findById(id) {
        return query(
            `SELECT id, name, description, image, settings, author_id
             FROM quiz WHERE id = $1`,
            [id]
        );
    }

    async getQuizMeta(quizId) {
        const result = await query(
            `SELECT id, author_id, settings
             FROM quiz
             WHERE id = $1`,
            [quizId]
        );

        return result.rows[0] || null;
    }

    async getQuizStatsMeta(quizStatsId) {
        const result = await query(
            `
            SELECT
                qs.id,
                qs.user_id,
                qs.quiz_id,
                q.author_id
            FROM quiz_stats qs
            JOIN quiz q ON q.id = qs.quiz_id
            WHERE qs.id = $1
            `,
            [quizStatsId]
        );

        return result.rows[0] || null;
    }

    async getTeacherGroupIds(teacherId) {
        const result = await query(
            `
            SELECT group_id
            FROM teacher_group
            WHERE teacher_id = $1
            `,
            [teacherId]
        );

        return result.rows.map((row) => Number(row.group_id));
    }

    async getQuestionsWithAnswers(quizId) {
        return query(
            `SELECT 
                q.id AS question_id,
                q.text AS question_text,
                q.image AS question_image,
                a.id AS answer_id,
                a.text AS answer_text,
                a.is_correct
             FROM question q
             LEFT JOIN answer_option a ON a.question_id = q.id AND a.is_deleted = FALSE
             WHERE q.quiz_id = $1 AND q.is_deleted = FALSE
             ORDER BY q.id, a.id`,
            [quizId]
        );
    }

    async upsertResult(userId, quizId, answers) {
        return query(
            `INSERT INTO quiz_stats (user_id, quiz_id, answers)
             VALUES ($1, $2, $3)`,
            [userId, quizId, JSON.stringify(answers)]
        );
    }

    async createQuizStats(userId, quizId) {
        const result = await query(
            `INSERT INTO quiz_stats (user_id, quiz_id)
         VALUES ($1, $2)
         RETURNING id`,
            [userId, quizId]
        );

        return result.rows[0].id;
    }

    async getQuizByQuizStatsId(quizStatsId) {
        const result = await query(
            `SELECT quiz_id FROM quiz_stats
             WHERE id = $1`,
            [quizStatsId]
        );

        return result.rows[0].quiz_id;
    }

    async upsertQuestionResult(userId, quizStatsId, questionId, answerOptionId) {
        return query(
            `INSERT INTO user_answer (quiz_stats_id, question_id, selected_answer_option_id)
             SELECT qs.id, q.id, ao.id
             FROM quiz_stats qs
             JOIN question q
               ON q.id = $2::bigint
              AND q.quiz_id = qs.quiz_id
             JOIN answer_option ao
               ON ao.id = $3::bigint
              AND ao.question_id = q.id
             WHERE qs.id = $1
               AND qs.user_id = $4
             ON CONFLICT (quiz_stats_id, question_id)
             DO UPDATE
             SET selected_answer_option_id = EXCLUDED.selected_answer_option_id,
                 created_at = NOW()
             RETURNING id`,
            [quizStatsId, questionId, answerOptionId, userId]
        );
    }

    async getLastAnsweredQuestionId(quizStatsId) {
        const result = await query(
            `SELECT question_id
             FROM user_answer
             WHERE quiz_stats_id = $1
             ORDER BY created_at DESC, id DESC
             LIMIT 1`,
            [quizStatsId]
        )

        if (result.rowCount == 0) {
            return -1;
        }

        return result.rows[0].question_id;
    }

    async getLastQuizStats(userId, quizId) {
        const result = await query(
            `SELECT id FROM quiz_stats WHERE user_id = $1 AND quiz_id = $2 ORDER BY id DESC LIMIT 1`,
            [userId, quizId]
        )

        if (result.rowCount == 0) {
            return -1;
        }

        return result.rows[0].id;
    }

    async getResult(userId, quizId) {
        return query(
            `SELECT answers
             FROM quiz_stats
             WHERE user_id = $1 AND quiz_id = $2`,
            [userId, quizId]
        );
    }

    async getQuizStatsSummary(quizStatsId) {
        const metaResult = await query(
            `
        SELECT
            COALESCE((qz.settings ->> 'passPercent')::numeric, 60) AS pass_percent,
            COALESCE((qz.settings ->> 'allowRetake')::boolean, TRUE) AS allow_retake,
            COALESCE((qz.settings ->> 'showCorrectAnswers')::boolean, TRUE) AS show_correct_answers,
            qs.created_at AS completed_at,
            qs.quiz_id
        FROM quiz_stats qs
        JOIN quiz qz ON qz.id = qs.quiz_id
        WHERE qs.id = $1
        `,
            [quizStatsId]
        );

        if (!metaResult.rows.length) {
            return null;
        }

        const meta = metaResult.rows[0];
        const quizId = Number(meta.quiz_id);

        const totalResult = await query(
            `SELECT COUNT(*)::int AS total_questions FROM question WHERE quiz_id = $1`,
            [quizId]
        );

        const answeredResult = await query(
            `SELECT COUNT(*)::int AS answered_questions FROM user_answer WHERE quiz_stats_id = $1`,
            [quizStatsId]
        );
        const correctResult = await query(
            `
            SELECT COUNT(*)::int AS correct_answers
            FROM user_answer ua
            JOIN answer_option ao ON ao.id = ua.selected_answer_option_id
            WHERE ua.quiz_stats_id = $1
              AND ao.is_correct = TRUE
            `,
            [quizStatsId]
        );
        const wrongResult = await query(
            `
            SELECT COUNT(*)::int AS wrong_answers
            FROM user_answer ua
            JOIN answer_option ao ON ao.id = ua.selected_answer_option_id
            WHERE ua.quiz_stats_id = $1
              AND ao.is_correct = FALSE
            `,
            [quizStatsId]
        );

        const totalQuestions = Number(totalResult.rows[0]?.total_questions || 0);
        const answeredQuestions = Number(answeredResult.rows[0]?.answered_questions || 0);
        const unanswered = Math.max(0, totalQuestions - answeredQuestions);

        return {
            totalQuestions,
            correctAnswers: Number(correctResult.rows[0]?.correct_answers || 0),
            wrongAnswers: Number(wrongResult.rows[0]?.wrong_answers || 0),
            unanswered,
            passPercent: Number(meta.pass_percent),
            allowRetake: Boolean(meta.allow_retake),
            showCorrectAnswers: Boolean(meta.show_correct_answers),
            completedAt: meta.completed_at || null,
        };
    }

    async hasUserPassed(userId, quizId) {
        return query(
            `SELECT 1
             FROM quiz_stats qs
             JOIN quiz qz ON qz.id = qs.quiz_id
             WHERE qs.user_id = $1
               AND qs.quiz_id = $2
               AND (
                SELECT CASE
                    WHEN COUNT(q.id) = 0 THEN FALSE
                    ELSE (
                        (COUNT(*) FILTER (WHERE ao.is_correct = TRUE) * 100.0) / COUNT(q.id)
                    ) >= COALESCE((qz.settings ->> 'passPercent')::numeric, 60)
                END
                FROM question q
                LEFT JOIN user_answer ua
                    ON ua.quiz_stats_id = qs.id
                   AND ua.question_id = q.id
                LEFT JOIN answer_option ao
                    ON ao.id = ua.selected_answer_option_id
                WHERE q.quiz_id = qs.quiz_id
               )
             LIMIT 1`,
            [userId, quizId]
        );
    }

    async updateQuestion(quizId, questionId, text, answers) {
        const client = await getClient();
        try {
            await client.query('BEGIN');


            await client.query(
                `UPDATE question
             SET text = $1
             WHERE id = $2 AND quiz_id = $3`,
                [text, questionId, quizId]
            );

            const answerIdsToKeep = [];
            for (const a of answers) {
                if (a.id) {
                    await client.query(
                        `UPDATE answer_option
                     SET text = $1, is_correct = $2
                     WHERE id = $3 AND question_id = $4`,
                        [a.text, !!a.is_correct, a.id, questionId]
                    );
                    answerIdsToKeep.push(a.id);
                } else {
                    const result = await client.query(
                        `INSERT INTO answer_option (question_id, text, is_correct)
                     VALUES ($1, $2, $3)
                     RETURNING id`,
                        [questionId, a.text, !!a.is_correct]
                    );
                    answerIdsToKeep.push(result.rows[0].id);
                }
            }

            if (answerIdsToKeep.length) {
                await client.query(
                    `UPDATE answer_option
                 SET is_deleted = TRUE
                 WHERE question_id = $1
                   AND NOT (id = ANY($2::bigint[]))`,
                    [questionId, answerIdsToKeep]
                );
            } else {
                await client.query(
                    `UPDATE answer_option SET is_deleted = TRUE WHERE question_id = $1`,
                    [questionId]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getQuizSummaryList(userId, quizId) {
        const result = await query(
            `SELECT id FROM quiz_stats 
            WHERE user_id = $1 AND quiz_id = $2
            ORDER BY id`,
            [userId, quizId]
        );

        return result.rows.map(row => row.id);
    }

    async getUserQuizStatuses(userId, quizIds) {
        if (!userId || !Array.isArray(quizIds) || quizIds.length === 0) {
            return [];
        }

        const result = await query(
            `
            WITH selected_quizzes AS (
                SELECT UNNEST($2::bigint[]) AS quiz_id
            ),
            user_attempts AS (
                SELECT
                    qs.id AS quiz_stats_id,
                    qs.quiz_id,
                    COALESCE((q.settings ->> 'passPercent')::numeric, 60) AS pass_percent,
                    (
                        SELECT COUNT(*)::int
                        FROM question qq
                        WHERE qq.quiz_id = qs.quiz_id
                          AND qq.is_deleted = FALSE
                    ) AS total_questions,
                    (
                        SELECT COUNT(*)::int
                        FROM user_answer ua
                        JOIN answer_option ao ON ao.id = ua.selected_answer_option_id
                        WHERE ua.quiz_stats_id = qs.id
                          AND ao.is_correct = TRUE
                    ) AS correct_answers
                FROM quiz_stats qs
                JOIN quiz q ON q.id = qs.quiz_id
                WHERE qs.user_id = $1
                  AND qs.quiz_id = ANY($2::bigint[])
            ),
            attempt_status AS (
                SELECT
                    quiz_id,
                    COUNT(*)::int AS attempt_count,
                    BOOL_OR(
                        total_questions > 0
                        AND (correct_answers::numeric * 100 / NULLIF(total_questions, 0)) >= pass_percent
                    ) AS has_passed
                FROM user_attempts
                GROUP BY quiz_id
            ),
            assignment_status AS (
                SELECT
                    aq.quiz_id,
                    TRUE AS is_assigned
                FROM assigned_quiz aq
                JOIN public."user" u ON u.group_id = aq.group_id
                WHERE u.id = $1
                  AND aq.quiz_id = ANY($2::bigint[])
                GROUP BY aq.quiz_id
            )
            SELECT
                sq.quiz_id,
                COALESCE(attempt_status.attempt_count, 0) AS attempt_count,
                COALESCE(attempt_status.has_passed, FALSE) AS has_passed,
                COALESCE(assignment_status.is_assigned, FALSE) AS is_assigned
            FROM selected_quizzes sq
            LEFT JOIN attempt_status ON attempt_status.quiz_id = sq.quiz_id
            LEFT JOIN assignment_status ON assignment_status.quiz_id = sq.quiz_id
            `,
            [userId, quizIds]
        );

        return result.rows.map((row) => ({
            quizId: Number(row.quiz_id),
            attemptCount: Number(row.attempt_count) || 0,
            hasPassed: Boolean(row.has_passed),
            isAssigned: Boolean(row.is_assigned)
        }));
    }

    async updateFullQuiz(quizId, data) {
        const client = await getClient();
        try {
            await client.query("BEGIN");

            const { name, description, image, questions, settings } = data;

            if (!Array.isArray(questions)) {
                throw new Error("Questions must be an array");
            }

            const quizResult = await client.query(
                `UPDATE quiz
                 SET name = $1,
                     description = $2,
                     image = $3,
                     settings = COALESCE($4::jsonb, settings)
                 WHERE id = $5`,
                [
                    name,
                    description,
                    image ?? null,
                    settings === undefined ? null : JSON.stringify(settings),
                    quizId
                ]
            );

            if (quizResult.rowCount === 0) {
                throw new Error("Quiz not found");
            }

            const questionIdsToKeep = [];

            for (const question of questions) {
                let questionId = question.id;

                if (questionId) {
                    await client.query(
                        `UPDATE question
                         SET text = $1, image = $2
                         WHERE id = $3 AND quiz_id = $4`,
                        [question.text, question.image ?? null, questionId, quizId]
                    );
                } else {
                    const insertedQuestion = await client.query(
                        `INSERT INTO question (quiz_id, text, image)
                         VALUES ($1, $2, $3)
                         RETURNING id`,
                        [quizId, question.text, question.image ?? null]
                    );
                    questionId = insertedQuestion.rows[0].id;
                }

                questionIdsToKeep.push(questionId);

                const answerIdsToKeep = [];

                for (const answer of question.answers ?? []) {
                    if (answer.id) {
                        await client.query(
                            `UPDATE answer_option
                             SET text = $1, is_correct = $2
                             WHERE id = $3 AND question_id = $4`,
                            [answer.text, !!answer.is_correct, answer.id, questionId]
                        );
                        answerIdsToKeep.push(answer.id);
                    } else {
                        const insertedAnswer = await client.query(
                            `INSERT INTO answer_option (question_id, text, is_correct)
                             VALUES ($1, $2, $3)
                             RETURNING id`,
                            [questionId, answer.text, !!answer.is_correct]
                        );
                        answerIdsToKeep.push(insertedAnswer.rows[0].id);
                    }
                }

                if (answerIdsToKeep.length) {
                    await client.query(
                        `UPDATE answer_option
                         SET is_deleted = TRUE
                         WHERE question_id = $1
                           AND NOT (id = ANY($2::bigint[]))`,
                        [questionId, answerIdsToKeep]
                    );
                } else {
                    await client.query(
                        `UPDATE answer_option SET is_deleted = TRUE WHERE question_id = $1`,
                        [questionId]
                    );
                }
            }

            if (questionIdsToKeep.length) {
                await client.query(
                    `UPDATE question
                     SET is_deleted = TRUE
                     WHERE quiz_id = $1
                       AND NOT (id = ANY($2::bigint[]))`,
                    [quizId, questionIdsToKeep]
                );
            } else {
                await client.query(
                    `UPDATE question SET is_deleted = TRUE WHERE quiz_id = $1`,
                    [quizId]
                );
            }

            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
}

export default new QuizRepository();
