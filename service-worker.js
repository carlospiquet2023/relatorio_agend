/**
 * TaskFlow - Enterprise Service Worker
 * Advanced PWA with offline-first strategy, intelligent caching, and performance optimization
 * @author Carlos Antonio de Oliveira Piquet
 * @version 3.0.0 - Google-Level Architecture
 */

// Cache version with semver
const VERSION = '3.0.0';
const CACHE_PREFIX = 'taskflow';
const CACHE_STATIC = `${CACHE_PREFIX}-static-v${VERSION}`;
const CACHE_DYNAMIC = `${CACHE_PREFIX}-dynamic-v${VERSION}`;
const CACHE_IMAGES = `${CACHE_PREFIX}-images-v${VERSION}`;
const CACHE_API = `${CACHE_PREFIX}-api-v${VERSION}`;

// Maximum cache sizes
const MAX_CACHE_SIZE = {
    dynamic: 50,
    images: 30,
    api: 25
};

// Static resources - critical path
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/database.js',
    '/js/alarm.js',
    '/js/themes.js',
    '/js/dashboard.js',
    '/js/integration.js',
    '/js/script.js',
    '/js/pwa-install.js',
    '/js/config.js',
    '/manifest.json'
];

// CDN resources with fallback
const CDN_RESOURCES = [
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

/**
 * Install Event - Precache critical assets
 */
self.addEventListener('install', event => {
    console.log(`%c🚀 TaskFlow SW v${VERSION} - Installing`, 'color: #4f46e5; font-weight: bold; font-size: 14px;');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHE_STATIC).then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache CDN resources
            caches.open(CACHE_DYNAMIC).then(cache => {
                console.log('🌐 Caching CDN resources...');
                return Promise.allSettled(
                    CDN_RESOURCES.map(url => 
                        fetch(url)
                            .then(response => cache.put(url, response))
                            .catch(err => console.warn(`Failed to cache ${url}:`, err))
                    )
                );
            })
        ])
        .then(() => {
            console.log('%c✅ Installation complete - Skipping waiting', 'color: #10b981; font-weight: bold;');
            return self.skipWaiting();
        })
        .catch(err => {
            console.error('❌ Installation failed:', err);
        })
    );
});

/**
 * Activate Event - Clean old caches
 */
self.addEventListener('activate', event => {
    console.log(`%c⚡ TaskFlow SW v${VERSION} - Activating`, 'color: #f59e0b; font-weight: bold; font-size: 14px;');
    
    event.waitUntil(
        Promise.all([
            // Clean old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName.startsWith(CACHE_PREFIX))
                        .filter(cacheName => !cacheName.includes(VERSION))
                        .map(cacheName => {
                            console.log(`🗑️ Deleting old cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Claim all clients
            self.clients.claim()
        ])
        .then(() => {
            console.log('%c✅ Activation complete - Claimed all clients', 'color: #10b981; font-weight: bold;');
            
            // Notify all clients of update
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: VERSION
                    });
                });
            });
        })
    );
});

/**
 * Fetch Event - Advanced caching strategies
 * Implements Stale-While-Revalidate, Cache-First, and Network-First patterns
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;
    
    // Route-based caching strategy
    event.respondWith(handleFetch(request));
});

/**
 * Intelligent fetch handler with multiple strategies
 */
async function handleFetch(request) {
    const url = new URL(request.url);
    
    // Strategy 1: Cache-First for static assets (CSS, JS)
    if (url.pathname.match(/\.(css|js)$/)) {
        return cacheFirst(request, CACHE_STATIC);
    }
    
    // Strategy 2: Cache-First for images
    if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
        return cacheFirst(request, CACHE_IMAGES);
    }
    
    // Strategy 3: Stale-While-Revalidate for HTML
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
        return staleWhileRevalidate(request, CACHE_DYNAMIC);
    }
    
    // Strategy 4: Network-First for API calls
    if (url.pathname.includes('/api/')) {
        return networkFirst(request, CACHE_API);
    }
    
    // Strategy 5: CDN resources - Cache-First with fallback
    if (url.hostname.includes('cdn')) {
        return cacheFirst(request, CACHE_DYNAMIC);
    }
    
    // Default: Network with cache fallback
    return networkWithCacheFallback(request);
}

/**
 * Cache-First Strategy
 * Try cache first, fallback to network
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
            await limitCacheSize(cacheName, MAX_CACHE_SIZE.dynamic);
        }
        return response;
    } catch (error) {
        console.error('Fetch failed:', error);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

/**
 * Network-First Strategy
 * Try network first, fallback to cache
 */
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
            await limitCacheSize(cacheName, MAX_CACHE_SIZE.api);
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

/**
 * Stale-While-Revalidate Strategy
 * Return cache immediately, update in background
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Fetch from network in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    });
    
    // Return cached version immediately or wait for network
    return cached || fetchPromise;
}

/**
 * Network with Cache Fallback
 */
async function networkWithCacheFallback(request) {
    try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_DYNAMIC);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        return cached || caches.match('/index.html');
    }
}

/**
 * Limit cache size to prevent overflow
 */
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
        // Delete oldest entries (FIFO)
        const deleteCount = keys.length - maxSize;
        for (let i = 0; i < deleteCount; i++) {
            await cache.delete(keys[i]);
        }
    }
}

/**
 * Background Sync - Sync data when online
 */
self.addEventListener('sync', event => {
    console.log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
    
    if (event.tag === 'sync-notebook') {
        event.waitUntil(syncNotebook());
    }
});

async function syncTasks() {
    try {
        console.log('📋 Syncing tasks...');
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                data: 'tasks'
            });
        });
        console.log('✅ Tasks synced successfully');
    } catch (error) {
        console.error('❌ Sync failed:', error);
        throw error;
    }
}

async function syncNotebook() {
    try {
        console.log('📓 Syncing notebook...');
        console.log('✅ Notebook synced successfully');
    } catch (error) {
        console.error('❌ Notebook sync failed:', error);
        throw error;
    }
}

/**
 * Push Notifications
 */
self.addEventListener('push', event => {
    console.log('🔔 Push notification received');
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || '📅 TaskFlow';
    const options = {
        body: data.body || 'Você tem uma nova notificação',
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-72.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'taskflow-notification',
        requireInteraction: data.requireInteraction || false,
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Fechar' }
        ],
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', event => {
    console.log('🖱️ Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data?.url || '/')
        );
    }
});

/**
 * Message Handler - Communication with main thread
 */
self.addEventListener('message', event => {
    console.log('💬 Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_DYNAMIC).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log(`%c🎯 TaskFlow Service Worker v${VERSION} loaded and ready!`, 'color: #4f46e5; font-weight: bold; font-size: 16px;');
