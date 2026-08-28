"use client";

import { useCallback, useEffect, useState } from "react";

interface AccessTokenState {
  accessToken: string | null;
  error: string | null;
  isLoading: boolean;
}

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

  const fetchAccessToken = useCallback(async () => {
    setState((previous) => ({ ...previous, isLoading: true }));
    try {
      const response = await fetch("/api/accessToken");
      const result = (await response.json()) as { accessToken?: string };
      if (result.accessToken === undefined) {
        throw new Error("Response did not include an access token");
      }
      setState({
        accessToken: result.accessToken,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      setState({
        accessToken: null,
        error: error instanceof Error ? error.message : "Error fetching data",
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    void fetchAccessToken();
  }, [fetchAccessToken]);

  return { ...state, refetch: () => void fetchAccessToken() };
};

export default useAccessToken;
