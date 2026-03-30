/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        muli: ['Muli', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        'manzur-primary': '#0669b3',
        'manzur-secondary': '#368aca',
      },
    },
  },
  plugins: [],
}