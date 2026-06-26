/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8FB',
        pearl: '#FFF4F8',
        blush: {
          50: '#FFF0F5',
          100: '#FFE0EC',
          200: '#FFCFE0',
          300: '#FFB6CD',
        },
        pink: {
          400: '#FF9ABA',
          500: '#FF6FA5',
          600: '#E85D8E',
        },
        ink: {
          300: '#D9C2C9',
          500: '#A98A93',
          700: '#6B4A52',
          900: '#4A2C35',
        },
      },
      fontFamily: {
        display: ['Comfortaa', 'system-ui', 'sans-serif'],
        body: ['Onest', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      borderRadius: {
        xl: '28px',
        '2xl': '36px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(74, 44, 53, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        glow: '0 0 24px rgba(255, 111, 165, 0.35)',
        soft: '0 6px 20px rgba(255, 111, 165, 0.12)',
      },
        animation: {
          float: 'float 6s ease-in-out infinite',
          pulseHeart: 'pulseHeart 1.5s ease-in-out infinite',
          shake: 'shake 0.4s ease-in-out',
          slideDown: 'slideDown 0.35s ease-out',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          pulseHeart: {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.08)' },
          },
          shake: {
            '0%, 100%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-8px)' },
            '75%': { transform: 'translateX(8px)' },
          },
          slideDown: {
            '0%': { opacity: '0', transform: 'translateY(-16px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
    },
  },
  plugins: [],
}
