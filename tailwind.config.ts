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
        'primary': {
          '50': '#fbf5ff',
          '100': '#f6e7ff',
          '200': '#eed3ff',
          '300': '#e2b0ff',
          '400': '#d07eff',
          '500': '#be4dff',
          '600': '#a81ff2',
          '700': '#961ad6',
          '800': '#7e1bae',
          '900': '#68178c',
          '950': '#490368',
        },

        'gray': {
          '50': '#f6f6f6',
          '100': '#e7e7e7',
          '200': '#d1d1d1',
          '300': '#b0b0b0',
          '400': '#888888',
          '500': '#707070',
          '600': '#5d5d5d',
          '700': '#4f4f4f',
          '800': '#454545',
          '900': '#3d3d3d',
          '950': '#262626',
        },

        'success': {
          '50': '#f2fbf5',
          '100': '#e0f8e7',
          '200': '#c3efd1',
          '300': '#94e1ae',
          '400': '#57c97d',
          '500': '#37b060',
          '600': '#28914c',
          '700': '#23723e',
          '800': '#205b34',
          '900': '#1c4b2e',
          '950': '#0a2916',
        },

        'warning': {
          '50': '#fff1f1',
          '100': '#ffe0e0',
          '200': '#ffc6c6',
          '300': '#ff9f9f',
          '400': '#ff6767',
          '500': '#fc3737',
          '600': '#ea1f1f',
          '700': '#c51010',
          '800': '#a21212',
          '900': '#861616',
          '950': '#490606',
        },

      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'hero-pattern': "url('/public/static/images/background.svg')",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
