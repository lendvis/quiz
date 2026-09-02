-- Демо-класс: ученики, попытки и ответы.
-- Без этих данных экраны результатов пустые, и платформу не на чем показать.
-- Данные детерминированы: сложность вопроса и сила ученика заданы явно,
-- поэтому аналитика каждый раз даёт одни и те же числа.

DO $$
DECLARE
  student_role_id BIGINT;
  group_a_id      BIGINT;
  group_b_id      BIGINT;
  teacher_id      BIGINT;

  -- 26 учеников: имя, группа (A/B), «сила» — вероятность верного ответа
  students CONSTANT TEXT[][] := ARRAY[
    ['Анна Ковалёва','A','0.95'],   ['Игорь Лебедев','A','0.90'],
    ['Мария Соколова','A','0.88'],  ['Дмитрий Орлов','A','0.82'],
    ['Полина Зайцева','A','0.80'],  ['Артём Волков','A','0.76'],
    ['Ксения Морозова','A','0.72'], ['Никита Фомин','A','0.68'],
    ['Елена Гусева','A','0.64'],    ['Павел Титов','A','0.58'],
    ['Софья Белова','A','0.52'],    ['Роман Кузьмин','A','0.46'],
    ['Алиса Ершова','A','0.38'],    ['Тимур Савельев','A','0.30'],
    ['Виктория Жукова','B','0.92'], ['Максим Панов','B','0.86'],
    ['Дарья Крылова','B','0.79'],   ['Егор Быков','B','0.74'],
    ['Алина Щербак','B','0.70'],    ['Кирилл Дорохов','B','0.63'],
    ['Милана Царёва','B','0.57'],   ['Степан Гордеев','B','0.50'],
    ['Ульяна Мишина','B','0.44'],   ['Глеб Рябов','B','0.36'],
    ['Вера Носова','B','0.28'],     ['Марк Литвинов','B','0.22']
  ];

  -- множитель сложности вопроса: <1 — вопрос сложнее, >1 — легче
  q_factor   CONSTANT NUMERIC[] := ARRAY[1.30, 1.05, 0.80, 0.45, 0.95, 1.20, 0.90, 0.60, 1.00];
  -- секунд на вопрос: разные вопросы требуют разного времени
  q_seconds  CONSTANT INT[]     := ARRAY[35, 52, 78, 96, 44, 30, 61, 88, 47];

  s_name TEXT; s_group TEXT; s_skill NUMERIC;
  new_user_id BIGINT; grp_id BIGINT;
  quiz_rec RECORD; q_rec RECORD;
  stats_id BIGINT; started_at TIMESTAMPTZ; answer_at TIMESTAMPTZ;
  q_index INT; correct_chance NUMERIC; roll NUMERIC; picked BIGINT;
  attempt_no INT; day_shift INT;
BEGIN
  SELECT id INTO student_role_id FROM public."role" WHERE name = 'student';
  SELECT id INTO group_a_id FROM public."group" WHERE name = 'Group A';
  SELECT id INTO group_b_id FROM public."group" WHERE name = 'Group B';
  SELECT id INTO teacher_id FROM public."user" WHERE username = 'teacher';

  IF student_role_id IS NULL OR group_a_id IS NULL OR teacher_id IS NULL THEN
    RAISE NOTICE 'Базовый сид не найден, демо-класс пропущен';
    RETURN;
  END IF;

  -- второй группе назначаем математику: иначе сравнивать группы не на чем
  INSERT INTO public.assigned_quiz (quiz_id, appointor_id, group_id)
  SELECT q.id, teacher_id, group_b_id
  FROM public.quiz q
  WHERE q.name = 'Математика: базовый уровень'
  ON CONFLICT DO NOTHING;

  -- детерминированная последовательность «случайных» чисел
  PERFORM setseed(0.42);

  attempt_no := 0;

  FOR i IN 1 .. array_length(students, 1) LOOP
    s_name  := students[i][1];
    s_group := students[i][2];
    s_skill := students[i][3]::NUMERIC;
    grp_id  := CASE WHEN s_group = 'A' THEN group_a_id ELSE group_b_id END;

    INSERT INTO public."user" (display_name, username, password, role_id, group_id, created_by)
    VALUES (
      s_name,
      'student' || lpad(i::TEXT, 2, '0'),
      -- тот же bcrypt-хеш пароля P@ssw0rd, что и у базовых демо-аккаунтов
      (SELECT password FROM public."user" WHERE username = 'student'),
      student_role_id, grp_id, teacher_id
    )
    ON CONFLICT (username) DO NOTHING
    RETURNING id INTO new_user_id;

    CONTINUE WHEN new_user_id IS NULL;

    -- каждый ученик проходит тесты, назначенные его группе
    FOR quiz_rec IN
      SELECT DISTINCT q.id, q.name
      FROM public.quiz q
      JOIN public.assigned_quiz aq ON aq.quiz_id = q.id
      WHERE aq.group_id = grp_id
      ORDER BY q.id
    LOOP
      -- четверо самых слабых не доходят до второго теста: так видно долю незавершивших
      CONTINUE WHEN s_skill < 0.32 AND quiz_rec.id > (SELECT min(id) FROM public.quiz);

      attempt_no := attempt_no + 1;
      day_shift  := (attempt_no % 9);
      started_at := NOW() - (day_shift || ' days')::INTERVAL - ((attempt_no % 7) || ' hours')::INTERVAL;

      INSERT INTO public.quiz_stats (user_id, quiz_id, created_at)
      VALUES (new_user_id, quiz_rec.id, started_at)
      RETURNING id INTO stats_id;

      q_index := 0;
      answer_at := started_at;

      FOR q_rec IN
        SELECT id FROM public.question
        WHERE quiz_id = quiz_rec.id AND is_deleted = FALSE
        ORDER BY id
      LOOP
        q_index := q_index + 1;

        correct_chance := LEAST(0.98, GREATEST(0.05,
          s_skill * COALESCE(q_factor[LEAST(q_index, array_length(q_factor,1))], 1.0)));

        answer_at := answer_at
          + ((COALESCE(q_seconds[LEAST(q_index, array_length(q_seconds,1))], 45)
              + (random() * 24 - 12)::INT) || ' seconds')::INTERVAL;

        roll := random();

        IF roll < correct_chance THEN
          SELECT id INTO picked FROM public.answer_option
          WHERE question_id = q_rec.id AND is_correct = TRUE AND is_deleted = FALSE
          ORDER BY id LIMIT 1;
        ELSE
          -- неверные тоже выбираются не поровну: первый дистрактор притягивает чаще
          SELECT id INTO picked FROM public.answer_option
          WHERE question_id = q_rec.id AND is_correct = FALSE AND is_deleted = FALSE
          ORDER BY CASE WHEN random() < 0.6 THEN 0 ELSE 1 END, id
          LIMIT 1;
        END IF;

        CONTINUE WHEN picked IS NULL;

        INSERT INTO public.user_answer (quiz_stats_id, question_id, selected_answer_option_id, created_at)
        VALUES (stats_id, q_rec.id, picked, answer_at);
      END LOOP;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Демо-класс добавлен: попыток %', attempt_no;
END $$;
