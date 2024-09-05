"use client";

import { SchematicEmbed } from "@schematichq/schematic-react";

export default function Usage({ accessToken }: { accessToken: string }) {
  const componentId = process.env.NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID;
  if (!componentId) {
    console.error(
      "Missing Schematic component ID (NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID)",
    );

    return <div>Not found</div>;
  }

  return <SchematicEmbed accessToken={accessToken} id={componentId} />;
}
