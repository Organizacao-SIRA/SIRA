/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Esta linha é crucial!
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1351B4',
          dark: '#003157',
          darker: '#002244',
          light: '#F2F5FD',
        },
        accent: {
          DEFAULT: '#FFCD07',
          light: '#FFF4CC',
          dark: '#8A6D00',
        },
        success: {
          DEFAULT: '#00A859',
        },
      },
    },
  },
  plugins: [],
}