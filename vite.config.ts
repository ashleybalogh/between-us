import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Relative asset URLs. GitHub Pages serves a project repo from /<repo>/, and
  // "./" keeps the build correct there without hardcoding the repo name, so
  // renaming the repo (or moving to a custom domain) needs no config change.
  base: "./",
  plugins: [react(), tailwindcss()],
  // Resolves the "@/*" alias from tsconfig.json rather than duplicating it here.
  resolve: { tsconfigPaths: true },
  server: { port: 8080 },
});
