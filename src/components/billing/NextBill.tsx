"use client";

import {
  deriveUpcomingInvoice,
  type DiscountLine,
  httpStatus,
  useResolvedLocale,
  useUpcomingInvoice,
} from "@schematichq/schematic-components/elements";
import { useMemo } from "react";

import { Badge, Button, Card } from "@/components/ui";

const ERROR_MESSAGE = "There was a problem retrieving your upcoming invoice.";
// A 404 with nothing to show is the account not being on the flag that
// serves company reads; the endpoint answers 204 for "nothing to bill".
const UNAVAILABLE_MESSAGE =
  "Your upcoming invoice is not available for this account.";

/**
 * The fixed copy above hides what actually failed. In development the
 * error's own message shows beneath it, so a mis-wired provider or a
 * refused request can be read off the page rather than dug out of the hook.
 */
const ErrorDetail = ({ error }: { error: Error }) =>
  process.env.NODE_ENV === "development" ? (
    <p className="text-xs text-muted-fg">{error.message}</p>
  ) : null;

const BillSkeleton = () => (
  <Card aria-busy="true" aria-label="Loading your next bill" role="status">
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-56 rounded-md bg-muted" />
      <div className="h-9 w-32 rounded-md bg-muted" />
      <div className="space-y-3 pt-2">
        <div className="h-4 w-64 rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  </Card>
);

const BillError = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => (
  <Card role="alert">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm text-danger">
          {httpStatus(error) === 404 ? UNAVAILABLE_MESSAGE : ERROR_MESSAGE}
        </p>
        <ErrorDetail error={error} />
      </div>
      <Button onClick={onRetry}>Try again</Button>
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
  <div className="flex items-start justify-between gap-4" data-testid={testId}>
    <span className="font-medium">{label}</span>
    <span className="text-right tabular-nums">{value}</span>
  </div>
);

/** "20% off", or "20% off for next 3 months" while it repeats. */
function discountText(discount: DiscountLine): string {
  if (discount.months === null) {
    return `${discount.valueText} off`;
  }
  return discount.months === 1
    ? `${discount.valueText} off for next month`
    : `${discount.valueText} off for next ${discount.months} months`;
}

/** The company's next bill, hand-built on `useUpcomingInvoice`. */
export function NextBill() {
  const { data: invoice, error, isPending, refetch } = useUpcomingInvoice();

  const locale = useResolvedLocale();

  const bill = useMemo(() => {
    if (invoice !== undefined && invoice !== null) {
      return deriveUpcomingInvoice(invoice, { locale });
    }
  }, [invoice, locale]);

  // `undefined` is still loading; `null` is a company with nothing to bill,
  // which is an answer and renders as content.
  if (invoice === undefined) {
    if (error !== undefined) {
      return <BillError error={error} onRetry={refetch} />;
    }
    if (isPending) {
      return <BillSkeleton />;
    }
  }

  if (bill === undefined) {
    return (
      <Card>
        <p className="py-9 text-center text-sm text-muted-fg">
          No upcoming invoice
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
      <div className="space-y-4">
        {bill.dueAt !== null && (
          <h2 className="text-xl">Next bill due {bill.dueAt.text}</h2>
        )}

        <div className="flex items-start justify-between gap-4">
          <p
            className="font-display text-4xl leading-none font-extrabold tabular-nums"
            data-testid="schematic-upcoming-total"
          >
            {bill.amountDueText}
          </p>
          <p className="max-w-40 text-right text-sm font-semibold">
            Estimated bill
          </p>
        </div>

        {hasRows && (
          <div className="space-y-4 text-sm">
            {bill.balanceApplied !== null && (
              <BillRow
                label="Applied balance towards next invoice"
                testId="schematic-balance-applied"
                value={bill.balanceApplied.amountText}
              />
            )}
            {bill.balanceRemaining !== null && (
              <BillRow
                label="Remaining balance after next invoice"
                testId="schematic-balance-remaining"
                value={bill.balanceRemaining.amountText}
              />
            )}
            {bill.discounts.length > 0 && (
              <BillRow
                label="Discount"
                testId="schematic-discounts"
                value={
                  <ul className="flex flex-col items-end gap-2">
                    {bill.discounts.map((discount, index) => (
                      <li
                        className="inline-flex items-center gap-2"
                        data-testid="schematic-discount"
                        key={`${discount.couponName}-${index}`}
                      >
                        {discount.code !== null && (
                          <Badge className="uppercase">{discount.code}</Badge>
                        )}
                        {discountText(discount)}
                      </li>
                    ))}
                  </ul>
                }
              />
            )}
          </div>
        )}

        {error !== undefined && (
          <div className="space-y-1" role="alert">
            <p className="text-sm text-danger">{ERROR_MESSAGE}</p>
            <ErrorDetail error={error} />
          </div>
        )}
      </div>
    </Card>
  );
}
