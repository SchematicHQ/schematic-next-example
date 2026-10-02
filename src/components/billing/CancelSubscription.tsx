"use client";

import {
  deriveUnsubscribe,
  useCompany,
  useResolvedLocale,
  useUnsubscribe,
} from "@schematichq/schematic-components/elements";
import { type ReactNode, useMemo, useState } from "react";

import { Button, LinkButton } from "@/components/ui";

/**
 * The plan's action row: the host's "Change plan" and, hand-built on
 * `useUnsubscribe` and `deriveUnsubscribe`, "Cancel subscription". Cancel
 * asks once, in place of the row, saying when access ends; the link goes
 * once the company reloads set to cancel.
 */
export function PlanActions({ changePlan }: { changePlan: ReactNode }) {
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
  const canCancel = view?.canUnsubscribe === true;

  if (confirming && view !== undefined) {
    return (
      <div className="space-y-3 border-t border-border pt-4" role="group">
        <p className="text-sm">
          Cancel at the end of this period? You keep everything until{" "}
          {view.accessEndsOn}.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            className="border-danger text-danger hover:bg-danger-soft"
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

  if (!changePlan && !canCancel) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {changePlan}
      {canCancel && (
        <LinkButton tone="danger" onClick={() => setConfirming(true)}>
          Cancel subscription
        </LinkButton>
      )}
    </div>
  );
}
