import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// Production builds ship no source maps: they would publish the readable
// source. `vite dev` always has them. SOURCEMAPS=1 opts a local build in;
// it is ignored on Vercel, so a stray variable can't publish them.
const sourcemap = process.env.SOURCEMAPS === "1" && !process.env.VERCEL;

export default defineConfig({ plugins: [sveltekit()], build: { sourcemap } });
