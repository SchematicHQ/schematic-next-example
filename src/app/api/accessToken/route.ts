import { NextRequest, NextResponse } from "next/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { auth, clerkClient } from "@clerk/nextjs/server";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export async function GET(_request: NextRequest) {
  const apiKey = process.env.SCHEMATIC_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "No Schematic key" }, { status: 400 });
  }

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { message: "User not logged in" },
      { status: 400 },
    );
  }

  const organizationMemberships =
    await clerkClient.users.getOrganizationMembershipList({
      userId,
    });

  if (organizationMemberships.data.length !== 1) {
    return NextResponse.json(
      { message: "User must belong to a single organization" },
      { status: 400 },
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
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to issue access token" },
      { status: 500 },
    );
  }
}
