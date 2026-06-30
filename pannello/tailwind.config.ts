import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#C0492C", dark: "#A23A20", 50: "#FBF1ED", 100: "#F4DED6" },
        ink: "#1a1410",
        paper: "#faf8f5",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,20,16,0.04), 0 2px 8px rgba(26,20,16,0.05)",
        hover: "0 6px 20px rgba(26,20,16,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
