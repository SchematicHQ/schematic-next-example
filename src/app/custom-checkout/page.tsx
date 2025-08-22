"use client";

import {
  Button,
  CheckoutDialog,
  EmbedProvider,
  Icon,
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
      <Button
        $color={error ? "danger" : "primary"}
        $variant="ghost"
        $size="sm"
        $isLoading={isLoading}
        onClick={checkout}
      >
        {error && <Icon name="exclamation-rounded-filled" />}
        Checkout
      </Button>
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
