// Velocity Relay service worker — network-first shell + Web Push.
// Network-first on navigation so the app is ALWAYS the latest build (no stale UI);
// falls back to the last good copy only when offline. Push works app-closed.
var SHELL = 'vr-shell-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).then(function (resp) {
        try { var c = resp.clone(); caches.open(SHELL).then(function (cache) { cache.put('shell', c); }); } catch (_) {}
        return resp;
      }).catch(function () {
        return caches.open(SHELL).then(function (cache) { return cache.match('shell'); });
      })
    );
    return;
  }
  /* everything else: pass-through to the network */
});

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { try { d = { body: e.data.text() }; } catch (_2) { d = {}; } }
  var title = d.title || 'Velocity Relay';
  var opts = {
    body: d.body || '',
    tag: d.tag || 'vr',
    renotify: true,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { ticket_id: d.ticket_id || null, url: d.url || ('./index.html' + (d.ticket_id ? ('?t=' + d.ticket_id) : '')) },
    vibrate: [60, 30, 60]
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cls) {
      for (var i = 0; i < cls.length; i++) {
        var c = cls[i];
        if ('focus' in c) { try { c.navigate && c.navigate(target); } catch (_) {} return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
