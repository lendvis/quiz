import { Sidebar } from "./components/Sidebar"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"

import { QuizesTab } from "./components/tabs/QuizesTab"
import { QuizDetailsTab } from "./components/tabs/QuizDetailsTab"
import { QuizTab } from "./components/tabs/QuizTab"
import { RegistrationPage } from "./components/pages/RegistrationPage"
import { LoginPage } from "./components/pages/LoginPage"
import { AuthContextProvider } from "./context/AuthContext"
import { ResultsTab } from "./components/tabs/ResultsTab"
import { SearchTab } from "./components/tabs/SearchTab"
import { PassedQuizTab } from "./components/tabs/PassedQuizTab"
import { EditorTab } from "./components/tabs/EditorTab"
import { EditorQuizesTab } from "./components/tabs/EditorQuizesTab"
import { CreateQuizTab } from "./components/tabs/CreateQuizTab"
import { NewQuizTab } from "./components/tabs/NewQuizTab"
import { QuizesToDoTab } from "./components/tabs/QuizesToDoTab"
import { DialogProvider } from "./context/DialogContext"
import { ManagementTab } from "./components/tabs/ManagementTab"
import { TeacherToolsTab } from "./components/tabs/TeacherToolsTab"

  export function App() {
    return (
      <AuthContextProvider>
          <BrowserRouter>
        <DialogProvider>
            <AppContent />
        </DialogProvider>
          </BrowserRouter>
      </AuthContextProvider>
    );
  }

  function AppContent() {
    const location = useLocation();

    const hideSidebar: boolean =
  location.pathname.startsWith("/register") ||
  location.pathname.startsWith("/login");

    return (
      <div className="app-shell flex h-full w-full overflow-hidden font-sans">
        {!hideSidebar && <Sidebar />}

        <main className="app-main flex-1 overflow-auto relative">
          <Routes>
            <Route path="/" element={<QuizesTab/>} />
            <Route path="/quizes" element={<QuizesTab />} />
            <Route path="/details/:id" element={<QuizDetailsTab />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />

            <Route path="/quiz/:id" element={<QuizTab />} />
            <Route path="/new_quiz/:id/:questionId" element={<NewQuizTab/>} />
            <Route path="/results/:quizId/:quizStatsId" element={<ResultsTab/>} />

            <Route path="/search" element={<SearchTab />}></Route>
            <Route path="/passed" element={<PassedQuizTab />}></Route>
            <Route path="/editor/:quizId" element={<EditorTab />}></Route>
            <Route path="/editor" element={<EditorQuizesTab />}></Route>
            <Route path="/create" element={<CreateQuizTab />}></Route>
            <Route path="/todo" element={<QuizesToDoTab/>}></Route>
            <Route path="/teacher-tools" element={<TeacherToolsTab/>}></Route>
            <Route path="/management" element={<ManagementTab/>}></Route>
            <Route ></Route>
          </Routes>
        </main>
      </div>
    );
  }

  export default App;
