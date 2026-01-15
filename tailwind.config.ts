import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                accent: {
                    gold: "#D4AF37",
                    "gold-bright": "#F9E076",
                    dark: "#0a0a0a",
                },
            },
            backgroundImage: {
                "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #F9E076 100%)",
            },
        },
    },
    plugins: [],
};
export default config;
