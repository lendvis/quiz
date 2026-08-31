#!/usr/bin/env bash
# Проверяет поднятый стек: health, вход всеми ролями, данные seed и разграничение прав.
# Запуск: ./scripts/smoke.sh   (после docker compose up -d --build)
set -uo pipefail

API="${API:-http://localhost:8088}"      # фронтенд, он же проксирует /api/
BACKEND="${BACKEND:-http://localhost:5051}"  # бэкенд напрямую
PASS='P@ssw0rd'
failed=0

check() {
  local label="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    printf '  ok    %s — %s\n' "$label" "$actual"
  else
    printf '  FAIL  %s — ожидали %s, получили %s\n' "$label" "$expected" "$actual"
    failed=1
  fi
}

# Код ответа на GET (с необязательным заголовком авторизации).
get_code() {
  local url="$1" token="${2:-}"
  if [ -n "$token" ]; then
    curl -s -o /dev/null -w '%{http_code}' "$url" -H "Authorization: Bearer $token"
  else
    curl -s -o /dev/null -w '%{http_code}' "$url"
  fi
}

login_body() {
  local payload
  payload=$(printf '{"username":"%s","password":"%s"}' "$1" "$2")
  curl -s -X POST "$API/api/auth/login" -H 'Content-Type: application/json' -d "$payload"
}

login_code() {
  local payload
  payload=$(printf '{"username":"%s","password":"%s"}' "$1" "$2")
  curl -s -o /dev/null -w '%{http_code}' \
    -X POST "$API/api/auth/login" -H 'Content-Type: application/json' -d "$payload"
}

token_of() { login_body "$1" "$PASS" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p'; }

echo "Проверяем $API (фронтенд) и $BACKEND (API)"

check "фронтенд отдаёт страницу"      200 "$(get_code "$API/")"
check "бэкенд /health"                200 "$(get_code "$BACKEND/health")"
check "публичные группы"              200 "$(get_code "$API/api/auth/groups/public")"

for user in admin teacher student; do
  check "вход: $user" 200 "$(login_code "$user" "$PASS")"
done
check "вход с неверным паролем отклонён" 400 "$(login_code student wrongpass1)"

quizzes=$(curl -s "$API/api/quizzes/cards" | grep -o '"id"' | wc -l | tr -d ' ')
check "seed: карточек тестов" 2 "$quizzes"

student_token=$(token_of student)
teacher_token=$(token_of teacher)

check "ученик не видит результаты учеников" 403 \
  "$(get_code "$API/api/quizzes/1/student-results" "$student_token")"
check "преподаватель видит результаты учеников" 200 \
  "$(get_code "$API/api/quizzes/1/student-results" "$teacher_token")"
check "без токена результаты недоступны" 403 \
  "$(get_code "$API/api/quizzes/1/student-results")"

# Картинки меняют содержимое теста — заливать может только преподаватель/руководство.
png=$(mktemp -t smoke).png
printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' \
  | base64 -d > "$png"
upload_code() {
  curl -s -o /dev/null -w '%{http_code}' -X POST "$API/api/image/quiz/1" \
    -H "Authorization: Bearer $1" -F "image=@$png"
}
check "ученик не может залить картинку теста" 403 "$(upload_code "$student_token")"
check "преподаватель может залить картинку"   200 "$(upload_code "$teacher_token")"
rm -f "$png"

if [ "$failed" -eq 0 ]; then
  echo "Все проверки прошли."
else
  echo "Есть непройденные проверки."
  exit 1
fi
