"use client";

import { ClerkProvider, useUser } from "@clerk/nextjs";
import { SchematicStyles } from "@schematichq/schematic-components/elements";
import {
  SchematicProvider,
  useSchematicEvents,
} from "@schematichq/schematic-react";
import { useEffect, useState } from "react";

import Loader from "@/components/Loader";
import useAuthContext from "@/hooks/useAuthContext";
import { demoCompanyKeys, demoIdentity, isDemoMode } from "@/utils/demoContext";

const fetchAccessToken = async (): Promise<string> => {
  const response = await fetch("/api/accessToken");
  const result = (await response.json()) as { accessToken?: string };
  if (result.accessToken === undefined) {
    throw new Error("Failed to issue a Schematic access token");
  }
  return result.accessToken;
};

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

const SchematicSession: React.FC<{
  children: React.ReactNode;
  publishableKey: string;
  sessionKey?: string | null;
}> = ({ children, publishableKey, sessionKey }) => (
  <SchematicProvider
    publishableKey={publishableKey}
    accessToken={fetchAccessToken}
    sessionKey={sessionKey}
    apiUrl={process.env.NEXT_PUBLIC_SCHEMATIC_API_URL}
    eventUrl={process.env.NEXT_PUBLIC_SCHEMATIC_EVENT_URL}
    webSocketUrl={process.env.NEXT_PUBLIC_SCHEMATIC_WEBSOCKET_URL}
  >
    <SchematicStyles />
    {children}
  </SchematicProvider>
);

const SchematicClerkSession: React.FC<{
  children: React.ReactNode;
  publishableKey: string;
}> = ({ children, publishableKey }) => {
  const { isLoaded, user } = useUser();

  // Three states, because Schematic reads all three: the org id once Clerk
  // has one, `null` for signed out — which is what drops the previous
  // company's invoices — and `undefined` for anything this app cannot
  // answer yet, which says nothing and so changes nothing.
  //
  // For a signed-in user the company is their first organization. The
  // membership list tells "none" from "not yet" by existing at all: absent
  // is unknown and says nothing, present and empty is a user with no
  // organization — no company to read, which ends the session rather than
  // leaving the last one's invoices on screen.
  const memberships = user?.organizationMemberships;
  const sessionKey = !isLoaded
    ? undefined
    : !user
      ? null
      : memberships === undefined
        ? undefined
        : (memberships[0]?.organization.id ?? null);

  return (
    <SchematicSession publishableKey={publishableKey} sessionKey={sessionKey}>
      <SchematicWrapped>{children}</SchematicWrapped>
    </SchematicSession>
  );
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

  // Demo mode: skip ClerkProvider entirely so the app boots with no Clerk keys.
  if (isDemoMode()) {
    return isClientSide ? (
      <SchematicSession
        publishableKey={schematicPubKey}
        sessionKey={demoCompanyKeys.id}
      >
        <SchematicWrappedDemo>{children}</SchematicWrappedDemo>
      </SchematicSession>
    ) : (
      <Loader />
    );
  }

  return (
    <ClerkProvider>
      {isClientSide ? (
        <SchematicClerkSession publishableKey={schematicPubKey}>
          {children}
        </SchematicClerkSession>
      ) : (
        <Loader />
      )}
    </ClerkProvider>
  );
}
