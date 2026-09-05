"use client";

import {
  deriveInvoiceList,
  type StringKey,
  type Translator,
  useInvoices,
  useResolvedLocale,
  useTranslator,
} from "@schematichq/schematic-components/elements";
import { useMemo, useState } from "react";

import { Badge, type BadgeTone, Button, Card } from "@/components/ui";
import { INVOICE_LIMIT, INVOICE_QUERY, INVOICE_STRINGS } from "@/utils/billing";

const STATUS_TONE: Record<string, BadgeTone> = {
  paid: "success",
  open: "warning",
  draft: "neutral",
  uncollectible: "danger",
  void: "neutral",
};

const STATUS_KEY: Record<string, StringKey> = {
  draft: "invoiceStatusDraft",
  open: "invoiceStatusOpen",
  paid: "invoiceStatusPaid",
  uncollectible: "invoiceStatusUncollectible",
  void: "invoiceStatusVoid",
};

const StatusPill = ({ status, t }: { status: string; t: Translator }) => {
  const key = STATUS_KEY[status] as StringKey | undefined;
  return (
    <Badge className="capitalize" tone={STATUS_TONE[status] ?? "neutral"}>
      {key === undefined ? status : t(key)}
    </Badge>
  );
};

const InvoicesSkeleton = ({ label }: { label: string }) => (
  <Card aria-busy="true" aria-label={label} role="status">
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
  retryText,
}: {
  message: string;
  onRetry: () => void;
  retryText: string;
}) => (
  <Card role="alert">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-danger">{message}</p>
      <Button onClick={onRetry}>{retryText}</Button>
    </div>
  </Card>
);

/** Billing history, hand-built on `useInvoices`. */
export function InvoiceHistory() {
  const {
    data: page,
    error,
    isPending,
    loadMore,
    refetch,
  } = useInvoices(INVOICE_QUERY);

  const locale = useResolvedLocale();
  const t = useTranslator(INVOICE_STRINGS);

  const [expanded, setExpanded] = useState(false);

  const list = useMemo(() => {
    if (page !== undefined) {
      return deriveInvoiceList(page, { locale });
    }
  }, [page, locale]);

  if (list === undefined) {
    if (error !== undefined) {
      return (
        <InvoicesError
          message={error.message}
          onRetry={refetch}
          retryText={t("retry")}
        />
      );
    }
    if (isPending) {
      return <InvoicesSkeleton label={t("invoicesLoading")} />;
    }
  }

  const rows = list?.rows ?? [];
  const count = list?.count ?? 0;
  const canCollapse = rows.length > INVOICE_LIMIT;
  const showingAll = !canCollapse || expanded;
  const visible = showingAll ? rows : rows.slice(0, INVOICE_LIMIT);
  const hasActions = canCollapse || (showingAll && list?.hasMore === true);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl">{t("invoicesHeader")}</h2>
        {rows.length > 0 && (
          <span className="text-sm text-muted-fg">
            {/* The company's invoices, not the rows loaded — the same count,
                through the same strings, as the packaged element renders on
                /account/billing. */}
            {visible.length < count
              ? t("invoicesShowing", { count, shown: visible.length })
              : t("invoicesCount", { count })}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="py-9 text-center text-sm text-muted-fg">
          {t("invoicesEmpty")}
        </p>
      ) : (
        <table className="mt-5 w-full border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th
                className="pb-2.5 text-sm font-medium text-muted-fg"
                scope="col"
              >
                {t("invoicesDateColumn")}
              </th>
              <th
                className="pb-2.5 text-right text-sm font-medium text-muted-fg"
                scope="col"
              >
                {t("invoicesAmountColumn")}
              </th>
              <th
                className="pb-2.5 text-right text-sm font-medium text-muted-fg"
                scope="col"
              >
                {t("invoicesStatusColumn")}
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
                      {row.dateText}
                    </a>
                  )}
                </td>
                <td className="py-3 text-right font-medium tabular-nums">
                  {row.isCredit ? (
                    <span
                      className="cursor-help text-muted-fg"
                      title={t("invoicesCredit")}
                    >
                      ({row.amountText})
                    </span>
                  ) : (
                    row.amountText
                  )}
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  {row.status !== null && (
                    <StatusPill status={row.status} t={t} />
                  )}
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
              {expanded ? t("invoicesSeeLess") : t("invoicesSeeMore")}
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
              {t("invoicesLoadMore")}
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
