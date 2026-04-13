
import type { FC, ReactNode } from "react";

interface ErrorBoundaryProps {
  error: boolean
  errorCode?: string
  children?: ReactNode
  fallback: ReactNode
}

export const ErrorBoundary: FC<ErrorBoundaryProps> = ({error, children, fallback}) => {
  return (
    error ? (fallback) : children
  )
}