/**
 * GNOSTIRI — Personal Study Plan (standalone legacy pages).
 *
 * The per-domain personal-study-plan.html pages are plain static files with no
 * bundler, so this must stay dependency-free vanilla JS. The live planning
 * experience is GNOSTIRI Tutor (/study-track/ and /tutor/); this page is an
 * honest pointer until the standalone pages are rebuilt on the app shell.
 */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    const root = document.getElementById('root');
    if (!root) return;
    const domain = (document.title.split('-')[1] || 'GNOSTIRI').trim();
    root.innerHTML =
      '<main class="personal-study-plan">' +
      '<h2>Your Personal Study Plan</h2>' +
      '<p>Study planning for <strong>' + domain + '</strong> now lives in GNOSTIRI Tutor, ' +
      'which builds your plan from real quiz performance and study activity.</p>' +
      '<p>' +
      '<a class="button primary" href="../study-track/">Open Study Track</a> ' +
      '<a class="button" href="../tutor/">Open Tutor</a> ' +
      '<a class="button" href="../quiz/">Practice quizzes</a>' +
      '</p>' +
      '</main>';
  });
})();
