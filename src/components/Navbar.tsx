"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import ThemeToggle from "@/components/ThemeToggle";
import { isDemoMode } from "@/utils/demoContext";

const NAV_LINK =
  "rounded-md text-sm text-muted-fg transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-bg/82 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between gap-6 px-5 md:px-8">
        <div className="flex items-center gap-7">
          <Link href="/" className="font-display text-xl font-semibold text-fg">
            Schematic
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/pricing" className={NAV_LINK}>
              Pricing
            </Link>
            <Link href="/usage" className={NAV_LINK}>
              Usage
            </Link>
            <Link href="/custom-checkout" className={NAV_LINK}>
              Checkout
            </Link>
            <Link href="/invoices" className={NAV_LINK}>
              Invoices
            </Link>
            <Link href="/invoices-element" className={NAV_LINK}>
              Invoices (element)
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Clerk's UserButton requires ClerkProvider, which is absent in
              demo mode. Render a static label instead. */}
          {isDemoMode() ? (
            <span className="text-sm text-muted-fg">Demo</span>
          ) : (
            <Show when="signed-in">
              <UserButton />
            </Show>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
