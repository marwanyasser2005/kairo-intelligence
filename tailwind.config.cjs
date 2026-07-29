/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        kairo: {
          green: '#2BD4A7',
          emerald: '#16A37C',
          ink: '#07110F',
          dark: '#07100E',
          card: '#0D1916',
          text: '#ECFDF8',
          dim: '#91A9A1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Tajawal', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Tajawal', 'system-ui', 'sans-serif'],
        cairo: ['Tajawal', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(43,212,167,.12), 0 24px 80px rgba(0,0,0,.28)',
        'glow-green': '0 18px 60px rgba(43,212,167,.18)',
      },
      animation: {
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3.6s ease-in-out infinite',
        'spin-slow': 'spin 18s linear infinite',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-14px,0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '.45', transform: 'scale(.96)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
};
