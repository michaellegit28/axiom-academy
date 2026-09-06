/**
 * GNOSTIRI -- theme toggle.
 *
 * Dark is the site default. This module wires the nav button
 * (marked [data-theme-toggle]) to flip the `data-theme` attribute on
 * <html> between "dark" and "light" and remembers the choice in
 * localStorage under "gnostiri-theme". The initial attribute is set
 * synchronously by an inline script in _includes/head.html so there is
 * no flash of the wrong theme before this file loads.
 */

(function () {
  var STORAGE_KEY = 'gnostiri-theme';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyButtonState(button, theme) {
    if (!button) return;
    button.innerHTML = theme === 'light'
      ? '<span aria-hidden="true">&#9789;</span>'
      : '<span aria-hidden="true">&#9788;</span>';
    button.setAttribute(
      'aria-label',
      theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('[data-theme-toggle]');
    if (!button) return;

    applyButtonState(button, currentTheme());

    button.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (error) {
        /* Storage unavailable (e.g. private browsing); theme still
           applies for the remainder of this page view. */
      }
      applyButtonState(button, next);
    });
  });
})();
