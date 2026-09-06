---
# Jekyll front matter so the Liquid asset path below resolves at build time.
# This file is still served from the site root (/sw-register.js).
---
/* Service Worker Registration (processed by Jekyll for the Liquid path). */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('{{ "/sw.js" | relative_url }}')
      .then(reg => {
        console.log('[SW] Registered:', reg.scope);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch(err => console.log('[SW] Registration failed:', err));
  });
}

function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.className = 'sw-update-banner';
  banner.innerHTML = `
    <span>🔄 New content available</span>
    <button onclick="window.location.reload()">Refresh</button>
  `;
  document.body.appendChild(banner);
}
