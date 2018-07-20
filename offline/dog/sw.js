let cacheName = 'cache-sw';

self.addEventListener('install', function(event) {
  console.log("SW: install.");
  // Cache the files here.
  let filesToCache = [
    '.',
    'index.html',
    'image.jpg'
  ];

  event.waitUntil(caches.open(cacheName).then(function(cache) {
    return cache.addAll(filesToCache);
  }));
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
