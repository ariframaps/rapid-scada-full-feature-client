import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    proxy: {
      "/api": {
        target:
          "https://rapid-scada-full-feature-server-production.up.railway.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // hapus '/api' biar path asli dipake
      },
    },
    allowedHosts: ["rapid-scada-full-feature-client-production.up.railway.app"],
  },
});
