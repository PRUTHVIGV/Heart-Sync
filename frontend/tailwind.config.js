/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF4458",
        secondary: "#FF6B6B",
        accent: "#a855f7",
        dark: "#0d0d1a",
        card: "#13131f",
        card2: "#1a1a2e",
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #FF4458 0%, #a855f7 100%)",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s infinite",
      },
    },
  },
  plugins: [],
};
