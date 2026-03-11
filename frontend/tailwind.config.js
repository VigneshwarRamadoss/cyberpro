/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#040b14',
        surface: '#0a1628',
        card: '#11223e',
        'card-elevated': '#162e54',
        border: '#1f3c6c',
        primary: {
          DEFAULT: '#0077b6',
          hover: '#0096c7',
        },
        accent: '#00b4d8',
        'focus-ring': '#00b4d8',
        'text-primary': '#ffffff',
        'text-secondary': '#e0e0e0',
        'text-muted': '#a0aabc',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#00b4d8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        'h1': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body': ['0.875rem', { lineHeight: '1.375rem', fontWeight: '400' }],
        'small': ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }],
        'caption': ['0.6875rem', { lineHeight: '1rem', fontWeight: '400' }],
      },
      borderRadius: {
        'input': '10px',
        'card': '16px',
        'modal': '20px',
        'pill': '999px',
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-right': 'slideRight 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
};
