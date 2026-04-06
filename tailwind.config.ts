import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#FFBC0D",
        crimson: "#DA291C",
        onyx: "#1A1A1C",
        surface: "#2A2A2C",
        card: "#333336",
        cream: "#FDFDFB",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
