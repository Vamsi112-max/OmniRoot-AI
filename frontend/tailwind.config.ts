import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./hooks/**/*.{ts,tsx,js,jsx,mdx}",
    "./lib/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        omni: "0 0 22px rgba(34, 211, 238, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

