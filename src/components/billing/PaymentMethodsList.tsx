"use client";

import {
  derivePaymentMethods,
  httpStatus,
  type PaymentMethodRow,
  usePaymentMethods,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import { useCallback, useMemo, useState } from "react";

import { AddPaymentMethod } from "@/components/billing/AddPaymentMethod";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/utils/cn";

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

const MethodsSkeleton = () => (
  <Card aria-busy="true" aria-label="Loading payment methods" role="status">
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-40 rounded-md bg-muted" />
      <div className="space-y-3 pt-2">
        {[0, 1].map((row) => (
          <div className="flex items-center justify-between gap-4" key={row}>
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const MethodsError = ({
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

const EXPIRY_TONE: Record<PaymentMethodRow["expiry"], string> = {
  ok: "text-muted-fg",
  soon: "text-amber-ink",
  expired: "text-danger",
  none: "",
};

/** "Expires 08/2027", "Expires soon 08/2027", or "Expired 08/2025". */
function expiryText(row: PaymentMethodRow): string {
  switch (row.expiry) {
    case "expired":
      return `Expired ${row.expiresText}`;
    case "soon":
      return `Expires soon ${row.expiresText}`;
    default:
      return `Expires ${row.expiresText}`;
  }
}

const MethodRow = ({
  disabled,
  onMakeDefault,
  onRemove,
  row,
}: {
  disabled: boolean;
  onMakeDefault: () => void;
  onRemove: () => void;
  row: PaymentMethodRow;
}) => (
  <li
    className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border py-3 last:border-0"
    data-testid="schematic-payment-method"
  >
    <span className="inline-flex grow flex-wrap items-center gap-2">
      <span className="font-medium">{row.label}</span>
      {row.last4 !== null && (
        <span className="tabular-nums">···· {row.last4}</span>
      )}
      {row.isDefault && <Badge>Default</Badge>}
    </span>
    {row.expiry !== "none" && (
      <span
        className={cn(
          "text-sm whitespace-nowrap tabular-nums",
          EXPIRY_TONE[row.expiry],
        )}
      >
        {expiryText(row)}
      </span>
    )}
    {(!row.isDefault || row.canRemove) && (
      <span className="inline-flex items-center gap-2">
        {!row.isDefault && (
          <Button disabled={disabled} onClick={onMakeDefault}>
            Make default
          </Button>
        )}
        {row.canRemove && (
          <Button disabled={disabled} onClick={onRemove}>
            Remove
          </Button>
        )}
      </span>
    )}
  </li>
);

/**
 * The company's saved payment methods, hand-built on `usePaymentMethods`.
 * Which rows can go is the server's call, carried on `canRemove`: the
 * default stays while others exist, and the last method stays on an active
 * subscription. Nothing is promoted, so a list with no default shows no
 * badge until someone picks one.
 */
export function PaymentMethodsList() {
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
  // The write that last failed, so Try again re-runs it rather than refetching.
  const [lastWrite, setLastWrite] = useState<(() => Promise<void>) | null>(
    null,
  );

  const rows = useMemo(() => {
    if (methods !== undefined) {
      return derivePaymentMethods(methods, { locale });
    }
  }, [methods, locale]);

  // A rejected write also lands on `mutationError`, so the rejection here
  // is already reported and only needs catching.
  const write = useCallback((action: () => Promise<void>): Promise<void> => {
    setLastWrite(() => action);
    return action().catch(() => {});
  }, []);

  const makeDefault = useCallback(
    (externalId: string) => write(() => setDefault(externalId)),
    [setDefault, write],
  );

  if (rows === undefined) {
    if (error !== undefined) {
      return <MethodsError error={error} onRetry={refetch} />;
    }
    if (isPending) {
      return <MethodsSkeleton />;
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl">Payment methods</h2>
        <Button disabled={adding} onClick={() => setAdding(true)}>
          Add
        </Button>
      </div>

      {rows === undefined || rows.length === 0 ? (
        <p className="py-9 text-center text-sm text-muted-fg">
          No payment method on file
        </p>
      ) : (
        <ul className="mt-5">
          {rows.map((row) => (
            <MethodRow
              disabled={isMutating}
              key={row.id}
              onMakeDefault={() => void makeDefault(row.externalId)}
              onRemove={() => void write(() => remove(row.id))}
              row={row}
            />
          ))}
        </ul>
      )}

      {adding && (
        <div className="mt-5">
          <AddPaymentMethod
            onDone={() => setAdding(false)}
            setDefault={makeDefault}
          />
        </div>
      )}

      {mutationError !== undefined && (
        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-4"
          role="alert"
        >
          <p className="text-sm text-danger">{mutationError.message}</p>
          {lastWrite !== null && (
            <Button disabled={isMutating} onClick={() => void write(lastWrite)}>
              Try again
            </Button>
          )}
        </div>
      )}

      {error !== undefined && (
        <div className="mt-5 space-y-1" role="alert">
          <p className="text-sm text-danger">{ERROR_MESSAGE}</p>
          <ErrorDetail error={error} />
        </div>
      )}
    </Card>
  );
}
