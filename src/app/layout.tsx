import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col items-center justify-center p-24">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
