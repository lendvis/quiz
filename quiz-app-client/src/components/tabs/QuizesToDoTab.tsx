import { type FC } from "react";
import { QuizCardsContent } from "./QuizesTab";
import { Tab } from "./Tab";
import { AuthGuard } from "../common/Guards/AuthGuard";
import { GroupGuard } from "../common/Guards/GroupGuard";

export interface QuizesToDoTabProps {

}

export const QuizesToDoTab: FC<QuizesToDoTabProps> = () => {
    return (
        <Tab>
            <AuthGuard>
                <GroupGuard>
                    <QuizCardsContent query={{assigned: true}}></QuizCardsContent>
                </GroupGuard>
            </AuthGuard>
        </Tab>
    )
}
