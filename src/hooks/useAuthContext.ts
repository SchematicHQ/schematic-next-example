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
        // Leave this here -- we need an org that doesn't have unlimited access
        keys: { clerkId: "org_2mWlIxdJTYJuafeCwsHJgb2RENx" },
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
