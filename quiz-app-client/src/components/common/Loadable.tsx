import { LoaderCircleIcon } from "lucide-react"
import type { FC, ReactNode } from "react"

export interface LoadableProps {
  loading: boolean,
  children?: ReactNode,
  fallback?: ReactNode
}

export const Loadable: FC<LoadableProps> = ({ loading, children, fallback }) => {
  if (!loading) return <>{children}</>

  if (fallback != null) return <>{fallback}</>

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col justify-center items-center text-gray-500">
        <LoaderCircleIcon className="animate-spin" />
      </div>
    </div>
  )
}
