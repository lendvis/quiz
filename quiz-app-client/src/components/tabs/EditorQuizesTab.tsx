import { type FC } from "react";
import { QuizCardsContent } from "./QuizesTab";
import { Tab } from "./Tab";
import { Button } from "../buttons/Button";
import { PlusIcon } from "lucide-react";
import { AuthGuard } from "../common/Guards/AuthGuard";
import { RoleGuard } from "../common/Guards/RoleGuard";
import { useNavigate } from "react-router-dom";
import { TabHeader } from "../ui/TabHeader";

export interface EditorQuizesTabProps {

}

export const EditorQuizesTab: FC<EditorQuizesTabProps> = () => {
    const navigate = useNavigate();

    return (
        <Tab>
            <AuthGuard>
                <RoleGuard
                    roles={["teacher", "leadership"]}
                    fallback={<h2 className="text-red-500">Создавать и редактировать тесты могут только преподаватели и руководство</h2>}
                >
                    <div className="flex flex-col gap-2">
                        <div className="w-full ">
                            <Button onClick={() => navigate("/create")}>Создать тест <PlusIcon /></Button>
                        </div>
                        <TabHeader>Ваши тесты</TabHeader>
                    </div>
                    <QuizCardsContent
                        query={{ self: true }}
                        cardLinkBuilder={(quiz) => `/editor/${quiz.id}`}
                        actionLabel="Редактировать тест"
                    />
                </RoleGuard>
            </AuthGuard>
        </Tab>
    )
}
