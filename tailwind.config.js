/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'theme-hacker',
    'theme-cyberpunk',
    'theme-synthwave',
    'theme-ghost'
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--bg-color)',
          fg: 'var(--text-color)',
          accent: 'var(--accent-color)',
          sys: 'var(--sys-color)'
        }
      }
    },
  },
  plugins: [],
}
