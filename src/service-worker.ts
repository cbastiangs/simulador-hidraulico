/// <reference lib="webworker" />
import { build, files, prerendered, version } from "$service-worker";

const worker = self as unknown as ServiceWorkerGlobalScope;
const prefix = `simulador:${worker.registration.scope}:`;
const cacheName = `${prefix}${version}`;
const assets = [...new Set([...build, ...files, ...prerendered])];
const assetPaths = new Set(assets.map(path => new URL(path, worker.location.origin).pathname));

worker.addEventListener("install", event => {
  // Activation only follows a complete cache. Keep the old worker until its
  // open pages close, so an update cannot mix two versions of the app.
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});
worker.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(prefix) && key !== cacheName) await caches.delete(key);
    await worker.clients.claim();
  })());
});
worker.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== worker.location.origin || !assetPaths.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const saved = await cache.match(url.pathname);
    return saved ?? fetch(request);
  })());
});
