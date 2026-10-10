/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        input: "rgb(var(--c-input) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        text: "rgb(var(--c-text) / <alpha-value>)",
        subtle: "rgb(var(--c-subtle) / <alpha-value>)",
        faint: "rgb(var(--c-faint) / <alpha-value>)",
        hover: "rgb(var(--c-hover) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
