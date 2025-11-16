/**
 * TaskFlow - Service Worker para PWA
 * Permite instalação como app e funcionamento offline
 */

const CACHE_NAME = 'taskflow-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/database.js',
  '/js/alarm.js',
  '/js/themes.js',
  '/js/dashboard.js',
  '/js/integration.js',
  '/js/script.js',
  '/electron-integration.js',
  '/alarme/Bells Message Pack vol.1  1.mp3'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalado com sucesso');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Ativado com sucesso');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }
        
        // Caso contrário, busca da rede
        return fetch(event.request).then(response => {
          // Não cachear se não for uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar a resposta
          const responseToCache = response.clone();
          
          // Adicionar ao cache
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Retornar página offline se disponível
        return caches.match('/index.html');
      })
  );
});

// Sincronização em background
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: Sincronização em background');
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// Notificações Push
self.addEventListener('push', event => {
  console.log('🔔 Service Worker: Notificação push recebida');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'TaskFlow';
  const options = {
    body: data.body || 'Você tem uma nova tarefa!',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    vibrate: [200, 100, 200],
    data: data
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('👆 Service Worker: Notificação clicada');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

async function syncTasks() {
  // Implementar sincronização de tarefas
  console.log('📊 Sincronizando tarefas...');
}

console.log('✅ Service Worker carregado');
