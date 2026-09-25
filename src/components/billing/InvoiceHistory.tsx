"use client";

import {
  deriveInvoiceList,
  plural,
  useInvoices,
  useResolvedLocale,
} from "@schematichq/schematic-components/elements";
import { useMemo, useState } from "react";

import { Badge, type BadgeTone, Button, PanelSection } from "@/components/ui";
import { INVOICE_LIMIT, INVOICE_QUERY } from "@/utils/billing";

const SECTION = {
  title: "Billing history",
};

const ERROR_MESSAGE = "There was a problem retrieving your invoices.";

/**
 * The fixed copy above hides what actually failed. In development the
 * error's own message shows beneath it, so a mis-wired provider or a 404
 * can be read off the page rather than dug out of the hook.
 */
const ErrorDetail = ({ error }: { error: Error }) =>
  process.env.NODE_ENV === "development" ? (
    <p className="text-xs text-muted-fg">{error.message}</p>
  ) : null;

function countCopy(locale: string, count: number, shown: number): string {
  const noun = plural(locale, count, { one: "invoice", other: "invoices" });
  return shown < count ? `${shown} of ${count} ${noun}` : `${count} ${noun}`;
}

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
  <PanelSection {...SECTION}>
    <div
      aria-busy="true"
      aria-label="Loading invoices"
      className="animate-pulse space-y-3"
      role="status"
    >
      {[0, 1, 2, 3].map((row) => (
        <div className="flex items-center justify-between gap-4" key={row}>
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  </PanelSection>
);

const InvoicesError = ({
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
        <p className="text-sm text-danger">{ERROR_MESSAGE}</p>
        <ErrorDetail error={error} />
      </div>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  </PanelSection>
);

export function InvoiceHistory() {
  const {
    data: page,
    error,
    isPending,
    loadMore,
    refetch,
  } = useInvoices(INVOICE_QUERY);

  const locale = useResolvedLocale();

  const [expanded, setExpanded] = useState(false);

  const list = useMemo(() => {
    if (page !== undefined) {
      return deriveInvoiceList(page, { locale });
    }
  }, [page, locale]);

  if (list === undefined) {
    if (error !== undefined) {
      return <InvoicesError error={error} onRetry={refetch} />;
    }
    if (isPending) {
      return <InvoicesSkeleton />;
    }
  }

  const rows = list?.rows ?? [];
  const count = list?.count ?? 0;
  const canCollapse = rows.length > INVOICE_LIMIT;
  const showingAll = !canCollapse || expanded;
  const visible = showingAll ? rows : rows.slice(0, INVOICE_LIMIT);
  const hasActions = canCollapse || (showingAll && list?.hasMore === true);

  return (
    <PanelSection
      {...SECTION}
      aside={
        rows.length > 0 && (
          <span className="text-sm text-muted-fg">
            {countCopy(locale, count, visible.length)}
          </span>
        )
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-fg">No invoices created yet</p>
      ) : (
        <table className="w-full border-collapse">
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
                data-testid="schematic-invoice"
                key={row.id}
              >
                <td className="py-3">
                  {row.url === null ? (
                    <span>{row.dateText}</span>
                  ) : (
                    <a
                      className="text-fg transition-colors duration-150 hover:text-accent"
                      href={row.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {row.dateText === "" ? "View invoice" : row.dateText}
                    </a>
                  )}
                </td>
                <td className="py-3 text-right font-medium tabular-nums">
                  {row.isCredit ? (
                    <span
                      className="cursor-help text-muted-fg"
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
        <div className="flex items-center gap-3">
          {canCollapse && (
            <Button onClick={() => setExpanded((value) => !value)}>
              {expanded ? "See less" : "See more"}
            </Button>
          )}
          {showingAll && list?.hasMore === true && (
            <Button
              disabled={isPending}
              onClick={() => {
                setExpanded(true);
                void loadMore();
              }}
            >
              Load more
            </Button>
          )}
        </div>
      )}

      {error !== undefined && (
        <div className="space-y-1" role="alert">
          <p className="text-sm text-danger">{ERROR_MESSAGE}</p>
          <ErrorDetail error={error} />
        </div>
      )}
    </PanelSection>
  );
}
