"use client";

import {
  type CreditGroupRow,
  derivePlanManager,
  httpStatus,
  type PlanCreditRow,
  type PlanManagerView,
  type PlanNotice,
  type PlanPrice,
  type UsageBasedRow,
  useCompany,
  useCreditBalances,
  useFeatureUsage,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";

import { Button, LinkButton, PanelSection } from "@/components/ui";
import { shortPeriod } from "@/utils/usageCopy";

const SECTION = {
  title: "Current plan",
};

const ERROR_MESSAGE = "There was a problem retrieving your plan.";
const UNAVAILABLE_MESSAGE = "Your plan is not available for this account.";

/** Rows a credit list shows before "See all". */
const VISIBLE_ROWS = 3;

const PERIOD_WORD: Record<string, string> = {
  day: "day",
  month: "month",
  quarter: "quarter",
  week: "week",
  year: "year",
};

const UNITS = {
  day: ["day", "days"],
  hour: ["hour", "hours"],
  minute: ["minute", "minutes"],
  second: ["second", "seconds"],
} as const;

/** The app's wording for where the subscription is headed. */
function noticeText(notice: PlanNotice): string | null {
  switch (notice.kind) {
    case "trial": {
      if (notice.endsIn === null) {
        return null;
      }
      const [one, many] = UNITS[notice.endsIn.unit];
      return `Your trial ends in ${notice.endsIn.amount} ${notice.endsIn.amount === 1 ? one : many}.`;
    }
    case "canceled":
      return notice.date === null
        ? "Your subscription is canceled."
        : `Your subscription is canceled. You keep ${notice.planName ?? "your plan"} until ${notice.date}.`;
    case "customPlanBilling":
      return notice.awaitingActivation
        ? `Pay the invoice by ${notice.date} to activate ${notice.planName ?? "your plan"}.`
        : `Pay the invoice by ${notice.date} to keep ${notice.planName ?? "your plan"}.`;
    case "scheduledDowngrade":
      return notice.date === null
        ? `You move to ${notice.toPlanName} at the end of this period.`
        : `You move to ${notice.toPlanName} on ${notice.date}.`;
  }
}

function priceText(price: PlanPrice): string {
  switch (price.kind) {
    case "usageBased":
      return "Pay as you go";
    case "free":
      return "Free";
    case "amount":
      return price.period === null
        ? price.amount
        : `${price.amount}/${shortPeriod(price.period)}`;
  }
}

/** "$0.02 per 100 GB", "Additional $0.05 per email", "2 AI credits per use", "$180.00/mo". */
function usageBasedDetail(row: UsageBasedRow): string | null {
  const parts: string[] = [];
  if (row.tierBased) {
    parts.push("Tiered pricing");
  }
  if (row.unitPrice !== null) {
    const per =
      row.unitPrice.packageSize === null
        ? row.unitPrice.units
        : `${row.unitPrice.packageSize} ${row.unitPrice.units}`;
    const period =
      row.unitPrice.period === null
        ? ""
        : `/${shortPeriod(row.unitPrice.period)}`;
    parts.push(
      `${row.additional ? "Additional " : ""}${row.unitPrice.cost} per ${per}${period}`,
    );
  }
  if (row.perUse !== null) {
    parts.push(`${row.perUse.amount} ${row.perUse.units} per use`);
  }
  if (row.cost !== null) {
    parts.push(
      row.cost.period === null
        ? row.cost.amount
        : `${row.cost.amount}/${shortPeriod(row.cost.period)}`,
    );
  }
  return parts.length === 0 ? null : parts.join(" · ");
}

function planCreditText(row: PlanCreditRow): string {
  const text = row.text;
  if (text.kind === "perLicense") {
    const plus =
      text.plus === null
        ? ""
        : `, plus ${text.plus.amount} ${text.plus.creditName} a ${PERIOD_WORD[text.plus.period] ?? text.plus.period}`;
    return `${text.amount} ${text.creditName} per ${text.licenseName}${plus}`;
  }
  return text.period === null
    ? `${text.amount} ${text.creditName}`
    : `${text.amount} ${text.creditName} a ${PERIOD_WORD[text.period] ?? text.period}`;
}

/** "220 AI credits/mo in all — 12 Seats × 10 + 100". */
function compositionText(row: PlanCreditRow): string | null {
  const c = row.composition;
  if (c === null) {
    return null;
  }
  const fixed = c.fixed === null ? "" : ` + ${c.fixed}`;
  return `${c.total} ${c.creditName}/${shortPeriod(c.period)} in all — ${c.quantity} ${c.licenseName} × ${c.perUnit}${fixed}`;
}

/** "(2) 500 credit pack — 500 AI credits"; promotional grants never count. */
function creditGroupText(row: CreditGroupRow, countAlways: boolean): string {
  const amount = `${row.quantity} ${row.creditName}`;
  const named =
    row.bundleName === null ? amount : `${row.bundleName} — ${amount}`;
  const counted =
    row.count > 1 && (countAlways || row.bundleName !== null)
      ? `(${row.count}) `
      : "";
  return `${counted}${named}`;
}

/** A titled list; a `truncate`d one shows three rows before "See all". */
function PlanList<Row>({
  children,
  footer,
  rows,
  title,
  truncate = false,
}: {
  children: (row: Row) => ReactNode;
  footer?: ReactNode;
  rows: Row[];
  title: string;
  truncate?: boolean;
}) {
  const [all, setAll] = useState(!truncate);
  if (rows.length === 0) {
    return null;
  }
  const shown = all ? rows : rows.slice(0, VISIBLE_ROWS);
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold tracking-wider text-muted-fg uppercase">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">{shown.map(children)}</ul>
      {truncate && rows.length > VISIBLE_ROWS && (
        <LinkButton aria-expanded={all} onClick={() => setAll((v) => !v)}>
          {all ? "Show fewer" : `See all (${rows.length})`}
        </LinkButton>
      )}
      {footer}
    </div>
  );
}

const Used = ({ amount, tip }: { amount: number; tip?: string }) =>
  amount > 0 ? (
    <span className="text-muted-fg tabular-nums" title={tip}>
      {amount} used{tip !== undefined && " ↻"}
    </span>
  ) : null;

/** What the plan bills by use, and the credits it and the company's purchases bring. */
function PlanUsage({ view }: { view: PlanManagerView }) {
  return (
    <>
      <PlanList rows={view.usageBased} title="Usage-based">
        {(row) => {
          const detail = usageBasedDetail(row);
          return (
            <li className="flex justify-between gap-4" key={row.featureId}>
              <span className="font-medium">
                {row.quantity === null
                  ? row.name
                  : `${row.quantity.amount} ${row.quantity.units}`}
              </span>
              {detail !== null && (
                <span className="text-right text-muted-fg tabular-nums">
                  {detail}
                </span>
              )}
            </li>
          );
        }}
      </PlanList>

      <PlanList
        footer={
          view.autoTopup !== null && (
            <div className="flex items-start justify-between gap-4 rounded-xl bg-muted px-4 py-3 text-sm">
              <div className="space-y-1">
                <p className="font-semibold">Auto top-up</p>
                {view.autoTopup.lines.map((line) => (
                  <p key={line.creditId}>
                    {line.kind === "disabled"
                      ? `Off for ${line.unit}`
                      : `Adds ${line.amount} ${line.unit} when ${line.threshold} are left`}
                  </p>
                ))}
              </div>
              <Link
                className="font-semibold text-accent underline underline-offset-[0.2em] hover:text-accent-deep"
                href="/custom-checkout"
              >
                Edit
              </Link>
            </div>
          )
        }
        rows={view.planCredits}
        title="Credits in plan"
        truncate
      >
        {(row) => {
          const composition = compositionText(row);
          return (
            <li className="space-y-1" key={row.creditId}>
              <div className="flex justify-between gap-4">
                <span className="font-medium">{planCreditText(row)}</span>
                <Used
                  amount={row.used}
                  tip={
                    row.autoTopup === null
                      ? undefined
                      : `Tops up ${row.autoTopup.amount} credits when ${row.autoTopup.threshold} are left`
                  }
                />
              </div>
              {composition !== null && (
                <p className="text-muted-fg">{composition}</p>
              )}
            </li>
          );
        }}
      </PlanList>

      {(
        [
          ["Top-ups", view.topUps, true],
          ["Credit bundles", view.bundles, false],
          ["Promotional credits", view.promotional, false],
        ] as const
      ).map(([title, rows, countAlways]) => (
        <PlanList key={title} rows={[...rows]} title={title} truncate>
          {(row) => (
            <li className="flex justify-between gap-4" key={row.key}>
              <span className="font-medium">
                {title === "Promotional credits"
                  ? `${row.quantity} ${row.creditName}`
                  : creditGroupText(row, countAlways)}
              </span>
              <Used amount={row.used} />
            </li>
          )}
        </PlanList>
      ))}
    </>
  );
}

/**
 * The company's plan, hand-built on `useCompany` and `derivePlanManager`:
 * where its subscription is headed, the plan and its price, the add-ons,
 * what it bills by use, and the credits the plan and the company's
 * purchases bring — what `<PlanManager>` shows, in the app's markup.
 */
export function CurrentPlan() {
  const company = useCompany();
  const usage = useFeatureUsage();
  const credits = useCreditBalances();
  const locale = useResolvedLocale();

  const view = useMemo(() => {
    if (
      company.data !== undefined &&
      usage.data !== undefined &&
      credits.data !== undefined
    ) {
      return derivePlanManager(
        {
          company: company.data,
          creditBalances: credits.data,
          featureUsage: usage.data,
        },
        { locale },
      );
    }
  }, [company.data, credits.data, locale, usage.data]);

  if (view === undefined) {
    const error = company.error ?? usage.error ?? credits.error;
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
            <Button
              onClick={() => {
                company.refetch();
                usage.refetch();
                credits.refetch();
              }}
            >
              Try again
            </Button>
          </div>
        </PanelSection>
      );
    }
    return (
      <PanelSection {...SECTION}>
        <div
          aria-busy="true"
          aria-label="Loading your plan"
          className="animate-pulse space-y-3"
          role="status"
        >
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
      </PanelSection>
    );
  }

  const notice = view.notice === null ? null : noticeText(view.notice);

  return (
    <PanelSection
      {...SECTION}
      aside={
        view.canChangePlan && (
          <Link
            className="text-sm font-semibold text-accent underline underline-offset-[0.2em] hover:text-accent-deep"
            href="/custom-checkout"
          >
            Change plan
          </Link>
        )
      }
    >
      <div className="space-y-4">
        {notice !== null && (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm" role="status">
            {notice}
          </p>
        )}
        {view.plan === null ? (
          <p className="text-sm text-muted-fg">You are not on a plan.</p>
        ) : (
          <div className="flex items-baseline justify-between gap-4">
            <div className="space-y-1">
              <p className="font-display text-3xl leading-none font-extrabold">
                {view.plan.name}
              </p>
              {view.plan.description !== null && (
                <p className="text-sm text-muted-fg">{view.plan.description}</p>
              )}
            </div>
            {view.plan.price !== null && (
              <p className="font-semibold tabular-nums">
                {priceText(view.plan.price)}
              </p>
            )}
          </div>
        )}
        <PlanList rows={view.addOns} title="Add-ons">
          {(addOn) => (
            <li className="flex justify-between gap-4" key={addOn.id}>
              <span className="font-medium">{addOn.name}</span>
              {addOn.price !== null && (
                <span className="tabular-nums">
                  {addOn.price.period === "one-time"
                    ? `${addOn.price.amount} once`
                    : `${addOn.price.amount}/${shortPeriod(addOn.price.period)}`}
                </span>
              )}
            </li>
          )}
        </PlanList>
        <PlanUsage view={view} />
      </div>
    </PanelSection>
  );
}
