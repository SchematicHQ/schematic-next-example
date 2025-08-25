"use client";

import {
  CheckoutDialog,
  EmbedProvider,
  useEmbed,
} from "@schematichq/schematic-components";
import { useCallback, useEffect, useState } from "react";
import { embedSettings } from "../embedSettings";

function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const { layout, stale, hydrate, setAccessToken, setLayout } = useEmbed();

  const checkout = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch("/api/accessToken");
      const result = await response.json();
      if ("accessToken" in result) {
        setAccessToken(result.accessToken);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }
    } finally {
      setIsLoading(false);
      setLayout("checkout");
    }
  }, [setAccessToken, setLayout]);

  useEffect(() => {
    if (stale) {
      hydrate();
    }
  }, [stale, hydrate]);

  return (
    <>
      <button
        className={
          error
            ? `group appearance-none text-lg font-sans font-medium leading-none flex justify-center items-center w-fit px-6 py-4 rounded-lg text-black bg-red-500 border-transparent duration-100 hover:bg-red-400 hover:cursor-pointer`
            : `group appearance-none text-lg font-sans font-medium leading-none flex justify-center items-center w-fit px-6 py-4 rounded-lg text-black bg-cyan-500 border-transparent duration-100 hover:bg-cyan-400 hover:cursor-pointer`
        }
        onClick={checkout}
      >
        <div
          className={
            isLoading
              ? `w-4 h-4 mr-2 rounded-full border-[0.0625rem] border-cyan-300 border-t-cyan-700 duration-100 animate-spin group-hover:border-cyan-200 group-hover:border-t-cyan-600`
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
      {layout === "checkout" && <CheckoutDialog />}
    </>
  );
}

export default function CustomCheckout() {
  return (
    <EmbedProvider settings={{ ...embedSettings }}>
      <div className="flex justify-center items-center">
        <Checkout />
      </div>
    </EmbedProvider>
  );
}
