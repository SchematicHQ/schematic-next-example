import { SignUp } from "@clerk/nextjs";

import { isDemoMode } from "../../utils/demoContext";

const SignUpPage = () =>
  isDemoMode() ? (
    <div>Sign-up is disabled in demo mode.</div>
  ) : (
    <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
  );

export default SignUpPage;
