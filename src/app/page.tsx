"use client";

import Weather from "@/components/Weather";
import ClientWrapper from "@/components/ClientWrapper";

export default function Home() {
  return (
    <div className="w-full max-w-5xl">
      <ClientWrapper>
        <Weather />
      </ClientWrapper>
    </div>
  );
}
