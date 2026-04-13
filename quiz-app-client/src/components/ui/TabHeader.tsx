import type { FC, PropsWithChildren } from "react"

export const TabHeader: FC<PropsWithChildren> = ({children}) => {
    return (
        <h1 className="text-3xl md:text-4xl text-slate-100 mb-5 font-bold tracking-tight">{children}</h1>
    )
}
