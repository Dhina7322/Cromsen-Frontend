/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2497cc',
          DEFAULT: '#162d3a', 
          dark: '#0e1e27',
        },
        action: '#2497cc', // Bright blue
        accent: '#2497cc', // We'll just use the same blue for accent to avoid orange
        secondary: '#f9f9f9',
        neutral: {
          soft: '#fdfdfd',
          base: '#f5f5f4',
          dark: '#2f2f2f'
        }
      },
      fontFamily: {
        brand: ['Cinzel', 'serif'],
        serif: ['Lora', 'serif'],
        sans: ['Questrial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
