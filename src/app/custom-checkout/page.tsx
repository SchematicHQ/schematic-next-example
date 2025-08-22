"use client";

import {
  Button,
  CheckoutDialog,
  EmbedProvider,
  Icon,
  useEmbed,
} from "@schematichq/schematic-components";
import { useCallback, useEffect, useState } from "react";

function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const { layout, stale, hydrate, setAccessToken, setLayout } = useEmbed();

  const checkout = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/accessToken");
      const result = await response.json();
      if ("accessToken" in result) {
        setAccessToken(result.accessToken);
      }
      setError(undefined);
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
    <EmbedProvider
      settings={{
        theme: {
          numberOfColumns: 1,
          colorMode: "dark",
          primary: "#2bbde1",
          secondary: "#2bbde1",
          card: {
            background: "#0e0e0e",
            borderRadius: 10,
            hasShadow: true,
            padding: 45,
          },
          typography: {
            heading1: {
              fontFamily: "Inter",
              fontSize: 37,
              fontWeight: 400,
              color: "#ffffff",
            },
            heading2: {
              fontFamily: "Inter",
              fontSize: 29,
              fontWeight: 200,
              color: "#ffffff",
            },
            heading3: {
              fontFamily: "Manrope",
              fontSize: 20,
              fontWeight: 600,
              color: "#ffffff",
            },
            heading4: {
              fontFamily: "Manrope",
              fontSize: 18,
              fontWeight: 800,
              color: "#ffffff",
            },
            heading5: {
              fontFamily: "Public Sans",
              fontSize: 17,
              fontWeight: 500,
              color: "#ffffff",
            },
            heading6: {
              fontFamily: "Public Sans",
              fontSize: 14,
              fontWeight: 400,
              color: "#d1d1d1",
            },
            text: {
              fontFamily: "Public Sans",
              fontSize: 16,
              fontWeight: 400,
              color: "#ffffff",
            },
            link: {
              fontFamily: "Inter",
              fontSize: 16,
              fontWeight: 400,
              color: "#2bbde1",
            },
          },
        },
      }}
    >
      <div className="flex justify-center items-center">
        <Checkout />
      </div>
    </EmbedProvider>
  );
}
