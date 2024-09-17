import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";

const useAuthContext = () => {
  const { isLoaded, user } = useUser();

  return useMemo(() => {
    if (!isLoaded || !user) {
      return;
    }

    const userName = user?.username ?? user?.fullName ?? user?.id;
    const { organizationMemberships } = user ?? {};
    const org = organizationMemberships?.[0]?.organization;
    if (!org) {
      return;
    }
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
