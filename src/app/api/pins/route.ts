import { clerkClient } from "@clerk/nextjs/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { NextRequest, NextResponse } from "next/server";

import { getAuthOrgId, AuthError } from "../../../utils/auth";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export async function POST(request: NextRequest) {
  const apiKey = process.env.SCHEMATIC_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "No Schematic key" }, { status: 400 });
  }

  const { locations } = await request.json();
  const numLocations = locations?.length ?? 0;

  try {
    const { orgId } = await getAuthOrgId();
    const basePath = process.env.NEXT_PUBLIC_SCHEMATIC_API_URL;
    const schematicClient = new SchematicClient({ apiKey, basePath });

    await schematicClient.companies.upsertCompany({
      keys: { clerkId: orgId },
      traits: { numLocations },
    });

    (await clerkClient()).organizations.updateOrganizationMetadata(orgId, {
      publicMetadata: { locations },
    });

    return NextResponse.json({ numLocations });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: (error as AuthError).message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Failed to update location count" },
      { status: 500 },
    );
  }
}
