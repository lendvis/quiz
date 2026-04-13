import { type ReactNode } from "react"
import { Loadable } from "./common/Loadable"
import type { FetchResponce } from "../hooks/useFetch"

export interface WithApiProps<T> {
  response: FetchResponce<T>,
  fallback?: ReactNode,
  children: (data: T) => ReactNode
}

export function WithApi<T>({ response, children, fallback }: WithApiProps<T>) {
  if (response.isFetching && !response.isSuccess) {
    return <Loadable loading={true} />;
  }

  if (response.error && !response.isFetching) {
    return <>{fallback}</>;
  }

  if (response.isSuccess && response.data) {
    return <>{children(response.data as T)}</>;
  }

  return null;
}