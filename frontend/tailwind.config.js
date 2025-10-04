/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // ← ЭТО КРИТИЧНО! Включаем dark mode через класс .dark
  theme: {
    extend: {},
  },
  plugins: [],
};
