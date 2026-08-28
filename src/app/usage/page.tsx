"use client";

import { useEffect, useState } from "react";
import {
  EmbedProvider,
  SchematicEmbed,
} from "@schematichq/schematic-components";

import Loader from "../../components/Loader";

export default function UsageAndPlan() {
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccessToken = async () => {
    try {
      const response = await fetch("/api/accessToken");
      const result = await response.json();
      if ("accessToken" in result) {
        setAccessToken(result.accessToken);
      }
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Error fetching data");
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // The rule traces into fetchAccessToken and flags the setState calls it
    // finds there. Every one of them runs after an await, so none is a
    // render-phase update -- which is what the rule exists to catch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAccessToken();
  }, []);

  const componentId = process.env.NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID;
  if (!componentId) {
    console.error(
      "Missing Schematic component ID (NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID)",
    );

    return <div>Not found</div>;
  }

  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
        <Loader />
      </>
    );
  }

  if (error || !accessToken) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
        <p>{error ?? "Unknown error"}</p>
      </>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_SCHEMATIC_API_URL;
  const apiConfig = apiUrl ? { basePath: apiUrl } : undefined;

  return (
    <EmbedProvider
      apiConfig={apiConfig}
      warningThresholdConfig={{ showAsLimit: true }}
      debug
    >
      <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
      <SchematicEmbed accessToken={accessToken} id={componentId} />
    </EmbedProvider>
  );
}
