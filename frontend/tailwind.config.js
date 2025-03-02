/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        near: {
          primary: '#5f8aea',
          secondary: '#4a7dfa',
          dark: '#2b4993',
          light: '#eef3ff',
        },
        sentiment: {
          positive: '#10b981',
          neutral: '#6b7280',
          negative: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 