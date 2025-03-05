import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
