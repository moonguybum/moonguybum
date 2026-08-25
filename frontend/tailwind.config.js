/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        court: {
          green: '#2d6a4f',
          clay: '#c1440e',
        },
      },
    },
  },
  plugins: [],
}
