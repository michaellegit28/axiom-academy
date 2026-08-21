/**
 * Axiom Academy — Home Dashboard
 * Reads localStorage("axiom_progress") and renders Continue Learning,
 * Learning Snapshot, Recommended, and Recent Activity widgets on the homepage.
 * Falls back gracefully (stays hidden) for first-time visitors with no data.
 */
(function () {
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem('axiom_progress')) || {};
    } catch (e) {
      return {};
    }
  }

  function timeAgo(ts) {
    if (!ts) return '';
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    return days + 'd ago';
  }

  function chapterUrl(subject, volume, chapter) {
    return (window.AXIOM_BASEURL || '') + '/read/' + subject + '/vol' + volume + '/ch' + chapter + '/';
  }

  function buildDashboard() {
    var cache = getProgress();
    var hasAnyData = Object.keys(cache).length > 0;
    var dashboard = document.getElementById('home-dashboard');
    if (!dashboard || !hasAnyData) return;

    dashboard.style.display = 'block';

    // ---- Continue Learning ----
    var chapterEntries = Object.values(cache).filter(function (v) {
      return v && typeof v === 'object' && 'percentRead' in v;
    });
    var inProgress = chapterEntries
      .filter(function (e) { return e.percentRead > 0 && !e.completed; })
      .sort(function (a, b) { return (b.lastRead || 0) - (a.lastRead || 0); })
      .slice(0, 3);

    var continueSection = document.getElementById('continue-learning-section');
    var continueCards = document.getElementById('continue-cards');
    if (inProgress.length > 0 && continueCards) {
      continueSection.style.display = 'block';
      continueCards.innerHTML = inProgress.map(function (e) {
        return '<a href="' + chapterUrl(e.subject, e.volume, e.chapter) + '" class="continue-card">' +
          '<div class="continue-card-top">' +
          '<span class="continue-card-subject">' + (e.subject || 'Physics').charAt(0).toUpperCase() + (e.subject || 'physics').slice(1) + ' \u00b7 Vol ' + e.volume + '</span>' +
          '<span class="continue-card-time">' + timeAgo(e.lastRead) + '</span>' +
          '</div>' +
          '<div class="continue-card-progress-bar"><div class="continue-card-progress-fill" style="width:' + e.percentRead + '%"></div></div>' +
          '<div class="continue-card-bottom"><span>' + e.percentRead + '% complete</span><span class="continue-card-cta">Continue \u2192</span></div>' +
          '</a>';
      }).join('');
    }

    // ---- Learning Snapshot ----
    var analytics = cache.analytics || {};
    var streak = (cache.study_track && cache.study_track.streakDays) || 0;
    var snapshotEl = document.getElementById('snapshot-stats');
    if (snapshotEl) {
      var stats = [
        { label: 'Day Streak', value: streak, icon: '\uD83D\uDD25' },
        { label: 'Quizzes Taken', value: analytics.totalQuizzesTaken || 0, icon: '\uD83E\uDDEA' },
        { label: 'Chapters Read', value: analytics.chaptersRead || 0, icon: '\uD83D\uDCD6' },
        { label: 'Cards Reviewed', value: analytics.totalCardsReviewed || 0, icon: '\uD83C\uDFB4' }
      ];
      snapshotEl.innerHTML = stats.map(function (s) {
        return '<div class="stat-pill"><span class="stat-pill-icon">' + s.icon + '</span>' +
          '<span class="stat-pill-value">' + s.value + '</span>' +
          '<span class="stat-pill-label">' + s.label + '</span></div>';
      }).join('');
      document.getElementById('todays-learning-section').style.display = 'block';
    }

    // ---- Recommended (Weak Topics) ----
    var weakTopics = cache.weak_topics || {};
    var weak = (weakTopics.physics || []).concat(weakTopics._needsPractice || []);
    var recSection = document.getElementById('recommended-section');
    var recCards = document.getElementById('recommended-cards');
    if (weak.length > 0 && recCards) {
      // find which exam each weak topic belongs to, from quiz_scores keys
      var scores = cache.quiz_scores || {};
      var topicExam = {};
      Object.values(scores).forEach(function (s) {
        topicExam[s.topic] = s.exam;
      });
      recSection.style.display = 'block';
      recCards.innerHTML = weak.slice(0, 4).map(function (topic) {
        var exam = topicExam[topic] || 'jamb';
        var label = topic.replace(/_/g, ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        return '<a href="' + (window.AXIOM_BASEURL || '') + '/quiz/' + exam + '/' + topic + '/" class="recommended-card">' +
          '<span class="recommended-icon">\u26A0\uFE0F</span>' +
          '<div><div class="recommended-title">' + label + '</div>' +
          '<div class="recommended-sub">' + exam.toUpperCase() + ' \u00b7 Needs review</div></div>' +
          '</a>';
      }).join('');
    }

    // ---- Recent Activity ----
    var history = (cache.quiz_history || []).slice(-5).reverse();
    var recentEl = document.getElementById('recent-activity-list');
    var recentSection = document.getElementById('recent-activity-section');
    if (history.length > 0 && recentEl) {
      recentSection.style.display = 'block';
      recentEl.innerHTML = history.map(function (h) {
        var topicLabel = (h.topic || '').replace(/_/g, ' ');
        return '<li class="recent-activity-item">' +
          '<span class="recent-activity-icon">\uD83E\uDDEA</span>' +
          '<span class="recent-activity-text">Scored <b>' + h.accuracy + '%</b> on ' + (h.exam || '').toUpperCase() + ' ' + topicLabel + '</span>' +
          '<span class="recent-activity-time">' + timeAgo(h.date) + '</span>' +
          '</li>';
      }).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', buildDashboard);
})();
