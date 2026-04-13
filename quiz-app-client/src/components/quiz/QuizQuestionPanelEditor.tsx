import { type FC, useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "../../api/quiz/getQuiz";
import { Trash2, ImagePlus } from "lucide-react";
import { uploadQuestionImage } from "../../api/quiz/uploadQuestionImage";
import { ServerBackground } from "../../components/ServerBackground";

interface QuizQuestionPanelEditorProps {
    question: QuizQuestion;
    onChangeQuestion: (updated: QuizQuestion) => void;
}

export const QuizQuestionPanelEditor: FC<QuizQuestionPanelEditorProps> = ({ question, onChangeQuestion }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageVersion, setImageVersion] = useState(0);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (localPreviewUrl) {
                URL.revokeObjectURL(localPreviewUrl);
            }
        };
    }, [localPreviewUrl]);

    useEffect(() => {
        setSelectedFile(null);
        setUploadMessage(null);
        if (localPreviewUrl) {
            URL.revokeObjectURL(localPreviewUrl);
            setLocalPreviewUrl(null);
        }
    }, [question.id]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }

        const file = e.target.files[0];
        setSelectedFile(file);
        setUploadMessage(null);

        if (localPreviewUrl) {
            URL.revokeObjectURL(localPreviewUrl);
        }
        setLocalPreviewUrl(URL.createObjectURL(file));
    };

    const handlePersistImage = async () => {
        if (!selectedFile) {
            return;
        }

        if (!question.id) {
            setUploadMessage("Сначала сохраните тест, затем сохраните изображение вопроса.");
            return;
        }

        setIsUploading(true);
        try {
            await uploadQuestionImage(question.id, selectedFile);
            setImageVersion((previous) => previous + 1);
            onChangeQuestion({
                ...question,
                image: `question/${question.id}`,
            });
            setUploadMessage("Изображение вопроса сохранено");
        } catch (err) {
            console.error(err);
            setUploadMessage("Ошибка загрузки изображения");
        } finally {
            setIsUploading(false);
        }
    };

    // --- ОТВЕТЫ ---
    const handleAddAnswer = () => {
        const newAnswer = { text: "Новый вариант", is_correct: false };
        const updatedAnswers = [...question.answers, newAnswer];
        onChangeQuestion({ ...question, answers: updatedAnswers });
    };

    const handleAnswerToggle = (answerIndex: number) => {
        const updatedAnswers = question.answers.map((ans, idx) =>
            idx === answerIndex ? { ...ans, is_correct: !ans.is_correct } : ans
        );
        onChangeQuestion({ ...question, answers: updatedAnswers });
    };

    const handleAnswerTextChange = (answerIndex: number, newText: string) => {
        const updatedAnswers = question.answers.map((ans, idx) =>
            idx === answerIndex ? { ...ans, text: newText } : ans
        );
        onChangeQuestion({ ...question, answers: updatedAnswers });
    };

    const handleRemoveAnswer = (answerIndex: number) => {
        if (question.answers.length <= 1) return;
        const updatedAnswers = question.answers.filter((_, idx) => idx !== answerIndex);
        onChangeQuestion({ ...question, answers: updatedAnswers });
    };

    if (!question) return null;

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl border border-gray-200 text-black">

            {/* ==== БЛОК ИЗОБРАЖЕНИЯ ==== */}
            <div className="mb-6">
                {localPreviewUrl ? (
                    <div
                        className="w-full h-48 rounded-lg border flex items-center justify-center bg-cover bg-center"
                        style={{ backgroundImage: `url(${localPreviewUrl})` }}
                    />
                ) : !question.id ? (
                    <div className="w-full h-48 rounded-lg border flex items-center justify-center bg-slate-100 text-slate-500">
                        Изображение вопроса появится после сохранения
                    </div>
                ) : (
                    <ServerBackground
                        key={`question-image-${question.id}-${imageVersion}`}
                        imageId={`question/${question.id}`}
                        className="w-full h-48 rounded-lg border flex items-center justify-center cursor-pointer"
                    />
                )}

                <div className="mt-3 flex flex-col md:flex-row md:items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                    >
                        <ImagePlus size={18} />
                        Выбрать изображение
                    </button>
                    <button
                        type="button"
                        onClick={handlePersistImage}
                        disabled={!selectedFile || isUploading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                        {isUploading ? "Сохранение..." : "Сохранить изображение вопроса"}
                    </button>
                </div>
                {uploadMessage && (
                    <p className="text-sm text-slate-600 mt-2">{uploadMessage}</p>
                )}

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                />
            </div>

            {/* ==== ТЕКСТ ВОПРОСА ==== */}
            <label className="block text-sm font-medium text-gray-500 mb-1">
                Текст вопроса
            </label>

            <input
                className="text-xl font-bold mb-6 w-full border-b pb-2 outline-none focus:border-blue-500 text-black"
                placeholder="Введите вопрос..."
                value={question.text}
                onChange={(e) =>
                    onChangeQuestion({ ...question, text: e.target.value })
                }
            />

            {/* ==== ОТВЕТЫ ==== */}
            <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-gray-500">
                    Варианты ответов
                </label>

                {question.answers.map((answer, idx) => (
                    <div key={idx} className="flex items-center gap-3">

                        <input
                            type="checkbox"
                            className="w-6 h-6 cursor-pointer accent-green-600"
                            checked={answer.is_correct}
                            onChange={() => handleAnswerToggle(idx)}
                        />

                        <input
                            className="flex-1 p-3 border rounded-lg bg-gray-50 focus:bg-white outline-none text-black"
                            value={answer.text}
                            onChange={(e) =>
                                handleAnswerTextChange(idx, e.target.value)
                            }
                        />

                        <button
                            onClick={() => handleRemoveAnswer(idx)}
                            className="text-gray-400 hover:text-red-500 p-1"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={handleAddAnswer}
                className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg"
            >
                + Добавить вариант ответа
            </button>
        </div>
    );
};
