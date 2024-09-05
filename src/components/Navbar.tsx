import { SignedIn, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  return (
    <nav className="w-full bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">Schematic</div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
