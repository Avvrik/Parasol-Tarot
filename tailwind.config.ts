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
        // Parasol Brand Colors
        'brand-primary': '#81B29A',      // green/teal
        'brand-secondary': '#F2CC8F',     // light yellow/cream
        'brand-accent': '#3D405B',       // dark blue/navy
        'brand-highlight': '#E07A5F',    // coral/salmon
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #81B29A 0%, #F2CC8F 50%, #3D405B 100%)',
      },
      fontFamily: {
        'moche': ['Moche', 'sans-serif'],
        'rubik': ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

