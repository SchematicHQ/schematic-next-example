"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CatalogDataProvider,
  CreditUsage,
  IncludedFeatures,
  Invoices,
  MeteredFeatures,
  PlanManager,
  PricingTable,
  SchematicStyles,
  UpcomingBill,
} from "@schematichq/schematic-components/v3";
import { NOW, SCENARIOS } from "@schematichq/schematic-components/v3/fixtures";
import { useMemo } from "react";

import { ELEMENTS, type ElementSlug } from "./elements";

const SCENARIO_NAMES = Object.keys(SCENARIOS) as (keyof typeof SCENARIOS)[];

function log(name: string) {
  return (...args: unknown[]) => console.log(`[v3] ${name}`, ...args);
}

/**
 * Renders one v3 element from a fixture scenario — no API, no auth — so the
 * elements can be checked visually in every state the fixtures describe.
 */
export default function V3Demo({ element }: { element: ElementSlug }) {
  const router = useRouter();
  const params = useSearchParams();
  const scenarioParam = params.get("scenario");
  const scenario: keyof typeof SCENARIOS =
    scenarioParam !== null && scenarioParam in SCENARIOS
      ? (scenarioParam as keyof typeof SCENARIOS)
      : element === "pricing-table"
        ? "public"
        : "pro";
  const data = useMemo(() => SCENARIOS[scenario](), [scenario]);

  let content: React.ReactNode;
  switch (element) {
    case "pricing-table":
      content = (
        <PricingTable
          showZeroPriceAsFree
          callToActionUrl="/usage"
          onSelectPlan={log("onSelectPlan")}
          onSelectAddOn={log("onSelectAddOn")}
        />
      );
      break;
    case "plan-manager":
      content = (
        <PlanManager
          now={NOW}
          onChangePlan={log("onChangePlan")}
          onEditAutoTopup={log("onEditAutoTopup")}
        />
      );
      break;
    case "included-features":
      content = <IncludedFeatures />;
      break;
    case "metered-features":
      content = <MeteredFeatures onAddMore={log("onAddMore")} />;
      break;
    case "credit-usage":
      content = <CreditUsage onBuyBundle={log("onBuyBundle")} />;
      break;
    case "invoices":
      content = <Invoices />;
      break;
    case "upcoming-bill":
      content = <UpcomingBill />;
      break;
  }

  return (
    <div className="flex flex-col gap-6">
      <SchematicStyles />
      <nav className="flex flex-wrap items-center gap-3 text-sm">
        {(Object.keys(ELEMENTS) as ElementSlug[]).map((slug) => (
          <Link
            key={slug}
            href={`/v3/${slug}?scenario=${scenario}`}
            className={slug === element ? "font-semibold underline" : ""}
          >
            {ELEMENTS[slug]}
          </Link>
        ))}
        <label className="ml-auto flex items-center gap-2">
          Scenario
          <select
            className="rounded border px-2 py-1"
            value={scenario}
            onChange={(event) =>
              router.replace(`/v3/${element}?scenario=${event.target.value}`)
            }
          >
            {SCENARIO_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </nav>
      <CatalogDataProvider
        data={data}
        onRefetch={log("refetch")}
        onLoadMoreInvoices={log("loadMoreInvoices")}
      >
        {content}
      </CatalogDataProvider>
    </div>
  );
}
