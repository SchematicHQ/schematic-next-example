"use client";

import { SchematicProvider } from "@schematichq/schematic-react";
import Weather from "@/components/Weather";
import Navbar from "@/components/Navbar";

export default function Home() {
  const schematicPubKey = process.env.NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY!;
  return (
    <SchematicProvider publishableKey={schematicPubKey}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-24">
          <div className="w-full max-w-5xl">
            <Weather />
          </div>
        </main>
      </div>
    </SchematicProvider>
  );
}