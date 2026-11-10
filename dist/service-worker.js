const CACHE = 'javalingo-static-v54';
const CORE = [
  './', './index.html', './manifest.webmanifest', './style.css',
  './data.js', './expansion.js', './java-advanced-tracks.js', './java-deep-routes.js', './java-mega-data.js', './app.js', './features.js',
  './missions.js', './mentor.js', './streak.js', './install.js',
  './java-arena-data.js', './java-arena-more.js', './java-extra-exam-items.js', './java-100-exams.js', './java-arena-missions.js', './java-arena-more-missions.js', './java-new-campaigns.js', './java-campus-expansion.js', './java-arena.js', './java-mega-catalog.js', './java-arena.css',
  './java-dictionary.js', './java-api-17.json', './java-practice-data.js', './java-learning-hub.js', './java-learning-hub.css', './java-profile-plus.css',
  './java-sos-core.js', './java-sos.js', './java-sos.css',
  './java-track-sim.js', './java-track-sim.css',
  './java-professor-game-core.js', './java-professor-game.js', './java-professor-game.css',
  './java-battle.js', './java-battle.css', './java-squad.js', './java-squad.css', './java-reasoning.js', './java-reasoning.css',
  './assets/royale-hero-1.webp', './assets/royale-hero-2.webp', './assets/royale-hero-3.webp',
  './assets/royale-hero-4.webp', './assets/royale-hero-5.webp', './assets/royale-hero-6.webp', './assets/royale-hero-7.webp', './assets/royale-hero-8.webp', './assets/royale-hero-9.webp', './assets/royale-hero-10.webp',
  './assets/royale-new-scene-1.webp', './assets/royale-new-scene-2.webp', './assets/royale-new-scene-3.webp', './assets/royale-new-scene-4.webp', './assets/royale-new-scene-5.webp',
  './assets/javailson-icon-64.png', './assets/javailson-icon-192.png', './assets/javailson-icon-512.png',
  './assets/professor-cartoon-full.webp', './assets/professor-cartoon-portrait.webp', './assets/professor-nao-grita.webp', './assets/professor-mascote.png',
  './assets/professor-figurinha-climao.png', './assets/professor-figurinha-aula.png', './assets/professor-figurinha-nao-grita.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('javalingo-static-') && key !== CACHE)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const home = await caches.match('./index.html');
        if (home) return home;
      }
      return Response.error();
    })
  );
});
