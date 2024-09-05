import Usage from "@/components/Usage";
import { Suspense } from "react";
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function UsageAndPlan() {
  const apiKey = process.env.SCHEMATIC_SECRET_KEY;
  if (!apiKey) {
    return (
      <div className="p-24">
        <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
        <p>
          No Schematic API key found. Please set the{" "}
          <code>SCHEMATIC_SECRET_KEY</code> environment variable.
        </p>
      </div>
    );
  }

  const { userId } = auth();

  if (!userId) {
    return (
      <div className="p-24">
        <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
        <p>Unauthorized. Please log in to view this page.</p>
      </div>
    );
  }

  const organizationMemberships =
    await clerkClient.users.getOrganizationMembershipList({
      userId,
    });

  if (organizationMemberships.data.length === 0) {
    return (
      <div className="p-24">
        <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
        <p>Must belong to an organization</p>
      </div>
    );
  }

  const orgId = organizationMemberships.data[0].organization.id;

  const schematicClient = new SchematicClient({ apiKey });

  try {
    const resp = await schematicClient.accesstokens.issueTemporaryAccessToken({
      resourceType: "company",
      lookup: {
        id: orgId,
      },
    });

    const accessToken = resp.data?.token;

    return (
      <div className="p-24">
        <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
        <Suspense fallback={<div>Loading usage data...</div>}>
          <Usage accessToken={accessToken} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching temporary access token:", error);

    return (
      <div className="p-24">
        <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
        <p>
          An error occurred while fetching usage data. Please try again later.
        </p>
      </div>
    );
  }
}
