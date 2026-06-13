import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Electric violet → the motion-forward accent
        brand: {
          50: "#f3f0ff",
          100: "#e9e3ff",
          200: "#d6caff",
          300: "#b9a3ff",
          400: "#9a73ff",
          500: "#7c4dff",
          600: "#6a2ff0",
          700: "#5a22d6",
          800: "#4a1cad",
          900: "#3e1c88",
          950: "#26104f",
        },
        // Near-black UI surfaces
        night: {
          950: "#070709",
          900: "#0b0b11",
          850: "#101018",
          800: "#15151f",
          700: "#1c1c28",
          600: "#272736",
          500: "#3a3a4d",
        },
        // Legacy neutral (kept so the global reskin can remap it)
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
        cream: { 50: "#fdfbf7", 100: "#faf6ee", 200: "#f3ebdd", 300: "#e9ddc9" },
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
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(0,0,0,0.5)",
        lift: "0 20px 60px -18px rgba(124,77,255,0.45)",
        glow: "0 0 0 1px rgba(124,77,255,0.4), 0 12px 40px -8px rgba(124,77,255,0.55)",
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem", "3xl": "1.75rem" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate(0,0) scale(1)", opacity: "0.7" },
          "33%": { transform: "translate(8%,-6%) scale(1.15)", opacity: "0.9" },
          "66%": { transform: "translate(-6%,8%) scale(0.95)", opacity: "0.6" },
        },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer: { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.7)", opacity: "0" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        aurora: "aurora 20s ease-in-out infinite",
        marquee: "marquee 36s linear infinite",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
