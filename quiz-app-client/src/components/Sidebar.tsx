import { BarChart3, ChevronFirst, ChevronLast, Compass, FilePenLine, LogOut, ShieldCheck, Users } from "lucide-react"
import type { FC, ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"

import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Button } from "./buttons/Button";

interface SidebarContextProps {
  expanded: boolean,
  activeItem: string | null,
  setActiveItem: (id: string) => void;
}

const SidebarContext = createContext<SidebarContextProps>({ expanded: false, activeItem: null, setActiveItem: () => { } });

export const Sidebar: FC<{ children?: ReactNode }> = ({ children }) => {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar_expanded");
    if (saved === null) {
      return true;
    }

    return saved === "true";
  })
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const auth = useContext(AuthContext);
  const role = auth?.role;
  const displayName = auth?.user?.displayName || "Пользователь";
  const roleLabel = role === "leadership" ? "Руководство" : role === "teacher" ? "Преподаватель" : role === "student" ? "Ученик" : "Гость";

  useEffect(() => {
    localStorage.setItem("sidebar_expanded", String(expanded));
  }, [expanded]);

  return (
    <aside className={`h-full relative z-20 shrink-0 transition-[width] duration-300 ${expanded ? "w-72" : "w-20"}`}>
      <nav className="h-full flex flex-col bg-slate-900 border-r border-slate-800 shadow-xl shadow-black/30">
        <div className={`p-4 flex items-center mb-2 ${expanded ? "justify-between" : "justify-center"}`}>
          <div className={`font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 overflow-hidden transition-all duration-300 ${expanded ? "w-32 opacity-100" : "w-0 opacity-0"}`}>
            QuizSpace
          </div>
          <button
            onClick={() => setExpanded(curr => !curr)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            aria-label={expanded ? "Свернуть меню" : "Развернуть меню"}
            title={expanded ? "Свернуть меню" : "Развернуть меню"}
          >
            {expanded ? <ChevronFirst className="text-slate-300" /> : <ChevronLast className="text-slate-300" />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded, activeItem, setActiveItem }}>
          <ul className={`flex-1 space-y-1 ${expanded ? "px-3" : "px-2"}`}>
            <SidebarItem icon={<Compass size={20} />} to="/quizes" text="Все тесты" />
            {role === "student" && <SidebarItem icon={<Compass size={20} />} to="/todo" text="Заданные тесты" />}
            {(role === "teacher" || role === "leadership") && (
              <SidebarItem icon={<FilePenLine size={20} />} to="/editor" text="Мои тесты" />
            )}
            {(role === "teacher" || role === "leadership") && (
              <SidebarItem icon={<BarChart3 size={20} />} to="/teacher-tools" text="Результаты и назначение" />
            )}
            {role === "leadership" && (
              <SidebarItem icon={<Users size={20} />} to="/management" text="Управление" />
            )}
            {children}
          </ul>
        </SidebarContext.Provider>
        {
          auth?.isAuthorized ? (
            <div className={`border-t border-slate-800 flex p-4 mt-2 bg-slate-900/50`}>
              <div className="flex flex-row items-center w-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex flex-shrink-0 items-center justify-center text-white font-bold shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className={`leading-4 flex flex-row w-full justify-between items-center
            overflow-hidden transition-all ${expanded ? "ml-3 opacity-100" : "w-0 opacity-0"}`}>
                  <div className="flex flex-col justify-center items-start">
                    <h4 className="font-medium text-slate-200 truncate max-w-[120px]">{displayName}</h4>
                    <span className="text-[11px] mt-1 text-slate-400 flex items-center gap-1 font-medium">
                      <ShieldCheck size={12} className="text-indigo-400" />
                      {roleLabel}
                    </span>
                    {auth.user?.group && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[120px] mt-0.5">
                        {auth.user.group.name}
                      </span>
                    )}
                  </div>
                  <button onClick={() => { auth.logout(); }} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors" >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>

          ) : (
            (
              <div className={`flex flex-row items-center justify-center overflow-hidden transition-all mb-2 h-15 ${expanded ? "w-72" : "w-0"}`}>
                <NavLink to="/login" className="shrink-0">
                  <Button className="mr-2">Войти</Button>
                </NavLink>
                <NavLink to="/register" className="shrink-0">
                  <Button>Зарегистрироватся</Button>
                </NavLink>
              </div>)
          )
        }
      </nav>
    </aside>
  )
}

interface SidebarItemProps {
  to: string,
  icon: ReactNode,
  text: ReactNode,
  alert?: boolean
}

export const SidebarItem: FC<SidebarItemProps> = ({ to, icon, text, alert }) => {
  const ctx: SidebarContextProps = useContext(SidebarContext);
  const { expanded, setActiveItem } = ctx;

  return (
    <li>
      <NavLink to={to} onClick={() => setActiveItem(to)}
        className={({ isActive }) => `relative flex items-center py-2.5 my-1
        font-medium rounded-lg cursor-pointer transition-all duration-300 group
        ${expanded ? "justify-start px-3" : "justify-center px-0"}
        ${isActive
            ? "bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-l-2 border-indigo-500"
            : "hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-l-2 border-transparent"
          }`}>
        <div className="transition-colors duration-300">
          {icon}
        </div>
        <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${expanded ? "w-44 ml-3 opacity-100" : "w-0 opacity-0"}`}>
          {text}
        </span>
        {!expanded && (
          <span className="absolute left-full ml-2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 opacity-0 pointer-events-none -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            {text}
          </span>
        )}
        {alert && (
          <div className={`absolute right-2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] ${expanded ? "" : "top-3"}`}></div>
        )}
      </NavLink>
    </li>
  )
}
