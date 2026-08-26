"use client";

import { useMemo, useState } from "react";
import {
  deriveInvoiceList,
  resolveLocale,
  useInvoices,
  SchematicStyles,
  StatusFrame,
} from "@schematichq/schematic-components/v3";

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

  const locale = resolveLocale();

  const [expanded, setExpanded] = useState(false);

  const list = useMemo(() => {
    if (page !== undefined) {
      return deriveInvoiceList(page, { locale });
    }
  }, [page, locale]);

  const rows = list?.rows ?? [];
  const canCollapse = rows.length > limit;
  const showingAll = !canCollapse || expanded;
  const visible = showingAll ? rows : rows.slice(0, limit);

  return (
    <StatusFrame
      className="schematic-card schematic-invoices"
      error={error}
      hasData={list !== undefined}
      isPending={isPending}
      label="invoices"
      onRetry={refetch}
    >
      {list !== undefined && (
        <>
          <div className="schematic-header">
            <h2>Invoices</h2>
          </div>

          {rows.length === 0 ? (
            <p className="schematic-muted schematic-invoices__empty">
              No invoices yet
            </p>
          ) : (
            <table className="schematic-invoices__table">
              <thead className="schematic-visually-hidden">
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id} data-testid="sch-invoice">
                    <td className="schematic-invoices__date">
                      {row.url === null ? (
                        <span>{row.dateText}</span>
                      ) : (
                        <a href={row.url} rel="noreferrer" target="_blank">
                          {row.dateText}
                        </a>
                      )}
                    </td>
                    <td className="schematic-invoices__amount">
                      {row.isCredit ? (
                        <span
                          className="schematic-invoices__credit"
                          title="Credit applied to your account"
                        >
                          ({row.amountText})
                        </span>
                      ) : (
                        row.amountText
                      )}
                    </td>
                    <td className="schematic-invoices__status">
                      {row.status !== null && (
                        <span className="schematic-chip">{row.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(canCollapse || (showingAll && list.hasMore)) && (
            <div className="schematic-invoices__actions">
              {canCollapse && (
                <button
                  className="schematic-link-button"
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? "See less" : "See more"}
                </button>
              )}
              {showingAll && list.hasMore && (
                <button
                  className="schematic-link-button"
                  type="button"
                  onClick={loadMore}
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </>
      )}
    </StatusFrame>
  );
}

export default function InvoicesPage() {
  return (
    <main>
      <SchematicStyles />
      <div style={{ margin: "2rem auto", maxWidth: "480px" }}>
        <InvoiceHistory />
      </div>
    </main>
  );
}
