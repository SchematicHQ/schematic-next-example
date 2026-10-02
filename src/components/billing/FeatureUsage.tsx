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

import { FeatureIcon } from "@/components/billing/FeatureIcon";
import { TeamUsage } from "@/components/billing/TeamUsage";
import { Button, PanelSection } from "@/components/ui";
import { headlineText, limitText, shortPeriod } from "@/utils/usageCopy";

const SECTION = {
  title: "Usage",
};

/** Fill colour per meter tone; past an overage's limit the track warns. */
const TONE = {
  critical: "bg-danger",
  ok: "bg-accent",
  overage: "bg-accent",
  tier: "bg-accent",
  warning: "bg-amber",
} as const;

/** The overage or tier line under a priced feature. */
function PriceLine({ row }: { row: MeteredFeatureRow }) {
  const details = row.priceDetails;
  if (details === null) {
    return null;
  }
  const period =
    details.period === null ? "" : `/${shortPeriod(details.period)}`;
  return (
    <div className="flex flex-wrap justify-between gap-x-4 rounded-lg bg-muted/50 px-3 py-2 text-sm tabular-nums">
      {details.kind === "overage" ? (
        <>
          <span>
            Additional: {details.unitPrice}/
            {details.packageSize > 1 && `${details.packageSize} `}
            {details.units}
            {period}
          </span>
          <span>
            {details.overage.amount} {details.overage.units} ·{" "}
            {details.overage.cost}
            {period}
          </span>
        </>
      ) : (
        <>
          <span>
            Tier: {details.from}
            {details.to === null
              ? "+"
              : details.to !== details.from
                ? `–${details.to}`
                : ""}
          </span>
          {details.cost !== null && (
            <span>
              {details.cost}
              {period}
            </span>
          )}
        </>
      )}
    </div>
  );
}

/** The team members who used an event-based feature most this period. */
function FeatureTeamUsage({ row }: { row: MeteredFeatureRow }) {
  const { data } = useFeatureUserUsage(row.featureId);
  if (data === undefined) {
    return null;
  }
  return (
    <TeamUsage
      count={data.count}
      total={data.total}
      unit={row.unit}
      users={data.users.map((user) => ({
        amount: user.usage,
        id: user.userId,
        label: user.name ?? user.userId,
      }))}
    />
  );
}

/**
 * What the company has used of each metered feature, hand-built on
 * `useFeatureUsage` and `deriveMeteredFeatures`: the figure, the limit line,
 * the meter, the overage or tier price, and who used it most, as the
 * packaged `<MeteredFeatures>` shows them. The copy is the app's own.
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
              {httpStatus(error) === 404
                ? "Usage is not available for this account."
                : "There was a problem retrieving your usage."}
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
            aria-label="Loading your usage"
            className="h-4 w-48 animate-pulse rounded bg-muted"
            role="status"
          />
        </PanelSection>
      );
    }
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <PanelSection {...SECTION}>
      <ul className="space-y-7">
        {rows.map((row) => {
          const limit = [
            row.limit === null ? null : limitText(row.limit),
            row.resetsAt === null ? null : `Resets ${row.resetsAt}`,
          ]
            .filter((part) => part !== null)
            .join(" • ");
          return (
            <li className="space-y-3" key={row.featureId}>
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
                <div className="flex min-w-0 grow gap-3">
                  <FeatureIcon name={row.icon} />
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-display text-lg font-bold">{row.name}</p>
                    {row.description !== null && (
                      <p className="text-sm text-muted-fg">{row.description}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-0.5 text-right tabular-nums">
                  {row.headline !== null && (
                    <p className="text-sm font-semibold">
                      {headlineText(row.headline)}
                    </p>
                  )}
                  {limit !== "" && (
                    <p className="text-xs text-muted-fg">{limit}</p>
                  )}
                </div>
              </div>
              {row.meter !== null && (
                <div className="flex items-center gap-3">
                  <div
                    aria-label={`${row.name} usage`}
                    aria-valuemax={row.meter.total}
                    aria-valuemin={0}
                    aria-valuenow={row.meter.value}
                    className={
                      row.meter.tone === "overage"
                        ? "h-2 grow overflow-hidden rounded-full bg-amber"
                        : "h-2 grow overflow-hidden rounded-full bg-muted"
                    }
                    role="meter"
                  >
                    <div
                      className={`h-full ${TONE[row.meter.tone]}`}
                      style={{ width: `${row.meter.percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums">
                    {row.meter.valueText}/{row.meter.totalText}
                  </span>
                </div>
              )}
              <PriceLine row={row} />
              {row.hasUsageByUser && <FeatureTeamUsage row={row} />}
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
