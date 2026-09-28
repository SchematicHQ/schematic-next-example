"use client";

import {
  deriveMeteredFeatures,
  httpStatus,
  type MeteredFeatureRow,
  useFeatureUsage,
  useFeatureUserUsage,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import { useMemo } from "react";

import { Button, PanelSection } from "@/components/ui";

const SECTION = {
  title: "Usage",
};

const ERROR_MESSAGE = "There was a problem retrieving your usage.";
// A 404 is the account not being on the flag that serves company reads.
const UNAVAILABLE_MESSAGE = "Usage is not available for this account.";

/** How many of a feature's heaviest users the section names. */
const TOP_USERS = 3;

const UsageSkeleton = () => (
  <PanelSection {...SECTION}>
    <div
      aria-busy="true"
      aria-label="Loading your usage"
      className="animate-pulse space-y-4"
      role="status"
    >
      <div className="h-4 w-48 rounded bg-muted" />
      <div className="h-2 w-full rounded-full bg-muted" />
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="h-2 w-full rounded-full bg-muted" />
    </div>
  </PanelSection>
);

/** "250 of 1,000", or just what was used where nothing caps it. */
function figure(row: MeteredFeatureRow): string | null {
  if (row.meter !== null) {
    return `${row.meter.valueText} of ${row.meter.totalText}`;
  }
  if (row.headline?.kind === "used") {
    return `${row.headline.amount} ${row.headline.units}`;
  }
  return null;
}

/** The team members who used an event-based feature most this period. */
function TopUsers({ featureId }: { featureId: string }) {
  const { data } = useFeatureUserUsage(featureId);
  const users = useMemo(
    () =>
      [...(data?.users ?? [])]
        .sort((a, b) => b.usage - a.usage)
        .slice(0, TOP_USERS),
    [data?.users],
  );
  if (users.length === 0) {
    return null;
  }
  return (
    <p className="text-xs text-muted-fg">
      Most active: {users.map((user) => user.name ?? user.userId).join(", ")}
      {data !== undefined && data.count > users.length
        ? ` and ${data.count - users.length} more`
        : ""}
    </p>
  );
}

/**
 * What the company has used of each metered feature, hand-built on
 * `useFeatureUsage` and `deriveMeteredFeatures`, as a section of the billing
 * portal's panel. The copy is the app's own; the figures come from the
 * derivation.
 */
export function FeatureUsage() {
  const { data, error, isPending, refetch } = useFeatureUsage();
  const locale = useResolvedLocale();

  const rows = useMemo(
    () => (data === undefined ? [] : deriveMeteredFeatures(data, { locale })),
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
              {httpStatus(error) === 404 ? UNAVAILABLE_MESSAGE : ERROR_MESSAGE}
            </p>
            <Button onClick={refetch}>Try again</Button>
          </div>
        </PanelSection>
      );
    }
    if (isPending) {
      return <UsageSkeleton />;
    }
  }

  if (rows.length === 0) {
    return (
      <PanelSection {...SECTION}>
        <p className="text-sm text-muted-fg">Nothing metered on your plan</p>
      </PanelSection>
    );
  }

  return (
    <PanelSection {...SECTION}>
      <ul className="space-y-5">
        {rows.map((row) => (
          <li className="space-y-2" key={row.featureId}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{row.name}</span>
              <span className="text-sm tabular-nums text-muted-fg">
                {figure(row)}
              </span>
            </div>
            {row.meter !== null && (
              <div
                aria-label={`${row.name} usage`}
                aria-valuemax={row.meter.total}
                aria-valuemin={0}
                aria-valuenow={row.meter.value}
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="meter"
              >
                <div
                  className={
                    row.meter.tone === "critical" ||
                    row.meter.tone === "overage"
                      ? "h-full bg-danger"
                      : "h-full bg-accent"
                  }
                  style={{ width: `${row.meter.percent}%` }}
                />
              </div>
            )}
            {row.resetsAt !== null && (
              <p className="text-xs text-muted-fg">Resets {row.resetsAt}</p>
            )}
            {row.hasUsageByUser && <TopUsers featureId={row.featureId} />}
          </li>
        ))}
      </ul>
    </PanelSection>
  );
}
