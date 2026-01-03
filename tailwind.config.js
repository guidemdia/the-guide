/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Source Sans 3", "sans-serif"],   // UI, body text
        sans: ["EB Garamond", "serif"],          // Headings, essays
        reading: ["Merriweather", "serif"],      // Long-form articles
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
