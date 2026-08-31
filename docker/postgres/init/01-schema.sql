CREATE TABLE IF NOT EXISTS public."role" (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public."group" (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public."user" (
  id BIGSERIAL PRIMARY KEY,
  display_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role_id BIGINT NOT NULL REFERENCES public."role"(id),
  group_id BIGINT REFERENCES public."group"(id),
  created_by BIGINT REFERENCES public."user"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teacher_group (
  teacher_id BIGINT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES public."group"(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, group_id)
);

CREATE TABLE IF NOT EXISTS public.quiz (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  settings JSONB NOT NULL DEFAULT '{"passPercent":60,"timeLimitMinutes":20,"showCorrectAnswers":true,"allowRetake":true}'::jsonb,
  author_id BIGINT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question (
  id BIGSERIAL PRIMARY KEY,
  quiz_id BIGINT NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.answer_option (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES public.question(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_stats (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  quiz_id BIGINT NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_answer (
  id BIGSERIAL PRIMARY KEY,
  quiz_stats_id BIGINT NOT NULL REFERENCES public.quiz_stats(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES public.question(id) ON DELETE CASCADE,
  selected_answer_option_id BIGINT REFERENCES public.answer_option(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assigned_quiz (
  quiz_id BIGINT NOT NULL REFERENCES public.quiz(id) ON DELETE CASCADE,
  appointor_id BIGINT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES public."group"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (quiz_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_user_group_id ON public."user"(group_id);
CREATE INDEX IF NOT EXISTS idx_quiz_author_id ON public.quiz(author_id);
CREATE INDEX IF NOT EXISTS idx_question_quiz_id ON public.question(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answer_option_question_id ON public.answer_option(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_stats_user_quiz ON public.quiz_stats(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_answer_quiz_stats_id ON public.user_answer(quiz_stats_id);
CREATE INDEX IF NOT EXISTS idx_assigned_quiz_group_id ON public.assigned_quiz(group_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_answer_unique_attempt_question ON public.user_answer(quiz_stats_id, question_id);

INSERT INTO public."role" (name)
VALUES ('student'), ('teacher'), ('leadership')
ON CONFLICT (name) DO NOTHING;

-- === Demo seed data (idempotent) ===
-- login/password for all demo users: P@ssw0rd
-- leadership: admin
-- teacher: teacher
-- student: student

INSERT INTO public."group" (name)
VALUES ('Group A'), ('Group B')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public."user" (display_name, username, password, role_id, group_id, created_by)
SELECT
  'Администратор',
  'admin',
  '$2b$07$WS0Hq000a9wx4DyYCej5QeQ4G.4xUzoITB.U0.vq67fQYcdoqM9/C',
  r.id,
  NULL,
  NULL
FROM public."role" r
WHERE r.name = 'leadership'
ON CONFLICT (username) DO NOTHING;

INSERT INTO public."user" (display_name, username, password, role_id, group_id, created_by)
SELECT
  'Тестовый преподаватель',
  'teacher',
  '$2b$07$WS0Hq000a9wx4DyYCej5QeQ4G.4xUzoITB.U0.vq67fQYcdoqM9/C',
  r.id,
  NULL,
  admin_user.id
FROM public."role" r
CROSS JOIN public."user" admin_user
WHERE r.name = 'teacher'
  AND admin_user.username = 'admin'
ON CONFLICT (username) DO NOTHING;

INSERT INTO public."user" (display_name, username, password, role_id, group_id, created_by)
SELECT
  'Тестовый ученик',
  'student',
  '$2b$07$WS0Hq000a9wx4DyYCej5QeQ4G.4xUzoITB.U0.vq67fQYcdoqM9/C',
  r.id,
  g.id,
  admin_user.id
FROM public."role" r
JOIN public."group" g ON g.name = 'Group A'
CROSS JOIN public."user" admin_user
WHERE r.name = 'student'
  AND admin_user.username = 'admin'
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.teacher_group (teacher_id, group_id)
SELECT teacher_user.id, g.id
FROM public."user" teacher_user
JOIN public."group" g ON g.name IN ('Group A', 'Group B')
WHERE teacher_user.username = 'teacher'
ON CONFLICT (teacher_id, group_id) DO NOTHING;

INSERT INTO public.quiz (name, description, settings, author_id)
SELECT
  'Математика: базовый уровень',
  'Короткий тест на базовые арифметические действия',
  '{"passPercent":70,"timeLimitMinutes":15,"showCorrectAnswers":true,"allowRetake":true}'::jsonb,
  teacher_user.id
FROM public."user" teacher_user
WHERE teacher_user.username = 'teacher'
  AND NOT EXISTS (
    SELECT 1
    FROM public.quiz q
    WHERE q.name = 'Математика: базовый уровень'
      AND q.author_id = teacher_user.id
  );

INSERT INTO public.question (quiz_id, text)
SELECT q.id, 'Сколько будет 2 + 2?'
FROM public.quiz q
JOIN public."user" teacher_user ON teacher_user.id = q.author_id
WHERE q.name = 'Математика: базовый уровень'
  AND teacher_user.username = 'teacher'
  AND NOT EXISTS (
    SELECT 1
    FROM public.question qq
    WHERE qq.quiz_id = q.id
      AND qq.text = 'Сколько будет 2 + 2?'
  );

INSERT INTO public.answer_option (question_id, text, is_correct)
SELECT question_row.id, option_row.text, option_row.is_correct
FROM public.question question_row
JOIN public.quiz q ON q.id = question_row.quiz_id
JOIN public."user" teacher_user ON teacher_user.id = q.author_id
JOIN (
  VALUES
    ('3', FALSE),
    ('4', TRUE),
    ('5', FALSE)
) AS option_row(text, is_correct) ON TRUE
WHERE q.name = 'Математика: базовый уровень'
  AND teacher_user.username = 'teacher'
  AND question_row.text = 'Сколько будет 2 + 2?'
  AND NOT EXISTS (
    SELECT 1
    FROM public.answer_option ao
    WHERE ao.question_id = question_row.id
      AND ao.text = option_row.text
  );

INSERT INTO public.quiz (name, description, settings, author_id)
SELECT
  'История: XX век',
  'Проверка базовых знаний по истории XX века',
  '{"passPercent":60,"timeLimitMinutes":20,"showCorrectAnswers":true,"allowRetake":true}'::jsonb,
  teacher_user.id
FROM public."user" teacher_user
WHERE teacher_user.username = 'teacher'
  AND NOT EXISTS (
    SELECT 1
    FROM public.quiz q
    WHERE q.name = 'История: XX век'
      AND q.author_id = teacher_user.id
  );

INSERT INTO public.question (quiz_id, text)
SELECT q.id, 'В каком году началась Вторая мировая война?'
FROM public.quiz q
JOIN public."user" teacher_user ON teacher_user.id = q.author_id
WHERE q.name = 'История: XX век'
  AND teacher_user.username = 'teacher'
  AND NOT EXISTS (
    SELECT 1
    FROM public.question qq
    WHERE qq.quiz_id = q.id
      AND qq.text = 'В каком году началась Вторая мировая война?'
  );

INSERT INTO public.answer_option (question_id, text, is_correct)
SELECT question_row.id, option_row.text, option_row.is_correct
FROM public.question question_row
JOIN public.quiz q ON q.id = question_row.quiz_id
JOIN public."user" teacher_user ON teacher_user.id = q.author_id
JOIN (
  VALUES
    ('1939', TRUE),
    ('1941', FALSE),
    ('1945', FALSE)
) AS option_row(text, is_correct) ON TRUE
WHERE q.name = 'История: XX век'
  AND teacher_user.username = 'teacher'
  AND question_row.text = 'В каком году началась Вторая мировая война?'
  AND NOT EXISTS (
    SELECT 1
    FROM public.answer_option ao
    WHERE ao.question_id = question_row.id
      AND ao.text = option_row.text
  );

INSERT INTO public.assigned_quiz (quiz_id, appointor_id, group_id)
SELECT q.id, admin_user.id, g.id
FROM public.quiz q
JOIN public."user" admin_user ON admin_user.username = 'admin'
JOIN public."group" g ON g.name = 'Group A'
WHERE q.name IN ('Математика: базовый уровень', 'История: XX век')
ON CONFLICT (quiz_id, group_id) DO NOTHING;

-- === Дополнительные вопросы, чтобы демо-тесты выглядели как настоящие ===

INSERT INTO public.question (quiz_id, text)
SELECT q.id, s.q_text
FROM (
  VALUES
    ('Математика: базовый уровень', 'Сколько будет 7 × 8?'),
    ('Математика: базовый уровень', 'Чему равен квадратный корень из 144?'),
    ('Математика: базовый уровень', 'Сколько процентов составляет 45 от 180?'),
    ('Математика: базовый уровень', 'Сколько будет 15% от 200?'),
    ('История: XX век', 'В каком году человек впервые полетел в космос?'),
    ('История: XX век', 'Как называлась первая искусственная спутниковая программа СССР?'),
    ('История: XX век', 'В каком году пала Берлинская стена?')
) AS s(quiz_name, q_text)
JOIN public.quiz q ON q.name = s.quiz_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.question qq WHERE qq.quiz_id = q.id AND qq.text = s.q_text
);

INSERT INTO public.answer_option (question_id, text, is_correct)
SELECT qq.id, s.opt_text, s.is_correct
FROM (
  VALUES
    ('Сколько будет 7 × 8?', '48', FALSE),
    ('Сколько будет 7 × 8?', '56', TRUE),
    ('Сколько будет 7 × 8?', '64', FALSE),
    ('Чему равен квадратный корень из 144?', '10', FALSE),
    ('Чему равен квадратный корень из 144?', '12', TRUE),
    ('Чему равен квадратный корень из 144?', '14', FALSE),
    ('Сколько процентов составляет 45 от 180?', '20%', FALSE),
    ('Сколько процентов составляет 45 от 180?', '25%', TRUE),
    ('Сколько процентов составляет 45 от 180?', '30%', FALSE),
    ('Сколько будет 15% от 200?', '20', FALSE),
    ('Сколько будет 15% от 200?', '30', TRUE),
    ('Сколько будет 15% от 200?', '35', FALSE),
    ('В каком году человек впервые полетел в космос?', '1957', FALSE),
    ('В каком году человек впервые полетел в космос?', '1961', TRUE),
    ('В каком году человек впервые полетел в космос?', '1969', FALSE),
    ('Как называлась первая искусственная спутниковая программа СССР?', '«Спутник»', TRUE),
    ('Как называлась первая искусственная спутниковая программа СССР?', '«Восток»', FALSE),
    ('Как называлась первая искусственная спутниковая программа СССР?', '«Союз»', FALSE),
    ('В каком году пала Берлинская стена?', '1985', FALSE),
    ('В каком году пала Берлинская стена?', '1989', TRUE),
    ('В каком году пала Берлинская стена?', '1991', FALSE)
) AS s(q_text, opt_text, is_correct)
JOIN public.question qq ON qq.text = s.q_text
WHERE NOT EXISTS (
  SELECT 1 FROM public.answer_option ao WHERE ao.question_id = qq.id AND ao.text = s.opt_text
);
