/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './extension/**/*.{html,tsx,ts,jsx,js}',
  ],
  theme: {
    extend: {
      colors: {
        'tabnova': {
          black:  '#000000',
          blue:   '#3B82F6',
          pink:   '#EC4899',
          yellow: '#FBBF24',
          green:  '#10B981',
          purple: '#8B5CF6',
          cyan:   '#06B6D4',
          orange: '#F97316',
          indigo: '#6366F1',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'explosion': 'explosion 800ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        explosion: {
          from: { opacity: '0', transform: 'scale(0)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
