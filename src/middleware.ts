import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isUnprotectedRoute = createRouteMatcher(["/sign-in", "/sign-up"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isUnprotectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
