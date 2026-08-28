import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      /*
        One import convention: React/Next first, then packages, then the "@/"
        alias for anything inside src, then relative siblings.

        This uses simple-import-sort rather than eslint-plugin-import's
        `import/order`, which calls sourceCode APIs that ESLint 10 removed and
        throws when it runs.
      */
      "simple-import-sort/imports": [
        "error",
        {
          groups: [["^react$", "^next"], ["^@?\\w"], ["^@/"], ["^\\."]],
        },
      ],
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
      // Reach into other directories through the alias, never "../".
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: 'Use the "@/" alias instead of a parent-relative path.',
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    settings: {
      // Fix for ESLint 10+: eslint-plugin-react uses context.getFilename() (legacy API)
      // which was removed in ESLint 10 flat config. Declaring the version explicitly
      // prevents the plugin from trying to auto-detect it and failing.
      react: { version: "19" },
    },
  },
]);
