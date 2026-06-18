import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isUnprotectedRoute = createRouteMatcher(["/sign-in", "/sign-up"]);

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// In demo mode there is no Clerk auth — let every request through untouched
// so the app boots with no Clerk keys configured.
export default isDemoMode
  ? () => NextResponse.next()
  : clerkMiddleware(async (auth, req) => {
      if (!isUnprotectedRoute(req)) await auth.protect();
    });

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
