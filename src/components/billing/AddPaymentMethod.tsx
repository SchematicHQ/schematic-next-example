"use client";

import { useResolvedLocale } from "@schematichq/schematic-components/elements";
import { useSetupIntent } from "@schematichq/schematic-react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type {
  Appearance,
  Stripe,
  StripeConstructorOptions,
  StripeElementLocale,
  StripeElements,
} from "@stripe/stripe-js";
import { type FormEvent, useEffect, useState } from "react";

import { Button, LinkButton } from "@/components/ui";

const LOAD_ERROR = "Could not load the payment form.";
const SAVE_ERROR = "Could not save the payment method.";

type FormState =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | {
      status: "ready";
      appearance: Appearance;
      clientSecret: string;
      stripe: Stripe;
    };

interface AddPaymentMethodProps {
  /** The form is finished with: saved, or cancelled. */
  onDone: () => void;
  /**
   * Makes the saved method the default. The server never promotes a method
   * on its own, so a form that skipped this would leave the new card idle.
   */
  setDefault: (externalId: string) => Promise<void>;
}

/**
 * Stripe's fields render in an iframe, where the app's CSS reaches nothing,
 * so the palette from `globals.css` is read off the document and handed
 * over as values. The custom properties hold literal colours, so they come
 * back as written; the font is read resolved off the body, since `--body`
 * names a `var()` the iframe could not follow. A dark theme gets Stripe's
 * night theme under the same colours, so its own chrome reads too.
 */
function resolveAppearance(): Appearance {
  const root = document.documentElement;
  const palette = getComputedStyle(root);
  const read = (name: string) => palette.getPropertyValue(name).trim();
  return {
    theme: root.classList.contains("dark") ? "night" : "stripe",
    variables: {
      borderRadius: read("--r"),
      colorBackground: read("--card"),
      colorDanger: read("--danger"),
      colorPrimary: read("--accent"),
      colorText: read("--fg"),
      colorTextSecondary: read("--muted-fg"),
      fontFamily: getComputedStyle(document.body).fontFamily,
    },
  };
}

/** A Stripe PaymentElement over a setup intent the API mints for the company. */
export function AddPaymentMethod({
  onDone,
  setDefault,
}: AddPaymentMethodProps) {
  const { create } = useSetupIntent();
  const locale = useResolvedLocale();
  const [state, setState] = useState<FormState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    // Importing @stripe/stripe-js starts loading Stripe.js from Stripe's CDN,
    // so it is imported here rather than at the top: /account/portal only pays
    // for it once the form opens.
    Promise.all([create(), import("@stripe/stripe-js")])
      .then(async ([intent, { loadStripe }]) => {
        const clientSecret = intent.setupIntentClientSecret;
        if (!clientSecret) {
          throw new Error("The setup intent carries no client secret.");
        }
        // A connected account is reached through Schematic's own key with
        // the account named; a direct account uses its own key.
        let key = intent.publishableKey ?? intent.schematicPublishableKey;
        const options: StripeConstructorOptions = {
          locale: locale as StripeElementLocale,
        };
        if (intent.accountId) {
          key = intent.schematicPublishableKey;
          options.stripeAccount = intent.accountId;
        }
        const stripe = await loadStripe(key, options);
        if (stripe === null) {
          throw new Error("Stripe.js did not load.");
        }
        if (!cancelled) {
          setState({
            status: "ready",
            appearance: resolveAppearance(),
            clientSecret,
            stripe,
          });
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
    // `create` is memoized by the hook; a new locale is a new Stripe load.
  }, [create, locale]);

  if (state.status === "loading") {
    return (
      <div
        aria-busy="true"
        aria-label="Loading the payment form"
        className="animate-pulse"
        role="status"
      >
        <div className="h-12 w-full rounded-md bg-muted" />
      </div>
    );
  }

  if (state.status === "failed") {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-4"
        role="alert"
      >
        <p className="text-sm text-danger">{state.message}</p>
        <LinkButton onClick={onDone}>Cancel</LinkButton>
      </div>
    );
  }

  return (
    <Elements
      options={{
        appearance: state.appearance,
        clientSecret: state.clientSecret,
      }}
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
    <form className="space-y-4" onSubmit={(event) => void submit(event)}>
      <PaymentElement />
      {message !== null && (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Button
          disabled={stripe === null || elements === null || saving}
          type="submit"
        >
          Save payment method
        </Button>
        <LinkButton disabled={saving} onClick={onDone}>
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
