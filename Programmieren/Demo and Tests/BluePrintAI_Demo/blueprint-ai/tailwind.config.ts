import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
          light: '#60A5FA',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          light: '#F87171',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F3F4F6',
          dark: '#E5E7EB',
          light: '#F9FAFB',
          foreground: '#111827',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
