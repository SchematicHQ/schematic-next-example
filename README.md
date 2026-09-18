# Schematic Next.js Example

A working example of [Schematic](https://schematichq.com) in a Next.js App Router
app: feature flags, usage tracking, entitlement enforcement, an embedded customer
portal, a custom checkout flow, and hand-built billing pages.

It uses [`schematic-react`](https://github.com/schematichq/schematic-js/tree/main/react)
for flags and usage tracking, and
[`schematic-components`](https://github.com/schematichq/schematic-js/tree/main/components)
for the embedded portal, pricing table, and checkout. Auth is
[Clerk](https://clerk.com), though there's a demo mode that skips it entirely.

## What's in here

| Route              | Shows                                                                             |
| ------------------ | --------------------------------------------------------------------------------- |
| `/`                | Feature flags and usage tracking gating a weather search                          |
| `/pricing`         | `<PricingTable>` — plans and upgrade CTA                                          |
| `/usage`           | `<SchematicEmbed>` — the full customer portal                                     |
| `/custom-checkout` | Driving `<CheckoutDialog>` yourself from your own button                          |
| `/billing`         | Next bill, payment methods, and billing history, built on the elements data hooks |
| `/account/billing` | The same three cards from `<UpcomingBill>`, `<PaymentMethods>`, and `<Invoices>`  |

## Prerequisites

- A Schematic account
- A Clerk account (not needed if you run in demo mode)
- The `company-context-api` flag on your Schematic account, which is what the
  `/company/*` endpoints behind `/billing` and `/account/billing` are gated on.
  Without it those reads 404 and both pages show an error rather than an empty
  history — ask Schematic to enable it.

For the full component experience you'll also want a Stripe account connected to
Schematic, with Stripe customer IDs in private metadata on your Clerk orgs.
The payment methods card on both billing pages reads through that
connection, so it needs:

- The Stripe integration installed on your Schematic account.
- A Stripe customer for the company (the demo company, in demo mode). Without
  one the card reports that payment methods are not available.
- `company-context-api` on, as above.
- `@stripe/stripe-js` and `@stripe/react-stripe-js` installed, which they are
  here. Both are optional peers of `schematic-components`: the list renders
  without them, and only the Add form needs them.

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

A branch that depends on a `@schematichq/*` version not on npm yet is the
one case where the override is committed, with the lockfile it produces.
Until the release lands a clone needs `../schematic-js` beside it and the
Vercel preview cannot build. Once it publishes, the last commit before the
branch merges is `pnpm run unlink:local && pnpm install`; the alias in
`next.config.mjs` stays.

Note that `verifyDepsBeforeRun` makes `pnpm run unlink:local` install first,
and that install fails on the missing version until it publishes. Run
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
  plural,
  useInvoices,
  useResolvedLocale,
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
const list = page && deriveInvoiceList(page, { locale });
```

`useInvoices` handles fetching and pagination; `deriveInvoiceList` turns a raw
page into display-ready rows (formatted dates, localised amounts, credit
flags), each carrying the raw `amountMinor`, `currency`, and `date` beside the
formatted text. `useResolvedLocale` resolves the same locale the element
formats in, so your own markup and a `<Invoices>` elsewhere on the page never
disagree on a date or an amount. The copy is yours: the element's string
catalogue holds only what the packaged card renders, so a status label or a
column header is written beside the markup that uses it, and `plural` serves a
count-bearing string in the viewer's language. See
`src/components/billing/InvoiceHistory.tsx` for the loading, error, and empty
states, plus show-more and load-more handling.

The card above it is `useUpcomingInvoice` and `deriveUpcomingInvoice` — the
next bill, with the account balance and discounts that shaped it. Its `data`
is `UpcomingInvoice | null`, where `null` is a loaded answer meaning there is
nothing to bill (no subscription), so only `undefined` is still loading. See
`src/components/billing/NextBill.tsx`.

Between them is `usePaymentMethods` and `derivePaymentMethods`: the methods
on file split into the `current` default and the `others`, each row with a
`label` — a key such as `paymentMethodsCardEndingIn` for the host to put words
to, or the text the provider supplied, a bank's name or a Link email — its
`last4`, and its short expiry, plus an `expiryWarning` when the default card
has fewer than four months left. The hook carries the writes beside the read,
`setDefault` and `remove`, each a promise that reloads the list on success and
rejects on failure, with `isMutating` while one is on the wire and
`mutationError` holding the last rejection.

`src/components/billing/PaymentMethodCard.tsx` lays that out the way the
embed does: a "Payment details" heading with the expiry warning beside it,
and one pill naming the default method with Edit on the right, or "No payment
method added yet" with Add. The pill offers no Remove: the server refuses to
remove the default while other methods exist, so a Remove there would fail
every time. Edit opens `src/components/billing/PaymentMethodDialog.tsx`, a
native `<dialog>` opened with `showModal()` so the browser owns the focus
trap, the backdrop, and Escape. It shows the pill again, and "Choose
different payment method" unfolds the other methods as rows — name, "Expires
8/27", Set default, and a remove control only where the server's `canRemove`
allows it — under a full-width "Add new payment method". The dialog disables
every action on `isMutating`, reports `mutationError` at its foot with a Try
again that re-runs that write, and a write that lands folds the rows away and
leaves the dialog on the refreshed method. Which rows can go is the server's
call; three rules hold:

- The default cannot be removed while other methods exist.
- The last method stays while a subscription is active.
- A method added through the form becomes the default, and nothing else is
  ever promoted: a list with no default shows an empty pill until someone
  picks, and every method is offered in the dialog.

"Add new payment method" swaps `src/components/billing/AddPaymentMethod.tsx`
into the dialog, with "Select existing payment method" beneath it as the way
back; with nothing on file the dialog opens straight onto the form, and
Cancel closes it. The form mints a setup intent with
`useSetupIntent().create()`, loads Stripe.js with the key the intent names
(Schematic's own key plus `stripeAccount` for a connected account, the
account's key otherwise), mounts Stripe's `PaymentElement` on the client
secret, and on Save confirms the setup in place; the saved method is then made
the default through the card's own `setDefault`, so a failure there lands at
the foot of the dialog like any other write. Stripe's fields render in an
iframe the app's CSS cannot reach, so the form hands Stripe an `appearance`
read off the palette in `globals.css` — the card, text, accent, and danger
colours, the radius, and the body font — with Stripe's night theme under the
dark one. `@stripe/stripe-js` is imported inside the form rather than at the
top of the module, because importing it starts loading Stripe.js from Stripe's
CDN, and `/billing` should not pay for that until someone opens the form.

`/account/billing` renders those three cards from the packaged
`<UpcomingBill>`, `<PaymentMethods>`, and `<Invoices>` instead, styled by
`<SchematicStyles />` — mounted once on the provider in
`src/components/ClientWrapper.tsx`. That is the packaged elements as a host
gets them out of the box, and the sheet follows the app's `color-scheme`, so
they track the theme toggle with nothing to wire up. `<PaymentMethods>` is
the same pill and dialog, lazy loads its Stripe form the same way and themes
it from its own tokens, and takes `allowEdit={false}` for a host that wants
the method on file with no way to change it and `showExpiration={false}` to
drop the warning. `src/app/account/billing/*.css` is the other way to do it:
a complete restyle through the documented class names, kept on disk and left
unimported so you can swap them in; `payment-methods.css` reaches the dialog,
its rows, the Add form, and the write error at its foot as well as the pill.
Copy is renamed by key — `strings={{ invoicesHeader: "Billing history" }}` — which is
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
- **`src/components/ui/`** — `Card`, `Button`, `Badge`. Variants (`size`,
  `tone`) own the properties a caller would otherwise fight over, so
  `className` is only used for layout.
- **`src/styles/palette.ts`** — the token subset the embedded components need.
  They are configured through props, not CSS, so they can't read the custom
  properties. `useEmbedSettings` translates this palette into `EmbedProvider`'s
  shape and re-derives on theme change, which is what keeps the embeds matching
  the rest of the app.

## Project layout

```
src/
  app/              routes; api/ holds the token + pins endpoints
  components/
    ui/             design-system primitives
  hooks/            useAccessToken, useEmbedSettings, …
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
