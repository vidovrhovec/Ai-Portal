// Service Worker for AI Learning Portal
// Handles caching, offline functionality, and background sync

const STATIC_CACHE = 'ai-learning-portal-static-v1';
const DYNAMIC_CACHE = 'ai-learning-portal-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return;

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // Special handling for flashcards - cache aggressively
    if (url.pathname.includes('/flashcards/')) {
      event.respondWith(handleFlashcardRequest(request));
      return;
    }
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle page requests
  event.respondWith(handlePageRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch {
    console.log('Network failed, trying cache for:', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return offline response for API calls
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This feature requires an internet connection'
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Handle flashcard requests with cache-first strategy for offline support
async function handleFlashcardRequest(request) {
  // Try cache first for flashcards
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Return cached response immediately
    return cachedResponse;
  }

  try {
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch {
    console.log('Network failed for flashcards, returning offline message');
  }

  // Return offline response for flashcards
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Flashcards are available offline. Please check your cached decks.',
      offline: true
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    console.log('Failed to fetch static asset:', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch {
    console.log('Network failed, trying cache for page:', request.url);
  }

  // Try cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return offline page
  const offlineResponse = await caches.match('/offline');
  if (offlineResponse) {
    return offlineResponse;
  }

  // Fallback offline response
  return new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - AI Learning Portal</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <h1>You're Offline</h1>
      <p>Please check your internet connection and try again.</p>
      <button onclick="window.location.reload()">Retry</button>
    </body>
    </html>
    `,
    {
      headers: { 'Content-Type': 'text/html' }
    }
  );
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Perform background sync
async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB or similar
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });

        // Remove from pending actions
        await removePendingAction(action.id);
      } catch (error) {
        console.log('Failed to sync action:', action.id, error);
      }
    }
  } catch {
    console.log('Background sync failed');
  }
}

// Placeholder functions for pending actions (would use IndexedDB in production)
async function getPendingActions() {
  // In a real implementation, this would query IndexedDB
  return [];
}

async function removePendingAction() {
  // In a real implementation, this would remove from IndexedDB
}

// Push notifications (optional)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data.url
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(syncContent());
    }
  });
}

// Sync content periodically
async function syncContent() {
  try {
    // Update cached content, check for new materials, etc.
    console.log('Periodic content sync');
  } catch (error) {
    console.log('Periodic sync failed:', error);
  }
}