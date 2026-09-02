import { AuthorizationPage } from "./AutorizationPage";
import { type LoginBody } from "../../api/auth/login";
import { useLogin } from "../../hooks/auth/useLogin";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IS_DEMO } from "../../api/client";


export const LoginPage = () => {
  const [fetchState, login] = useLogin();
  const auth = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (fetchState.isSuccess && fetchState.data) {
      auth?.login(fetchState.data.token, fetchState.data.user);
      navigate("/");
    }
  }, [fetchState.isSuccess, fetchState.data, auth, navigate]);


  return (
    <AuthorizationPage<LoginBody>
      title="Вход"
      description={
        IS_DEMO
          ? "Демо-режим: данные записаны с рабочего стенда, изменения не сохраняются. Логины teacher, student и admin — пароль уже подставлен."
          : "Войдите в систему, чтобы продолжить обучение или управление тестами."
      }
      fields = {[{
          name: "username",
          label: "Логин",
          placeholder: "Логин пользователя",
          type: "text"
        },
        {
          name: "password",
          label: "Пароль",
          placeholder: "Пароль",
          type: "password"
        }
      ]}
      initialFormState={IS_DEMO ? { username: "teacher", password: "P@ssw0rd" } : { username: "", password: "" }}
      submitLabel="Войти"
      submitHandler={(body) => {login(body)}}
      isSubmitting={fetchState.isFetching}
      error={fetchState.error}
      link={{ text: "Нет аккаунта?", to: "/register", toText: "Регистрация" }}
      isSuccess={fetchState.isSuccess}
    />
  );
};
