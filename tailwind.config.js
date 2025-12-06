/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                main: '#0a1929',
                card: '#0f2137',
                input: '#1a2f45',
                primary: {
                    DEFAULT: '#0066A1',
                    hover: '#005082',
                    light: '#1a7bb8',
                },
                secondary: {
                    DEFAULT: '#FDB913',
                    hover: '#e5a610',
                    light: '#fec645',
                },
                positive: {
                    DEFAULT: '#00d68f',
                    hover: '#00b377',
                },
                negative: {
                    DEFAULT: '#f87171',
                    hover: '#ef4444',
                },
                info: {
                    DEFAULT: '#0066A1',
                    hover: '#005082',
                },
                textPrimary: '#f0f4f8',
                textSecondary: '#9ca3af',
                glass: 'rgba(0, 102, 161, 0.25)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(0, 102, 161, 0.3)',
            }
        },
    },
    plugins: [],
}
