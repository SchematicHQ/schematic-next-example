// Hardcoded demo identity — no auth required.
//
// When NEXT_PUBLIC_DEMO_MODE === "true" the app skips Clerk entirely and
// identifies as a single fixed company/user against a (typically local)
// Schematic API. The demo environment must seed entitlements for the
// company key below (`id: "demo-co"`).
//
// Mirrors the dashai demo pattern (lib/server-identity.ts + data/demoIdentity.ts),
// but uses simple stable `id` keys since this app isn't bound to Metronome.

export const isDemoMode = (): boolean =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Company the demo identifies as. Seed entitlements for this key in the
// provisioned Schematic environment.
export const demoCompanyKeys: Record<string, string> = { id: "demo-co" };

// User the demo identifies as. Overridable via env so the same image can be
// retargeted without code changes.
export const demoUserKeys: Record<string, string> = {
  id: process.env.NEXT_PUBLIC_DEMO_USER_KEY ?? "demo-user",
};

export const demoIdentity = {
  company: {
    keys: demoCompanyKeys,
    name: process.env.NEXT_PUBLIC_DEMO_COMPANY_NAME ?? "Demo Company",
    traits: { status: "active" } as Record<string, string | number | boolean>,
  },
  user: {
    keys: demoUserKeys,
    name: process.env.NEXT_PUBLIC_DEMO_USER_NAME ?? "Demo User",
    traits: { status: "active" } as Record<string, string | number | boolean>,
  },
};
