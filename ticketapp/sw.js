// Velocity Relay service worker — pass-through + Web Push.
// Does NOT cache the app shell (updates always fresh). It DOES handle push so
// notifications arrive even when the app/tab is fully closed.
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) { /* pass-through: let the network handle it */ });

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
    data: { ticket_id: d.ticket_id || null, url: './index.html' + (d.ticket_id ? ('?t=' + d.ticket_id) : '') },
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
