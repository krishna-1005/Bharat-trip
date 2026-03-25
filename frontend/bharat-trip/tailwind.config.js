/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#020617',
          blue: '#0a192f',
        },
        accent: {
          blue: '#3b82f6',
        }
      },
      borderRadius: {
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
