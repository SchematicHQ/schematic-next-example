import { NextRequest, NextResponse } from "next/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";

import { getAuthOrgId, AuthError } from "../../../utils/auth";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export async function GET(_request: NextRequest) {
  const apiKey = process.env.SCHEMATIC_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "No Schematic key" }, { status: 400 });
  }

  try {
    const { orgId } = await getAuthOrgId();
    const basePath = process.env.NEXT_PUBLIC_SCHEMATIC_API_URL;
    const schematicClient = new SchematicClient({ apiKey, basePath });

    const resp = await schematicClient.accesstokens.issueTemporaryAccessToken({
      resourceType: "company",
      lookup: {
        clerkId: orgId,
      },
    });

    const accessToken = resp.data?.token;
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
