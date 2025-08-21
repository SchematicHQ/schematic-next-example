"use client";

import {
  Button,
  CheckoutDialog,
  EmbedProvider,
  Loader,
  useEmbed,
} from "@schematichq/schematic-components";
import { useEffect, useState } from "react";

function ButtonWithCheckout() {
  const { layout, hydrate, setAccessToken, setLayout } = useEmbed();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccessToken() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/accessToken");
        const result = await response.json();
        if ("accessToken" in result) {
          setAccessToken(result.accessToken);
        }
        setError(null);
      } catch (error) {
        console.error(error);
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccessToken();
  }, [setAccessToken]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function handlePlanChanged() {
      return hydrate();
    }

    window.addEventListener("plan-changed", handlePlanChanged);

    return () => {
      window.removeEventListener("plan-changed", handlePlanChanged);
    };
  }, [hydrate]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <Button $size="lg" onClick={() => setLayout("checkout")}>
        Checkout
      </Button>
      {layout === "checkout" && <CheckoutDialog />}
    </>
  );
}

export default function CustomCheckout() {
  return (
    <EmbedProvider>
      <div className="flex justify-center items-center">
        <ButtonWithCheckout />
      </div>
    </EmbedProvider>
  );
}
