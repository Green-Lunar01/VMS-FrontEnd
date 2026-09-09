"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api/client";

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
}

/**
 * Runs `fetcher` on mount and whenever `deps` change, with the usual
 * loading/error handling and protection against out-of-order responses.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], enabled = true): AsyncState<T> {
  const [data, setDataState] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const latest = useRef(0);
  const fetcherRef = useRef(fetcher);

  // Keep the latest fetcher without making it a dependency of the effect.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) return;

    const run = latest.current + 1;
    latest.current = run;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current();
        if (cancelled || run !== latest.current) return;
        setDataState(result);
      } catch (err) {
        if (cancelled || run !== latest.current) return;
        setError(err instanceof ApiError ? err.messages.join(" ") : "Unable to load this data.");
      } finally {
        if (!cancelled && run === latest.current) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, enabled]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const setData = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setDataState((prev) => (typeof updater === "function" ? (updater as (p: T | undefined) => T)(prev) : updater));
  }, []);

  return { data, loading, error, reload, setData };
}
