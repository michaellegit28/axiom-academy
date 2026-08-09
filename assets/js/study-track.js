/**
 * Axiom Academy — Study Track Generator (Phase 5)
 * Creates personalized daily schedules based on exam date and weak topics.
 */

import { progressTracker } from "./progress.js";

export class StudyTrack {
  constructor() {
    this.tracks = {
      jamb: { name: "JAMB Prep", duration: 180, topics: ["measurements", "kinematics", "dynamics", "thermal", "waves", "optics", "electricity", "modern"] },
      waec: { name: "WAEC Prep", duration: 240, topics: ["mechanics", "thermal", "waves", "electricity", "atomic"] },
      masterclass: { name: "Physics Masterclass", duration: 365, topics: [] } // Self-paced
    };
  }

  generate(trackId, examDate = null) {
    const track = this.tracks[trackId];
    if (!track) return null;

    const today = new Date();
    const endDate = examDate ? new Date(examDate) : new Date(today.getTime() + track.duration * 24 * 60 * 60 * 1000);
    const daysLeft = Math.max(1, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    const weak = progressTracker.getWeakTopics();
    const weakTopics = [...weak.weak, ...weak.needsPractice];

    const schedule = [];

    if (trackId === "masterclass") {
      // Self-paced: unlock next volume at 80%
      schedule.push({
        type: "mastery",
        message: "Masterclass is self-paced. Complete each volume to 80% to unlock the next.",
        daily: [
          { task: "Read 1 chapter", duration: 45 },
          { task: "Quiz on chapter topics", duration: 20 },
          { task: "Review flashcards", duration: 15 }
        ]
      });
    } else {
      // Exam prep: distribute topics across remaining days
      const topicsPerDay = Math.ceil(track.topics.length / daysLeft);
      const dailyMinutes = Math.min(120, Math.max(30, Math.floor(240 / daysLeft * 30)));

      for (let day = 0; day < Math.min(daysLeft, 14); day++) {
        const dayTopics = [];
        for (let i = 0; i < topicsPerDay; i++) {
          const idx = (day * topicsPerDay + i) % track.topics.length;
          dayTopics.push(track.topics[idx]);
        }

        // Prioritize weak topics
        const priority = weakTopics.find(t => dayTopics.includes(t)) || dayTopics[0];

        schedule.push({
          day: day + 1,
          date: new Date(today.getTime() + day * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          focus: priority,
          tasks: [
            { task: `Read: ${priority}`, duration: Math.floor(dailyMinutes * 0.4) },
            { task: `Quiz: ${priority}`, duration: Math.floor(dailyMinutes * 0.35) },
            { task: "Flashcards", duration: Math.floor(dailyMinutes * 0.25) }
          ],
          totalMinutes: dailyMinutes
        });
      }
    }

    return {
      track: trackId,
      trackName: track.name,
      examDate: endDate.toISOString().split("T")[0],
      daysLeft,
      schedule
    };
  }

  saveGoal(trackId, examDate) {
    const data = this.generate(trackId, examDate);
    localStorage.setItem("axiom_study_track", JSON.stringify(data));
    return data;
  }

  loadGoal() {
    const raw = localStorage.getItem("axiom_study_track");
    return raw ? JSON.parse(raw) : null;
  }
}

// Auto-render study track UI if container exists
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("study-track");
  if (!container) return;

  const tracker = new StudyTrack();
  const saved = tracker.loadGoal();

  if (saved) {
    renderTrack(saved);
  } else {
    container.innerHTML = `
      <div class="track-empty">
        <h3>🎯 Set Your Study Goal</h3>
        <p>Choose an exam and target date to generate a personalized study plan.</p>
        <div class="track-options">
          <button class="track-btn" data-track="jamb">JAMB Prep</button>
          <button class="track-btn" data-track="waec">WAEC Prep</button>
          <button class="track-btn" data-track="masterclass">Masterclass</button>
        </div>
        <div class="track-date" style="display:none;">
          <label>Target Date:</label>
          <input type="date" id="track-date-input">
          <button class="btn-primary" id="track-generate">Generate Plan</button>
        </div>
      </div>
    `;

    let selectedTrack = null;
    container.querySelectorAll(".track-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedTrack = btn.dataset.track;
        container.querySelector(".track-date").style.display = "block";
        // Set default date
        const d = new Date();
        d.setMonth(d.getMonth() + (selectedTrack === "jamb" ? 6 : 8));
        document.getElementById("track-date-input").value = d.toISOString().split("T")[0];
      });
    });

    document.getElementById("track-generate")?.addEventListener("click", () => {
      const date = document.getElementById("track-date-input").value;
      if (selectedTrack && date) {
        const plan = tracker.saveGoal(selectedTrack, date);
        renderTrack(plan);
      }
    });
  }

  function renderTrack(plan) {
    let html = `
      <div class="track-header">
        <h3>🎯 ${plan.trackName}</h3>
        <p>${plan.daysLeft} days until ${plan.examDate}</p>
      </div>
      <div class="track-schedule">
    `;

    plan.schedule.slice(0, 7).forEach(day => {
      html += `
        <div class="track-day">
          <div class="track-day-header">
            <span class="track-day-num">Day ${day.day}</span>
            <span class="track-day-date">${day.date}</span>
          </div>
          <div class="track-focus">Focus: ${day.focus || "General Review"}</div>
          <ul class="track-tasks">
            ${day.tasks.map(t => `<li><span>${t.task}</span><span>${t.duration} min</span></li>`).join("")}
          </ul>
          <div class="track-total">Total: ${day.totalMinutes || day.tasks.reduce((s,t)=>s+t.duration,0)} min</div>
        </div>
      `;
    });

    html += `</div><button class="btn-outline btn-block" id="track-reset" style="margin-top:1rem;">Change Goal</button>`;
    container.innerHTML = html;

    document.getElementById("track-reset")?.addEventListener("click", () => {
      localStorage.removeItem("axiom_study_track");
      window.location.reload();
    });
  }
});
