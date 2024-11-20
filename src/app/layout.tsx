import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <ClientWrapper>
            <Navbar />
            <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 md:p-24">
              <div className="w-full max-w-5xl">{children}</div>
            </main>
          </ClientWrapper>
        </div>
      </body>
    </html>
  );
}
