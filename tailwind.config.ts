import type { Config } from "tailwindcss";

/**
 * Tailwind reads its palette from CSS custom properties defined in
 * app/globals.css. This keeps the FlagGlobe palette swappable in one place (and
 * overridable per-instance via the `theme` prop) while component code stays
 * palette-agnostic.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--globe-bg)",
        ocean: "var(--globe-ocean)",
        land: "var(--globe-land)",
        accent: "var(--globe-accent)",
        ink: "var(--globe-ink)",
        muted: "var(--globe-muted)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
