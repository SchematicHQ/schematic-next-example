"use client";

import { useCallback, useEffect, useState } from "react";

interface AccessTokenState {
  accessToken: string | null;
  error: string | null;
  isLoading: boolean;
}

/** What /api/accessToken answers with. */
export interface IssuedAccessToken {
  accessToken: string;
  /** When the token stops being usable, as the API reported it. */
  expiresAt?: string | null;
}

/**
 * The one call to /api/accessToken. The hook below wraps it for components
 * that hold a token themselves; `SchematicProvider` is handed a provider
 * built on it in ClientWrapper, so both paths mint the same way and there is
 * one place to change when the route changes.
 */
export const requestAccessToken = async (): Promise<IssuedAccessToken> => {
  const response = await fetch("/api/accessToken");
  const result = (await response.json()) as Partial<IssuedAccessToken>;
  if (result.accessToken === undefined) {
    throw new Error("Failed to issue a Schematic access token");
  }
  return { accessToken: result.accessToken, expiresAt: result.expiresAt };
};

/**
 * Exchanges the app's session for a short-lived, company-scoped Schematic
 * access token via /api/accessToken.
 *
 * Embedded components take this token as a prop, so anything rendering
 * `SchematicEmbed` or driving a checkout needs it. `SchematicProvider` takes
 * the fetcher itself (see ClientWrapper) and re-calls it after a 401.
 */
export const useAccessToken = (): AccessTokenState & {
  refetch: () => void;
} => {
  const [state, setState] = useState<AccessTokenState>({
    accessToken: null,
    error: null,
    isLoading: true,
  });

  // Bumped by `refetch` to re-run the effect below.
  const [attempt, setAttempt] = useState(0);

  // The request lives in the effect rather than in a `useCallback` the effect
  // calls: from across that boundary the state update reads as a synchronous
  // one, which is a cascading render and a lint error. The cleanup is what
  // makes `refetch` safe — it retires the in-flight request, so a slow first
  // response can't land after a newer one and overwrite it.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const { accessToken } = await requestAccessToken();
        if (!cancelled) {
          setState({
            accessToken,
            error: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setState({
            accessToken: null,
            error:
              error instanceof Error ? error.message : "Error fetching data",
            isLoading: false,
          });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // The initial state is already `isLoading: true`, so only a refetch — which
  // starts from a settled state — has a flag to raise.
  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true }));
    setAttempt((previous) => previous + 1);
  }, []);

  return { ...state, refetch };
};

export default useAccessToken;
