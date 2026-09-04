import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves this repo from https://<user>.github.io/between-us/.
// Absolute, not "./": iOS resolves a Home Screen app's launch URL itself, and
// relative asset paths break if it lands on any path but the exact index.
// Keep in sync with start_url/scope in public/manifest.webmanifest.
const BASE = "/between-us/";

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
  // Resolves the "@/*" alias from tsconfig.json rather than duplicating it here.
  resolve: { tsconfigPaths: true },
  server: { port: 8080 },
});
