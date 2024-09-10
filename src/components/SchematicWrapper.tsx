import React from "react";
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function SchematicWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiKey = process.env.SCHEMATIC_SECRET_KEY;
  if (!apiKey) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center p-24">
        <div className="w-full max-w-5xl">
          <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
          <p>
            No Schematic API key found. Please set the{" "}
            <code>SCHEMATIC_SECRET_KEY</code> environment variable.
          </p>
        </div>
      </main>
    );
  }

  const schematicClient = new SchematicClient({ apiKey });

  const { userId } = auth();
  if (!userId) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center p-24">
        <div className="w-full max-w-5xl">
          <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
          <p>Unauthorized. Please log in to view this page.</p>
        </div>
      </main>
    );
  }

  const organizationMemberships =
    await clerkClient.users.getOrganizationMembershipList({
      userId,
    });

  if (organizationMemberships.data.length === 0) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center p-24">
        <div className="w-full max-w-5xl">
          <div className="p-24">
            <h1 className="text-2xl font-bold mb-4">Usage & Plan</h1>
            <p>Must belong to an organization</p>
          </div>
        </div>
      </main>
    );
  }

  const org = organizationMemberships.data[0]?.organization;
  const privateData = org?.privateMetadata ?? {};
  const stripeCustomerId = privateData.stripeCustomerId;
  const extraKeys: Record<string, string> = {};
  if (typeof stripeCustomerId === "string") {
    extraKeys.stripe_customer_id = stripeCustomerId;
  }
  const orgId = org?.id ?? "";
  const orgName = org?.name ?? "";

  schematicClient.identify({
    company: {
      keys: {
        id: orgId,
        ...extraKeys,
      },
      name: orgName,
      traits: { logoUrl: org.imageUrl },
    },
    keys: { id: userId },
    traits: { status: "active" },
  });

  return <>{children}</>;
}
