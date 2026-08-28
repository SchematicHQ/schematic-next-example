"use client";

import { useMemo, useState } from "react";
import {
  deriveInvoiceList,
  resolveLocale,
  useInvoices,
  useSchematicLocale,
} from "@schematichq/schematic-components/v3";

// The page owns its markup rather than rendering <Invoices />, so it styles
// itself with the app's Tailwind instead of the library's injected CSS. Only
// the data seam below comes from the v3 package.
const CARD = "rounded-lg border border-gray-200 bg-white p-6";
const BUTTON =
  "rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const STATUS_STYLE: Record<string, string> = {
  paid: "border-green-200 bg-green-50 text-green-700",
  open: "border-amber-200 bg-amber-50 text-amber-700",
  draft: "border-gray-200 bg-gray-50 text-gray-600",
  uncollectible: "border-red-200 bg-red-50 text-red-700",
  void: "border-gray-200 bg-gray-50 text-gray-600",
};

const StatusPill = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize ${
      STATUS_STYLE[status] ?? STATUS_STYLE.draft
    }`}
  >
    {status}
  </span>
);

const InvoicesSkeleton = () => (
  <div aria-busy="true" aria-label="Loading invoices" className={CARD}>
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-32 rounded-md bg-gray-100" />
      <div className="space-y-3 pt-2">
        {[0, 1, 2, 3].map((row) => (
          <div className="flex items-center justify-between gap-4" key={row}>
            <div className="h-4 w-28 rounded bg-gray-100" />
            <div className="h-4 w-16 rounded bg-gray-100" />
            <div className="h-5 w-16 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const InvoicesError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className={CARD} role="alert">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-red-600">{message}</p>
      <button className={BUTTON} type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  </div>
);

interface InvoiceHistoryProps {
  includePending?: boolean;
  limit?: number;
}

function InvoiceHistory({
  includePending = true,
  limit = 10,
}: InvoiceHistoryProps) {
  const {
    data: page,
    error,
    isPending,
    loadMore,
    refetch,
  } = useInvoices({ includePending });

  const locale = resolveLocale(useSchematicLocale());

  const [expanded, setExpanded] = useState(false);

  const list = useMemo(() => {
    if (page !== undefined) {
      return deriveInvoiceList(page, { locale });
    }
  }, [page, locale]);

  // A failed refetch keeps the last good data on screen; only a failure with
  // nothing to show replaces the card.
  if (list === undefined) {
    if (error !== undefined) {
      return <InvoicesError message={error.message} onRetry={refetch} />;
    }
    if (isPending) {
      return <InvoicesSkeleton />;
    }
  }

  const rows = list?.rows ?? [];
  const canCollapse = rows.length > limit;
  const showingAll = !canCollapse || expanded;
  const visible = showingAll ? rows : rows.slice(0, limit);
  const hasActions = canCollapse || (showingAll && list?.hasMore === true);

  return (
    <div className={CARD}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold">Billing history</h2>
        {rows.length > 0 && (
          <span className="text-sm text-gray-500">
            {rows.length} {rows.length === 1 ? "invoice" : "invoices"}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="py-9 text-center text-sm text-gray-500">
          No invoices yet
        </p>
      ) : (
        <table className="mt-5 w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th
                className="pb-2.5 text-sm font-medium text-gray-500"
                scope="col"
              >
                Date
              </th>
              <th
                className="pb-2.5 text-right text-sm font-medium text-gray-500"
                scope="col"
              >
                Amount
              </th>
              <th
                className="pb-2.5 text-right text-sm font-medium text-gray-500"
                scope="col"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                className="border-b border-gray-200 last:border-0"
                data-testid="sch-invoice"
                key={row.id}
              >
                <td className="py-3 pr-4">
                  {row.url === null ? (
                    <span>{row.dateText}</span>
                  ) : (
                    <a
                      className="transition-colors hover:text-blue-600"
                      href={row.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {row.dateText}
                    </a>
                  )}
                </td>
                <td className="py-3 pr-4 text-right font-medium tabular-nums">
                  {row.isCredit ? (
                    <span
                      className="text-gray-500"
                      title="Credit applied to your account"
                    >
                      ({row.amountText})
                    </span>
                  ) : (
                    row.amountText
                  )}
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  {row.status !== null && <StatusPill status={row.status} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {hasActions && (
        <div className="mt-5 flex items-center gap-3">
          {canCollapse && (
            <button
              className={BUTTON}
              type="button"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Show less" : `Show all ${rows.length}`}
            </button>
          )}
          {showingAll && list?.hasMore === true && (
            <button
              className={BUTTON}
              disabled={isPending}
              type="button"
              onClick={loadMore}
            >
              {isPending ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}

      {error !== undefined && (
        <p className="mt-5 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <InvoiceHistory />
    </div>
  );
}
