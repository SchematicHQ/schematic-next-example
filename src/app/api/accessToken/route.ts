import { NextResponse } from "next/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";

import { getAuthOrgId, AuthError } from "../../../utils/auth";
import { demoCompanyKeys, isDemoMode } from "../../../utils/demoContext";

export async function GET() {
  const apiKey = process.env.SCHEMATIC_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "No Schematic key" }, { status: 400 });
  }

  try {
    const basePath = process.env.NEXT_PUBLIC_SCHEMATIC_API_URL;
    const schematicClient = new SchematicClient({ apiKey, basePath });

    // In demo mode there's no Clerk session — look up the hardcoded company.
    const lookup = isDemoMode()
      ? demoCompanyKeys
      : { clerkId: (await getAuthOrgId()).orgId };

    const resp = await schematicClient.accesstokens.issueTemporaryAccessToken({
      lookup,
    });

    const accessToken = resp.data.token;
    return NextResponse.json({ accessToken });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: (error as AuthError).message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Failed to issue access token" },
      { status: 500 },
    );
  }
}
