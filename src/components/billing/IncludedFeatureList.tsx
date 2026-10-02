"use client";

import {
  deriveIncludedFeatures,
  httpStatus,
  useFeatureUsage,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import { useMemo, useState } from "react";

import { FeatureIcon } from "@/components/billing/FeatureIcon";
import { Button, LinkButton, PanelSection } from "@/components/ui";
import { entitlementText, usageText } from "@/utils/usageCopy";

const SECTION = {
  title: "Included features",
};

/** Features shown before "See all". */
const VISIBLE = 4;

/**
 * Everything the plan includes, hand-built on `useFeatureUsage` and
 * `deriveIncludedFeatures`: each feature's allowance or price on the right,
 * with what has been used and when it resets beneath, the way the packaged
 * `<IncludedFeatures>` lays it out. The words are the app's own, from
 * `src/utils/usageCopy.ts`.
 */
export function IncludedFeatureList() {
  const { data, error, isPending, refetch } = useFeatureUsage();
  const locale = useResolvedLocale();
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(
    () => (data === undefined ? [] : deriveIncludedFeatures(data, { locale })),
    [data, locale],
  );

  if (data === undefined) {
    if (error !== undefined) {
      return (
        <PanelSection {...SECTION}>
          <div
            className="flex flex-wrap items-center justify-between gap-4"
            role="alert"
          >
            <p className="text-sm text-danger">
              {httpStatus(error) === 404
                ? "Features are not available for this account."
                : "There was a problem retrieving your features."}
            </p>
            <Button onClick={refetch}>Try again</Button>
          </div>
        </PanelSection>
      );
    }
    if (isPending) {
      return (
        <PanelSection {...SECTION}>
          <div
            aria-busy="true"
            aria-label="Loading your features"
            className="h-4 w-48 animate-pulse rounded bg-muted"
            role="status"
          />
        </PanelSection>
      );
    }
  }

  const shown = expanded ? rows : rows.slice(0, VISIBLE);

  return (
    <PanelSection {...SECTION}>
      <ul className="space-y-6">
        {shown.map((row) => {
          const usage = usageText(row.usage, row.usageSummary);
          return (
            <li
              className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1"
              key={row.featureId}
            >
              <div className="flex min-w-0 grow gap-3">
                <FeatureIcon name={row.icon} />
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium">{row.name}</p>
                  {row.description !== null && (
                    <p className="text-sm text-muted-fg">{row.description}</p>
                  )}
                  {row.perLicenseCredits.map((credits) => (
                    <p
                      className="text-sm text-muted-fg"
                      key={credits.creditName}
                    >
                      Includes {credits.amount} {credits.creditName} per{" "}
                      {credits.licenseName}
                    </p>
                  ))}
                  {row.expiresAt !== null && (
                    <p className="text-sm text-muted-fg italic">
                      Expires {row.expiresAt.text}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-0.5 text-right">
                {row.entitlement !== null && (
                  <p className="text-sm tabular-nums">
                    {entitlementText(row.entitlement)}
                  </p>
                )}
                {usage !== null && (
                  <p className="text-xs tabular-nums text-muted-fg">{usage}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {rows.length > VISIBLE && (
        <LinkButton
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Hide all" : "See all"}
        </LinkButton>
      )}
    </PanelSection>
  );
}
