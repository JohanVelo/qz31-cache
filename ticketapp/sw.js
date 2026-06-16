// Velocity Relay service worker — minimal/pass-through.
// Exists only to make the app installable as a standalone PWA. It does NOT cache
// the app shell (so updates are always fresh; no stale-app issues inside Telegram).
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) { /* pass-through: let the network handle it */ });
