import { useEffect, useState, type FC } from "react";
import { Tab } from "./Tab";
import { Input } from "../ui/Input";
import { LoadableButton } from "../buttons/LoadableButton";
import { useCreateQuiz } from "../../hooks/useCreateQuiz";
import { type CreateQuizBody } from "../../api/quiz/createQuiz";
import { useNavigate } from "react-router-dom";
import { Textarea } from "../ui/Textarea";
import { uploadQuizImage } from "../../api/quiz/uploadQuizImage";
import { DEFAULT_QUIZ_SETTINGS, type QuizSettings } from "../../api/quiz/getQuiz";

export const CreateQuizTab: FC = () => {
  const [createQuizResponce, createQuiz] = useCreateQuiz();
  const navigate = useNavigate();

  const initialFormState: CreateQuizBody = {
    name: "",
    description: "",
    settings: { ...DEFAULT_QUIZ_SETTINGS },
  };

  const [formData, setFormData] = useState<CreateQuizBody>(initialFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (field: keyof Omit<CreateQuizBody, "settings">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = <K extends keyof QuizSettings>(
    field: K,
    value: QuizSettings[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!createQuizResponce.isSuccess) return;

    const uploadImageIfExists = async () => {
      const quizId = createQuizResponce.data?.id;
      if (!quizId) return;

      if (selectedFile) {
        try {
          await uploadQuizImage(quizId, selectedFile);
        } catch (err) {
          console.error("Image upload failed", err);
        }
      }

      navigate(`/editor/${quizId}`);
    };

    uploadImageIfExists();
  }, [createQuizResponce.isSuccess, createQuizResponce.data?.id, navigate, selectedFile]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createQuiz(formData);
  };

  return (
    <Tab>
      <form
        className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-xl border-2 border-slate-200 bg-white/90 p-5 shadow-md"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Создание теста</h1>
          <p className="text-sm text-slate-500">
            Заполни базовую информацию и сразу задай правила прохождения.
          </p>
        </div>

        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Название теста"
        />

        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Краткое описание или инструкция"
          className="min-h-28"
        />

        <section className="rounded-lg border-2 border-slate-200 bg-slate-50/60 p-4">
          <h2 className="text-lg font-medium text-slate-900">Настройки прохождения</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input
              type="number"
              min={1}
              max={100}
              value={formData.settings.passPercent}
              onChange={(e) =>
                handleSettingsChange(
                  "passPercent",
                  Math.min(100, Math.max(1, Number(e.target.value) || 1))
                )
              }
              placeholder="Порог прохождения, %"
            />
            <Input
              type="number"
              min={1}
              max={300}
              value={formData.settings.timeLimitMinutes}
              onChange={(e) =>
                handleSettingsChange(
                  "timeLimitMinutes",
                  Math.min(300, Math.max(1, Number(e.target.value) || 1))
                )
              }
              placeholder="Лимит времени, минут"
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.settings.showCorrectAnswers}
                onChange={(e) => handleSettingsChange("showCorrectAnswers", e.target.checked)}
              />
              Показывать правильные ответы после завершения
            </label>
            <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.settings.allowRetake}
                onChange={(e) => handleSettingsChange("allowRetake", e.target.checked)}
              />
              Разрешить повторное прохождение
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-500">Изображение теста (необязательно)</label>

          {previewUrl && (
            <div
              className="h-48 w-full rounded-lg border bg-cover bg-center"
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
          )}

          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <LoadableButton loading={createQuizResponce.isFetching}>Создать тест</LoadableButton>
      </form>
    </Tab>
  );
};
