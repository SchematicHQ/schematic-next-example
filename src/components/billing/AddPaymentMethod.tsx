"use client";

import { useSetupIntent } from "@schematichq/schematic-react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type {
  Stripe,
  StripeConstructorOptions,
  StripeElements,
} from "@stripe/stripe-js";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui";

const LOAD_ERROR = "Could not load the payment form.";
const SAVE_ERROR = "Could not save the payment method.";

type FormState =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | { status: "ready"; clientSecret: string; stripe: Stripe };

interface AddPaymentMethodProps {
  /** The form is finished with: saved, or cancelled. */
  onDone: () => void;
  /**
   * Makes the saved method the default. The server never promotes a method
   * on its own, so a form that skipped this would leave the new card idle.
   */
  setDefault: (externalId: string) => Promise<void>;
}

/** A Stripe PaymentElement over a setup intent the API mints for the company. */
export function AddPaymentMethod({
  onDone,
  setDefault,
}: AddPaymentMethodProps) {
  const { create } = useSetupIntent();
  const [state, setState] = useState<FormState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    // Importing @stripe/stripe-js starts loading Stripe.js from Stripe's CDN,
    // so it is imported here rather than at the top: /billing only pays for
    // it once the form opens.
    Promise.all([create(), import("@stripe/stripe-js")])
      .then(async ([intent, { loadStripe }]) => {
        const clientSecret = intent.setupIntentClientSecret;
        if (!clientSecret) {
          throw new Error("The setup intent carries no client secret.");
        }
        // A connected account is reached through Schematic's own key with
        // the account named; a direct account uses its own key.
        let key = intent.publishableKey ?? intent.schematicPublishableKey;
        const options: StripeConstructorOptions = {};
        if (intent.accountId) {
          key = intent.schematicPublishableKey;
          options.stripeAccount = intent.accountId;
        }
        const stripe = await loadStripe(key, options);
        if (stripe === null) {
          throw new Error("Stripe.js did not load.");
        }
        if (!cancelled) {
          setState({ status: "ready", clientSecret, stripe });
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          const message = cause instanceof Error ? cause.message : LOAD_ERROR;
          setState({ status: "failed", message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [create]);

  if (state.status === "loading") {
    return (
      <div
        aria-busy="true"
        aria-label="Loading the payment form"
        className="animate-pulse border-t border-border pt-4"
        role="status"
      >
        <div className="h-12 w-full rounded-md bg-muted" />
      </div>
    );
  }

  if (state.status === "failed") {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4"
        role="alert"
      >
        <p className="text-sm text-danger">{state.message}</p>
        <Button onClick={onDone}>Cancel</Button>
      </div>
    );
  }

  return (
    <Elements
      options={{ clientSecret: state.clientSecret }}
      stripe={state.stripe}
    >
      <Fields onDone={onDone} setDefault={setDefault} />
    </Elements>
  );
}

async function confirm(
  stripe: Stripe,
  elements: StripeElements,
): Promise<{ id: string } | { error: string }> {
  const result = await stripe.confirmSetup({
    elements,
    confirmParams: { return_url: window.location.href },
    // Most methods confirm in place; one that must redirect comes back to
    // this page, where the list loads afresh.
    redirect: "if_required",
  });
  if (result.error !== undefined) {
    return { error: result.error.message ?? SAVE_ERROR };
  }
  const method = result.setupIntent.payment_method;
  const id = typeof method === "string" ? method : method?.id;
  return id ? { id } : { error: SAVE_ERROR };
}

/** Inside `<Elements>`, where Stripe's hooks resolve. */
function Fields({ onDone, setDefault }: AddPaymentMethodProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stripe === null || elements === null || saving) {
      return;
    }
    setSaving(true);
    setMessage(null);
    const outcome = await confirm(stripe, elements).catch(() => ({
      error: SAVE_ERROR,
    }));
    if ("error" in outcome) {
      setMessage(outcome.error);
      setSaving(false);
      return;
    }
    // Stripe has the method from here on. A default that fails to take is
    // the list's to report and retry, so the form closes either way.
    await setDefault(outcome.id).catch(() => {});
    onDone();
  };

  return (
    <form
      className="space-y-4 border-t border-border pt-4"
      onSubmit={(event) => void submit(event)}
    >
      <PaymentElement />
      {message !== null && (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button
          disabled={stripe === null || elements === null || saving}
          type="submit"
        >
          Save
        </Button>
        <Button disabled={saving} onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
