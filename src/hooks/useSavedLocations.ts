"use client";

import { useOrganization } from "@clerk/nextjs";

import { isDemoMode } from "../utils/demoContext";

// Returns the company's persisted pinned locations.
//
// In Clerk mode these live in the org's publicMetadata (written by /api/pins).
// In demo mode there's no Clerk org, so pinned locations are session-only
// (start empty). The selected implementation is fixed for the lifetime of the
// process by NEXT_PUBLIC_DEMO_MODE, so exactly one hook runs on every render —
// no Rules-of-Hooks violation.

const useClerkSavedLocations = (): string[] => {
  const { organization } = useOrganization();
  if (!organization) return [];
  return (organization.publicMetadata.locations ?? []) as string[];
};

const useDemoSavedLocations = (): string[] => [];

const useSavedLocations: () => string[] = isDemoMode()
  ? useDemoSavedLocations
  : useClerkSavedLocations;

export default useSavedLocations;
