"use client";

import { SignedIn, UserButton } from "@clerk/clerk-react";
import Link from "next/link";

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

        <div className="flex items-center space-x-4">
          <Link href="/usage" className="text-white hover:text-gray-300">
            Usage
          </Link>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
