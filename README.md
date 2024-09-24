This is an example app demonstrating how to use [Schematic](https://schematichq.com) in a Next.js app with Clerk authentication.

## Prerequisites

In order to use this example app, you'll need:

1. A Schematic account - this example app assumes a Schematic account with several flags set up (`weather-search`, `humidity`, and `wind-speed`
2. A Clerk account

In order to make full use of the capabilities of Schematic components, you'll also need:

1. A Stripe account
2. Stripe customer IDs stored in private metadata on your Clerk companies

## Getting Started

1. Set up your Schematic account; add features for "Weather Search", "Humidity", and "Wind Speed", create some plans and entitlements for these features, connect your Stripe account, and connect your Clerk account.

2. Set up your `.env` file:

```bash
cp .env.example .env
```

3. In the [Schematic app](https://app.schematichq.com), create a component and store its component ID in your `.env` file:

```bash
NEXT_PUBLIC_SCHEMATIC_COMPONENT_ID="your-component-id"
```

4. In the [Schematic app](https://app.schematichq.com), create a new API key and store both the publishable key and secret in your `.env` file:

```bash
NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY="api_"
SCHEMATIC_SECRET_KEY="sch_dev_"
```

5. Store your Clerk secret and publishable keys in your .env file:

```bash
CLERK_SECRET_KEY="sk_test_"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_"
```

6. Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

7. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

8. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
