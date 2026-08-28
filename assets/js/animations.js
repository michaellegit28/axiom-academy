/*!
 * GNOSTIRI Premium Motion System
 * Vanilla JS only
 */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function addVisibleImmediately() {
    var animated = document.querySelectorAll('.animate-on-scroll, .stagger-item');
    animated.forEach(function (element) {
      element.classList.add('visible');
    });
  }

  function setupStaggerLists() {
    var staggerLists = document.querySelectorAll('.stagger-list');

    staggerLists.forEach(function (list) {
      Array.prototype.forEach.call(list.children, function (child) {
        child.classList.add('stagger-item');
      });
    });
  }

  function initScrollReveal() {
    setupStaggerLists();

    var animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-item');

    if (prefersReducedMotion) {
      animatedElements.forEach(function (element) {
        element.classList.add('visible');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      animatedElements.forEach(function (element) {
        element.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -10% 0px'
    });

    animatedElements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function animateCount(element) {
    var target = parseFloat(element.getAttribute('data-count-to'));
    var duration = 1200;
    var suffix = element.getAttribute('data-count-suffix') || '';
    var prefix = element.getAttribute('data-count-prefix') || '';
    var decimals = parseInt(element.getAttribute('data-count-decimals') || '0', 10);
    var startTime = null;

    if (isNaN(target)) {
      return;
    }

    function updateFrame(timestamp) {
      if (!startTime) {
        startTime = timestamp;
      }

      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = easeOutQuad(progress);
      var current = target * eased;
      var formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

      element.textContent = prefix + formatted + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(updateFrame);
      } else {
        var finalValue = decimals > 0 ? target.toFixed(decimals) : Math.round(target).toString();
        element.textContent = prefix + finalValue + suffix;
      }
    }

    window.requestAnimationFrame(updateFrame);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count-to]');

    if (!counters.length) {
      return;
    }

    if (prefersReducedMotion) {
      counters.forEach(function (counter) {
        var target = counter.getAttribute('data-count-to') || '0';
        var suffix = counter.getAttribute('data-count-suffix') || '';
        var prefix = counter.getAttribute('data-count-prefix') || '';
        counter.textContent = prefix + target + suffix;
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (counter) {
        animateCount(counter);
      });
      return;
    }

    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  function initTypewriter() {
    var nodes = document.querySelectorAll('[data-typewriter]');

    if (!nodes.length) {
      return;
    }

    nodes.forEach(function (node) {
      if (node.dataset.typewriterReady === 'true') {
        return;
      }

      var originalText = (node.textContent || '').trim();
      var speed = parseInt(node.getAttribute('data-typewriter-speed') || '40', 10);

      if (!originalText) {
        return;
      }

      if (prefersReducedMotion) {
        node.textContent = originalText;
        node.dataset.typewriterReady = 'true';
        return;
      }

      node.setAttribute('aria-label', originalText);
      node.textContent = '';
      node.dataset.typewriterReady = 'true';

      var index = 0;

      function typeNext() {
        node.textContent = originalText.slice(0, index);
        index += 1;

        if (index <= originalText.length) {
          window.setTimeout(typeNext, speed);
        }
      }

      typeNext();
    });
  }

  function createRipple(event, element) {
    var rect = element.getBoundingClientRect();
    var ripple = document.createElement('span');
    var size = Math.max(rect.width, rect.height);
    var clientX = rect.width / 2;
    var clientY = rect.height / 2;

    if (event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
      clientX = event.clientX - rect.left;
      clientY = event.clientY - rect.top;
    }

    ripple.className = 'ripple-circle';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (clientX - size / 2) + 'px';
    ripple.style.top = (clientY - size / 2) + 'px';

    element.appendChild(ripple);

    ripple.addEventListener('animationend', function () {
      ripple.remove();
    });
  }

  function initRipples() {
    if (prefersReducedMotion) {
      return;
    }

    var rippleTargets = document.querySelectorAll('.btn, .ripple-target');

    rippleTargets.forEach(function (target) {
      target.addEventListener('click', function (event) {
        createRipple(event, target);
      });

      target.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          createRipple(null, target);
        }
      });
    });
  }

  function initPageProgressBar() {
    var progressBar = document.querySelector('.page-progress-bar');

    if (!progressBar) {
      return;
    }

    if (prefersReducedMotion) {
      document.body.classList.remove('loading');
      progressBar.style.width = '100%';
      progressBar.style.opacity = '1';
      return;
    }

    document.body.classList.add('loading');

    document.addEventListener('DOMContentLoaded', function () {
      progressBar.style.width = '35%';
    });

    window.addEventListener('load', function () {
      progressBar.style.width = '100%';
      document.body.classList.remove('loading');

      window.setTimeout(function () {
        progressBar.style.opacity = '0';
      }, 220);

      window.setTimeout(function () {
        progressBar.style.width = '0%';
      }, 550);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (prefersReducedMotion) {
      setupStaggerLists();
      addVisibleImmediately();
    }

    initScrollReveal();
    initCounters();
    initTypewriter();
    initRipples();
    initPageProgressBar();
  });
})();
