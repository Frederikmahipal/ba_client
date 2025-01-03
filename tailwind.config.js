/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#1DB954",
          "secondary": "#282828",
          "accent": "#1DB954",
          "neutral": "#B3B3B3",
          "base-100": "#121212",
          "base-200": "#181818",
          "base-300": "#282828",
          "info": "#2E77D0",
          "success": "#1DB954",
          "warning": "#F59B23",
          "error": "#E91429",
        },
      },
    ],
  },
}