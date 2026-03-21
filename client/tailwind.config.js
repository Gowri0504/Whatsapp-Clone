/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          dark: "#0b141a",
          sidebar: "#111b21",
          header: "#202c33",
          sent: "#005c4b",
          received: "#202c33",
          green: "#00a884",
          gray: "#8696a0",
          light: "#d1d7db",
        }
      }
    },
  },
  plugins: [],
}
