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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        lottery: {
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(14, 165, 233, 0.5)',
        'glow-gold': '0 0 30px rgba(255, 215, 0, 0.6)',
      }
    },
  },
  plugins: [],
}