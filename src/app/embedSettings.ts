import { type EmbedSettings } from "@schematichq/schematic-components";

import { type DeepPartial } from "@/types";

export const embedSettings: DeepPartial<EmbedSettings> = {
  theme: {
    numberOfColumns: 1,
    colorMode: "dark",
    primary: "#2bbde1",
    secondary: "#2bbde1",
    card: {
      background: "#0e0e0e",
      borderRadius: 10,
      hasShadow: true,
      padding: 45,
    },
    typography: {
      heading1: {
        fontFamily: "Inter",
        fontSize: 37,
        fontWeight: 400,
        color: "#ffffff",
      },
      heading2: {
        fontFamily: "Inter",
        fontSize: 29,
        fontWeight: 200,
        color: "#ffffff",
      },
      heading3: {
        fontFamily: "Manrope",
        fontSize: 20,
        fontWeight: 600,
        color: "#ffffff",
      },
      heading4: {
        fontFamily: "Manrope",
        fontSize: 18,
        fontWeight: 800,
        color: "#ffffff",
      },
      heading5: {
        fontFamily: "Public Sans",
        fontSize: 17,
        fontWeight: 500,
        color: "#ffffff",
      },
      heading6: {
        fontFamily: "Public Sans",
        fontSize: 14,
        fontWeight: 400,
        color: "#d1d1d1",
      },
      text: {
        fontFamily: "Public Sans",
        fontSize: 16,
        fontWeight: 400,
        color: "#ffffff",
      },
      link: {
        fontFamily: "Inter",
        fontSize: 16,
        fontWeight: 400,
        color: "#2bbde1",
      },
    },
  },
};
