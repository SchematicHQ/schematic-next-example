#!/usr/bin/env node
/**
 * Switches the Schematic packages between the published versions in
 * package.json and a sibling schematic-js checkout.
 *
 *   pnpm run link:local     # resolve @schematichq/* from ../schematic-js
 *   pnpm run unlink:local   # back to the published versions
 *
 * The example installs from npm by default so anyone can clone and run it.
 * Developing the packages and the app together needs the local ones, and
 * pnpm reads overrides only from pnpm-workspace.yaml — so this writes them
 * between the markers there rather than asking anyone to hand-edit a file
 * they then have to remember not to commit.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE = join(ROOT, "pnpm-workspace.yaml");
const START = "  # schematic-local-start";
const END = "  # schematic-local-end";
const SOURCE = process.env.SCHEMATIC_JS_DIR ?? "../schematic-js";

const LINKS = [
  ["@schematichq/schematic-components", `${SOURCE}/components`],
  ["@schematichq/schematic-react", `${SOURCE}/react`],
  ["@schematichq/schematic-js", `${SOURCE}/js`],
];

const mode = process.argv[2];
if (mode !== "on" && mode !== "off") {
  console.error("usage: local-packages.mjs on|off");
  process.exit(1);
}

const workspace = readFileSync(WORKSPACE, "utf8");
const start = workspace.indexOf(START);
const end = workspace.indexOf(END);
if (start === -1 || end === -1) {
  console.error(
    `${WORKSPACE} is missing the ${START.trim()} / ${END.trim()} markers`,
  );
  process.exit(1);
}

const body =
  mode === "on"
    ? LINKS.map(([name, path]) => `\n  "${name}": link:${path}`).join("")
    : "";
writeFileSync(
  WORKSPACE,
  workspace.slice(0, start + START.length) + body + "\n" + workspace.slice(end),
);

console.log(
  mode === "on"
    ? `Linked @schematichq/* to ${SOURCE}. Run \`pnpm install\`, and \`pnpm run unlink:local\` before committing.`
    : "Unlinked @schematichq/*; the published versions apply. Run `pnpm install`.",
);
