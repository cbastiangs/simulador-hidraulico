// Built at build time (adapter-static) as an empty shell: the app is static files.
// No server render: without a screen the page would lay out at the wrong size and
// snap once the scripts ran; app.html shows a splash until the app mounts instead.
export const prerender = true;
export const ssr = false;
