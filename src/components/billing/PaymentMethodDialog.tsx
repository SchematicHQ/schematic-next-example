"use client";

import type {
  DerivedPaymentMethods,
  PaymentMethodRow,
} from "@schematichq/schematic-components/elements";
import { useEffect, useId, useRef } from "react";

import { AddPaymentMethod } from "@/components/billing/AddPaymentMethod";
import { MethodName, MethodPill } from "@/components/billing/PaymentMethodPill";
import { Button, LinkButton } from "@/components/ui";

/** What the dialog shows: the method on file, or the form for a new one. */
export type PaymentMethodDialogView = "current" | "add";

interface PaymentMethodDialogProps {
  /** Whether "Choose different payment method" is unfolded. */
  choosing: boolean;
  derived: DerivedPaymentMethods;
  isMutating: boolean;
  /** A write this dialog session made that failed; undefined otherwise. */
  mutationError: Error | undefined;
  onChoose: () => void;
  onClose: () => void;
  onRemove: (row: PaymentMethodRow) => void;
  /** Re-runs the failed write; omitted until one has failed. */
  onRetry?: () => void;
  onSetDefault: (row: PaymentMethodRow) => void;
  onView: (view: PaymentMethodDialogView) => void;
  /** What the form makes the saved method with. */
  setDefault: (externalId: string) => Promise<void>;
  view: PaymentMethodDialogView;
}

const OtherMethodRow = ({
  disabled,
  onRemove,
  onSetDefault,
  row,
}: {
  disabled: boolean;
  onRemove: () => void;
  onSetDefault: () => void;
  row: PaymentMethodRow;
}) => (
  <li
    className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border py-3 last:border-0"
    data-brand={row.brand}
    data-kind={row.kind}
    data-testid="schematic-payment-method"
  >
    <MethodName row={row} />
    {row.expiresShort !== null && (
      <span className="text-sm whitespace-nowrap text-muted-fg tabular-nums">
        Expires {row.expiresShort}
      </span>
    )}
    <LinkButton
      className="whitespace-nowrap"
      disabled={disabled}
      onClick={onSetDefault}
    >
      Set default
    </LinkButton>
    {row.canRemove && (
      <button
        aria-label="Remove"
        className="inline-flex cursor-pointer rounded-full p-1 text-sm leading-none text-muted-fg transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={onRemove}
        type="button"
      >
        <i
          aria-hidden="true"
          className="schematic-icon schematic-icon--close"
        />
      </button>
    )}
  </li>
);

/**
 * "Edit payment details": a native `<dialog>` opened with `showModal()`, so
 * the browser owns the focus trap, the backdrop, and Escape. It shows the
 * pill again, and "Choose different payment method" unfolds the other
 * saved methods with Set default and, where the server allows, a remove
 * control; "Add new payment method" swaps in the Stripe form. With nothing
 * on file it opens straight onto the form, and Cancel closes it.
 */
export function PaymentMethodDialog({
  choosing,
  derived,
  isMutating,
  mutationError,
  onChoose,
  onClose,
  onRemove,
  onRetry,
  onSetDefault,
  onView,
  setDefault,
  view,
}: PaymentMethodDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { current, others, rows } = derived;
  const hasMethods = rows.length > 0;
  const showForm = view === "add" || !hasMethods;

  // No cleanup: the element leaves the document with the component, which
  // takes it out of the top layer without a `close` event. A cleanup that
  // called `close()` would fire one, and under Strict Mode's mount, unmount,
  // mount the resulting `onClose` would shut the dialog it just opened.
  useEffect(() => {
    const element = ref.current;
    if (element !== null && !element.open) {
      element.showModal();
    }
  }, []);

  return (
    <dialog
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-card border border-border bg-card p-0 text-fg shadow-[var(--shadow)] backdrop:bg-black/60"
      onClick={(event) => {
        // The dialog has no padding, so a click on it and not on a child
        // is a click on the backdrop.
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClose={onClose}
      ref={ref}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h2 className="font-heading text-lg font-semibold" id={titleId}>
          Edit payment details
        </h2>
        <Button aria-label="Close" onClick={onClose} size="icon">
          <i
            aria-hidden="true"
            className="schematic-icon schematic-icon--close"
          />
        </Button>
      </div>

      <div className="space-y-5 px-6 py-5">
        {showForm ? (
          <AddPaymentMethod
            onDone={hasMethods ? () => onView("current") : onClose}
            onSelectExisting={hasMethods ? () => onView("current") : undefined}
            setDefault={setDefault}
          />
        ) : (
          <>
            <MethodPill row={current} />
            <LinkButton
              aria-expanded={choosing}
              className="inline-flex items-center gap-2 no-underline hover:underline"
              onClick={onChoose}
            >
              Choose different payment method
              <i
                aria-hidden="true"
                className={`schematic-icon ${choosing ? "schematic-icon--chevron-up" : "schematic-icon--chevron-down"}`}
              />
            </LinkButton>
            {choosing && (
              <>
                {others.length > 0 && (
                  <ul aria-label="Choose different payment method">
                    {others.map((row) => (
                      <OtherMethodRow
                        disabled={isMutating}
                        key={row.id}
                        onRemove={() => onRemove(row)}
                        onSetDefault={() => onSetDefault(row)}
                        row={row}
                      />
                    ))}
                  </ul>
                )}
                <Button
                  className="w-full justify-center"
                  disabled={isMutating}
                  onClick={() => onView("add")}
                >
                  Add new payment method
                </Button>
              </>
            )}
          </>
        )}

        {mutationError !== undefined && (
          <div
            className="flex flex-wrap items-center justify-between gap-4"
            role="alert"
          >
            <p className="text-sm text-danger">{mutationError.message}</p>
            {onRetry !== undefined && (
              <LinkButton disabled={isMutating} onClick={onRetry}>
                Try again
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
