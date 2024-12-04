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
          "primary": "#111827",
          "secondary": "#1f2937",
          "accent": "#4ade80",
          "neutral": "#6b7280",
          "base-100": "#111827",
          "info": "#006ec0",
          "success": "#69a900",
          "warning": "#ff8d00",
          "error": "#ff7b80",
        },
      },
    ],
  },
}