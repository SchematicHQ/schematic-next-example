"use client";

import {
  CheckoutDialog,
  EmbedProvider,
  useEmbed,
} from "@schematichq/schematic-components";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import useEmbedSettings from "@/hooks/useEmbedSettings";

// The plan this button drops the customer straight into checkout for.
const PLAN_ID = "plan_LF8sduVDqib";

function CheckoutButton({
  error,
  isLoading,
  onClick,
}: {
  error?: Error;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        error
          ? `group appearance-none text-lg font-sans font-medium leading-none flex justify-center items-center w-fit px-6 py-4 rounded-lg text-black bg-red-500 border-transparent duration-100 hover:bg-red-400 hover:cursor-pointer`
          : `group appearance-none text-lg font-sans font-medium leading-none flex justify-center items-center w-fit px-6 py-4 rounded-lg text-black bg-cyan-500 border-transparent duration-100 hover:bg-cyan-400 hover:cursor-pointer`
      }
      onClick={onClick}
    >
      <div
        className={
          isLoading
            ? `w-4 h-4 mr-2 rounded-full border border-cyan-300 border-t-cyan-700 duration-100 animate-spin group-hover:border-cyan-200 group-hover:border-t-cyan-600`
            : `w-0 h-0 mr-0 rounded-full border-0 border-cyan-300 border-t-cyan-700 duration-100 animate-spin group-hover:border-cyan-200 group-hover:border-t-cyan-600`
        }
      />
      {error && (
        <div className="text-xs font-sans font-black flex justify-center items-center w-4 h-4 mr-2 rounded-full text-red-500 bg-black">
          !
        </div>
      )}
      Checkout
      {error && (
        <span className="sr-only">Checkout failed: {error.message}</span>
      )}
    </button>
  );
}

function Checkout() {
  const { hydrate, initializeWithPlan, layout, setAccessToken, stale } =
    useEmbed();

  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const checkout = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);
    initializeWithPlan({
      planId: PLAN_ID,
      skipped: {
        planStage: true,
        addOnStage: true,
        usageStage: true,
      },
    });

    try {
      const response = await fetch("/api/accessToken");
      const result = (await response.json()) as { accessToken?: string };
      if (result.accessToken === undefined) {
        throw new Error("Response did not include an access token");
      }
      setAccessToken(result.accessToken);
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("Failed to start checkout"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [setAccessToken, initializeWithPlan]);

  useEffect(() => {
    if (stale) {
      hydrate();
    }
  }, [stale, hydrate]);

  return (
    <>
      <CheckoutButton error={error} isLoading={isLoading} onClick={checkout} />
      {!stale &&
        layout === "checkout" &&
        createPortal(<CheckoutDialog />, document.body)}
    </>
  );
}

export default function CustomCheckout() {
  const embedSettings = useEmbedSettings();

  return (
    <EmbedProvider settings={embedSettings}>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl mb-4 text-center max-w-160">
          This button will launch a checkout with the <b>Pro Plan</b>{" "}
          pre-selected and drop you straight into checkout.
        </h1>
        <Checkout />
      </div>
    </EmbedProvider>
  );
}
