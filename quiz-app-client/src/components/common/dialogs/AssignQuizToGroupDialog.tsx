import { useEffect, useState } from "react";
import { useAssignQuizToGroups } from "../../../hooks/useAssignQuizToGroups";
import { getAssignedGroups } from "../../../api/auth/getAssignedGroups";
import type { UserGroup } from "../../../api/auth/types";

type AssignQuizToGroupDialogProps = {
  quizId: string;
};

const AssignQuizToGroupDialog = ({ quizId }: AssignQuizToGroupDialogProps) => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // ⚠️ правильный порядок: [state, function]
  const [assignResponse, assign] = useAssignQuizToGroups();

  // 🔹 загрузка групп
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getAssignedGroups();
        setGroups(data.groups || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGroups();
  }, []);

  // 🔹 переключение чекбокса
  const toggleGroup = (groupId: number) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // 🔹 сохранение
  const handleSave = async () => {
    try {
      await assign({
        quizId: Number(quizId),
        groupIds: Array.from(selected),
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full text-black">
      <h2 className="text-lg font-semibold mb-4 ">
        Назначить тест группе
      </h2>

      {/* список групп */}
      <div className="flex-1 overflow-auto border rounded p-2 mb-4">
        {groups.length === 0 && (
          <div className="text-gray-500 text-sm">
            Нет доступных групп
          </div>
        )}

        {groups.map((group) => (
          <label
            key={group.id}
            className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
          >
            <span>{group.name}</span>

            <input
              type="checkbox"
              checked={selected.has(group.id)}
              onChange={() => toggleGroup(group.id)}
            />
          </label>
        ))}
      </div>

      {/* кнопка */}
      <button
        onClick={handleSave}
        disabled={selected.size === 0 || assignResponse.isFetching}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {assignResponse.isFetching ? "Сохранение..." : "Сохранить"}
      </button>
    </div>
  );
};

export default AssignQuizToGroupDialog;
