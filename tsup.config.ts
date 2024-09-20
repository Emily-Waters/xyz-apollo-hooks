import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts", "src/bin.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
});
