/**
 * GNOSTIRI — application shell wiring.
 *
 * Vanilla ES module (no bundler, no framework). Runs on every page that uses
 * the app-shell layout and does three small jobs:
 *   1. Injects the Sign in / account button into the canonical nav menu.
 *   2. Marks the current page in the nav with aria-current="page".
 *   3. Reflects auth state on the button via the shared axiomAuth module.
 *
 * Auth behavior itself lives in assets/js/auth.js; this file only consumes
 * its public contract (onAuthChange / signOut / displayName / isAnonymous).
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

function injectAuthButton() {
  const menu = document.querySelector('[data-nav-menu]');
  if (!menu || document.getElementById('site-auth-button')) return null;
  const item = document.createElement('li');
  item.className = 'gnostiri-nav__auth';
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'site-auth-button';
  button.className = 'gnostiri-nav__auth-btn';
  button.textContent = 'Sign in';
  item.appendChild(button);
  menu.appendChild(item);
  return button;
}

async function wireAuthButton(button) {
  let axiomAuth = null;
  try {
    ({ axiomAuth } = await import('./auth.js'));
  } catch (error) {
    // Auth SDK unreachable (offline / blocked CDN). Hide the button rather
    // than showing a control that cannot work.
    console.warn('[GNOSTIRI Shell] Auth unavailable, hiding sign-in button:', error);
    button.hidden = true;
    return;
  }

  const render = (user, isAnonymous) => {
    if (user && !isAnonymous) {
      const name = (axiomAuth.displayName || 'Account').split(' ')[0];
      button.textContent = name;
      button.title = 'Signed in — click to sign out';
      button.dataset.signedIn = 'true';
    } else {
      button.textContent = 'Sign in';
      button.title = 'Sign in or create a free account';
      delete button.dataset.signedIn;
    }
  };

  button.addEventListener('click', async () => {
    if (button.dataset.signedIn) {
      try {
        await axiomAuth.signOut();
      } catch (error) {
        console.warn('[GNOSTIRI Shell] Sign out failed:', error);
      }
      return;
    }
    if (typeof window.openAuthModal === 'function') {
      window.openAuthModal();
    }
  });

  axiomAuth.onAuthChange(render);
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  const button = injectAuthButton();
  if (button) wireAuthButton(button);
});
