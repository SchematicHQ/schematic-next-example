import type { Metadata } from "next";
import { Inter, Manrope, Public_Sans } from "next/font/google";

import ClientWrapper from "@/components/ClientWrapper";
import Navbar from "@/components/Navbar";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
// The Schematic v3 elements reference these through the --schematic-font-*
// variables (mapped in globals.css); the SDK never loads font files itself.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "Schematic Next.js Example",
  description: "Next.js example with Schematic and Clerk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${manrope.variable} ${publicSans.variable}`}
      >
        <div className="flex flex-col min-h-screen">
          <ClientWrapper>
            <Navbar />
            <main className="grow flex flex-col items-center justify-center px-4 py-8 md:p-24">
              <div className="w-full max-w-5xl">{children}</div>
            </main>
          </ClientWrapper>
        </div>
      </body>
    </html>
  );
}
