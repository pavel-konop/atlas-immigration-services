import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        atlas: {
          navy: "#071d3a",
          midnight: "#06162d",
          blue: "#12365f",
          ink: "#102136",
          gold: "#d9a528",
          amber: "#f0bd3c",
          cream: "#fffaf0",
          mist: "#eef4f8",
          line: "#d8e0e8"
        }
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Georgia", "Iowan Old Style", "ui-serif", "serif"]
      },
      spacing: {
        18: "4.5rem"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(7, 29, 58, 0.12)",
        gold: "0 18px 40px rgba(217, 165, 40, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
