importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  const { precacheAndRoute } = workbox.precaching;
  const { registerRoute, setCatchHandler } = workbox.routing;
  const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;

  // Precache the essential app shell files for an instant offline experience.
  precacheAndRoute([
    { url: '/index.html', revision: null },
    { url: '/offline.html', revision: null },
    { url: '/manifest.json', revision: null },
  ]);

  // Use a NetworkFirst strategy for navigation requests.
  // This ensures users always get the latest content if they are online.
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
      cacheName: 'pages',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [200],
        }),
      ],
    })
  );
  
  // Set a global catch handler to provide the offline fallback page for failed navigations.
  setCatchHandler(({ event }) => {
    if (event.request.destination === 'document') {
      return caches.match('/offline.html');
    }
    return Response.error();
  });

  // Cache JavaScript and CSS files with a Stale-While-Revalidate strategy.
  // This provides assets quickly from the cache while updating them in the background.
  registerRoute(
    ({ request }) =>
      request.destination === 'script' || request.destination === 'style',
    new StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

  // Cache images with a CacheFirst strategy and an expiration policy.
  // This is ideal for images that don't change often.
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100, // Max number of images to cache
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          purgeOnQuotaError: true, // Automatically clean up if storage is full
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200], // Cache opaque responses (for CORS images)
        }),
      ],
    })
  );
  
  // Cache Google Fonts stylesheets with Stale-While-Revalidate.
  registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Cache Google Fonts webfont files with CacheFirst for a year.
  registerRoute(
    ({url}) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
          maxEntries: 30,
        }),
      ],
    })
  );

  // This message listener allows the new service worker to take control immediately.
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  // --- PWA Feature Listeners ---

  // Background Sync: Listens for the 'sync' event.
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-booking-request') {
      console.log('Service Worker: Background sync event for booking request received.');
      event.waitUntil(
        new Promise((resolve, reject) => {
            console.log("Background Sync: Pretending to sync data...");
            setTimeout(resolve, 2000);
        })
      );
    }
  });

  // Periodic Sync: Listens for the 'periodicsync' event.
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'get-latest-specials') {
      console.log('Service Worker: Periodic sync event for specials received.');
      event.waitUntil(
        new Promise((resolve, reject) => {
            console.log("Periodic Sync: Pretending to fetch latest specials...");
            setTimeout(resolve, 2000);
        })
      );
    }
  });

  // Push Notifications: Handles incoming push messages.
  self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Bos Salon', body: 'You have a new message!' };
    const title = data.title;
    const options = {
      body: data.body,
      icon: 'https://i.ibb.co/gLSThX4v/unnamed-removebg-preview.png',
      badge: 'https://i.ibb.co/gLSThX4v/unnamed-removebg-preview.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });

  // Push Notifications: Handles clicks on notifications.
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/')
    );
  });

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}