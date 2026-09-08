"use client";

import { type EmbedSettings } from "@schematichq/schematic-components";
import { useMemo } from "react";

import { useTheme } from "@/components/ThemeProvider";
import {
  BODY_FONT,
  CARD_PADDING,
  CARD_RADIUS,
  DISPLAY_FONT,
  HEADING_FONT,
  PALETTE,
} from "@/styles/palette";
import { type DeepPartial } from "@/types";

export const useEmbedSettings = (): DeepPartial<EmbedSettings> => {
  // `null` until the client resolves the preference; light is the SSR default.
  const { theme } = useTheme();
  const colorMode = theme ?? "light";

  return useMemo(() => {
    const palette = PALETTE[colorMode];

    return {
      theme: {
        colorMode,
        numberOfColumns: 1,
        primary: palette.accent,
        secondary: palette.accent,
        danger: palette.danger,
        card: {
          background: palette.card,
          borderRadius: CARD_RADIUS,
          hasShadow: true,
          padding: CARD_PADDING,
        },
        typography: {
          heading1: {
            color: palette.fg,
            fontFamily: DISPLAY_FONT,
            fontSize: 37,
            fontWeight: 400,
          },
          heading2: {
            color: palette.fg,
            fontFamily: DISPLAY_FONT,
            fontSize: 29,
            fontWeight: 200,
          },
          heading3: {
            color: palette.fg,
            fontFamily: HEADING_FONT,
            fontSize: 20,
            fontWeight: 600,
          },
          heading4: {
            color: palette.fg,
            fontFamily: HEADING_FONT,
            fontSize: 18,
            fontWeight: 800,
          },
          heading5: {
            color: palette.fg,
            fontFamily: BODY_FONT,
            fontSize: 17,
            fontWeight: 500,
          },
          heading6: {
            color: palette.mutedFg,
            fontFamily: BODY_FONT,
            fontSize: 14,
            fontWeight: 400,
          },
          text: {
            color: palette.fg,
            fontFamily: BODY_FONT,
            fontSize: 16,
            fontWeight: 400,
          },
          link: {
            color: palette.accent,
            fontFamily: DISPLAY_FONT,
            fontSize: 16,
            fontWeight: 400,
          },
        },
      },
    };
  }, [colorMode]);
};

export default useEmbedSettings;
