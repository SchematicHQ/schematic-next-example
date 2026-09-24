import type {
  PaymentMethodLabelKey,
  PaymentMethodRow,
} from "@schematichq/schematic-components/elements";
import type { ReactNode } from "react";

/**
 * The words a row's label can ask for. `derivePaymentMethods` hands back a
 * key rather than the text so the copy stays the host's; the packaged
 * element resolves the same keys through its translator.
 */
const LABELS: Record<PaymentMethodLabelKey, string> = {
  paymentMethodsCardEndingIn: "Card ending in",
  paymentMethodsApplePayEndingIn: "Apple Pay ending in",
  paymentMethodsGooglePayEndingIn: "Google Pay ending in",
  paymentMethodsBankAccount: "Bank account",
  paymentMethodsGeneric: "Payment method",
};

/**
 * "Card ending in 4444": the brand's mark, the label, and the digits that
 * follow it. The mark is `row.icon` from the schematic-icons font, which
 * `<SchematicStyles />` in the root layout already loads; it is decorative,
 * since the label names the method.
 */
export const MethodName = ({ row }: { row: PaymentMethodRow }) => (
  <span
    className="inline-flex grow flex-wrap items-center gap-x-1"
    data-brand={row.brand}
    data-kind={row.kind}
  >
    <i
      aria-hidden="true"
      className={`schematic-icon schematic-icon--${row.icon} mr-0.5 shrink-0 text-xl text-muted-fg`}
    />
    <span className="font-medium">
      {row.label.key === undefined ? row.label.text : LABELS[row.label.key]}
    </span>
    {row.last4 !== null && <span className="tabular-nums">{row.last4}</span>}
  </span>
);

/**
 * The pill: the method on file, or the empty copy, with whatever action the
 * caller puts beside it. The card shows it with Edit; the dialog without.
 */
export const MethodPill = ({
  children,
  row,
}: {
  children?: ReactNode;
  row: PaymentMethodRow | null;
}) => (
  <div
    className="flex items-center justify-between gap-4 rounded-full bg-muted px-5 py-2.5"
    data-testid="schematic-payment-method-current"
  >
    {row === null ? (
      <span className="grow text-sm text-muted-fg">
        No payment method added yet
      </span>
    ) : (
      <MethodName row={row} />
    )}
    {children}
  </div>
);
