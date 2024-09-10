"use client";

import { SchematicProvider } from "@schematichq/schematic-react";
import { ClerkProvider } from "@clerk/nextjs";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const schematicPubKey = process.env.NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY!;

  return (
    <ClerkProvider>
      <SchematicProvider publishableKey={schematicPubKey}>
        {children}
      </SchematicProvider>
    </ClerkProvider>
  );
}
