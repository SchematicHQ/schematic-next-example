import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The Schematic packages are linked to a sibling checkout while the v3 entry
// point is unpublished (see pnpm-workspace.yaml). Turbopack only traces
// modules under its inferred root, which is this directory, so it cannot
// follow those symlinks; pointing the root at the parent brings the sibling
// checkout in scope. Drop this once the packages come from npm.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root },
};

export default nextConfig;
