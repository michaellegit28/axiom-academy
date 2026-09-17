/**
 * GNOSTIRI — application shell wiring.
 *
 * Vanilla ES module (no bundler, no framework). Runs on every page that uses
 * the app-shell layout and marks the current page in the nav with
 * aria-current="page".
 *
 * The site is 100% free with no accounts: all learning, progress, and
 * analytics features run locally in the browser (localStorage / IndexedDB).
 */

function markActiveNav() {
  const menu = document.querySelector('[data-nav-menu]');
  if (!menu) return;
  const current = window.location.pathname.replace(/\/index\.html$/, '/');
  menu.querySelectorAll('a[href]').forEach((link) => {
    let path = '';
    try {
      path = new URL(link.getAttribute('href'), window.location.origin).pathname;
    } catch (error) {
      return;
    }
    if (path.replace(/\/index\.html$/, '/') === current) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
});
