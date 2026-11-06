import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wingmall Primary Color — Wing Iconic Gold / Yellow (#ffcc00 / #fc0)
        primary: {
          DEFAULT: '#ffcc00',
          50: '#fefce8',
          100: '#fffbeb',
          200: '#fff4c2',
          300: '#ffe885',
          400: '#fac800',
          500: '#ffcc00',
          600: '#e6b800',
          700: '#cd8900',
          800: '#b96409',
          900: '#8f4b00',
          foreground: '#04172a',
          muted: '#ffcc0080',
        },

        // Wingmall Secondary Color — Wing Deep Royal Blue (#003494)
        secondary: {
          DEFAULT: '#003494',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#3080ff',
          500: '#155dfc',
          600: '#003494',
          700: '#002a7a',
          800: '#002060',
          900: '#001642',
          950: '#000d2b',
          foreground: '#ffffff',
          silver: '#827d7d',
        },

        // Wing Corporate Brand (Deep Blue base with Lime accent)
        brand: {
          DEFAULT: '#003494',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#3080ff',
          500: '#155dfc',
          600: '#003494',
          700: '#002a7a',
          800: '#002060',
          900: '#001642',
          // Wing Lime Accent (#a9cc38)
          lime: {
            DEFAULT: '#a9cc38',
            50: '#f7fbe8',
            100: '#eef8c6',
            200: '#dff293',
            300: '#cce956',
            400: '#b7dc2b',
            500: '#a9cc38',
            600: '#8aa828',
            700: '#6a8321',
            800: '#4f611d',
            900: '#374317',
            muted: '#a9cc382e',
          },
        },

        // Wing Direct Palette Tokens (from shop.wingmall.com)
        wing: {
          yellow: '#ffcc00',
          blue: '#003494',
          lime: '#a9cc38',
          dark: '#04172a',
          lightBlue: '#5957d6',
          golden: '#fab62e',
          robin: '#00c7bd',
          orange: '#ff9500',
        },

        // Wingmall Semantic & Surface Tokens
        wingmall: {
          background: '#ffffff',
          foreground: '#04172a',
          card: '#ffffff',
          cardForeground: '#0c0a09',
          muted: '#f5f5f4',
          mutedForeground: '#606d85',
          mutedForegroundReverse: '#d7dae4',
          accent: '#f2f3f7',
          accentForeground: '#04172a',
          accentSaturated: '#a6b2c4',
          border: '#ebedef',
          input: '#ebedef',
          ring: '#0077ff',
          success: '#10b77f',
          warning: '#fbbd23',
          destructive: '#f21818',
          info: '#3c83f6',
        },
      },
      fontFamily: {
        sans: [
          'Poppins',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        poppins: ['Poppins', 'Inter', 'sans-serif'],
        khmer: ['"Kantumruy Pro"', '"Noto Sans Khmer"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
