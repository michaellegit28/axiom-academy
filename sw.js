/**
 * Axiom Academy — Service Worker
 * Caches chapters, quizzes, and flashcards for offline use
 */

const CACHE_NAME = 'axiom-academy-v2';
const STATIC_ASSETS = [
  '/axiom-academy/',
  '/axiom-academy/high-school/',
  '/axiom-academy/high-school/study/',
  '/axiom-academy/high-school/subject/',
  '/axiom-academy/assets/css/app.css',
  '/axiom-academy/assets/js/app.js',
  '/axiom-academy/assets/js/learning-taxonomy.js',
  '/axiom-academy/assets/js/quiz-engine.js',
  '/axiom-academy/assets/js/flashcards.js',
  '/axiom-academy/assets/js/study-track.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Network-first for HTML so curriculum updates are visible immediately;
  // cache remains the offline fallback.
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/axiom-academy/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
