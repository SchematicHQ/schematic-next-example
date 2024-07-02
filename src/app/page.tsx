"use client";

import { SchematicProvider } from "@schematichq/schematic-react";
import Weather from "@/components/Weather";

export default function Home() {
  const schematicPubKey = process.env.SCHEMATIC_PUBLISHABLE_KEY!;
  return (
    <SchematicProvider publishableKey={schematicPubKey}>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <Weather />
        </div>
      </main>
    </SchematicProvider>
  );
}
