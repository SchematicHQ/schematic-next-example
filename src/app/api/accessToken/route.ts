import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { NextResponse } from "next/server";

import { AuthError, getAuthOrgId } from "@/utils/auth";
import { demoCompanyKeys, isDemoMode } from "@/utils/demoContext";

export async function GET() {
  const apiKey = process.env.SCHEMATIC_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "No Schematic key" }, { status: 400 });
  }

  try {
    const basePath = process.env.NEXT_PUBLIC_SCHEMATIC_API_URL;
    const schematicClient = new SchematicClient({ apiKey, basePath });

    // In demo mode there's no Clerk session — look up the hardcoded company.
    // `company` is the id the client's session names for it, which is the
    // Clerk org id here and the demo company's key in demo mode.
    let company: string;
    let lookup: Record<string, string>;
    if (isDemoMode()) {
      company = demoCompanyKeys.id;
      lookup = demoCompanyKeys;
    } else {
      const { orgId } = await getAuthOrgId();
      company = orgId;
      lookup = { clerkId: orgId };
    }

    const resp = await schematicClient.accesstokens.issueTemporaryAccessToken({
      lookup,
    });

    // The expiry with it: SchematicProvider's token provider holds the token
    // until this moment and mints a new one then, rather than waiting for a
    // request to come back 401. And the company, so the client can tell a
    // token minted for the organization the user just switched to from one
    // for the session it asked about, and refuse to send it for the wrong
    // one.
    return NextResponse.json({
      accessToken: resp.data.token,
      company,
      expiresAt: resp.data.expiredAt,
    });
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
