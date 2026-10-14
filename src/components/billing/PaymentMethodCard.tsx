"use client";

import {
  type DerivedPaymentMethods,
  derivePaymentMethods,
  httpStatus,
  type PaymentMethodRow,
  usePaymentMethods,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import { useCallback, useMemo, useState } from "react";

import { AddPaymentMethodDialog } from "@/components/billing/AddPaymentMethodDialog";
import { MethodName } from "@/components/billing/PaymentMethodName";
import { Badge, Button, LinkButton, PanelSection } from "@/components/ui";

const SECTION = {
  title: "Payment details",
};

const ERROR_MESSAGE = "There was a problem retrieving your payment methods.";
// A 404 with nothing to show is the account not being on the flag that
// serves company reads; an empty list is a 200 with no rows.
const UNAVAILABLE_MESSAGE =
  "Payment methods are not available for this account.";

/**
 * The fixed copy above hides what actually failed. In development the
 * error's own message shows beneath it, so a mis-wired provider or a
 * refused request can be read off the page rather than dug out of the hook.
 */
const ErrorDetail = ({ error }: { error: Error }) =>
  process.env.NODE_ENV === "development" ? (
    <p className="text-xs text-muted-fg">{error.message}</p>
  ) : null;

const LIST = "divide-y divide-border rounded-card border border-border";

/** A row's shape, so the section does not reflow on arrival. */
const MethodSkeleton = () => (
  <PanelSection {...SECTION}>
    <div
      aria-busy="true"
      aria-label="Loading payment methods"
      className={`${LIST} animate-pulse`}
      role="status"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3.5">
        <div className="h-4 w-44 rounded bg-muted" />
        <div className="h-4 w-14 rounded bg-muted" />
      </div>
    </div>
  </PanelSection>
);

const MethodError = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => (
  <PanelSection {...SECTION}>
    <div
      className="flex flex-wrap items-center justify-between gap-4"
      role="alert"
    >
      <div className="space-y-1">
        <p className="text-sm text-danger">
          {httpStatus(error) === 404 ? UNAVAILABLE_MESSAGE : ERROR_MESSAGE}
        </p>
        <ErrorDetail error={error} />
      </div>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  </PanelSection>
);

/** "Expires in 2 months", or "Expired", beside the section heading. */
const ExpiryWarning = ({ derived }: { derived: DerivedPaymentMethods }) => {
  if (derived.expiryWarning === "none") {
    return null;
  }
  if (derived.expiryWarning === "expired") {
    return (
      <Badge data-expiry="expired" tone="danger">
        Expired
      </Badge>
    );
  }
  const months = derived.monthsToExpiration ?? 0;
  return (
    <Badge data-expiry="soon" tone="warning">
      Expires in {months} {months === 1 ? "month" : "months"}
    </Badge>
  );
};

/**
 * One saved method: its name, a Default badge on the one billed, when a
 * card expires, and its actions. Remove asks once more in place before it
 * writes, since it cannot be undone from here.
 */
const MethodRow = ({
  confirming,
  disabled,
  onCancelRemove,
  onConfirmRemove,
  onRemove,
  onSetDefault,
  row,
}: {
  confirming: boolean;
  disabled: boolean;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
  onRemove: () => void;
  onSetDefault: () => void;
  row: PaymentMethodRow;
}) => (
  <li
    className="flex items-center gap-4 px-4 py-3"
    data-brand={row.brand}
    data-kind={row.kind}
    data-testid="schematic-payment-method"
  >
    {/* The card's details, however many lines, on the left; the Default
        badge and the actions centred against all of them on the right. */}
    <div className="min-w-0 grow space-y-0.5">
      <div className="flex">
        <MethodName row={row} />
      </div>
      {row.expiresShort !== null && (
        <p className="text-sm text-muted-fg tabular-nums">
          Expires {row.expiresShort}
        </p>
      )}
    </div>
    <div className="flex shrink-0 items-center self-center">
      {confirming ? (
        <div className="flex items-center gap-3">
          <span className="text-sm">Remove this method?</span>
          <LinkButton
            disabled={disabled}
            onClick={onConfirmRemove}
            tone="danger"
          >
            Remove
          </LinkButton>
          <LinkButton disabled={disabled} onClick={onCancelRemove}>
            Cancel
          </LinkButton>
        </div>
      ) : (
        // Set default reads as a link; Remove is a different shape in a
        // different place — a faint × closing the row, red once pointed at —
        // so the two are never mistaken for one another.
        <div className="flex items-center gap-4">
          {row.isDefault ? (
            <Badge tone="success">Default</Badge>
          ) : (
            <LinkButton disabled={disabled} onClick={onSetDefault}>
              Set default
            </LinkButton>
          )}
          {row.canRemove && (
            <button
              aria-label="Remove"
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-lg leading-none text-muted-fg/60 transition-colors duration-150 hover:text-danger focus-visible:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted-fg/60"
              disabled={disabled}
              onClick={onRemove}
              title="Remove"
              type="button"
            >
              <i
                aria-hidden="true"
                className="schematic-icon schematic-icon--close"
              />
            </button>
          )}
        </div>
      )}
    </div>
  </li>
);

/**
 * The company's payment methods, hand-built on `usePaymentMethods` as one
 * list: the default first with its badge, every other method after it, and
 * each task a click away — Set default and Remove on the row, "Add payment
 * method" under the list opening the Stripe form in a dialog. A warning
 * sits beside the heading when the default card is about to expire.
 *
 * Remove shows only where the server's `canRemove` allows it. A method the
 * form saves becomes the default.
 */
export function PaymentMethodCard() {
  const {
    data: methods,
    error,
    isMutating,
    isPending,
    mutationError,
    refetch,
    remove,
    setDefault,
  } = usePaymentMethods();

  const locale = useResolvedLocale();

  const [adding, setAdding] = useState(false);
  // The row whose Remove is waiting on its confirmation.
  const [confirming, setConfirming] = useState<string | null>(null);
  // The write that last failed, so Try again re-runs it rather than
  // refetching; also whether anything has been written yet, which is what
  // decides whether a `mutationError` is this section's to show.
  const [lastWrite, setLastWrite] = useState<(() => Promise<void>) | null>(
    null,
  );

  const derived = useMemo(() => {
    if (methods !== undefined) {
      return derivePaymentMethods(methods, { locale });
    }
  }, [methods, locale]);

  // A rejected write also lands on `mutationError`, so the rejection here
  // is already reported and only needs catching.
  const write = useCallback(async (action: () => Promise<void>) => {
    setLastWrite(() => action);
    try {
      await action();
    } catch {
      // Reported through `mutationError`.
    }
  }, []);

  const makeDefault = useCallback(
    (externalId: string) => write(() => setDefault(externalId)),
    [setDefault, write],
  );

  if (derived === undefined) {
    if (error !== undefined) {
      return <MethodError error={error} onRetry={refetch} />;
    }
    if (isPending) {
      return <MethodSkeleton />;
    }
  }

  // The default leads; the rest keep the server's order.
  const rows =
    derived === undefined
      ? []
      : derived.current === null
        ? derived.rows
        : [derived.current, ...derived.others];

  return (
    <PanelSection
      {...SECTION}
      aside={derived !== undefined && <ExpiryWarning derived={derived} />}
    >
      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-fg">No payment method added yet</p>
        ) : (
          <ul aria-label="Payment methods" className={LIST}>
            {rows.map((row) => (
              <MethodRow
                confirming={confirming === row.id}
                disabled={isMutating}
                key={row.id}
                onCancelRemove={() => setConfirming(null)}
                onConfirmRemove={() => {
                  setConfirming(null);
                  void write(() => remove(row.id));
                }}
                onRemove={() => setConfirming(row.id)}
                onSetDefault={() => void makeDefault(row.externalId)}
                row={row}
              />
            ))}
          </ul>
        )}

        {lastWrite !== null && mutationError !== undefined && (
          <div
            className="flex flex-wrap items-center justify-between gap-4"
            role="alert"
          >
            <p className="text-sm text-danger">{mutationError.message}</p>
            <LinkButton
              disabled={isMutating}
              onClick={() => void write(lastWrite)}
            >
              Try again
            </LinkButton>
          </div>
        )}

        <Button disabled={isMutating} onClick={() => setAdding(true)}>
          + Add payment method
        </Button>

        {adding && (
          <AddPaymentMethodDialog
            onClose={() => setAdding(false)}
            setDefault={makeDefault}
          />
        )}

        {error !== undefined && (
          <div className="space-y-1" role="alert">
            <p className="text-sm text-danger">{ERROR_MESSAGE}</p>
            <ErrorDetail error={error} />
          </div>
        )}
      </div>
    </PanelSection>
  );
}
