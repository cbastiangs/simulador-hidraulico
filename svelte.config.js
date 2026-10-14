import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Runes mode everywhere except dependencies: Svelte 4 syntax is a compile error.
    runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
  },
  kit: {
    // Every page is prerendered to plain files: no server, works offline.
    adapter: adapter(),
    alias: { $hydraulics: "src/hydraulics" },
  },
};
