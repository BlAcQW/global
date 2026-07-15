import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

/**
 * Type stack (PRD §11):
 *   - Space Grotesk → display / wordmark
 *   - IBM Plex Mono → HUD coordinate readout (the instrument signature)
 *
 * Both exist on Google Fonts, so the build stays dependency-free. The CSS vars
 * (--font-display / --font-mono) are the swap point — replace with next/font/local
 * and nothing downstream changes.
 */
export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontMono.variable}`;
