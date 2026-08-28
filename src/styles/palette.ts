/*
  The subset of globals.css tokens that the Schematic embeds need.

  Schematic embeds are configured through props rather than CSS, so they
  cannot read the custom properties in globals.css. This module mirrors those
  values once and `useEmbedSettings` translates it into the vendor's shape.
  Change a colour in globals.css and change it here too.

  The dark values are the original embed theme (cyan #2bbde1 on #0e0e0e
  cards, white text, #d1d1d1 secondary); light is the readable counterpart.
*/
export const PALETTE = {
  light: {
    accent: "#0d7e9c",
    card: "#ffffff",
    danger: "#e5484d",
    fg: "#141414",
    mutedFg: "#5c5c5c",
  },
  dark: {
    accent: "#2bbde1",
    card: "#0e0e0e",
    danger: "#ff6b6e",
    fg: "#ffffff",
    mutedFg: "#d1d1d1",
  },
} as const;

/** Matches the --display / --heading / --body families loaded in layout.tsx. */
export const DISPLAY_FONT = "Inter";
export const HEADING_FONT = "Manrope";
export const BODY_FONT = "Public Sans";

/** `--r: 10px`, and the `p-11.25` / shadow on the Card primitive. */
export const CARD_RADIUS = 10;
export const CARD_PADDING = 45;
