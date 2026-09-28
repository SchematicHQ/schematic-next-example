"use client";

import {
  deriveCreditUsage,
  httpStatus,
  useCreditBalances,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import { useMemo } from "react";

import { Button, PanelSection } from "@/components/ui";

const SECTION = {
  title: "Credits",
};

const ERROR_MESSAGE = "There was a problem retrieving your credits.";
// A 404 is the account not being on the flag that serves company reads.
const UNAVAILABLE_MESSAGE = "Credits are not available for this account.";

/**
 * The company's credit balances, hand-built on `useCreditBalances` and
 * `deriveCreditUsage`, as a section of the billing portal's panel: what is
 * left of each credit, when it next refreshes or runs out, and how the plan
 * makes up its allowance. The copy is the app's own.
 */
export function Credits() {
  const { data, error, isPending, refetch } = useCreditBalances();
  const locale = useResolvedLocale();

  const credits = useMemo(
    () => (data === undefined ? [] : deriveCreditUsage(data, { locale })),
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
      return (
        <PanelSection {...SECTION}>
          <div
            aria-busy="true"
            aria-label="Loading your credits"
            className="h-4 w-48 animate-pulse rounded bg-muted"
            role="status"
          />
        </PanelSection>
      );
    }
  }

  if (credits.length === 0) {
    return (
      <PanelSection {...SECTION}>
        <p className="text-sm text-muted-fg">No credits on your plan</p>
      </PanelSection>
    );
  }

  return (
    <PanelSection {...SECTION}>
      <ul className="space-y-5">
        {credits.map((credit) => {
          const next = credit.ledger.find((grant) => grant.date !== null);
          return (
            <li className="space-y-1" key={credit.creditId}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium">{credit.name}</span>
                <span className="text-sm tabular-nums">
                  {credit.remaining.amount} left
                </span>
              </div>
              {next?.date !== null && next?.date !== undefined && (
                <p className="text-xs text-muted-fg">
                  {next.date.kind === "resets" ? "Refreshes" : "Runs out"}{" "}
                  {next.date.text}
                </p>
              )}
              {credit.composition !== null && (
                <p className="text-xs text-muted-fg">
                  {credit.composition.total} {credit.composition.creditName}{" "}
                  each {credit.composition.period}:{" "}
                  {credit.composition.perLicense.quantity}{" "}
                  {credit.composition.perLicense.licenseName} ×{" "}
                  {credit.composition.perLicense.perUnit}
                  {credit.composition.companyGrant !== null &&
                    ` + ${credit.composition.companyGrant}`}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
