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
        forest: {
          900: '#0B1D15',
          800: '#0F291E', // Sidebar Xanh Rừng Sâu
          700: '#163D2D',
          600: '#1E523D',
          500: '#2A7255',
          100: '#E6F4EE',
          50: '#F0F9F5',
        },
        navy: {
          900: '#0f172a',
          800: '#1e3a8a',
          700: '#1d4ed8',
          600: '#2563eb',
          50: '#eff6ff',
        },
        amber: {
          DEFAULT: '#D97706', // Vàng Đồng
          gold: '#D97706',
          light: '#F59E0B',
          dark: '#B45309',
        },
        porcelain: '#F8FAFC', // Trắng Sứ
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 41, 30, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-amber': '0 0 20px -3px rgba(217, 119, 6, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.02)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
