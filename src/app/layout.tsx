import type { Metadata } from "next";
import { Inter, Manrope, Public_Sans } from "next/font/google";

import ClientWrapper from "@/components/ClientWrapper";
import Navbar from "@/components/Navbar";
import ThemeProvider, { themeScript } from "@/components/ThemeProvider";

import "./globals.css";

/*
  The three families the original embed theme used: Inter for h1/h2 and links,
  Manrope for h3/h4, Public Sans for body copy and h5/h6. All three are
  variable fonts, so every weight the theme asks for (Inter 200, Manrope 800)
  comes for free.
*/
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-publicsans",
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
    // The theme script writes a class onto <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${publicSans.variable}`}
      >
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <ClientWrapper>
              <Navbar />
              <main className="grow flex flex-col items-center justify-center px-4 py-8 md:p-24">
                <div className="w-full max-w-5xl">{children}</div>
              </main>
            </ClientWrapper>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
