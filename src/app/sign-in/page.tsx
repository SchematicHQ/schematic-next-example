import { SignIn } from "@clerk/nextjs";

import { isDemoMode } from "../../utils/demoContext";

const SignInPage = () =>
  isDemoMode() ? (
    <div>Sign-in is disabled in demo mode.</div>
  ) : (
    <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
  );

export default SignInPage;
