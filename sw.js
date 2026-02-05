const CACHE_NAME = 'findaphotographer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.tsx',
  '/metadata.json',
  '/components/AIMatchmaker.tsx',
  '/components/BookingModal.tsx',
  '/components/BookingsView.tsx',
  '/components/ChatView.tsx',
  '/components/FavoritesView.tsx',
  '/components/Icon.tsx',
  '/components/LoginScreen.tsx',
  '/components/Logo.tsx',
  '/components/MapView.tsx',
  '/components/MessagesView.tsx',
  '/components/OnboardingModal.tsx',
  '/components/PaymentScreen.tsx',
  '/components/ProfileDetail.tsx',
  '/components/ProfileView.tsx',
  '/components/InitialSetupScreen.tsx',
  '/components/EditProfileScreen.tsx',
  '/components/QuizModal.tsx',
  '/components/QuizNotificationPopup.tsx',
  '/components/ReviewModal.tsx',
  '/components/UserProfileCard.tsx',
  '/components/SubViewScreen.tsx',
  '/components/GuidedTour.tsx',
  '/components/Layout.tsx',
  '/contexts/FavoritesContext.tsx',
  '/contexts/AppContext.tsx',
  '/contexts/UserContext.tsx',
  '/services/geminiService.ts',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Utilise une approche plus robuste pour mettre en cache les ressources externes
        const cachePromises = urlsToCache.map(urlToCache => {
          const request = new Request(urlToCache, {mode: 'no-cors'});
          return fetch(request).then(response => cache.put(request, response));
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  // Stratégie "Cache d'abord, puis réseau"
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si la ressource est dans le cache, on la retourne
        if (cachedResponse) {
          return cachedResponse;
        }

        // Sinon, on va la chercher sur le réseau
        return fetch(event.request).then(
          networkResponse => {
            // On vérifie qu'on a une réponse valide avant de la mettre en cache
            if (!networkResponse || networkResponse.status !== 200 || event.request.method !== 'GET') {
              return networkResponse;
            }

            // IMPORTANT : Il faut cloner la réponse.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      }).catch(error => {
          // Gère les erreurs de fetch (par exemple, hors ligne)
          console.log('Fetch failed; returning offline page instead.', error);
          // Optionnel: retourner une page de fallback
          // return caches.match('/offline.html');
      })
    );
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Supprime les anciens caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});