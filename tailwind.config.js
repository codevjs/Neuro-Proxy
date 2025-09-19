import {heroui} from '@heroui/theme';

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './helpers/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        // fontFamily: {
        //     sans: ['font-sans'],
        // },
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)'],
            },
            screens: {
                tablet: '640px',
                // => @media (min-width: 640px) { ... }
                laptop: '1024px',
                // => @media (min-width: 1024px) { ... }
                desktop: '1280px',
                // => @media (min-width: 1280px) { ... }
            },
        },
    },
    darkMode: 'class',
    plugins: [
        heroui({
            themes: {
                dark: {
                    colors: {
                        primary: {
                            DEFAULT: '#19D5A5',
                            100: '#0A4037',
                            200: '#0E5A4A',
                            300: '#12745E',
                            400: '#15A67C',
                            500: '#19D5A5',
                            600: '#2DE0B4',
                            700: '#5FE7C5',
                            800: '#91EED6',
                            900: '#C3F5E7',
                        },
                        secondary: {
                            DEFAULT: '#10B981',
                            100: '#064E3B',
                            200: '#065F46',
                            300: '#047857',
                            400: '#059669',
                            500: '#10B981',
                            600: '#34D399',
                            700: '#6EE7B7',
                            800: '#A7F3D0',
                            900: '#D1FAE5',
                        },
                    },
                },
                light: {
                    colors: {
                        primary: {
                            DEFAULT: '#19D5A5',
                            100: '#C3F5E7',
                            200: '#91EED6',
                            300: '#5FE7C5',
                            400: '#2DE0B4',
                            500: '#19D5A5',
                            600: '#15A67C',
                            700: '#12745E',
                            800: '#0E5A4A',
                            900: '#0A4037',
                        },
                        secondary: {
                            DEFAULT: '#10B981',
                            100: '#064E3B',
                            200: '#065F46',
                            300: '#047857',
                            400: '#059669',
                            500: '#10B981',
                            600: '#34D399',
                            700: '#6EE7B7',
                            800: '#A7F3D0',
                            900: '#D1FAE5',
                        },
                    },
                },
            },
        }),
    ],
};
