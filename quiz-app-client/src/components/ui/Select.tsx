import type { FC, PropsWithChildren } from "react"

export const Select : FC<PropsWithChildren> = ({children}) => {
    return (
        <select className="">
            {children}
        </select>
    )
}