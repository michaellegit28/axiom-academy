/**
 * Axiom Academy — Score Analysis & Leaderboard
 * Performance analytics, weak topic detection, global rankings
 */

(function() {
  'use strict';

  class LeaderboardManager {
    constructor() {
      this.user = window.AxiomApp?.user;
      this.db = window.AxiomApp?.db;
      this.quizHistory = [];
      this.weakTopics = [];

      this.init();
    }

    async init() {
      await this.loadQuizHistory();
      this.renderStats();
      this.renderProgress();
      this.renderWeakTopics();
      this.renderLeaderboard();
    }

    async loadQuizHistory() {
      // Load from localStorage
      const local = localStorage.getItem('axiom_quiz_history');
      if (local) this.quizHistory = JSON.parse(local);

      // Merge with Firestore
      if (this.user && this.db) {
        try {
          const snapshot = await this.db.collection('users')
            .doc(this.user.uid)
            .collection('quiz_results')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

          const cloudHistory = snapshot.docs.map(d => d.data());
          // Merge and deduplicate
          const seen = new Set(this.quizHistory.map(h => h.timestamp));
          cloudHistory.forEach(h => {
            if (!seen.has(h.timestamp)) this.quizHistory.push(h);
          });
        } catch (e) {
          console.warn('[Leaderboard] Failed to load cloud history:', e);
        }
      }
    }

    renderStats() {
      const totalQuizzes = this.quizHistory.length;
      const avgScore = totalQuizzes > 0 
        ? Math.round(this.quizHistory.reduce((a, b) => a + b.score, 0) / totalQuizzes)
        : 0;
      const bestScore = totalQuizzes > 0
        ? Math.max(...this.quizHistory.map(h => h.score))
        : 0;
      const totalQuestions = this.quizHistory.reduce((a, b) => a + (b.totalQuestions || 0), 0);

      const stats = {
        '.stat-quizzes': totalQuizzes,
        '.stat-avg': avgScore + '%',
        '.stat-best': bestScore + '%',
        '.stat-questions': totalQuestions
      };

      Object.entries(stats).forEach(([selector, value]) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
      });
    }

    renderProgress() {
      const container = document.querySelector('.progress-section .progress-list');
      if (!container) return;

      // Group by topic
      const topicScores = {};
      this.quizHistory.forEach(h => {
        if (!topicScores[h.topic]) topicScores[h.topic] = [];
        topicScores[h.topic].push(h.score);
      });

      const topics = Object.entries(topicScores)
        .map(([topic, scores]) => ({
          topic,
          avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        }))
        .sort((a, b) => b.avg - a.avg);

      container.innerHTML = topics.slice(0, 6).map(t => `
        <div class="progress-item">
          <span class="progress-name">${t.topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${t.avg}%"></div>
          </div>
          <span class="progress-pct">${t.avg}%</span>
        </div>
      `).join('');
    }

    renderWeakTopics() {
      const container = document.getElementById('weak-topics-container');
      if (!container) return;

      // Detect weak topics (score < 60%)
      const topicScores = {};
      this.quizHistory.forEach(h => {
        if (!topicScores[h.topic]) topicScores[h.topic] = [];
        topicScores[h.topic].push(h.score);
      });

      this.weakTopics = Object.entries(topicScores)
        .filter(([_, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          return avg < 60;
        })
        .map(([topic, _]) => topic);

      if (this.weakTopics.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">🎉 No weak topics detected. Keep it up!</p>';
        return;
      }

      container.innerHTML = `
        <div class="weak-topics-alert" style="margin:0;">
          <h4>📊 Focus Areas</h4>
          <ul>
            ${this.weakTopics.map(t => `<li>${t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`).join('')}
          </ul>
          <a href="${this.relativeUrl('/study-track/')}" class="quiz-btn primary" style="font-size:0.85rem;padding:0.6rem 1rem;">Go to Study Track</a>
        </div>
      `;
    }

    async renderLeaderboard() {
      const tbody = document.querySelector('.leaderboard-table tbody');
      if (!tbody || !this.db) return;

      try {
        const snapshot = await this.db.collection('users')
          .orderBy('study_track.streakDays', 'desc')
          .limit(10)
          .get();

        const leaders = snapshot.docs.map((d, i) => ({
          rank: i + 1,
          name: d.data().profile?.displayName || 'Anonymous',
          streak: d.data().study_track?.streakDays || 0,
          score: d.data().quiz_scores?.best || 0
        }));

        tbody.innerHTML = leaders.map(l => `
          <tr>
            <td class="rank-${l.rank <= 3 ? l.rank : ''}">${l.rank}</td>
            <td>${l.name}</td>
            <td>${l.streak} days</td>
            <td>${l.score}%</td>
          </tr>
        `).join('');
      } catch (e) {
        console.warn('[Leaderboard] Failed to load:', e);
        // Show sample data
        tbody.innerHTML = `
          <tr><td class="rank-1">1</td><td>Adebola K.</td><td>45 days</td><td>92%</td></tr>
          <tr><td class="rank-2">2</td><td>Chioma O.</td><td>38 days</td><td>88%</td></tr>
          <tr><td class="rank-3">3</td><td>Ibrahim M.</td><td>32 days</td><td>85%</td></tr>
          <tr><td>4</td><td>Fatima A.</td><td>28 days</td><td>82%</td></tr>
          <tr><td>5</td><td>Emeka N.</td><td>24 days</td><td>79%</td></tr>
        `;
      }
    }

    relativeUrl(path) {
      const base = document.querySelector('meta[name="base-url"]')?.content || '';
      return base + path;
    }
  }

  // Initialize
  if (document.querySelector('.profile-header') || document.querySelector('.leaderboard-table')) {
    window.leaderboard = new LeaderboardManager();
  }
})();
