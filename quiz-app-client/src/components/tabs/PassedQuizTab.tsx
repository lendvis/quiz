import type { FC } from "react";
import { QuizCardsContent } from "./QuizesTab";
import { Tab } from "./Tab";
import { TabHeader } from "../ui/TabHeader";

export interface PassedQuizTabProps {

}

export const PassedQuizTab:FC< PassedQuizTabProps> = () => {
    return (
      <>
        <Tab>
          <TabHeader>Пройденые тесты</TabHeader>
          <QuizCardsContent className="w-full h-full" query={{passed: true }}>

          </QuizCardsContent>
        </Tab>
      </>
    )
}