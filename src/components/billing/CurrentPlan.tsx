"use client";

import {
  derivePlanManager,
  httpStatus,
  type PlanNotice,
  type PlanPrice,
  useCompany,
  useCreditBalances,
  useFeatureUsage,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import Link from "next/link";
import { useMemo } from "react";

import { Button, PanelSection } from "@/components/ui";
import { shortPeriod } from "@/utils/usageCopy";

const SECTION = {
  title: "Current plan",
};

const ERROR_MESSAGE = "There was a problem retrieving your plan.";
const UNAVAILABLE_MESSAGE = "Your plan is not available for this account.";

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

/**
 * The company's plan, hand-built on `useCompany` and `derivePlanManager`:
 * where its subscription is headed, the plan and its price, and the
 * add-ons. Usage and credits have sections of their own on this page.
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
        {view.addOns.length > 0 && (
          <ul className="space-y-2 text-sm" data-testid="plan-add-ons">
            {view.addOns.map((addOn) => (
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
            ))}
          </ul>
        )}
      </div>
    </PanelSection>
  );
}
