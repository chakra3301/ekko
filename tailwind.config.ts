import type { Config } from 'tailwindcss';

// Tailwind CSS configuration
// Customize theme, plugins, and content paths
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Add custom color palette here
      },
      fontFamily: {
        // Add custom fonts here
      },
    },
  },
  plugins: [],
};

export default config;

