import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 4620,

    // ✅ Allowed hosts for production (Render domain etc.)
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "lead-management-frontend-5jes.onrender.com", // ✅ Add your Render frontend domain here
    ],
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
