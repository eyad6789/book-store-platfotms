// Service Worker for المتنبي (Al-Mutanabbi) Bookstore
const CACHE_NAME = 'mutanabbi-v1.0.0';
const STATIC_CACHE = 'mutanabbi-static-v1';
const DYNAMIC_CACHE = 'mutanabbi-dynamic-v1';

const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/offline.html',
  '/placeholder-book.jpg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response for caching
          const responseClone = response.clone();
          
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline message for API requests
            return new Response(
              JSON.stringify({
                success: false,
                error: 'لا يوجد اتصال بالإنترنت',
                offline: true
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached page or offline page
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Handle other requests (images, CSS, JS, etc.)
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseClone = response.clone();
            
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // Return placeholder for images
            if (request.destination === 'image') {
              return caches.match('/placeholder-book.jpg');
            }
            
            // Return empty response for other failed requests
            return new Response('', { status: 404 });
          });
      })
  );
});

// Background sync for offline orders
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
  
  if (event.tag === 'background-sync-wishlist') {
    event.waitUntil(syncPendingWishlist());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'لديك إشعار جديد من المتنبي',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض التفاصيل',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icons/xmark.png'
      }
    ],
    requireInteraction: true,
    dir: 'rtl',
    lang: 'ar'
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'المتنبي';
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('المتنبي', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync pending orders when back online
async function syncPendingOrders() {
  try {
    console.log('Service Worker: Syncing pending orders...');
    
    // Open IndexedDB to get pending orders
    const db = await openDB('mutanabbi-offline', 1);
    const pendingOrders = await db.getAll('pending-orders');
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${order.token}`
          },
          body: JSON.stringify(order.data)
        });
        
        if (response.ok) {
          await db.delete('pending-orders', order.id);
          console.log('Service Worker: Order synced successfully', order.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync order', order.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing orders', error);
  }
}

// Sync pending wishlist changes when back online
async function syncPendingWishlist() {
  try {
    console.log('Service Worker: Syncing pending wishlist changes...');
    
    const db = await openDB('mutanabbi-offline', 1);
    const pendingWishlist = await db.getAll('pending-wishlist');
    
    for (const item of pendingWishlist) {
      try {
        const response = await fetch(`/api/wishlist/${item.bookId}`, {
          method: item.action === 'add' ? 'POST' : 'DELETE',
          headers: {
            'Authorization': `Bearer ${item.token}`
          }
        });
        
        if (response.ok) {
          await db.delete('pending-wishlist', item.id);
          console.log('Service Worker: Wishlist item synced successfully', item.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync wishlist item', item.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing wishlist', error);
  }
}

// Simple IndexedDB wrapper
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('pending-orders')) {
        db.createObjectStore('pending-orders', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pending-wishlist')) {
        db.createObjectStore('pending-wishlist', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
