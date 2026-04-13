import { useContext, useEffect, useMemo, useState, type FC, type FormEvent } from "react";
import { Tab } from "./Tab";
import { AuthContext } from "../../context/AuthContext";
import { getManagedGroups, createGroup, type ManagedGroup } from "../../api/auth/adminGroups";
import { createTeacher, getTeachers, type TeacherListItem } from "../../api/auth/adminTeachers";
import { Button } from "../buttons/Button";
import type { ApiError } from "../../api/api-error";

const getApiErrorMessage = (error: unknown) => {
  const maybeApiError = error as ApiError | undefined;
  if (maybeApiError?.message) {
    return maybeApiError.message;
  }
  return "Произошла ошибка. Повторите попытку.";
};

export const ManagementTab: FC = () => {
  const auth = useContext(AuthContext);
  const [groups, setGroups] = useState<ManagedGroup[]>([]);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);

  const [groupName, setGroupName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [teacherUsername, setTeacherUsername] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canManage = auth?.role === "leadership";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [groupsResponse, teachersResponse] = await Promise.all([
        getManagedGroups(),
        getTeachers(),
      ]);

      setGroups(groupsResponse.groups || []);
      setTeachers(teachersResponse.teachers || []);
      setError(null);
    } catch (loadError) {
      console.error(loadError);
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!canManage) {
      return;
    }
    void loadData();
  }, [canManage]);

  const toggleGroup = (groupId: number) => {
    setSelectedGroupIds((previous) => {
      if (previous.includes(groupId)) {
        return previous.filter((id) => id !== groupId);
      }
      return [...previous, groupId];
    });
  };

  const resetTeacherForm = () => {
    setTeacherName("");
    setTeacherUsername("");
    setTeacherPassword("");
    setSelectedGroupIds([]);
  };

  const onCreateGroup = async (event: FormEvent) => {
    event.preventDefault();
    if (!groupName.trim()) {
      return;
    }

    setIsCreatingGroup(true);
    setSuccess(null);
    setError(null);
    try {
      await createGroup({ name: groupName.trim() });
      setGroupName("");
      setSuccess("Группа создана");
      await loadData();
    } catch (createError) {
      console.error(createError);
      setError(getApiErrorMessage(createError));
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const onCreateTeacher = async (event: FormEvent) => {
    event.preventDefault();
    if (!teacherName.trim() || !teacherUsername.trim() || !teacherPassword.trim()) {
      return;
    }

    setIsCreatingTeacher(true);
    setSuccess(null);
    setError(null);
    try {
      await createTeacher({
        displayName: teacherName.trim(),
        username: teacherUsername.trim(),
        password: teacherPassword.trim(),
        groupIds: selectedGroupIds,
      });
      resetTeacherForm();
      setSuccess("Преподаватель создан");
      await loadData();
    } catch (createError) {
      console.error(createError);
      setError(getApiErrorMessage(createError));
    } finally {
      setIsCreatingTeacher(false);
    }
  };

  const hasGroups = useMemo(() => groups.length > 0, [groups.length]);

  if (!canManage) {
    return (
      <Tab>
        <div className="h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl border border-red-100 text-red-700">
            Доступ к управлению есть только у роли руководства.
          </div>
        </div>
      </Tab>
    );
  }

  return (
    <Tab>
      <div className="w-full flex flex-col gap-6 text-slate-100 p-2 pb-8">
        <header className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-cyan-200">Панель руководства</h1>
          <p className="text-slate-400 mt-3 text-lg font-medium">
            Управляйте группами и аккаунтами преподавателей централизованно.
          </p>
          {error && <p className="text-rose-400 mt-4 p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">{error}</p>}
          {success && <p className="text-emerald-400 mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">{success}</p>}
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-visible">
            <h2 className="text-2xl font-bold text-slate-100">Группы</h2>
            <form onSubmit={onCreateGroup} className="flex gap-3">
              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Название новой группы"
                className="flex-1 bg-slate-800/80 border border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-100 placeholder-slate-500 transition-all font-medium"
              />
              <Button type="submit" disabled={isCreatingGroup || !groupName.trim()} className="px-6 rounded-xl shrink-0">
                {isCreatingGroup ? "Создание..." : "Создать"}
              </Button>
            </form>

            <div className="border border-slate-700/50 bg-slate-800/30 rounded-2xl overflow-y-auto max-h-[32rem]">
              {isLoading ? (
                <div className="p-6 text-slate-400 text-center">Загрузка...</div>
              ) : groups.length === 0 ? (
                <div className="p-6 text-slate-400 text-center">Группы пока не созданы.</div>
              ) : (
                groups.map((group) => (
                  <div key={group.id} className="p-4 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-800/60 transition-colors">
                    <div className="font-semibold text-slate-200 text-lg mb-1">{group.name}</div>
                    <div className="text-sm text-indigo-300 font-medium flex gap-4">
                      <span>Учеников: {group.studentsCount}</span>
                      <span>Преподавателей: {group.teachersCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-visible">
            <h2 className="text-2xl font-bold text-slate-100">Преподаватели</h2>
            <form onSubmit={onCreateTeacher} className="flex flex-col gap-3">
              <input
                value={teacherName}
                onChange={(event) => setTeacherName(event.target.value)}
                placeholder="ФИО преподавателя"
                className="w-full bg-slate-800/80 border border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-100 placeholder-slate-500 transition-all font-medium"
              />
              <input
                value={teacherUsername}
                onChange={(event) => setTeacherUsername(event.target.value)}
                placeholder="Логин"
                className="w-full bg-slate-800/80 border border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-100 placeholder-slate-500 transition-all font-medium"
              />
              <input
                type="password"
                value={teacherPassword}
                onChange={(event) => setTeacherPassword(event.target.value)}
                placeholder="Пароль"
                className="w-full bg-slate-800/80 border border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-100 placeholder-slate-500 transition-all font-medium"
              />
              <div className="border border-slate-700/50 bg-slate-800/30 rounded-2xl p-4 max-h-40 overflow-auto">
                <p className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Доступные группы</p>
                {!hasGroups && <p className="text-sm text-slate-500">Сначала создайте группу.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {groups.map((group) => (
                    <label key={group.id} className="flex items-center gap-3 text-sm py-1.5 px-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors border border-transparent hover:border-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-800"
                      />
                      <span className="text-slate-200">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                disabled={isCreatingTeacher || !teacherName.trim() || !teacherUsername.trim() || !teacherPassword.trim()}
                className="py-3 rounded-xl mt-2"
              >
                {isCreatingTeacher ? "Создание..." : "Создать преподавателя"}
              </Button>
            </form>

            <div className="border border-slate-700/50 bg-slate-800/30 rounded-2xl overflow-y-auto max-h-[32rem]">
              {isLoading ? (
                <div className="p-6 text-slate-400 text-center">Загрузка...</div>
              ) : teachers.length === 0 ? (
                <div className="p-6 text-slate-400 text-center">Преподаватели пока не созданы.</div>
              ) : (
                teachers.map((teacher) => (
                  <div key={teacher.id} className="p-4 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-800/60 transition-colors">
                    <div className="font-semibold text-slate-200 text-lg mb-1">{teacher.displayName}</div>
                    <div className="text-sm text-indigo-300 font-medium">@{teacher.username}</div>
                    <div className="text-xs text-slate-400 mt-2 flex gap-1 flex-wrap">
                      <span className="font-semibold uppercase tracking-wider text-slate-500">Группы:</span> 
                      {teacher.groups.length ? teacher.groups.map((group) => group.name).join(", ") : "не назначены"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </Tab>
  );
};
