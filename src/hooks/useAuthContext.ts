import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";

const useAuthContext = () => {
  const { isLoaded, user } = useUser();

  return useMemo(() => {
    if (!isLoaded || !user) {
      return;
    }

    const userName = user.username ?? user.fullName ?? user.id;
    // The company is the user's one organization, the rule the session in
    // ClientWrapper and /api/accessToken share: more than one is no company,
    // so nothing identifies against an organization the token endpoint would
    // refuse to mint for.
    const { organizationMemberships } = user;
    if (organizationMemberships.length !== 1) {
      return;
    }
    const org = organizationMemberships[0].organization;
    const orgId = org.id;
    const userId = user.id;
    const orgName = org.name;

    return {
      company: {
        keys: { clerkId: orgId },
        name: orgName,
        traits: { status: "active" },
      },
      user: {
        keys: { clerkId: userId },
        name: userName,
        traits: { status: "active" },
      },
    };
  }, [isLoaded, user]);
};

export default useAuthContext;
