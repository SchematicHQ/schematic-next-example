# Schematic Next.js Example

A working example of [Schematic](https://schematichq.com) in a Next.js App Router
app: feature flags, usage tracking, entitlement enforcement, an embedded customer
portal, a custom checkout flow, and a hand-built invoice table.

It uses [`schematic-react`](https://github.com/schematichq/schematic-js/tree/main/react)
for flags and usage tracking, and
[`schematic-components`](https://github.com/schematichq/schematic-js/tree/main/components)
for the embedded portal, pricing table, and checkout. Auth is
[Clerk](https://clerk.com), though there's a demo mode that skips it entirely.

## What's in here

| Route              | Shows                                                    |
| ------------------ | -------------------------------------------------------- |
| `/`                | Feature flags and usage tracking gating a weather search |
| `/pricing`         | `<PricingTable>` — plans and upgrade CTA                 |
| `/usage`           | `<SchematicEmbed>` — the full customer portal            |
| `/custom-checkout` | Driving `<CheckoutDialog>` yourself from your own button |
| `/billing`         | Billing history, built on the elements data hooks        |
| `/account/billing` | The same card from `<Invoices>`                          |

## Prerequisites

- A Schematic account
- A Clerk account (not needed if you run in demo mode)
- The `company-context-api` flag on your Schematic account, which is what the
  `/company/*` endpoints behind `/billing` and `/account/billing` are gated on.
  Without it those reads 404 and both pages show an error rather than an empty
  history — ask Schematic to enable it.

For the full component experience you'll also want a Stripe account connected to
Schematic, with Stripe customer IDs in private metadata on your Clerk orgs.

## Getting started

1. In [Schematic](https://app.schematichq.com), add features for `weather-search`,
   `humidity`, `wind-speed`, and `pinned-locations`. Create plans and entitlements
   for them, then connect your Stripe and Clerk accounts.

2. Create a component in the Components tab — this is what `/usage` renders.

3. Copy the env template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   You'll need your Schematic publishable key and secret, the component ID from
   step 2, and your Clerk keys. Each variable is documented in `.env.example`.

4. Install and run:

   ```bash
   pnpm install && pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

### Working against a local schematic-js

The example installs the published `@schematichq/*` packages, so it runs from a
clone on its own. To develop the packages and this app together, check out
[schematic-js](https://github.com/schematichq/schematic-js) beside this repo and
point the app at it:

```bash
pnpm run link:local && pnpm install   # SCHEMATIC_JS_DIR=… for another path
pnpm run unlink:local && pnpm install # back to the published packages
```

That writes a `link:` override into `pnpm-workspace.yaml` between its
`schematic-local` markers, so the switch is one command and shows up in
`git status` rather than living in a file you have to remember not to commit.
It links `schematic-components` only; `schematic-react` and `schematic-js`
install from npm at the versions `package.json` pins, the way `yarn link`
used to leave every other dependency alone. `SCHEMATIC_LINK_ALL=1` links all
three when the SDKs are what you are changing.

A linked package resolves its own externals from the checkout's
`node_modules`: a second copy of `schematic-react` and `schematic-js`, so
`<Invoices>` would read a session the app's `SchematicProvider` never wrote.
`next.config.mjs` detects the link and aliases both names to this app's
copies for webpack and Turbopack; with the published package it does nothing,
so it is safe to commit and needs no toggling.

`@schematichq/schematic-components` 3.0.0 is not on npm yet, so this branch
commits its override and the lockfile that produces. Until it publishes a
clone needs `../schematic-js` beside it and the Vercel preview cannot build.
Once a release candidate exists the last commit before this branch merges is
`pnpm run unlink:local`, pin the exact version in `package.json`, and
`pnpm install`; the alias in `next.config.mjs` stays.

Note that `verifyDepsBeforeRun` makes `pnpm run unlink:local` install first,
and the install after it fails on the missing 3.0.0 until it publishes. Run
`node scripts/local-packages.mjs off` directly if the switch gets stuck.

### Demo mode

Uncomment `NEXT_PUBLIC_DEMO_MODE="true"` in `.env.local` to run without Clerk.
The app then identifies as one hardcoded company (`id: "demo-co"`) and user, and
skips `ClerkProvider` entirely. Seed entitlements for that company key first, or
every feature will read as unentitled. See `src/utils/demoContext.ts`.

## How Schematic is wired up

**1. Wrap the app in `SchematicProvider`.** In `src/components/ClientWrapper.tsx`:

```tsx
<SchematicProvider
  publishableKey={schematicPubKey}
  session={{ company: companyKey, token: fetchAccessToken }}
>
  {children}
</SchematicProvider>
```

`session` names whose billing the elements read and how: `company` is the
Clerk org id, and `token` is the fetcher itself, which the client calls once,
holds until the expiry it returns, and calls again after a 401. A different
`company` drops every loaded billing resource, so switching Clerk orgs can't
leave the previous org's invoices on screen. `session={null}` is signing out,
which drops them too, and `session={undefined}` is "not known yet", which
changes nothing — `ClientWrapper` tells the three apart from Clerk's `isLoaded`
and the user's organization memberships. The session names no `user` because
`/api/accessToken` mints company-wide tokens, so every member of an
organization shares one session.

**2. Identify the user and company.** Also in `ClientWrapper`, via the `identify`
function from `useSchematicEvents`:

```ts
const { identify } = useSchematicEvents();
const authContext = useAuthContext();

useEffect(() => {
  const { company, user } = authContext ?? {};
  if (company && user) {
    void identify({
      company: { keys: company.keys, name: company.name },
      keys: user.keys,
      name: user.name,
      traits: user.traits,
    });
  }
}, [authContext, identify]);
```

**3. Track usage.** `src/components/Weather.tsx` reports each search:

```ts
track({ event: "weather-search" });
```

**4. Enforce entitlements.** `useSchematicFlag` for booleans, and
`useSchematicEntitlement` when you need the usage numbers too:

```ts
const humidityFlag = useSchematicFlag("humidity");
{humidityFlag && <p>Humidity: {weatherData?.humidity}%</p>}

const { featureUsage, featureAllocation, featureUsageExceeded } =
  useSchematicEntitlement("weather-search");
```

**5. Issue a scoped access token.** Embedded components take a short-lived,
company-scoped token. `src/app/api/accessToken/route.ts` exchanges your secret
key for one:

```ts
const schematicClient = new SchematicClient({ apiKey });
const resp = await schematicClient.accesstokens.issueTemporaryAccessToken({
  lookup: { clerkId: orgId },
});
return NextResponse.json({
  accessToken: resp.data.token,
  company: orgId,
  expiresAt: resp.data.expiredAt,
});
```

The expiry lets the session's token provider refresh before a request fails
rather than after one has. The company stamps the token with the session it
was minted for: a token that comes back after the user switched organizations
names the new org, and the client refuses to send it for the old one rather
than reading the wrong company's billing. On the client,
`src/hooks/useAccessToken.ts` wraps that call.

**6. Render the portal.** `src/app/usage/page.tsx`:

```tsx
<EmbedProvider settings={embedSettings}>
  <SchematicEmbed accessToken={accessToken} id={componentId} />
</EmbedProvider>
```

### Building your own UI on Schematic data

`/billing` is the example to copy when the prebuilt components aren't the right
shape. It uses the same hooks the elements do and renders entirely your own markup:

```tsx
import {
  deriveInvoiceList,
  useInvoices,
  useResolvedLocale,
  useTranslator,
} from "@schematichq/schematic-components/elements";

const {
  data: page,
  error,
  isPending,
  loadMore,
  refetch,
} = useInvoices({
  includePending: true,
});
const locale = useResolvedLocale();
const t = useTranslator({ invoicesHeader: "Billing history" });
const list = page && deriveInvoiceList(page, { locale });
```

`useInvoices` handles fetching and pagination; `deriveInvoiceList` turns a raw
page into display-ready rows (formatted dates, localised amounts, credit
flags), each carrying the raw `amountMinor`, `currency`, and `date` beside the
formatted text. `useResolvedLocale` and `useTranslator` resolve the same locale
and copy the element would, so your own markup and a `<Invoices>` elsewhere on
the page never disagree. See `src/components/billing/InvoiceHistory.tsx` for
the loading, error, and empty states, plus show-more and load-more handling.

`/account/billing` renders the same data through the packaged `<Invoices>`
element instead, styled by `<SchematicStyles />` — mounted once on the
provider in `src/components/ClientWrapper.tsx`. That is the packaged element
as a host gets it out of the box, and the sheet follows the app's
`color-scheme`, so it tracks the theme toggle with nothing to wire up.
`src/app/account/billing/invoices.css` is the other way to do it: a complete
restyle through the documented class names, kept on disk and left unimported
so you can swap it in. Copy is renamed by key — `strings={{ invoicesHeader: "Billing history" }}` — which is
the whole integration for a host that wants different words in one language;
`translate` on the provider routes every string through an i18n stack instead.
Both pages take their query, row limit, and copy from `src/utils/billing.ts`,
so the two showing the same figures is a fact rather than a coincidence.

## Styling

The app has a small design system rather than ad-hoc classes, so you can see how
Schematic's components sit inside a real one.

- **`src/app/globals.css`** — CSS custom properties for colour, radius, and
  fonts, with a light and a dark palette, mapped to Tailwind v4 utilities
  through `@theme inline`. Errors use a `--danger` family separate from the
  brand `--accent`.
- **`src/components/ThemeProvider.tsx`** — resolves the theme from
  `localStorage` and `prefers-color-scheme`, and applies it before first paint
  so a dark reload never flashes light.
- **`src/components/ui/`** — `Card`, `Button`, `Input`, `Badge`, `PageHeader`.
  Variants (`size`, `tone`) own the properties a caller would otherwise fight
  over, so `className` is only used for layout.
- **`src/styles/palette.ts`** — the token subset that third-party widgets need.
  Schematic and Clerk are configured through props, not CSS, so they can't read
  the custom properties. `useEmbedSettings` and `useClerkAppearance` translate
  this palette into each vendor's shape and re-derive on theme change, which is
  what keeps embeds and auth screens matching the rest of the app.

## Project layout

```
src/
  app/              routes; api/ holds the token + pins endpoints
  components/
    ui/             design-system primitives
  hooks/            useAccessToken, useEmbedSettings, useClerkAppearance, …
  styles/           palette shared with third-party widgets
  utils/            auth helpers and demo-mode identity
```

## Scripts

```bash
pnpm dev      # dev server on :3000
pnpm build    # production build
pnpm start    # serve the build on :3001
pnpm lint     # eslint
pnpm format   # prettier
```
