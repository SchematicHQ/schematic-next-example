"use client";

import { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import {
  SchematicProvider,
  useSchematicEvents,
} from "@schematichq/schematic-react";

import useAuthContext from "../hooks/useAuthContext";
import { demoIdentity, isDemoMode } from "../utils/demoContext";
import Loader from "./Loader";

// Clerk-derived identify (default, non-demo behavior).
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

// Demo-mode identify — hardcoded company/user, no Clerk.
const SchematicWrappedDemo: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { identify } = useSchematicEvents();

  useEffect(() => {
    void identify({
      company: {
        keys: demoIdentity.company.keys,
        name: demoIdentity.company.name,
        traits: { ...demoIdentity.company.traits },
      },
      keys: demoIdentity.user.keys,
      name: demoIdentity.user.name,
      traits: { ...demoIdentity.user.traits },
    });
  }, [identify]);

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

  const provider = (
    <SchematicProvider
      publishableKey={schematicPubKey}
      apiUrl={process.env.NEXT_PUBLIC_SCHEMATIC_API_URL}
      eventUrl={process.env.NEXT_PUBLIC_SCHEMATIC_EVENT_URL}
      webSocketUrl={process.env.NEXT_PUBLIC_SCHEMATIC_WEBSOCKET_URL}
    >
      {isDemoMode() ? (
        <SchematicWrappedDemo>{children}</SchematicWrappedDemo>
      ) : (
        <SchematicWrapped>{children}</SchematicWrapped>
      )}
    </SchematicProvider>
  );

  // Demo mode: skip ClerkProvider entirely so the app boots with no Clerk keys.
  if (isDemoMode()) {
    return isClientSide ? provider : <Loader />;
  }

  return (
    <ClerkProvider>{isClientSide ? provider : <Loader />}</ClerkProvider>
  );
}
