/**
 * Axiom Academy — Progress Tracker (Phase 4)
 * Tracks chapter reading progress, quiz scores, and computes analytics.
 * Offline-first with Firestore sync.
 */

import { axiomAuth } from "./auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---- Local Storage Helpers ----
const LS_KEY = "axiom_progress";

function getLocalProgress() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch { return {}; }
}

function setLocalProgress(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ---- Progress Tracker ----
export class ProgressTracker {
  constructor() {
    this.db = getFirestore(window.firebaseApp);
    this.cache = getLocalProgress();
    this._syncQueue = [];
    this._syncing = false;
  }

  // ---- Chapter Reading ----
  trackChapterProgress(subject, volume, chapter, percentRead = 0, completed = false) {
    const key = `${subject}_vol${volume}_ch${chapter}`;
    const entry = {
      subject,
      volume,
      chapter,
      percentRead: Math.min(100, Math.max(0, percentRead)),
      completed,
      lastRead: Date.now(),
      readTime: (this.cache[key]?.readTime || 0) + 1 // Increment by 1 min approx
    };

    this.cache[key] = entry;
    setLocalProgress(this.cache);
    this._queueSync("progress", key, entry);

    // Update streak
    this._updateStreak();
  }

  // Scroll-based progress for reading view
  initReadingProgress(subject, volume, chapter) {
    let lastPercent = 0;
    const save = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

      if (Math.abs(percent - lastPercent) >= 5) {
        lastPercent = percent;
        const completed = percent >= 95;
        this.trackChapterProgress(subject, volume, chapter, percent, completed);
      }
    };

    window.addEventListener("scroll", () => requestAnimationFrame(save), { passive: true });
    // Initial save
    this.trackChapterProgress(subject, volume, chapter, 0, false);
  }

  // ---- Quiz Scores ----
  async submitQuizScore(exam, subject, topic, score, total, timeSpentSeconds = 0) {
    const key = `${exam}_${subject}_${topic}`;
    const existing = this.cache.quiz_scores?.[key] || {};
    const attempts = (existing.attempts || 0) + 1;
    const best = Math.max(score, existing.best || 0);
    const accuracy = Math.round((score / total) * 100);

    const entry = {
      exam,
      subject,
      topic,
      score,
      total,
      accuracy,
      attempts,
      best,
      timeSpentSeconds: (existing.timeSpentSeconds || 0) + timeSpentSeconds,
      lastAttempt: Date.now()
    };

    if (!this.cache.quiz_scores) this.cache.quiz_scores = {};
    this.cache.quiz_scores[key] = entry;

    // Append to chronological quiz history (for analytics table)
    if (!this.cache.quiz_history) this.cache.quiz_history = [];
    this.cache.quiz_history.push({
      exam, subject, topic, score, total, accuracy,
      timeSpentSeconds,
      date: Date.now()
    });
    // Cap history to last 200 attempts to keep localStorage lean
    if (this.cache.quiz_history.length > 200) {
      this.cache.quiz_history = this.cache.quiz_history.slice(-200);
    }

    setLocalProgress(this.cache);

    // Compute weak topics immediately
    this._computeWeakTopics();

    // Sync to Firestore
    this._queueSync("quiz_scores", key, entry);
    this._queueSync("weak_topics", "physics", this.cache.weak_topics?.physics || []);

    // Update analytics
    this._updateAnalytics("quiz", timeSpentSeconds);

    return entry;
  }

  // ---- Weak Topic Detection ----
  _computeWeakTopics() {
    const scores = this.cache.quiz_scores || {};
    const topics = {};

    Object.values(scores).forEach(entry => {
      const topic = entry.topic;
      if (!topics[topic]) topics[topic] = { total: 0, correct: 0, attempts: 0 };
      topics[topic].total += entry.total;
      topics[topic].correct += entry.score;
      topics[topic].attempts += 1;
    });

    const weak = [];
    const needsPractice = [];
    const strong = [];

    Object.entries(topics).forEach(([topic, data]) => {
      const accuracy = data.correct / data.total;
      if (accuracy < 0.5 && data.attempts >= 2) weak.push(topic);
      else if (accuracy < 0.75 && data.attempts >= 2) needsPractice.push(topic);
      else if (accuracy >= 0.75 && data.attempts >= 2) strong.push(topic);
    });

    if (!this.cache.weak_topics) this.cache.weak_topics = {};
    this.cache.weak_topics.physics = weak;
    this.cache.weak_topics._needsPractice = needsPractice;
    this.cache.weak_topics._strong = strong;
    setLocalProgress(this.cache);
  }

  getWeakTopics() {
    this._computeWeakTopics();
    return {
      weak: this.cache.weak_topics?.physics || [],
      needsPractice: this.cache.weak_topics?._needsPractice || [],
      strong: this.cache.weak_topics?._strong || []
    };
  }

  getTopicMastery(topic) {
    const scores = this.cache.quiz_scores || {};
    const relevant = Object.values(scores).filter(s => s.topic === topic);
    if (relevant.length === 0) return null;

    const totalCorrect = relevant.reduce((sum, s) => sum + s.score, 0);
    const totalQuestions = relevant.reduce((sum, s) => sum + s.total, 0);
    return {
      accuracy: Math.round((totalCorrect / totalQuestions) * 100),
      attempts: relevant.length,
      best: Math.max(...relevant.map(s => s.best)),
      lastAttempt: Math.max(...relevant.map(s => s.lastAttempt))
    };
  }

  // ---- Analytics ----
  _updateAnalytics(type, durationMinutes = 0) {
    if (!this.cache.analytics) {
      this.cache.analytics = {
        totalStudyMinutes: 0,
        totalQuizzesTaken: 0,
        totalCardsReviewed: 0,
        chaptersRead: 0,
        lastActiveDate: null
      };
    }

    const a = this.cache.analytics;
    a.totalStudyMinutes += durationMinutes;
    a.lastActiveDate = Date.now();

    if (type === "quiz") a.totalQuizzesTaken += 1;
    if (type === "flashcard") a.totalCardsReviewed += 1;
    if (type === "chapter") a.chaptersRead += 1;

    // Track minutes per calendar day (for the weekly activity chart)
    if (durationMinutes > 0) {
      if (!this.cache.daily_activity) this.cache.daily_activity = {};
      const dayKey = new Date().toDateString();
      this.cache.daily_activity[dayKey] = (this.cache.daily_activity[dayKey] || 0) + durationMinutes;
    }

    setLocalProgress(this.cache);
    this._queueSync("analytics", "summary", a);
  }

  _updateStreak() {
    const today = new Date().toDateString();
    const track = this.cache.study_track || { streakDays: 0, lastStudyDate: null };

    if (track.lastStudyDate) {
      const last = new Date(track.lastStudyDate);
      const diff = (new Date(today) - last) / (1000 * 60 * 60 * 24);

      if (diff >= 2) {
        track.streakDays = 1; // Reset
      } else if (diff >= 1) {
        track.streakDays += 1; // Continue
      }
      // If same day, do nothing
    } else {
      track.streakDays = 1;
    }

    track.lastStudyDate = today;
    this.cache.study_track = track;
    setLocalProgress(this.cache);
    this._queueSync("study_track", "streak", track);
  }

  getStreak() {
    return this.cache.study_track?.streakDays || 0;
  }

  // ---- Firestore Sync ----
  _queueSync(collection, key, data) {
    this._syncQueue.push({ collection, key, data });
    this._flushSync();
  }

  async _flushSync() {
    if (this._syncing || this._syncQueue.length === 0) return;
    if (!axiomAuth.user || axiomAuth.isAnonymous) return;

    this._syncing = true;
    const userId = axiomAuth.uid;

    while (this._syncQueue.length > 0) {
      const item = this._syncQueue.shift();
      try {
        const ref = doc(this.db, "users", userId, item.collection, item.key);
        await setDoc(ref, { ...item.data, _syncedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn("[Progress] Sync failed:", e);
        this._syncQueue.unshift(item); // Retry later
        break;
      }
    }

    this._syncing = false;
    if (this._syncQueue.length > 0) {
      setTimeout(() => this._flushSync(), 5000);
    }
  }

  // ---- Cloud Load (on login) ----
  async loadFromCloud() {
    if (!axiomAuth.user || axiomAuth.isAnonymous) return;

    try {
      const userId = axiomAuth.uid;
      const collections = ["progress", "quiz_scores", "weak_topics", "study_track", "analytics"];

      for (const col of collections) {
        const ref = doc(this.db, "users", userId, col, "_summary");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const cloud = snap.data();
          // Merge: cloud wins for newer data
          this.cache[col] = { ...(this.cache[col] || {}), ...cloud };
        }
      }

      setLocalProgress(this.cache);
    } catch (e) {
      console.warn("[Progress] Cloud load failed:", e);
    }
  }

  // ---- Summary for Profile ----
  getProfileSummary() {
    const scores = this.cache.quiz_scores || {};
    const progress = this.cache.progress || {};
    const analytics = this.cache.analytics || {};

    const totalQuizzes = Object.keys(scores).length;
    const avgAccuracy = totalQuizzes > 0
      ? Math.round(Object.values(scores).reduce((s, q) => s + q.accuracy, 0) / totalQuizzes)
      : 0;

    const chaptersCompleted = Object.values(progress).filter(p => p.completed).length;
    const totalChapters = Object.keys(progress).length;

    return {
      displayName: axiomAuth.displayName,
      email: axiomAuth.email,
      photoURL: axiomAuth.photoURL,
      isAnonymous: axiomAuth.isAnonymous,
      streakDays: this.getStreak(),
      totalStudyMinutes: analytics.totalStudyMinutes || 0,
      totalQuizzesTaken: analytics.totalQuizzesTaken || 0,
      totalCardsReviewed: analytics.totalCardsReviewed || 0,
      chaptersCompleted,
      totalChapters,
      avgAccuracy,
      weakTopics: this.getWeakTopics()
    };
  }

  // ---- Analytics Page Helpers ----
  getQuizHistory(limit = 20) {
    const history = this.cache.quiz_history || [];
    return history.slice(-limit).reverse();
  }

  getWeeklyActivity() {
    const daily = this.cache.daily_activity || {};
    const labels = [];
    const minutes = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      labels.push(d.toLocaleDateString(undefined, { weekday: "short" }));
      minutes.push(Math.round(daily[key] || 0));
    }
    return { labels, minutes };
  }

  getTopicBreakdown() {
    const scores = this.cache.quiz_scores || {};
    const topics = {};

    Object.values(scores).forEach(entry => {
      const topic = entry.topic;
      if (!topics[topic]) topics[topic] = { total: 0, correct: 0, attempts: 0 };
      topics[topic].total += entry.total;
      topics[topic].correct += entry.score;
      topics[topic].attempts += 1;
    });

    return Object.entries(topics).map(([topic, d]) => ({
      topic,
      accuracy: Math.round((d.correct / d.total) * 100),
      attempts: d.attempts
    })).sort((a, b) => a.accuracy - b.accuracy);
  }

  getRecommendedActions() {
    const breakdown = this.getTopicBreakdown();
    const weak = breakdown.filter(t => t.accuracy < 50).slice(0, 3);
    if (weak.length === 0) {
      return [{ text: "Take a new quiz to keep building your mastery profile.", href: "/quiz/" }];
    }
    return weak.map(t => ({
      text: `Practice ${t.topic.replace(/_/g, " ")} — currently ${t.accuracy}% accuracy`,
      href: `/quiz/jamb/physics/${t.topic}/`
    }));
  }
}

export const progressTracker = new ProgressTracker();
export default progressTracker;
