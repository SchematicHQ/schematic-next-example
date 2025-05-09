"use client";

import React, { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import {
  SchematicProvider,
  useSchematicEvents,
} from "@schematichq/schematic-react";
import Loader from "./Loader";
import useAuthContext from "../hooks/useAuthContext";

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
    setIsClientSide(true);
  }, []);

  return (
    <ClerkProvider>
      {isClientSide ? (
        <SchematicProvider
          publishableKey={schematicPubKey}
          apiUrl={process.env.NEXT_PUBLIC_SCHEMATIC_API_URL}
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
