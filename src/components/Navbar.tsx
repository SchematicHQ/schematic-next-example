"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="w-full bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-white text-xl font-bold hover:text-gray-300"
          >
            Schematic
          </Link>
        </div>

        <div className="flex items-center space-x-8">
          <Link href="/pricing" className="text-white hover:text-gray-300">
            Pricing
          </Link>

          <Link
            href="/custom-checkout"
            className="text-white hover:text-gray-300"
          >
            Custom Checkout
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/usage" className="text-white hover:text-gray-300">
            Usage
          </Link>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
