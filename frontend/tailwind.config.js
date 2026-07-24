/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#020617',
        foreground: '#F8FAFC',
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
          dark: '#1E3A8A',
          light: '#3B82F6',
        },
        accent: {
          DEFAULT: '#38BDF8',
          foreground: '#020617',
        },
        muted: {
          DEFAULT: '#1E293B',
          foreground: '#94A3B8',
        },
        card: {
          DEFAULT: 'rgba(15, 23, 42, 0.65)',
          foreground: '#F8FAFC',
          border: 'rgba(255, 255, 255, 0.08)',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 25px -5px rgba(56, 189, 248, 0.3)',
        'glow-primary': '0 0 30px -5px rgba(37, 99, 235, 0.4)',
      },
      backdropBlur: {
        glass: '16px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
