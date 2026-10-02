"use client";

import {
  type CreditUsageRow,
  deriveCreditUsage,
  httpStatus,
  useCreditBalances,
  useCreditUserUsage,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import Link from "next/link";
import { useMemo, useState } from "react";

import { FeatureIcon } from "@/components/billing/FeatureIcon";
import { TeamUsage } from "@/components/billing/TeamUsage";
import { Button, LinkButton, PanelSection } from "@/components/ui";
import { ledgerText, shortPeriod } from "@/utils/usageCopy";

const SECTION = {
  title: "Credits",
};

/** Grants shown before "See all". */
const VISIBLE_GRANTS = 3;

/** "Your plan includes 220 AI credits/mo — 12 Seats × 10 + 100 company grant." */
function compositionText(credit: CreditUsageRow): string | null {
  const composition = credit.composition;
  if (composition === null) {
    return null;
  }
  const parts = [
    `${composition.perLicense.quantity} ${composition.perLicense.licenseName} × ${composition.perLicense.perUnit}`,
  ];
  if (composition.companyGrant !== null) {
    parts.push(`${composition.companyGrant} company grant`);
  }
  const sentence = `Your plan includes ${composition.total} ${composition.creditName}/${shortPeriod(composition.period)} — ${parts.join(" + ")}.`;
  return composition.renewsOn === null
    ? sentence
    : `${sentence} Renews on the ${composition.renewsOn}.`;
}

/** The grants behind a balance, behind "See balance details". */
function Ledger({ credit }: { credit: CreditUsageRow }) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  if (credit.ledger.length === 0) {
    return null;
  }
  const rows = all ? credit.ledger : credit.ledger.slice(0, VISIBLE_GRANTS);
  return (
    <div className="space-y-2">
      <LinkButton
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          setAll(false);
        }}
      >
        {open ? "Hide balance details" : "See balance details"}
      </LinkButton>
      {open && (
        <div className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
          <ul className="space-y-2">
            {rows.map((row) => (
              <li className="flex justify-between gap-4" key={row.id}>
                <span>{ledgerText(row)}</span>
                {row.date !== null && (
                  <span className="whitespace-nowrap text-muted-fg">
                    {row.date.kind === "resets" ? "Resets" : "Expires"}{" "}
                    {row.date.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {credit.ledger.length > VISIBLE_GRANTS && (
            <LinkButton
              aria-expanded={all}
              onClick={() => setAll((value) => !value)}
            >
              {all ? "Hide all" : `See all (${credit.ledger.length})`}
            </LinkButton>
          )}
        </div>
      )}
    </div>
  );
}

/** The team members who spent a credit most over its live grants. */
function CreditTeamUsage({ credit }: { credit: CreditUsageRow }) {
  const { data } = useCreditUserUsage(credit.creditId);
  if (data === undefined) {
    return null;
  }
  return (
    <TeamUsage
      count={data.count}
      total={data.total}
      unit={credit.unit}
      users={data.users.map((user) => ({
        amount: user.used,
        id: user.userId,
        label: user.name ?? user.userId,
      }))}
    />
  );
}

/**
 * The company's credit balances, hand-built on `useCreditBalances` and
 * `deriveCreditUsage`: what is left of each, "Buy more" where a bundle sells
 * it, how the plan makes up its allowance, the grants behind the balance,
 * and who spent it, as the packaged `<CreditUsage>` shows them. The copy is
 * the app's own.
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
              {httpStatus(error) === 404
                ? "Credits are not available for this account."
                : "There was a problem retrieving your credits."}
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
    return null;
  }

  return (
    <PanelSection {...SECTION}>
      <ul className="space-y-7">
        {credits.map((credit) => {
          const composition = compositionText(credit);
          return (
            <li className="space-y-3" key={credit.creditId}>
              <div className="flex gap-3">
                <FeatureIcon name={credit.icon} />
                <div className="min-w-0 space-y-0.5">
                  <p className="font-display text-lg font-bold">
                    {credit.name}
                  </p>
                  {credit.description !== null && (
                    <p className="text-sm text-muted-fg">
                      {credit.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold tabular-nums">
                  {credit.remaining.amount} {credit.remaining.units} remaining
                </p>
                {credit.purchasable && (
                  <Link
                    className="rounded-xl border border-border-2 px-3.5 py-1.5 text-sm font-semibold hover:bg-muted"
                    href="/custom-checkout"
                  >
                    Buy more
                  </Link>
                )}
              </div>
              {composition !== null && (
                <p className="text-xs text-muted-fg">{composition}</p>
              )}
              <Ledger credit={credit} />
              <CreditTeamUsage credit={credit} />
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
