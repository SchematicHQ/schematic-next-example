"use client";

import { PricingTable } from "@schematichq/schematic-react/components";

export default function Pricing() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Pricing</h1>
      <PricingTable callToActionUrl="/usage" />
    </>
  );
}
