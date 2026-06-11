import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0E1A",
          secondary: "#111827",
          elevated: "#1A1F35",
        },
        brand: {
          cyan: "#00B4D8",
        },
        accent: {
          purple: "#7B2FBE",
          green: "#06D6A0",
          orange: "#FF6B35",
          red: "#EF4444",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
          muted: "#475569",
        },
        border: "#1E2B45",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
