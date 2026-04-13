import { useEffect, useMemo, useState, type FC } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Tab } from "./Tab"
import { SearchInput } from "../SearchInput"

//@ts-ignore
import { type QuizCard, type QuizCardsQuery } from "../../api/quiz/getQuizCards"
import { QuizCardsContent } from "./QuizesTab"

export const SearchTab: FC = () => {
    const [params] = useSearchParams();
    const query = params.get("query");
    const memoizedQuery = useMemo(() => ({ name: query || 'null' } as QuizCardsQuery), [query]);
    const navigate = useNavigate();

    const [inputData, setInputData] = useState<string>(query ? query : "");

    const onSearch = () => {    
        navigate(`/search${inputData && `/?query=${inputData}`}`);
        
    }

    useEffect(() => {
        if (!query) return;
        console.log(query)
        rerender();
    }, [query])

    const [force, forceUpdate] = useState(0);

    const rerender = () => {
    forceUpdate(prev => prev + 1);
    };

    return (
        <Tab>
            <SearchInput onSearch={onSearch} value={inputData} onChange={(e) => {setInputData(e.target.value)}} placeholder="Поиск"></SearchInput>
            <div className="w-full h-full">

                <QuizCardsContent query={memoizedQuery} key={force}/>
            </div>
        </Tab>
    );
};