"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { AddPaymentMethod } from "@/components/billing/AddPaymentMethod";
import { Button } from "@/components/ui";

interface AddPaymentMethodDialogProps {
  onClose: () => void;
  /** What the form makes the saved method with. */
  setDefault: (externalId: string) => Promise<void>;
}

/**
 * "Add payment method": the Stripe form in a native `<dialog>` opened with
 * `showModal()`, so the browser owns the focus trap, the backdrop, and
 * Escape. Saving makes the new method the default and closes it; so do
 * Cancel, the close control, and a click on the backdrop, without saving.
 *
 * It is portalled to `<body>`. A closed `<dialog>` is hidden but still a
 * child, so left in the section it would count as the last child and give
 * the Add button above it the stack's bottom margin — the page shifted by
 * that margin the moment the dialog mounted.
 */
export function AddPaymentMethodDialog({
  onClose,
  setDefault,
}: AddPaymentMethodDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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

  return createPortal(
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
          Add payment method
        </h2>
        <Button aria-label="Close" onClick={onClose} size="icon">
          <i
            aria-hidden="true"
            className="schematic-icon schematic-icon--close"
          />
        </Button>
      </div>
      <div className="px-6 py-5">
        <AddPaymentMethod onDone={onClose} setDefault={setDefault} />
      </div>
    </dialog>,
    document.body,
  );
}
