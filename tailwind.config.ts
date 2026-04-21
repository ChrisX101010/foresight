import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Foresight palette — "plasma on ink"
        ink: {
          900: '#0A0B0F',
          800: '#10121A',
          700: '#171A26',
          600: '#1F2335',
          500: '#2A2F45',
          400: '#3A4060',
        },
        plasma: {
          DEFAULT: '#C6FF3D',
          dim: '#A8DB2D',
          deep: '#6B8F15',
        },
        ember: '#FF5A2B',
        chalk: '#F4F1EA',
        fog: '#8A8FA8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 38s linear infinite',
        'flicker': 'flicker 2.4s infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-25%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '0.82' },
          '48%': { opacity: '1' },
          '52%': { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
