"use client";

import {
  CheckoutDialog,
  EmbedProvider,
  useEmbed,
} from "@schematichq/schematic-components";
import { useCallback, useEffect, useState } from "react";
import { embedSettings } from "../embedSettings";

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
    </button>
  );
}

function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const { layout, stale, hydrate, setAccessToken, initializeWithPlan } =
    useEmbed();

  const checkout = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch("/api/accessToken");
      const result = await response.json();
      if ("accessToken" in result) {
        setAccessToken(result.accessToken);
        initializeWithPlan({
          planId: "plan_LF8sduVDqib",
          skipped: {
            planStage: true,
            addOnStage: true,
          },
          hideSkipped: true,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }
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
      {layout === "checkout" && <CheckoutDialog />}
    </>
  );
}

export default function CustomCheckout() {
  return (
    <EmbedProvider settings={{ ...embedSettings }}>
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
