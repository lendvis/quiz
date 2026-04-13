import { useCallback, useState } from "react";
import type { ApiError } from "../api/api-error";
import type { AxiosError } from "axios";

export interface FetchResponce<T> {
  data: T | null;
  isFetching: boolean;
  error: ApiError | null;
  isSuccess: boolean | null;
}

export function useFetch<T, P>(fetchFn: (params: P) => Promise<T>) {
  const [state, setState] = useState<FetchResponce<T>>({
    data: null,
    isFetching: false,
    error: null,
    isSuccess: false,
  });

  const fetchMethod = useCallback(async (params: P): Promise<T> => {
    setState(prev => ({ ...prev, isFetching: true }));

    try {
      const data = await fetchFn(params);

      setState({
        data,
        isFetching: false,
        error: null,
        isSuccess: true,
      });

      return data;
    } catch (err: unknown) {
      let apiError: ApiError = {
        message: "Произошла неизвестная ошибка",
        errors: {},
      };

      if ((err as AxiosError)?.response?.data) {
        apiError = (err as AxiosError).response!.data as ApiError;
      }

      setState({
        data: null,
        isFetching: false,
        error: apiError,
        isSuccess: false,
      });

      throw apiError;
    }
  }, [fetchFn]);

  return [state, fetchMethod] as const;
}
