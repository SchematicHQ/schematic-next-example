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

| Route              | Shows                                                           |
| ------------------ | --------------------------------------------------------------- |
| `/`                | Feature flags and usage tracking gating a weather search        |
| `/pricing`         | `<PricingTable>` — plans and upgrade CTA                        |
| `/usage`           | `<SchematicEmbed>` — the full customer portal                   |
| `/custom-checkout` | Driving `<CheckoutDialog>` yourself from your own button        |
| `/invoices`        | Building your own UI on the v3 data hooks, no Schematic styling |

## Prerequisites

- A Schematic account
- A Clerk account (not needed if you run in demo mode)

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
   yarn && yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

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
  accessToken={fetchAccessToken}
>
  {children}
</SchematicProvider>
```

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
  resourceType: "company",
  lookup: { clerkId: orgId },
});
return NextResponse.json({ accessToken: resp.data?.token });
```

On the client, `src/hooks/useAccessToken.ts` wraps that call.

**6. Render the portal.** `src/app/usage/page.tsx`:

```tsx
<EmbedProvider settings={embedSettings}>
  <SchematicEmbed accessToken={accessToken} id={componentId} />
</EmbedProvider>
```

### Building your own UI on Schematic data

`/invoices` is the example to copy when the prebuilt components aren't the right
shape. It uses the v3 data hooks and renders entirely your own markup:

```tsx
import {
  deriveInvoiceList,
  resolveLocale,
  useInvoices,
  useSchematicLocale,
} from "@schematichq/schematic-components/v3";

const {
  data: page,
  error,
  isPending,
  loadMore,
  refetch,
} = useInvoices({
  includePending: true,
});
const locale = resolveLocale(useSchematicLocale());
const list = page && deriveInvoiceList(page, { locale });
```

`useInvoices` handles fetching and pagination; `deriveInvoiceList` turns a raw
page into display-ready rows (formatted dates, localised amounts, credit
flags). See `src/app/invoices/page.tsx` for the loading, error, and empty
states, plus show-more and load-more handling.

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
yarn dev      # dev server on :3000
yarn build    # production build
yarn start    # serve the build on :3001
yarn lint     # eslint
yarn format   # prettier
```
