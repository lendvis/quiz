import { useCallback, useEffect, useRef } from "react";
import { useFetch } from "./useFetch";

const areDepsEqual = (prevDeps: readonly unknown[], nextDeps: readonly unknown[]) => {
  if (prevDeps.length !== nextDeps.length) {
    return false;
  }

  for (let i = 0; i < prevDeps.length; i += 1) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return false;
    }
  }

  return true;
};

export function useAutoFetch<T>(fetchFn: () => Promise<T>, deps: readonly unknown[] = []) {
  const fetchFnRef = useRef(fetchFn);
  const prevDepsRef = useRef<readonly unknown[] | null>(null);

  fetchFnRef.current = fetchFn;

  const apiFn = useCallback(() => {
    return fetchFnRef.current();
  }, []);

  const [apiState, fetchMethod] = useFetch<T, void>(apiFn);

  useEffect(() => {
    const previousDeps = prevDepsRef.current;

    if (previousDeps && areDepsEqual(previousDeps, deps)) {
      return;
    }

    prevDepsRef.current = deps;
    void fetchMethod(undefined);
  });

  return apiState;
};
