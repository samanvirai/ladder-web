/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'kollektif': ['Kollektif', 'sans-serif'],
      },
      colors: {
        // Ladder brand colors
        'brand-red': '#B80C09',
        'brand-orange': '#FF7F11',
        'brand-black': '#141301',
        'brand-yellow': '#FFF94F',
        'brand-white': '#FBFFFE',
      }
    },
  },
  plugins: [],
} 