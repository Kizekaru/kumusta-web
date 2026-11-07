import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        brand: {
          purple: "#5003C0",
          magenta: "#AB03A9",
          rose: "#FF467A",
          yellow: "#FFD51E",
          black: "#0A0A0A",
        },
        accent: {
          emerald: "#10b981",
          teal: "#14b8a6",
          amber: "#f59e0b",
          rose: "#FF467A",
        }
      }
    },
  },
  plugins: [],
};
export default config;
