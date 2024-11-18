import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        text: '#05022c',
        backgroundColor: '#f0effa',
        primary: '#2f27ce',
        secondary: '#e7e6ef',
        accent: '#65009c',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'hero-pattern': "url('/public/static/images/background.svg')",
      },
      boxShadow: {
        around: '0px 0px 10px 0px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
