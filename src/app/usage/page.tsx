"use client";

import {
  EmbedProvider,
  SchematicEmbed,
} from "@schematichq/schematic-components";

import Loader from "@/components/Loader";
import useAccessToken from "@/hooks/useAccessToken";
import useEmbedSettings from "@/hooks/useEmbedSettings";

export default function UsageAndPlan() {
  const { accessToken, error, isLoading } = useAccessToken();
  const embedSettings = useEmbedSettings();

  const componentId = process.env.NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID;
  const apiUrl = process.env.NEXT_PUBLIC_SCHEMATIC_API_URL;
  const apiConfig = apiUrl ? { basePath: apiUrl } : undefined;

  const body = () => {
    if (!componentId) {
      return (
        <p>
          Missing Schematic component ID — set
          NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID in your .env.local file.
        </p>
      );
    }

    if (isLoading) {
      return <Loader />;
    }

    if (error !== null || accessToken === null) {
      return <p>{error ?? "Unknown error"}</p>;
    }

    return (
      <EmbedProvider
        apiConfig={apiConfig}
        settings={embedSettings}
        warningThresholdConfig={{ showAsLimit: true }}
      >
        <SchematicEmbed accessToken={accessToken} id={componentId} />
      </EmbedProvider>
    );
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
      {body()}
    </>
  );
}
