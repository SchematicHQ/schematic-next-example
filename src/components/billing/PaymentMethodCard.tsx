"use client";

import {
  type DerivedPaymentMethods,
  derivePaymentMethods,
  httpStatus,
  usePaymentMethods,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import { useCallback, useMemo, useState } from "react";

import {
  PaymentMethodDialog,
  type PaymentMethodDialogView,
} from "@/components/billing/PaymentMethodDialog";
import { MethodPill } from "@/components/billing/PaymentMethodPill";
import { Badge, Button, Card, LinkButton } from "@/components/ui";

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

/** The heading bar and the pill, so the page does not reflow on arrival. */
const MethodSkeleton = () => (
  <Card aria-busy="true" aria-label="Loading payment methods" role="status">
    <div className="animate-pulse space-y-5">
      <div className="h-5 w-40 rounded-md bg-muted" />
      <div className="flex items-center justify-between gap-4 rounded-full bg-muted px-5 py-2.5">
        <div className="h-4 w-40 rounded bg-border" />
        <div className="h-4 w-10 rounded bg-border" />
      </div>
    </div>
  </Card>
);

const MethodError = ({
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

/** "Expires in 2 months", or "Expired", beside the heading. */
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
 * The company's payment method on file, hand-built on `usePaymentMethods`
 * the way the embed lays it out: one pill naming the default, a warning
 * beside the heading when that card is about to expire, and an Edit that
 * opens a dialog where the other saved methods can be made the default or
 * removed and a new one added through Stripe.
 *
 * The pill offers no Remove. The server refuses to remove the default while
 * others exist and the last method on a subscription, so a Remove here
 * would always fail; removal lives on the other rows in the dialog, where
 * the server's `canRemove` decides which offer it.
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

  // Null while the dialog is closed.
  const [dialog, setDialog] = useState<PaymentMethodDialogView | null>(null);
  const [choosing, setChoosing] = useState(false);
  // The write that last failed, so Try again re-runs it rather than
  // refetching; also whether this dialog session has written at all, which
  // is what decides whether a `mutationError` is its to show.
  const [lastWrite, setLastWrite] = useState<(() => Promise<void>) | null>(
    null,
  );

  const derived = useMemo(() => {
    if (methods !== undefined) {
      return derivePaymentMethods(methods, { locale });
    }
  }, [methods, locale]);

  // A rejected write also lands on `mutationError`, so the rejection here
  // is already reported and only needs catching. A write that lands leaves
  // the dialog on the refreshed method, the other rows folded away.
  const write = useCallback(async (action: () => Promise<void>) => {
    setLastWrite(() => action);
    try {
      await action();
      setDialog("current");
      setChoosing(false);
    } catch {
      // Reported through `mutationError`.
    }
  }, []);

  const makeDefault = useCallback(
    (externalId: string) => write(() => setDefault(externalId)),
    [setDefault, write],
  );

  const open = () => {
    setLastWrite(null);
    setChoosing(false);
    setDialog("current");
  };

  if (derived === undefined) {
    if (error !== undefined) {
      return <MethodError error={error} onRetry={refetch} />;
    }
    if (isPending) {
      return <MethodSkeleton />;
    }
  }

  return (
    <Card>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl">Payment details</h2>
          {derived !== undefined && <ExpiryWarning derived={derived} />}
        </div>

        <MethodPill row={derived?.current ?? null}>
          <LinkButton onClick={open}>
            {derived?.current ? "Edit" : "Add"}
          </LinkButton>
        </MethodPill>

        {derived !== undefined && dialog !== null && (
          <PaymentMethodDialog
            choosing={choosing}
            derived={derived}
            isMutating={isMutating}
            mutationError={lastWrite === null ? undefined : mutationError}
            onChoose={() => setChoosing((was) => !was)}
            onClose={() => setDialog(null)}
            onRemove={(row) => void write(() => remove(row.id))}
            onRetry={
              lastWrite === null ? undefined : () => void write(lastWrite)
            }
            onSetDefault={(row) => void makeDefault(row.externalId)}
            onView={setDialog}
            setDefault={makeDefault}
            view={dialog}
          />
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
