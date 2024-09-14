"use client";

import Loader from "./Loader";
import React, { useEffect, useState } from "react";
import { SchematicProvider } from "@schematichq/schematic-react";
import { ClerkProvider } from "@clerk/nextjs";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const schematicPubKey = process.env.NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY!;
  if (!schematicPubKey) {
    throw new Error(
      "No Schematic Publishable Key found. Please add it to your .env.local file.",
    );
  }

  // This is necessary to ensure that SchematicProvider is not rendered server-side
  // In the future, we will provide a more NextJS-specific solution for this.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ClerkProvider>
      {isMounted ? (
        <SchematicProvider publishableKey={schematicPubKey}>
          {children}
        </SchematicProvider>
      ) : (
        <Loader />
      )}
    </ClerkProvider>
  );
}
