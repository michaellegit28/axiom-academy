/**
 * Axiom Academy — Quiz Engine
 * Supports: JAMB (objective), WAEC (theory + objective), Masterclass (brainstorming + objective)
 */

(function() {
  'use strict';

  class QuizEngine {
    constructor() {
      this.config = window.QUIZ_CONFIG || {};
      this.questions = [];
      this.currentIndex = 0;
      this.answers = {};
      this.score = 0;
      this.timer = null;
      this.timeRemaining = (this.config.timeLimit || 0) * 60;
      this.startTime = null;

      this.container = document.getElementById('quiz-container');
      this.controls = document.getElementById('quiz-controls');
      this.results = document.getElementById('quiz-results');
      this.progressEl = document.getElementById('quiz-progress');
      this.timerEl = document.getElementById('quiz-timer');

      this.init();
    }

    async init() {
      await this.loadQuestions();
      this.renderQuestion();
      this.setupControls();
      this.startTimer();
      this.startTime = Date.now();
    }

    async loadQuestions() {
      try {
        // Try to load from data attribute or embedded data
        const dataEl = document.getElementById('quiz-data');
        if (dataEl) {
          this.questions = JSON.parse(dataEl.textContent);
        } else if (this.config.dataUrl) {
          const resp = await fetch(this.config.dataUrl);
          const data = await resp.json();
          this.questions = data.questions || [];
        }

        // Fallback: generate sample questions if none loaded
        if (!this.questions.length) {
          this.questions = this.getSampleQuestions();
        }

        console.log('[Quiz] Loaded', this.questions.length, 'questions');
      } catch (e) {
        console.warn('[Quiz] Failed to load questions:', e);
        this.questions = this.getSampleQuestions();
      }
    }

    getSampleQuestions() {
      return [
        {
          id: 'sample-1',
          type: 'objective',
          question: 'A body moving with uniform acceleration has a velocity of 10 m/s at a certain instant and 20 m/s after 5 seconds. What is its acceleration?',
          options: ['A. 1 m/s²', 'B. 2 m/s²', 'C. 3 m/s²', 'D. 4 m/s²'],
          correct: 1,
          explanation: 'Using v = u + at: 20 = 10 + a(5), so a = 2 m/s².',
          topic: 'kinematics',
          difficulty: 'easy'
        },
        {
          id: 'sample-2',
          type: 'objective',
          question: 'The SI unit of electric charge is the:',
          options: ['A. Ampere', 'B. Coulomb', 'C. Volt', 'D. Ohm'],
          correct: 1,
          explanation: 'The coulomb (C) is the SI unit of electric charge.',
          topic: 'electricity',
          difficulty: 'easy'
        },
        {
          id: 'sample-3',
          type: 'objective',
          question: 'In a simple pendulum, the period depends on:',
          options: ['A. Mass and length', 'B. Length and gravitational acceleration', 'C. Mass and amplitude', 'D. Amplitude and density'],
          correct: 1,
          explanation: 'T = 2π√(L/g). The period depends only on length and g, not on mass.',
          topic: 'mechanics',
          difficulty: 'medium'
        }
      ];
    }

    renderQuestion() {
      const q = this.questions[this.currentIndex];
      if (!q) return this.showResults();

      this.updateProgress();

      let html = `
        <div class="quiz-question" data-index="${this.currentIndex}">
          <div class="question-number">Question ${this.currentIndex + 1} of ${this.questions.length}</div>
          <div class="question-text">${this.renderMath(q.question)}</div>
      `;

      if (q.type === 'objective') {
        html += `<div class="options-list">`;
        q.options.forEach((opt, i) => {
          const selected = this.answers[q.id] === i ? 'selected' : '';
          const letter = String.fromCharCode(65 + i);
          html += `
            <div class="option-item ${selected}" data-index="${i}" onclick="quiz.selectOption('${q.id}', ${i})">
              <span class="option-letter">${letter}</span>
              <span>${this.renderMath(opt)}</span>
            </div>
          `;
        });
        html += `</div>`;
      } else if (q.type === 'theory') {
        const saved = this.answers[q.id] || '';
        html += `
          <textarea class="theory-textarea" 
            placeholder="Type your answer here..."
            oninput="quiz.saveTheoryAnswer('${q.id}', this.value)"
          >${saved}</textarea>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem;">
            💡 Tip: Structure your answer with clear points for maximum marks.
          </p>
        `;
      }

      html += `</div>`;
      this.container.innerHTML = html;

      // Re-render MathJax
      if (window.MathJax) {
        window.MathJax.typesetPromise?.([this.container]);
      }
    }

    renderMath(text) {
      // Basic escape, MathJax will handle the rest
      return text;
    }

    selectOption(questionId, optionIndex) {
      this.answers[questionId] = optionIndex;

      // Update UI
      const items = this.container.querySelectorAll('.option-item');
      items.forEach((item, i) => {
        item.classList.toggle('selected', i === optionIndex);
      });
    }

    saveTheoryAnswer(questionId, value) {
      this.answers[questionId] = value;
    }

    setupControls() {
      const prevBtn = document.getElementById('btn-prev');
      const nextBtn = document.getElementById('btn-next');
      const submitBtn = document.getElementById('btn-submit');

      prevBtn?.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.renderQuestion();
        }
      });

      nextBtn?.addEventListener('click', () => {
        if (this.currentIndex < this.questions.length - 1) {
          this.currentIndex++;
          this.renderQuestion();
        } else {
          // Show submit on last question
          nextBtn.style.display = 'none';
          submitBtn.style.display = 'inline-flex';
        }
      });

      submitBtn?.addEventListener('click', () => this.submitQuiz());

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && this.currentIndex > 0) {
          this.currentIndex--;
          this.renderQuestion();
        } else if (e.key === 'ArrowRight') {
          if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.renderQuestion();
          }
        }
      });
    }

    updateProgress() {
      if (this.progressEl) {
        this.progressEl.textContent = `Question ${this.currentIndex + 1} of ${this.questions.length}`;
      }

      const prevBtn = document.getElementById('btn-prev');
      const nextBtn = document.getElementById('btn-next');
      const submitBtn = document.getElementById('btn-submit');

      if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
      if (nextBtn) nextBtn.style.display = this.currentIndex < this.questions.length - 1 ? 'inline-flex' : 'none';
      if (submitBtn) submitBtn.style.display = this.currentIndex === this.questions.length - 1 ? 'inline-flex' : 'none';
    }

    startTimer() {
      if (!this.config.timeLimit || !this.timerEl) return;

      this.updateTimerDisplay();

      this.timer = setInterval(() => {
        this.timeRemaining--;
        this.updateTimerDisplay();

        if (this.timeRemaining <= 0) {
          this.submitQuiz();
        }
      }, 1000);
    }

    updateTimerDisplay() {
      if (!this.timerEl) return;
      const mins = Math.floor(this.timeRemaining / 60);
      const secs = this.timeRemaining % 60;
      this.timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

      // Warning colors
      this.timerEl.classList.remove('warning', 'danger');
      if (this.timeRemaining < 60) this.timerEl.classList.add('danger');
      else if (this.timeRemaining < 180) this.timerEl.classList.add('warning');
    }

    submitQuiz() {
      clearInterval(this.timer);

      // Calculate score
      let correct = 0;
      const breakdown = [];
      const weakTopics = new Set();

      this.questions.forEach(q => {
        const userAnswer = this.answers[q.id];
        let isCorrect = false;

        if (q.type === 'objective') {
          isCorrect = userAnswer === q.correct;
          if (isCorrect) correct++;
          else weakTopics.add(q.topic);
        } else if (q.type === 'theory') {
          // Theory questions are saved for AI/manual review
          isCorrect = null; // pending review
        }

        breakdown.push({
          question: q.question.substring(0, 60) + '...',
          correct: isCorrect,
          topic: q.topic
        });
      });

      const objectiveQuestions = this.questions.filter(q => q.type === 'objective');
      this.score = objectiveQuestions.length > 0 
        ? Math.round((correct / objectiveQuestions.length) * 100) 
        : 0;

      // Save results
      this.saveResults(breakdown, Array.from(weakTopics));

      // Show results
      this.showResults(breakdown, Array.from(weakTopics));
    }

    async saveResults(breakdown, weakTopics) {
      const result = {
        exam: this.config.exam,
        subject: this.config.subject,
        topic: this.config.topic,
        score: this.score,
        totalQuestions: this.questions.length,
        timeSpent: Math.round((Date.now() - this.startTime) / 1000),
        weakTopics: weakTopics,
        timestamp: new Date().toISOString()
      };

      // Save locally
      const history = JSON.parse(localStorage.getItem('axiom_quiz_history') || '[]');
      history.push(result);
      localStorage.setItem('axiom_quiz_history', JSON.stringify(history));

      // Save to Firestore
      if (window.AxiomApp?.user && window.AxiomApp.db) {
        try {
          await window.AxiomApp.db.collection('users')
            .doc(window.AxiomApp.user.uid)
            .collection('quiz_results')
            .add({
              ...result,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

          // Update weak topics
          await window.AxiomApp.db.collection('users')
            .doc(window.AxiomApp.user.uid)
            .update({
              [`weak_topics.${this.config.subject}`]: firebase.firestore.FieldValue.arrayUnion(...weakTopics)
            });
        } catch (e) {
          console.warn('[Quiz] Failed to save to cloud:', e);
        }
      }
    }

    showResults(breakdown, weakTopics) {
      this.container.style.display = 'none';
      this.controls.style.display = 'none';
      this.results.style.display = 'block';

      // Animate score circle
      const scoreValue = document.getElementById('score-value');
      const scoreCircle = document.getElementById('score-circle');
      if (scoreValue) scoreValue.textContent = this.score + '%';
      if (scoreCircle) {
        const deg = (this.score / 100) * 360;
        scoreCircle.style.setProperty('--score-deg', deg + 'deg');
      }

      // Breakdown
      const breakdownEl = document.getElementById('results-breakdown');
      if (breakdownEl && breakdown) {
        breakdownEl.innerHTML = breakdown.slice(0, 5).map(item => {
          const status = item.correct === true ? 'correct' : item.correct === false ? 'incorrect' : 'skipped';
          const icon = item.correct === true ? '✓' : item.correct === false ? '✗' : '?';
          return `
            <div class="breakdown-item">
              <div class="breakdown-status ${status}">${icon}</div>
              <div class="breakdown-text">${item.question}</div>
            </div>
          `;
        }).join('');
      }

      // Weak topics alert
      const weakAlert = document.getElementById('weak-topics-alert');
      const weakList = document.getElementById('weak-topics-list');
      if (weakAlert && weakTopics && weakTopics.length > 0) {
        weakAlert.style.display = 'block';
        if (weakList) {
          weakList.innerHTML = weakTopics.map(t => 
            `<li>${t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`
          ).join('');
        }
      }
    }
  }

  // Initialize quiz if on quiz page
  if (document.querySelector('.quiz-wrapper')) {
    window.quiz = new QuizEngine();
  }
})();
