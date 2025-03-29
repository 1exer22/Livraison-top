// Service Worker pour la gestion des notifications push
const CACHE_NAME = 'livraison-top-v1';

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/logo.png',
        '/badge.png'
      ]);
    })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  // Nettoyer les anciens caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Écouter les messages de l'application
self.addEventListener('message', (event) => {
  console.log('Message reçu dans le service worker:', event.data);

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options)
      .then(() => console.log('Notification affichée depuis le service worker'))
      .catch(err => console.error('Erreur lors de l\'affichage de la notification:', err));
  }
});

// Gérer les notifications push entrantes
self.addEventListener('push', (event) => {
  console.log('Notification push reçue:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Nouvelle notification',
        message: event.data.text()
      };
    }
  }

  const options = {
    body: data.message || 'Notification sans contenu',
    icon: '/logo.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nouvelle notification', options)
  );
});

// Gérer le clic sur une notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Vérifier si une fenêtre existe déjà et l'utiliser
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
