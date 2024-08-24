import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        realOrange: "#dc7633",
        darkGray: "#242424",
      },
      backgroundImage: {
        radio: "url('/backgrounds/image.jpg')",
      },
    },
  },
  plugins: [],
};
export default config;
