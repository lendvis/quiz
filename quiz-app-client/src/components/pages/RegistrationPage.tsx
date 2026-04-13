import { AuthorizationPage } from "./AutorizationPage";
import { useRegister } from "../../hooks/auth/useRegister";
import type { RegisterBody } from "../../api/auth/register";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getPublicGroups } from "../../api/auth/getPublicGroups";
import type { UserGroup } from "../../api/auth/types";
import type { ApiError } from "../../api/api-error";

export const RegistrationPage = () => {
  const [registerFetchState, register] = useRegister();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await getPublicGroups();
        setGroups(response.groups || []);
        setGroupsError(null);
      } catch (error) {
        console.error(error);
        setGroupsError("Не удалось загрузить список групп. Попробуйте обновить страницу.");
      }
    };

    void loadGroups();
  }, []);

  useEffect(() => {
    if (registerFetchState.isSuccess && registerFetchState.data) {
      auth?.login(registerFetchState.data.token, registerFetchState.data.user);
      navigate("/");
    }
  }, [registerFetchState.data, registerFetchState.isSuccess, auth, navigate]);

  type RegistrationFormState = {
    role: "student" | "leadership";
    displayName: string;
    username: string;
    password: string;
    groupId: string;
    leadershipRegistrationCode: string;
  };

  const submitHandler = (formState: RegistrationFormState) => {
    const payload: RegisterBody = {
      username: formState.username.trim(),
      password: formState.password,
      displayName: formState.displayName.trim(),
      role: formState.role,
    };

    if (formState.role === "student") {
      payload.groupId = Number(formState.groupId);
    }

    if (formState.role === "leadership") {
      payload.leadershipRegistrationCode = formState.leadershipRegistrationCode.trim();
    }

    register(payload);
  };

  const groupOptions = useMemo(() => {
    return groups.map((group) => ({
      label: group.name,
      value: String(group.id),
    }));
  }, [groups]);

  const pageError: ApiError | null = registerFetchState.error
    ? registerFetchState.error
    : groupsError
      ? { message: groupsError, errors: {} }
      : null;

  return (
    <AuthorizationPage<RegistrationFormState>
      title="Регистрация"
      description="Ученики регистрируются с группой, руководство — по коду доступа."
      fields={[
        {
          name: "role",
          label: "Роль",
          type: "select",
          placeholder: "Выберите роль",
          required: true,
          options: [
            { label: "Ученик", value: "student" },
            { label: "Руководство", value: "leadership" },
          ],
        },
        {
          name: "displayName",
          label: "Ваше имя",
          type: "text",
          placeholder: "Например: Иван Петров",
        },
        {
          name: "username",
          label: "Логин",
          type: "text",
          placeholder: "Введите логин пользователя",
        },
        {
          name: "password",
          label: "Пароль",
          type: "password",
          placeholder: "Введите пароль",
        },
        {
          name: "groupId",
          label: "Группа",
          type: "select",
          placeholder: groups.length > 0 ? "Выберите группу" : "Список групп пуст",
          options: groupOptions,
          required: true,
          visibleWhen: (formData) => formData.role === "student",
        },
        {
          name: "leadershipRegistrationCode",
          label: "Код регистрации руководства",
          type: "password",
          placeholder: "Введите код доступа",
          required: true,
          visibleWhen: (formData) => formData.role === "leadership",
        },
      ]}
      initialFormState={{
        role: "student",
        displayName: "",
        username: "",
        password: "",
        groupId: "",
        leadershipRegistrationCode: "",
      }}
      submitLabel="Зарегистрироваться"
      submitHandler={submitHandler}
      isSubmitting={registerFetchState.isFetching}
      error={pageError}
      link={{ text: "Уже есть аккаунт?", to: "/login", toText: "Войти" }}
      isSuccess={registerFetchState.isSuccess}
    />
  );
};
