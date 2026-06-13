import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand: deep wine / maroon — the Akwaaba-style warm, premium accent
        brand: {
          50: "#fcf4f5",
          100: "#f8e6e9",
          200: "#f0ccd3",
          300: "#e2a3b0",
          400: "#cf6f82",
          500: "#b94a60",
          600: "#9d3349",
          700: "#7e2239",
          800: "#681c30",
          900: "#571a2a",
          950: "#310d17",
        },
        // Accent: maple — energy, warmth, the unmistakable Canadian mark
        maple: {
          50: "#fef3f2",
          100: "#fee4e2",
          200: "#fecdc9",
          300: "#fcaaa3",
          400: "#f77a6e",
          500: "#ee5140",
          600: "#db3522",
          700: "#b82819",
          800: "#982419",
          900: "#7e241c",
          950: "#450d09",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d4d9e2",
          300: "#aeb8c9",
          400: "#8292ab",
          500: "#617291",
          600: "#4d5b78",
          700: "#404a62",
          800: "#384053",
          900: "#1f2530",
          950: "#141821",
        },
        cream: {
          50: "#fdfbf7",
          100: "#faf6ee",
          200: "#f3ebdd",
          300: "#e9ddc9",
        },
        wine: {
          600: "#7c1f3d",
          700: "#5f152c",
          800: "#4a1023",
          900: "#380b1b",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(20, 24, 33, 0.08), 0 6px 24px -8px rgba(20, 24, 33, 0.12)",
        lift: "0 12px 40px -12px rgba(6, 118, 92, 0.28)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
