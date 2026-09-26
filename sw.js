// Service worker de Puestos Fronterizos: recibe y muestra las notificaciones push.
// Va en la raíz del sitio, junto a index.html.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Puestos Fronterizos', body: e.data ? e.data.text() : '' }; }
  const destino = d.tipo === 'recordatorio' ? 'recordatorio' : (d.control || '');
  e.waitUntil(self.registration.showNotification(d.title || 'Puestos Fronterizos', {
    body: d.body || '',
    icon: 'icono.png',
    badge: 'icono.png',
    tag: d.control || d.tipo || 'aviso',
    renotify: true,
    data: { destino }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = (e.notification.data && e.notification.data.destino) || '';
  const url = new URL('./', self.registration.scope);
  if (destino) url.searchParams.set('abrir', destino);
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) {
        w.postMessage({ abrir: destino });
        return w.focus();
      }
    }
    return self.clients.openWindow(url.href);
  })());
});
