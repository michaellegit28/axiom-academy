---
# Jekyll front matter so {{ site.baseurl }} resolves at build time.
# This file is still served from the site root (/sw.js) as required for
# service-worker scope.
---
/**
 * GNOSTIRI — Service Worker
 * Caches shell routes, styles, scripts, and question banks for offline use.
 * Every URL is prefixed with the Jekyll baseurl so the worker works both on
 * GitHub Pages (/axiom-academy/) and on local builds.
 */

const BASE = '{{ site.baseurl }}';
const CACHE_NAME = 'gnostiri-v4';
const OFFLINE_FALLBACK = BASE + '/';

const STATIC_ASSETS = [
  BASE + '/',
  BASE + '/high-school/',
  BASE + '/high-school/study/',
  BASE + '/high-school/subject/',
  BASE + '/high-school/mathematics/algebra/',
  BASE + '/study/',
  BASE + '/quiz/',
  BASE + '/quiz/high-school/',
  BASE + '/search/',
  BASE + '/profile/',
  BASE + '/tutor/',
  BASE + '/assets/css/app.css',
  BASE + '/assets/css/gnostiri-ui.css',
  BASE + '/assets/css/quiz.css',
  BASE + '/assets/css/textbook.css',
  BASE + '/assets/css/fit-and-flow.css',
  BASE + '/assets/css/personal-study-plan.css',
  BASE + '/assets/js/axiom-state.js',
  BASE + '/assets/js/app-shell.js',
  BASE + '/assets/js/animations.js',
  BASE + '/assets/js/progress-charts.js',
  BASE + '/assets/js/quiz-engine.js',
  BASE + '/assets/js/flashcards.js',
  BASE + '/assets/js/study-track.js',
  BASE + '/assets/js/study-reader.js',
  BASE + '/assets/js/learning-taxonomy.js',
  BASE + '/assets/data/quizzes/high-school/mathematics/algebra.json',
  BASE + '/assets/data/quizzes/high-school/mathematics/number-and-numeracy.json',
  BASE + '/manifest.json',
  BASE + '/assets/images/icon-192.png',
  BASE + '/assets/images/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        // Cache each asset independently so one missing file can never
        // fail the whole install (cache.addAll would reject everything).
        Promise.all(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((error) => console.warn('[SW] Skipped:', url, error))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => Promise.all(
    cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).then((response) => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      return response;
    }).catch(() => caches.match(request)));
    return;
  }

  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(fetch(request).then((response) => {
      if (response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    }).catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_FALLBACK))));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    });
  }));
});
