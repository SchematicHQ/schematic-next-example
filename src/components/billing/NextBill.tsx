"use client";

import {
  deriveUpcomingInvoice,
  type Translator,
  type UpcomingBillSummary,
  useResolvedLocale,
  useTranslator,
  useUpcomingInvoice,
} from "@schematichq/schematic-components/v3";
import { useMemo } from "react";

import { Badge, Button, Card } from "@/components/ui";
import { UPCOMING_BILL_STRINGS } from "@/utils/billing";

const BillSkeleton = ({ label }: { label: string }) => (
  <Card aria-busy="true" aria-label={label} role="status">
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-56 rounded-md bg-muted" />
      <div className="h-9 w-32 rounded-md bg-muted" />
      <div className="space-y-3 border-t border-border pt-4">
        <div className="h-4 w-64 rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  </Card>
);

const BillError = ({
  message,
  onRetry,
  retryText,
}: {
  message: string;
  onRetry: () => void;
  retryText: string;
}) => (
  <Card role="alert">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-danger">{message}</p>
      <Button onClick={onRetry}>{retryText}</Button>
    </div>
  </Card>
);

const BillRow = ({
  label,
  value,
  testId,
}: {
  label: string;
  value: React.ReactNode;
  testId: string;
}) => (
  <div
    className="flex items-baseline justify-between gap-4 py-1.5"
    data-testid={testId}
  >
    <span className="font-medium">{label}</span>
    <span className="text-right whitespace-nowrap tabular-nums">{value}</span>
  </div>
);

/** "20% off", or "20% off for 3 months" while it repeats. */
const discountText = (
  discount: UpcomingBillSummary["discounts"][number],
  t: Translator,
): string =>
  discount.months === null
    ? t("upcomingBillDiscountValue", { value: discount.valueText })
    : t("upcomingBillDiscountRepeating", {
        count: discount.months,
        value: discount.valueText,
      });

/** The company's next bill, hand-built on `useUpcomingInvoice`. */
export function NextBill() {
  const { data: invoice, error, isPending, refetch } = useUpcomingInvoice();

  const locale = useResolvedLocale();
  const t = useTranslator(UPCOMING_BILL_STRINGS);

  const bill = useMemo(() => {
    if (invoice !== undefined && invoice !== null) {
      return deriveUpcomingInvoice(invoice, { locale });
    }
  }, [invoice, locale]);

  // `undefined` is still loading; `null` is a company with nothing to bill,
  // which is an answer and renders as content.
  if (invoice === undefined) {
    if (error !== undefined) {
      return (
        <BillError
          message={error.message}
          onRetry={refetch}
          retryText={t("retry")}
        />
      );
    }
    if (isPending) {
      return <BillSkeleton label={t("upcomingBillLoading")} />;
    }
  }

  if (bill === undefined) {
    return (
      <Card>
        <p className="py-9 text-center text-sm text-muted-fg">
          {t("upcomingBillEmpty")}
        </p>
      </Card>
    );
  }

  const hasRows =
    bill.balanceApplied !== null ||
    bill.balanceRemaining !== null ||
    bill.discounts.length > 0;

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl">
          {bill.dueAt === null
            ? t("upcomingBillHeaderUndated")
            : t("upcomingBillHeader", { date: bill.dueAt.text })}
        </h2>
      </div>

      <div className="flex items-center flex-wrap gap-4 mt-4">
        <p
          className="font-display text-4xl font-extrabold tabular-nums"
          data-testid="schematic-upcoming-total"
        >
          {bill.amountDueText}
        </p>
        <Badge tone="warning">{t("upcomingBillEstimate")}</Badge>
      </div>

      {hasRows && (
        <div className="mt-5 border-t border-border pt-3 text-sm">
          {bill.balanceApplied !== null && (
            <BillRow
              label={t("upcomingBillBalanceApplied")}
              testId="schematic-balance-applied"
              value={bill.balanceApplied.amountText}
            />
          )}
          {bill.balanceRemaining !== null && (
            <BillRow
              label={t("upcomingBillBalanceRemaining")}
              testId="schematic-balance-remaining"
              value={bill.balanceRemaining.amountText}
            />
          )}
          {bill.discounts.map((discount, index) => (
            <BillRow
              key={`${discount.couponName}-${index}`}
              label={t("upcomingBillDiscount")}
              testId="schematic-discount"
              value={
                <span className="inline-flex items-center gap-2">
                  {discount.code === null ? (
                    <span className="text-muted-fg">{discount.couponName}</span>
                  ) : (
                    <Badge className="uppercase">{discount.code}</Badge>
                  )}
                  {discountText(discount, t)}
                </span>
              }
            />
          ))}
        </div>
      )}

      {error !== undefined && (
        <p className="mt-5 text-sm text-danger" role="alert">
          {error.message}
        </p>
      )}
    </Card>
  );
}
