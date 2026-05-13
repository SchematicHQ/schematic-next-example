"use client";

import { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import {
  SchematicProvider,
  useSchematicEvents,
} from "@schematichq/schematic-react";
import { EmbedAdapter } from "@schematichq/schematic-react/components";

import useAuthContext from "../hooks/useAuthContext";
import Loader from "./Loader";

const SchematicWrapped: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { identify } = useSchematicEvents();
  const authContext = useAuthContext();

  useEffect(() => {
    const { company, user } = authContext ?? {};
    if (company && user) {
      void identify({
        company: {
          keys: company.keys,
          name: company.name,
        },
        keys: user.keys,
        name: user.name,
        traits: user.traits,
      });
    }
  }, [authContext, identify]);

  return children;
};

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const schematicPubKey = process.env.NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY;
  if (!schematicPubKey) {
    throw new Error(
      "No Schematic Publishable Key found. Please add it to your .env.local file.",
    );
  }

  const [isClientSide, setIsClientSide] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClientSide(true);
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_SCHEMATIC_API_URL;
  const apiConfig = apiUrl ? { basePath: apiUrl } : undefined;

  return (
    <ClerkProvider>
      {isClientSide ? (
        <SchematicProvider
          embed={EmbedAdapter}
          publishableKey={schematicPubKey}
          apiConfig={apiConfig}
          apiUrl={apiUrl}
          eventUrl={process.env.NEXT_PUBLIC_SCHEMATIC_EVENT_URL}
          webSocketUrl={process.env.NEXT_PUBLIC_SCHEMATIC_WEBSOCKET_URL}
        >
          <SchematicWrapped>{children}</SchematicWrapped>
        </SchematicProvider>
      ) : (
        <Loader />
      )}
    </ClerkProvider>
  );
}
