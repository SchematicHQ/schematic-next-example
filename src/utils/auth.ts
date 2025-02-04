import { auth, clerkClient } from "@clerk/nextjs/server";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getAuthOrgId() {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthError("User not logged in");
  }

  let organizationMemberships;
  try {
    const client = await clerkClient();
    organizationMemberships = await client.users.getOrganizationMembershipList({
      userId,
    });
  } catch {
    throw new AuthError("Failed to fetch organization memberships");
  }

  if (organizationMemberships.data.length !== 1) {
    throw new AuthError("User must belong to a single organization");
  }

  const orgId = organizationMemberships.data[0].organization.id;

  return { orgId };
}
