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
        background: '#F2F2F2',
        navy: {
          DEFAULT: '#111844',
          50: '#F4F5F9',
          100: '#E4E6F1',
          200: '#C2C7DF',
          300: '#949DC6',
          400: '#6773AC',
          500: '#4B5694',
          600: '#343E78',
          700: '#232B5B',
          800: '#171E4B',
          900: '#111844',
          950: '#0B0F2B',
        },
        brand: {
          DEFAULT: '#4B5694',
          hover: '#3D477C',
          light: '#EEF0FA',
        },
      },
      boxShadow: {
        '3d': '0 10px 30px -10px rgba(17, 24, 68, 0.12), 0 4px 6px -2px rgba(17, 24, 68, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
        '3d-hover': '0 20px 40px -12px rgba(17, 24, 68, 0.22), 0 8px 12px -4px rgba(17, 24, 68, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)',
        'card-glow': '0 0 0 1px rgba(17, 24, 68, 0.08), 0 8px 24px -4px rgba(75, 86, 148, 0.12)',
        'pill-glow': '0 2px 10px rgba(75, 86, 148, 0.35)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite linear',
      }
    },
  },
  plugins: [],
}
