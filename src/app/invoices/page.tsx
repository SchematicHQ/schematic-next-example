"use client";

import { useMemo, useState } from "react";

import {
  deriveInvoiceList,
  resolveLocale,
  useInvoices,
  useSchematicLocale,
} from "@schematichq/schematic-components/v3";

import { Badge, type BadgeTone, Button, Card } from "@/components/ui";

const STATUS_TONE: Record<string, BadgeTone> = {
  paid: "success",
  open: "warning",
  draft: "neutral",
  uncollectible: "danger",
  void: "neutral",
};

const StatusPill = ({ status }: { status: string }) => (
  <Badge className="capitalize" tone={STATUS_TONE[status] ?? "neutral"}>
    {status}
  </Badge>
);

const InvoicesSkeleton = () => (
  <Card aria-busy="true" aria-label="Loading invoices">
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-32 rounded-md bg-muted" />
      <div className="space-y-3 pt-2">
        {[0, 1, 2, 3].map((row) => (
          <div className="flex items-center justify-between gap-4" key={row}>
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const InvoicesError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <Card role="alert">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-danger">{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  </Card>
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
    <Card>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl">Billing history</h2>
        {rows.length > 0 && (
          <span className="text-sm text-muted-fg">
            {rows.length} {rows.length === 1 ? "invoice" : "invoices"}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="py-9 text-center text-sm text-muted-fg">
          No invoices yet
        </p>
      ) : (
        <table className="mt-5 w-full border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th
                className="pb-2.5 text-sm font-medium text-muted-fg"
                scope="col"
              >
                Date
              </th>
              <th
                className="pb-2.5 text-right text-sm font-medium text-muted-fg"
                scope="col"
              >
                Amount
              </th>
              <th
                className="pb-2.5 text-right text-sm font-medium text-muted-fg"
                scope="col"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                className="border-b border-border last:border-0"
                data-testid="sch-invoice"
                key={row.id}
              >
                <td className="py-3 pr-4">
                  {row.url === null ? (
                    <span>{row.dateText}</span>
                  ) : (
                    <a
                      className="text-fg transition-colors duration-150 hover:text-accent"
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
                      className="text-muted-fg"
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
            <Button onClick={() => setExpanded((value) => !value)}>
              {expanded ? "Show less" : `Show all ${rows.length}`}
            </Button>
          )}
          {showingAll && list?.hasMore === true && (
            <Button disabled={isPending} onClick={loadMore}>
              {isPending ? "Loading…" : "Load more"}
            </Button>
          )}
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

export default function InvoicesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1>Invoices</h1>
        <p className="mt-1 text-muted-fg">Billing history for your account.</p>
      </header>
      <InvoiceHistory />
    </div>
  );
}
