/**
 * Axiom Academy — Daily Mission Widget (Phase 5)
 * Generates personalized daily tasks based on weak topics, streak, and progress.
 */

import { axiomAuth } from "./auth.js";
import { progressTracker } from "./progress.js";

export class DailyMission {
  constructor() {
    this.tasks = [];
    this.completed = new Set();
    this._loadState();
  }

  _loadState() {
    const today = new Date().toDateString();
    const raw = localStorage.getItem("axiom_mission_state");
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === today) {
        this.completed = new Set(data.completed || []);
      }
    }
  }

  _saveState() {
    localStorage.setItem("axiom_mission_state", JSON.stringify({
      date: new Date().toDateString(),
      completed: Array.from(this.completed)
    }));
  }

  generate() {
    const summary = progressTracker.getProfileSummary();
    const weak = summary.weakTopics?.weak || [];
    const practice = summary.weakTopics?.needsPractice || [];
    const tasks = [];

    // Task 1: Read next chapter (always present)
    const nextChapter = this._getNextChapter();
    if (nextChapter) {
      tasks.push({
        id: "read",
        icon: "📖",
        label: `Read: ${nextChapter.title}`,
        duration: "30 min",
        action: nextChapter.url,
        type: "link"
      });
    }

    // Task 2: Quiz on weak topic (highest priority)
    const targetTopic = weak[0] || practice[0];
    if (targetTopic) {
      tasks.push({
        id: "quiz",
        icon: "🧪",
        label: `Quiz: ${this._formatTopic(targetTopic)}`,
        duration: "20 min",
        action: `/quiz/jamb/physics/${targetTopic}/`,
        type: "link"
      });
    }

    // Task 3: Flashcards
    tasks.push({
      id: "flash",
      icon: "🎴",
      label: "Flashcards: 15 cards",
      duration: "10 min",
      action: "/flash/physics/kinematics/",
      type: "link"
    });

    // Task 4: Review weak topic (if any)
    if (weak.length > 0) {
      tasks.push({
        id: "review",
        icon: "🔁",
        label: `Review: ${this._formatTopic(weak[0])}`,
        duration: "15 min",
        action: `/read/physics/`,
        type: "link"
      });
    }

    this.tasks = tasks;
    return tasks;
  }

  _getNextChapter() {
    // Try to find from page context first
    const article = document.querySelector("[data-volume]");
    if (article) {
      const vol = parseInt(article.dataset.volume, 10);
      const ch = parseInt(article.dataset.chapter, 10);
      const subject = article.dataset.subject || "physics";
      return {
        title: `Vol ${vol} Ch ${ch + 1}`,
        url: `/read/${subject}/vol${vol}/ch${ch + 1}/`
      };
    }
    // Fallback
    return { title: "Continue Reading", url: "/read/" };
  }

  _formatTopic(slug) {
    return slug.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }

  isComplete(taskId) {
    return this.completed.has(taskId);
  }

  toggle(taskId) {
    if (this.completed.has(taskId)) {
      this.completed.delete(taskId);
    } else {
      this.completed.add(taskId);
      // Track analytics
      progressTracker._updateAnalytics("mission", 0);
    }
    this._saveState();
    return this.completed.has(taskId);
  }

  getProgress() {
    if (this.tasks.length === 0) return 0;
    return Math.round((this.completed.size / this.tasks.length) * 100);
  }

  getStreak() {
    return progressTracker.getStreak();
  }
}

// Auto-init widget if container exists
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("daily-mission");
  if (!container) return;

  const mission = new DailyMission();
  const tasks = mission.generate();

  function render() {
    const progress = mission.getProgress();
    const streak = mission.getStreak();

    let html = `
      <div class="mission-header">
        <div class="mission-title">
          <span class="mission-icon">🔥</span>
          <span>Today's Mission</span>
        </div>
        <div class="mission-progress">
          <div class="mission-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="ring-fill" stroke-dasharray="${progress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <span class="ring-text">${progress}%</span>
          </div>
        </div>
      </div>
      <div class="mission-streak">${streak > 0 ? `🔥 ${streak} day streak` : "Start your streak today!"}</div>
      <ul class="mission-list">
    `;

    tasks.forEach(task => {
      const done = mission.isComplete(task.id);
      html += `
        <li class="mission-item${done ? " done" : ""}" data-task="${task.id}">
          <span class="mission-check">${done ? "✅" : "⬜"}</span>
          <div class="mission-content">
            <span class="mission-label">${task.icon} ${task.label}</span>
            <span class="mission-duration">${task.duration}</span>
          </div>
          ${!done && task.type === "link" ? `<a href="${task.action}" class="mission-go">Go →</a>` : ""}
        </li>
      `;
    });

    html += `</ul>`;
    container.innerHTML = html;

    // Bind clicks
    container.querySelectorAll(".mission-item").forEach(item => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".mission-go")) return;
        const id = item.dataset.task;
        const nowDone = mission.toggle(id);
        item.classList.toggle("done", nowDone);
        item.querySelector(".mission-check").textContent = nowDone ? "✅" : "⬜";
        render(); // Re-render to update progress ring
      });
    });
  }

  render();
});
