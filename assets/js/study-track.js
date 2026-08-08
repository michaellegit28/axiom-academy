/**
 * Axiom Academy — Study Track & Daily Missions
 * AI-generated study plans, streak tracking, schedule display
 */

(function() {
  'use strict';

  class StudyTrackManager {
    constructor() {
      this.user = window.AxiomApp?.user;
      this.db = window.AxiomApp?.db;
      this.schedule = [];
      this.streak = 0;

      this.init();
    }

    async init() {
      await this.loadSchedule();
      this.renderDailyMission();
      this.renderSchedule();
      this.updateStreak();
    }

    async loadSchedule() {
      // Try to load from Firestore first
      if (this.user && this.db) {
        try {
          const doc = await this.db.collection('users').doc(this.user.uid).get();
          if (doc.exists) {
            const data = doc.data();
            this.schedule = data.study_track?.schedule || [];
            this.streak = data.study_track?.streakDays || 0;
          }
        } catch (e) {
          console.warn('[StudyTrack] Failed to load from cloud:', e);
        }
      }

      // Fallback to localStorage
      if (!this.schedule.length) {
        const local = localStorage.getItem('axiom_study_schedule');
        if (local) this.schedule = JSON.parse(local);
      }

      // Generate default schedule if none exists
      if (!this.schedule.length) {
        this.generateDefaultSchedule();
      }
    }

    generateDefaultSchedule() {
      const today = new Date();
      const topics = [
        { title: 'Measurements & Units', tasks: ['Read Chapter 1', 'JAMB Quiz: 10 questions', 'Flashcards: 15 cards'] },
        { title: 'Kinematics', tasks: ['Read Chapter 2', 'Practice Problems', 'Flashcards: 15 cards'] },
        { title: 'Dynamics', tasks: ['Read Chapter 3', 'JAMB Quiz: 10 questions', 'Review weak topics'] },
        { title: 'Work, Energy & Power', tasks: ['Read Chapter 4', 'Theory Practice', 'Flashcards: 15 cards'] },
        { title: 'Circular Motion', tasks: ['Read Chapter 5', 'JAMB Quiz: 10 questions', 'Mock Exam Section'] }
      ];

      this.schedule = topics.map((t, i) => ({
        date: new Date(today.getTime() + (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        title: t.title,
        tasks: t.tasks.map(task => ({ text: task, done: false })),
        completed: false
      }));

      this.saveSchedule();
    }

    async saveSchedule() {
      localStorage.setItem('axiom_study_schedule', JSON.stringify(this.schedule));

      if (this.user && this.db) {
        try {
          await this.db.collection('users').doc(this.user.uid).update({
            'study_track.schedule': this.schedule,
            'study_track.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (e) {
          console.warn('[StudyTrack] Failed to save to cloud:', e);
        }
      }
    }

    renderDailyMission() {
      const container = document.querySelector('.mission-list');
      if (!container) return;

      const today = new Date().toISOString().split('T')[0];
      const todayPlan = this.schedule.find(s => s.date === today) || this.schedule[0];

      if (!todayPlan) return;

      container.innerHTML = todayPlan.tasks.map((task, i) => `
        <li class="mission-item ${task.done ? 'done' : ''}" data-index="${i}">
          <div class="mission-check ${task.done ? 'done' : ''}" onclick="studyTrack.toggleTask(0, ${i})"></div>
          <span>${task.text}</span>
        </li>
      `).join('');

      // Update streak display
      const streakEl = document.querySelector('.streak-badge');
      if (streakEl) {
        streakEl.innerHTML = `🔥 ${this.streak} day streak`;
      }
    }

    renderSchedule() {
      const container = document.querySelector('.schedule-timeline');
      if (!container) return;

      const today = new Date().toISOString().split('T')[0];

      container.innerHTML = this.schedule.slice(0, 14).map((day, i) => {
        const isDone = day.completed;
        const isToday = day.date === today;
        const dateObj = new Date(day.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        return `
          <div class="schedule-item ${isDone ? 'done' : ''} ${isToday ? 'active' : ''}">
            <div class="schedule-date">${dateStr}</div>
            <div class="schedule-title">${day.title}</div>
            <div class="schedule-desc">${day.tasks.length} tasks · ${day.tasks.filter(t => t.done).length}/${day.tasks.length} completed</div>
          </div>
        `;
      }).join('');
    }

    toggleTask(dayIndex, taskIndex) {
      if (!this.schedule[dayIndex]) return;

      const task = this.schedule[dayIndex].tasks[taskIndex];
      task.done = !task.done;

      // Check if all tasks done
      const allDone = this.schedule[dayIndex].tasks.every(t => t.done);
      this.schedule[dayIndex].completed = allDone;

      if (allDone) {
        this.incrementStreak();
      }

      this.saveSchedule();
      this.renderDailyMission();
      this.renderSchedule();
    }

    incrementStreak() {
      const lastActive = localStorage.getItem('axiom_last_active');
      const today = new Date().toDateString();

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === yesterday.toDateString()) {
          this.streak++;
        } else {
          this.streak = 1;
        }

        localStorage.setItem('axiom_last_active', today);
        localStorage.setItem('axiom_streak', this.streak);

        // Update Firestore
        if (this.user && this.db) {
          this.db.collection('users').doc(this.user.uid).update({
            'study_track.streakDays': this.streak,
            'study_track.lastActive': firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }

    updateStreak() {
      const saved = localStorage.getItem('axiom_streak');
      if (saved) this.streak = parseInt(saved);
    }
  }

  // Initialize
  if (document.querySelector('.study-track-header') || document.querySelector('.daily-mission')) {
    window.studyTrack = new StudyTrackManager();
  }
})();
