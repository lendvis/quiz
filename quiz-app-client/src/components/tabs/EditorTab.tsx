import { useEffect, useState, type FC, type HTMLAttributes } from "react";
import { Tab } from "./Tab";
import { DEFAULT_QUIZ_SETTINGS, type Quiz, type QuizQuestion, type QuizSettings } from "../../api/quiz/getQuiz";
import { useParams } from "react-router-dom";
import { useGetQuiz } from "../../hooks/useGetQuiz";
import { WithApi } from "../withApi";
import type { FetchResponce } from "../../hooks/useFetch";
import { TabErrorFallback } from "../common/fallbacks/TabErrorFallback";
import { Trash2 } from "lucide-react";
import { QuizQuestionPanelEditor } from "../quiz/QuizQuestionPanelEditor";
import { Button } from "../buttons/Button";
import { usePutQuiz } from "../../hooks/usePutQuiz";
import { Loadable } from "../common/Loadable";
import { ServerBackground } from "../ServerBackground";
import { uploadQuizImage } from "../../api/quiz/uploadQuizImage";

export interface EditorTabProps {

}

// 1. Создаем отдельный компонент для редактора
const QuizEditorInner: FC<{ quiz: Quiz; onSave: (updated: Quiz) => void; isSaving: boolean }> = ({ quiz, onSave, isSaving }) => {
    
    const [editedQuiz, setEditedQuiz] = useState<Quiz>(quiz);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
    const [isCoverUploading, setIsCoverUploading] = useState(false);
    const [coverUploadMessage, setCoverUploadMessage] = useState<string | null>(null);
    const [coverImageVersion, setCoverImageVersion] = useState(0);

    const markDirty = (nextQuiz: Quiz) => {
        setIsDirty(JSON.stringify(nextQuiz) !== JSON.stringify(quiz));
    };

    // Синхронизируем состояние, если данные извне реально изменились (например, после сохранения)
    useEffect(() => {
        setEditedQuiz(quiz);
        setIsDirty(false);
        setCoverUploadMessage(null);
    }, [quiz]);

    useEffect(() => {
        return () => {
            if (coverPreviewUrl) {
                URL.revokeObjectURL(coverPreviewUrl);
            }
        };
    }, [coverPreviewUrl]);

    const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (coverPreviewUrl) {
            URL.revokeObjectURL(coverPreviewUrl);
        }

        setCoverFile(file);
        setCoverPreviewUrl(URL.createObjectURL(file));
        setCoverUploadMessage(null);
    };

    const handleCoverUpload = async () => {
        if (!coverFile || !editedQuiz.id) {
            return;
        }

        setIsCoverUploading(true);
        setCoverUploadMessage(null);
        try {
            await uploadQuizImage(editedQuiz.id, coverFile);
            setCoverImageVersion((previous) => previous + 1);
            setCoverUploadMessage("Обложка успешно обновлена");
            setCoverFile(null);
        } catch (error) {
            console.error(error);
            setCoverUploadMessage("Не удалось загрузить обложку");
        } finally {
            setIsCoverUploading(false);
        }
    };

    const handleAddQuestion = () => {
        const newQuestion: QuizQuestion = {
            text: "Новый вопрос",
            answers: [
                { text: "Ответ 1", is_correct: true },
                { text: "Ответ 2", is_correct: false }
            ]
        };

        const updatedQuestions = [...editedQuiz.questions, newQuestion];
        const newQuiz = { ...editedQuiz, questions: updatedQuestions };

        setEditedQuiz(newQuiz);
        setCurrentIndex(updatedQuestions.length - 1);
        markDirty(newQuiz);
    };

    const handleChangeQuestion = (updated: QuizQuestion) => {
        const updatedQuestions = [...editedQuiz.questions];
        updatedQuestions[currentIndex] = updated;
        const newQuiz = { ...editedQuiz, questions: updatedQuestions };

        setEditedQuiz(newQuiz);
        markDirty(newQuiz);
    };

    const handleSettingsChange = <K extends keyof QuizSettings>(
        field: K,
        value: QuizSettings[K]
    ) => {
        const newQuiz: Quiz = {
            ...editedQuiz,
            settings: {
                ...(editedQuiz.settings || DEFAULT_QUIZ_SETTINGS),
                [field]: value,
            },
        };
        setEditedQuiz(newQuiz);
        markDirty(newQuiz);
    };

    const handleDeleteQuestion = (index: number) => {
        if (editedQuiz.questions.length <= 1) return;

        const updatedQuestions = editedQuiz.questions.filter((_, i) => i !== index);
        const newIndex = currentIndex >= updatedQuestions.length ? updatedQuestions.length - 1 : currentIndex;

        const newQuiz = { ...editedQuiz, questions: updatedQuestions };
        setEditedQuiz(newQuiz);
        setCurrentIndex(newIndex);
        markDirty(newQuiz);
    };

    const currentQuestion = editedQuiz.questions[currentIndex];

    return (
        <div className="flex w-full flex-col gap-4"  >
            <QuestionTabButtonHeader
                canSave={isDirty}
                onSaveButtonClicked={() => onSave(editedQuiz)}
                loading={isSaving}
            />
            <section className="w-full bg-white rounded border border-slate-200 p-3 text-black">
                <h3 className="font-semibold mb-2">Обложка теста</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="text-xs uppercase tracking-wide text-slate-500 px-3 py-2 border-b border-slate-200 bg-slate-50">
                            Текущая обложка
                        </div>
                        <ServerBackground
                            key={`quiz-cover-${editedQuiz.id}-${coverImageVersion}`}
                            imageId={`quiz/${editedQuiz.id}`}
                            className="h-44 w-full bg-cover bg-center"
                        />
                    </div>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="text-xs uppercase tracking-wide text-slate-500 px-3 py-2 border-b border-slate-200 bg-slate-50">
                            Превью новой обложки
                        </div>
                        <div
                            className="h-44 w-full bg-slate-100 bg-cover bg-center"
                            style={coverPreviewUrl ? { backgroundImage: `url(${coverPreviewUrl})` } : undefined}
                        />
                    </div>
                </div>
                <div className="mt-3 flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <input type="file" accept="image/*" onChange={handleCoverFileChange} />
                    <Button
                        type="button"
                        onClick={handleCoverUpload}
                        disabled={!coverFile || isCoverUploading || !editedQuiz.id}
                    >
                        {isCoverUploading ? "Загрузка..." : "Сохранить обложку"}
                    </Button>
                    {coverUploadMessage && (
                        <span className="text-sm text-slate-600">{coverUploadMessage}</span>
                    )}
                </div>
            </section>
            <QuizSettingsPanel
                settings={editedQuiz.settings || DEFAULT_QUIZ_SETTINGS}
                onChange={handleSettingsChange}
            />
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_24rem] gap-4 items-start">
                <div className="w-full flex justify-center">
                    {currentQuestion && (
                        <QuizQuestionPanelEditor
                            question={currentQuestion}
                            onChangeQuestion={handleChangeQuestion}
                        />
                    )}
                </div>
                <QuestionTabButtonList
                    questions={editedQuiz.questions}
                    onSelect={(i) => setCurrentIndex(i)}
                    onDelete={handleDeleteQuestion}
                    onAdd={handleAddQuestion}
                />
            </div>
        </div>
    );
};

// 2. Основной компонент теперь выглядит просто и чисто
export const EditorTab: FC = () => {
    const { quizId } = useParams();
    const [putQuizResponce, putQuiz] = usePutQuiz();
    const [refreshNonce, setRefreshNonce] = useState(0);
    const getQuizResponse = useGetQuiz(Number(quizId), [refreshNonce]);

    const handleSave = async (updatedQuiz: Quiz) => {
        await putQuiz({ id: Number(quizId), quiz: updatedQuiz });
        setRefreshNonce((previous) => previous + 1);
    };

    return (
        <Tab>
            <WithApi<Quiz>
                response={getQuizResponse as FetchResponce<Quiz>}
                fallback={<TabErrorFallback />}
            >
                {(quiz) => (
                    <QuizEditorInner
                        quiz={quiz}
                        onSave={handleSave}
                        isSaving={putQuizResponce.isFetching}
                    />
                )}
            </WithApi>
        </Tab>
    );
};

interface QuestionTabButtonListProps {
    questions: QuizQuestion[]
    onSelect: (index: number) => void
    onDelete: (index: number) => void
    onAdd: () => void
}

const QuestionTabButtonList: FC<QuestionTabButtonListProps> = ({
    questions,
    onSelect,
    onDelete,
    onAdd
}) => {
    return (
        <div className="w-full bg-white p-2 flex flex-col rounded border border-slate-200">
            <ul className="flex flex-col gap-2">
                {questions.map((_, index) => (
                    <QuestionTabButton
                        key={index}
                        index={index}
                        onClick={() => onSelect(index)}
                        onDelete={() => onDelete(index)}
                        question={_}
                    />
                ))}
            </ul>

            <Button
                className="mt-2 rounded h-10"
                onClick={onAdd}
            >
                Добавить вопрос
            </Button>
        </div>
    )
}

interface QuizSettingsPanelProps {
    settings: QuizSettings;
    onChange: <K extends keyof QuizSettings>(field: K, value: QuizSettings[K]) => void;
}

const QuizSettingsPanel: FC<QuizSettingsPanelProps> = ({ settings, onChange }) => {
    return (
        <div className="w-full bg-white rounded border border-slate-200 p-3 text-black">
            <h3 className="font-semibold mb-2">Настройки прохождения</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="text-sm flex flex-col gap-1">
                    Порог прохождения, %
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={settings.passPercent}
                        onChange={(event) =>
                            onChange("passPercent", Math.min(100, Math.max(1, Number(event.target.value) || 1)))
                        }
                        className="border border-slate-300 rounded px-2 py-1"
                    />
                </label>
                <label className="text-sm flex flex-col gap-1">
                    Лимит времени, минут
                    <input
                        type="number"
                        min={1}
                        max={300}
                        value={settings.timeLimitMinutes}
                        onChange={(event) =>
                            onChange("timeLimitMinutes", Math.min(300, Math.max(1, Number(event.target.value) || 1)))
                        }
                        className="border border-slate-300 rounded px-2 py-1"
                    />
                </label>
                <label className="text-sm flex items-center gap-2 rounded border border-slate-200 px-3 py-2">
                    <input
                        type="checkbox"
                        checked={settings.showCorrectAnswers}
                        onChange={(event) => onChange("showCorrectAnswers", event.target.checked)}
                    />
                    Показывать правильные ответы после теста
                </label>
                <label className="text-sm flex items-center gap-2 rounded border border-slate-200 px-3 py-2">
                    <input
                        type="checkbox"
                        checked={settings.allowRetake}
                        onChange={(event) => onChange("allowRetake", event.target.checked)}
                    />
                    Разрешить повторное прохождение
                </label>
            </div>
        </div>
    );
}

interface QuestionTabButtonHeaderProps {
    canSave: boolean,
    onSaveButtonClicked?: () => void,
    loading: boolean
}

const QuestionTabButtonHeader: FC<QuestionTabButtonHeaderProps> = ({ canSave, onSaveButtonClicked, loading }) => {
    return (
        <div className="w-full bg-gray-200 p-2 flex flex-row-reverse">
            <Button inactive={!canSave} onClick={() => { onSaveButtonClicked && onSaveButtonClicked() }}>
                <Loadable loading={loading}>Сохранить</Loadable>
            </Button>
        </div>
    )
}





interface QuestionTabButtonProps extends HTMLAttributes<HTMLLIElement> {
    index: number
    onDelete?: (index: number) => void,
    question: QuizQuestion
}

export const QuestionTabButton: FC<QuestionTabButtonProps> = ({
    index,
    onDelete,
    question,
    ...props
}) => {
    const handleDelete = () => {
        if (onDelete) onDelete(index)
    }

    return (
        <li
            className="bg-slate-700 text-slate-100 rounded flex items-center justify-between px-4 h-12 min-w-0"
            {...props as HTMLAttributes<HTMLLIElement>}
        >
            <span className="flex-1 min-w-0 text-left truncate">
                {question.text}
            </span>

            <button
                type="button"
                className="w-10 h-10 bg-red-500 rounded flex items-center justify-center hover:opacity-80 cursor-pointer"
                onClick={handleDelete}
            >
                <Trash2 size={20} />
            </button>
        </li>
    )
}
