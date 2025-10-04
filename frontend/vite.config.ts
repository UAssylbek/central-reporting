import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // ✅ React должен быть первым
    tailwindcss(), // ✅ Tailwind вторым
  ],
  server: {
    port: 3000,
    open: true,
  },
});
