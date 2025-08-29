/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

    theme: {
      extend: {
        colors: {
          'dark-1': '#09090a',
          'dark-2': '#1c1c1e',
          'dark-3': '#2a2a2e',
          'dark-4': '#3a3a3e',
          'light-1': '#f9f9f9',
          'light-4': '#a1a1aa',
          'primary-500': '#6366f1',
          red: '#ef4444',
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }