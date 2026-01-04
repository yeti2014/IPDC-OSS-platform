// public/service-worker.js
// IPDC Platform Service Worker - Enhanced Offline Functionality

const CACHE_VERSION = 'ipdc-v1.0.1';
const CACHE_NAME = `ipdc-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ipdc-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `ipdc-images-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html', // Fallback page
];

// Routes that should always try network first
const NETWORK_FIRST_ROUTES = [
  '/api/',
  '/firestore/',
];

// Maximum cache sizes (increased to reduce frequent trimming)
const MAX_RUNTIME_CACHE_SIZE = 200;
const MAX_IMAGE_CACHE_SIZE = 100;

// ============================================================================
// Installation - Cache static assets
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing service worker...', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[Service Worker] Installation complete');
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[Service Worker] Installation failed:', error);
    })
  );
});

// ============================================================================
// Activation - Clean up old caches
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating service worker...', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.startsWith('ipdc-') &&
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation complete');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// ============================================================================
// Fetch - Intercept network requests with caching strategies
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine caching strategy based on request type
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    // Images: Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE));
  } else if (NETWORK_FIRST_ROUTES.some(route => url.pathname.includes(route))) {
    // API/Dynamic content: Network first, cache fallback
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  } else if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    // Static assets: Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
  } else {
    // HTML and other: Stale-while-revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE));
  }
});

// ============================================================================
// Caching Strategies
// ============================================================================

/**
 * Cache First Strategy
 * Try cache first, fall back to network if not found
 */
async function cacheFirstStrategy(request, cacheName, maxSize = null) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      // Clone response before caching
      const responseToCache = networkResponse.clone();

      // Cache the new response
      await cache.put(request, responseToCache);

      // Trim cache if needed
      if (maxSize) {
        await trimCache(cacheName, maxSize);
      }
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first strategy failed:', error);

    // Return offline fallback page for navigation requests
    if (request.destination === 'document') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/offline.html');
    }

    throw error;
  }
}

/**
 * Network First Strategy
 * Try network first, fall back to cache if offline
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network first failed, trying cache:', request.url);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for navigation requests
    if (request.destination === 'document') {
      const mainCache = await caches.open(CACHE_NAME);
      return mainCache.match('/offline.html');
    }

    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidateStrategy(request, cacheName, maxSize = null) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);

      if (maxSize) {
        await trimCache(cacheName, maxSize);
      }
    }
    return networkResponse;
  }).catch((error) => {
    console.error('[Service Worker] Network fetch failed:', error);
    return cachedResponse;
  });

  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Trim cache to maximum size by removing oldest entries
 */
async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));

    // Only log if trimming significant amount (reduces console noise)
    if (keysToDelete.length >= 10) {
      console.log(`[Service Worker] Trimmed ${keysToDelete.length} items from ${cacheName}`);
    }
  }
}

// ============================================================================
// Message Handling - Communication with app
// ============================================================================
self.addEventListener('message', (event) => {
  // Ignore messages without data or type
  if (!event.data || typeof event.data !== 'object') {
    return;
  }

  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      // Cache specific URLs on demand
      event.waitUntil(
        caches.open(RUNTIME_CACHE).then((cache) => {
          return cache.addAll(data.urls);
        })
      );
      break;

    case 'CLEAR_CACHE':
      // Clear all caches
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter(name => name.startsWith('ipdc-'))
              .map(name => caches.delete(name))
          );
        })
      );
      break;

    case 'GET_CACHE_SIZE':
      // Calculate total cache size
      event.waitUntil(
        getCacheSize().then((size) => {
          event.ports[0].postMessage({ size });
        })
      );
      break;

    default:
      if (type !== undefined) {
        console.log('[Service Worker] Unknown message type:', type);
      }
      // Silently ignore messages without a type
  }
});

/**
 * Calculate total cache size
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('ipdc-')) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
  }

  return totalSize;
}

// ============================================================================
// Background Sync - For queued offline operations
// ============================================================================
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);

  if (event.tag === 'sync-requests') {
    event.waitUntil(syncQueuedRequests());
  }
});

/**
 * Sync queued requests when back online
 */
async function syncQueuedRequests() {
  try {
    // Get queued requests from IndexedDB
    const db = await openDB();
    const tx = db.transaction('requestQueue', 'readonly');
    const store = tx.objectStore('requestQueue');

    // Wrap getAll in a promise to handle the async properly
    const queuedRequests = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    console.log('[Service Worker] Syncing', queuedRequests.length, 'queued requests');

    if (!Array.isArray(queuedRequests) || queuedRequests.length === 0) {
      console.log('[Service Worker] No requests to sync');
      return;
    }

    for (const queuedRequest of queuedRequests) {
      try {
        const response = await fetch(queuedRequest.url, queuedRequest.options);

        if (response.ok) {
          // Remove from queue on success
          const deleteTx = db.transaction('requestQueue', 'readwrite');
          const deleteStore = deleteTx.objectStore('requestQueue');
          await new Promise((resolve, reject) => {
            const delRequest = deleteStore.delete(queuedRequest.id);
            delRequest.onsuccess = () => resolve();
            delRequest.onerror = () => reject(delRequest.error);
          });
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync request:', error);
      }
    }

    console.log('[Service Worker] Background sync complete');
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}

/**
 * Open IndexedDB for request queue
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ipdc-offline-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('requestQueue')) {
        db.createObjectStore('requestQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

console.log('[Service Worker] Service worker loaded successfully');
