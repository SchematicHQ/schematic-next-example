import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = dirname(fileURLToPath(import.meta.url));

// Whether `@schematichq/schematic-components` resolves to a checkout outside
// this project, i.e. `pnpm run link:local` is on. An npm install resolves
// inside node_modules and this is false.
const componentsLinked = !realpathSync(
  require.resolve("@schematichq/schematic-components"),
).startsWith(resolve(root, "node_modules"));

// The elements bundle leaves `schematic-js` and `schematic-react` external.
// Resolved from a linked checkout they would come from the checkout's own
// `node_modules`: a second copy of each, and `<Invoices>` reading a session
// the app's `SchematicProvider` never wrote. Point both names at this app's
// copies while linked; with the published package there is nothing to do.
// Aliased to the package directories, not their entry files, so the bundler
// still picks the ESM or CJS build itself.
const packageDir = (name) => dirname(require.resolve(`${name}/package.json`));
const sdks = componentsLinked
  ? {
      "@schematichq/schematic-react": packageDir(
        "@schematichq/schematic-react",
      ),
      "@schematichq/schematic-js": packageDir("@schematichq/schematic-js"),
    }
  : {};

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, ...sdks };
    return config;
  },
  turbopack: { resolveAlias: sdks },
};

export default nextConfig;
