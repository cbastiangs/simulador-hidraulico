import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    // Every page is prerendered to plain files: no server, works offline.
    adapter: adapter(),
    alias: { $hydraulics: "src/hydraulics" },
  },
};
