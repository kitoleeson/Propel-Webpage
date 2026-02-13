import type { Config } from "tailwindcss";

const config: Config = {
  content: [ "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}" ],
  theme: {
    extend: {
      colors: {
        primary: "var(--colour-primary)",
        "primary-hover": "var(--colour-primary-hover)",
        accent: "var(--colour-accent)",
        background: "var(--colour-background)",
        text: "var(--colour-text)",
      },
      fontFamily: { body: ["var(--font-body)", "sans-serif"], heading: ["var(--font-heading)", "sans-serif"] },
      fontSize: {
        body: "var(--text-body)",
        small: "var(--text-small)",
        h1: "var(--text-h1)",
        h2: "var(--text-h2)",
      },
    },
  },
  plugins: [],
};

export default config;