let cacheName = 'cache-sw';

self.addEventListener('install', function(event) {
  console.log("SW: install.");

  event.waitUntil(caches.delete(cacheName));
});

self.addEventListener('activate', function(event) {
  console.log("SW: activate.");
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

