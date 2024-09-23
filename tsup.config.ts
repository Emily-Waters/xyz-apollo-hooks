import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
});
