/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'text-glow': 'text-glow 2s ease-in-out infinite alternate',
        'border-glow': 'border-glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'text-glow': {
          '0%': { textShadow: '0 0 5px #f97316, 0 0 10px #f97316, 0 0 15px #f97316' },
          '100%': { textShadow: '0 0 10px #f97316, 0 0 20px #f97316, 0 0 30px #f97316' },
        },
        'border-glow': {
          '0%': { borderColor: '#f97316', boxShadow: '0 0 5px #f97316' },
          '100%': { borderColor: '#ea580c', boxShadow: '0 0 10px #ea580c' },
        },
      },
    },
  },
  plugins: [],
}
