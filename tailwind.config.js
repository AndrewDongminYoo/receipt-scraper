/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f4ed',
        surface: '#fcfbf8',
        charcoal: '#1c1c1c',
        muted: '#5f5f5d',
        border: '#eceae4',
      },
      borderRadius: {
        btn: 6,
        card: 12,
        'card-lg': 16,
      },
    },
  },
  plugins: [],
};
