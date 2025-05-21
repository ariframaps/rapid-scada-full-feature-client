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
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // hapus '/api' biar path asli dipake
      },
    },
    allowedHosts: [
      "e5e7-2001-448a-c020-5e9-844d-1f45-c6e7-872c.ngrok-free.app",
    ],
  },
});
