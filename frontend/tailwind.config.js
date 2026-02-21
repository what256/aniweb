/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                premium: {
                    900: '#0f0f15',
                    800: '#1a1a24',
                    700: '#2b2b3a',
                    accent: '#6366f1',
                    accentHover: '#4f46e5'
                }
            }
        },
    },
    plugins: [],
}
