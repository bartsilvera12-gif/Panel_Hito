import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        azul: '#002A3B',
        cian: '#2CC3EF',
        'cian-hover': '#7FDCF7',
        claro: '#F4F7F8',
        gris: '#61717A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
