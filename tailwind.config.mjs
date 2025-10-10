/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'pfc-black': '#111111',
        'pfc-red': '#E63946',
        'pfc-white': '#FFFFFF',
        'pfc-gray-light': '#F1F1F1',
        'pfc-gray': '#A9A9A9',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

