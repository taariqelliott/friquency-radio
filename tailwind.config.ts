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
        realBlue: "#dc7633",
      },
      backgroundImage: {
        radio: "url('/backgrounds/image.jpg')",
      },
    },
  },
  plugins: [],
};
export default config;
