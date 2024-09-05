'use client';

import { SchematicProvider } from "@schematichq/schematic-react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const schematicPubKey = process.env.NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY!;

  return (
    <SchematicProvider publishableKey={schematicPubKey}>
      {children}
    </SchematicProvider>
  );
}