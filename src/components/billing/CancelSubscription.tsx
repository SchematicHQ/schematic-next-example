"use client";

import {
  deriveUnsubscribe,
  useCompany,
  useResolvedLocale,
  useUnsubscribe,
} from "@schematichq/schematic-components/elements";
import { useMemo, useState } from "react";

import { Button, LinkButton } from "@/components/ui";

/**
 * Cancelling at period end, hand-built on `useUnsubscribe` and
 * `deriveUnsubscribe`: a link that asks once before it cancels, inline
 * rather than in a dialog. Gone once the company says it cancels.
 */
export function CancelSubscription() {
  const { data: company } = useCompany();
  const { unsubscribe, isMutating, mutationError } = useUnsubscribe();
  const locale = useResolvedLocale();
  const [confirming, setConfirming] = useState(false);

  const view = useMemo(
    () =>
      company === undefined
        ? undefined
        : deriveUnsubscribe(company, [], { locale }),
    [company, locale],
  );

  if (view === undefined || !view.canUnsubscribe) {
    return null;
  }

  if (!confirming) {
    return (
      <LinkButton tone="danger" onClick={() => setConfirming(true)}>
        Cancel subscription
      </LinkButton>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border p-4" role="group">
      <p className="text-sm">
        Cancel at the end of this period? You keep everything until{" "}
        {view.accessEndsOn}.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={isMutating}
          onClick={() => {
            unsubscribe().then(
              () => setConfirming(false),
              () => {},
            );
          }}
        >
          {isMutating ? "Cancelling…" : "Yes, cancel"}
        </Button>
        <Button disabled={isMutating} onClick={() => setConfirming(false)}>
          Keep my plan
        </Button>
      </div>
      {mutationError !== undefined && (
        <p className="text-sm text-danger" role="alert">
          We couldn&apos;t cancel your subscription. Please try again.
        </p>
      )}
    </div>
  );
}
