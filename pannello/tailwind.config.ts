import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#B15C43", dark: "#964A34", 50: "#FAF2EE", 100: "#F0DED6" },
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        black: "rgb(var(--black-rgb) / <alpha-value>)",
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
