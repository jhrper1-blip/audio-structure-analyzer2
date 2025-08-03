/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
    extend: {
      colors: {
        strooq: {
          primary: '#00D0FF',
          accent: '#FF00A8',
          bg: '#0F111A',
          light: '#F5F7FA'
        }
      }
    }
  },
  plugins: [],
}