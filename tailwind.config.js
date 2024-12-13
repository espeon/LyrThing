/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      'sans': ['DM Sans', 'sans-serif'],
      'mono': ['IBM Plex Mono', 'monospace'],
      'serif': ['DM Serif Display', 'serif'],
    }
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}

