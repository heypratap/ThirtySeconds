/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#E43D12',
          rose: '#D6536D',
          blush: '#FFA2B6',
          gold: '#EFB11D',
          cream: '#EBE9E1',
          dark: '#161618',
          card: '#FFFFFF',
          cardDark: '#202024'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        dmsans: ['"DM Sans"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
