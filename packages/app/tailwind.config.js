/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Space Mono', 'monospace'],
        'mono': ['Space Mono', 'monospace'],
        'barcode': ['Libre Barcode 128', 'monospace'],
      },
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        lottery: {
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.6)',
        'glow-violet': '0 0 25px rgba(139, 92, 246, 0.5)',
        'glow-gold': '0 0 30px rgba(255, 215, 0, 0.6)',
      }
    },
  },
  plugins: [],
}