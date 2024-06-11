import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isUnprotectedRoute = createRouteMatcher([
  "/sign-in",
  "/sign-up",
]);

export default clerkMiddleware((auth, req) => {
  if (!isUnprotectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
