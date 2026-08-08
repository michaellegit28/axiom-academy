/**
 * Axiom Academy — Core Application Logic
 * Firebase Auth + Firestore integration
 * Multi-page app state management
 */

(function() {
  'use strict';

  // =====================
  // CONFIGURATION
  // =====================
  const FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // =====================
  // GLOBAL STATE
  // =====================
  window.AxiomApp = {
    user: null,
    db: null,
    auth: null,
    currentTrack: localStorage.getItem('axiom_track') || 'masterclass',
    currentSubject: localStorage.getItem('axiom_subject') || 'physics',

    // Initialize app
    init() {
      this.initFirebase();
      this.initAuth();
      this.initNav();
      this.initAuthModal();
      this.loadUserData();
    },

    // Initialize Firebase
    initFirebase() {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        console.log('[Axiom] Firebase initialized');
      } catch (e) {
        console.warn('[Axiom] Firebase init failed:', e);
      }
    },

    // Initialize Auth State Listener
    initAuth() {
      if (!this.auth) return;

      this.auth.onAuthStateChanged(user => {
        this.user = user;
        this.updateNavProfile();

        if (user) {
          console.log('[Axiom] User signed in:', user.email);
          this.syncLocalToCloud();
          this.showBanner('Welcome back, ' + (user.displayName || 'Student') + '!');
        } else {
          console.log('[Axiom] User signed out');
        }
      });
    },

    // Update navigation profile display
    updateNavProfile() {
      const nameEl = document.getElementById('profile-name');
      const avatarEl = document.getElementById('profile-avatar');

      if (!nameEl) return;

      if (this.user) {
        const displayName = this.user.displayName || this.user.email?.split('@')[0] || 'Student';
        nameEl.textContent = displayName;
        if (avatarEl) {
          avatarEl.innerHTML = '<span style="font-size:0.9rem;font-weight:700;">' + displayName.charAt(0).toUpperCase() + '</span>';
          avatarEl.style.background = 'var(--accent-masterclass)';
          avatarEl.style.color = 'var(--text-inverse)';
        }
      } else {
        nameEl.textContent = 'Sign In';
        if (avatarEl) {
          avatarEl.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
          avatarEl.style.background = 'var(--bg-tertiary)';
          avatarEl.style.color = 'var(--text-muted)';
        }
      }
    },

    // Initialize Navigation
    initNav() {
      // Highlight current tab
      const currentPath = window.location.pathname;
      document.querySelectorAll('.nav-tab, .mobile-tab').forEach(tab => {
        const href = tab.getAttribute('href');
        if (href && currentPath.includes(href.replace('{{ site.baseurl }}', ''))) {
          tab.classList.add('active');
        }
      });

      // Track switcher persistence
      document.querySelectorAll('[data-track]').forEach(el => {
        el.addEventListener('click', (e) => {
          const track = e.currentTarget.dataset.track;
          localStorage.setItem('axiom_track', track);
          this.currentTrack = track;
        });
      });
    },

    // Initialize Auth Modal
    initAuthModal() {
      const modal = document.getElementById('auth-modal');
      const closeBtn = document.getElementById('auth-close');
      const profileBtn = document.getElementById('nav-profile');
      const tabs = document.querySelectorAll('.auth-tab');
      const forms = {
        signin: document.getElementById('form-signin'),
        signup: document.getElementById('form-signup')
      };

      // Open modal
      if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
          if (this.user) {
            window.location.href = this.relativeUrl('/profile/');
          } else {
            e.preventDefault();
            modal.style.display = 'flex';
          }
        });
      }

      // Close modal
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });

      // Tab switching
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const target = tab.dataset.tab;
          Object.values(forms).forEach(f => f && (f.style.display = 'none'));
          if (forms[target]) forms[target].style.display = 'flex';
        });
      });

      // Sign In
      forms.signin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        await this.signIn(email, password);
      });

      // Sign Up
      forms.signup?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const exam = document.getElementById('signup-exam').value;
        const examDate = document.getElementById('signup-exam-date').value;
        await this.signUp(name, email, password, exam, examDate);
      });

      // Google Sign In
      document.getElementById('btn-google')?.addEventListener('click', () => {
        this.signInWithGoogle();
      });
    },

    // Sign In
    async signIn(email, password) {
      try {
        await this.auth.signInWithEmailAndPassword(email, password);
        document.getElementById('auth-modal').style.display = 'none';
        this.clearAuthError();
      } catch (err) {
        this.showAuthError(this.formatAuthError(err));
      }
    },

    // Sign Up
    async signUp(name, email, password, exam, examDate) {
      try {
        const cred = await this.auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name });

        // Create user document
        await this.db.collection('users').doc(cred.user.uid).set({
          profile: {
            displayName: name,
            email: email,
            examType: exam,
            examDate: examDate ? new Date(examDate) : null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          },
          progress: {},
          quiz_scores: {},
          weak_topics: { physics: [] },
          study_track: {
            currentGoal: exam.toUpperCase(),
            dailyTargetMinutes: 60,
            streakDays: 0,
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
          }
        });

        // Generate initial study plan
        this.generateStudyPlan(cred.user.uid, exam, examDate);

        document.getElementById('auth-modal').style.display = 'none';
        this.clearAuthError();
        this.showBanner('Account created! Your study plan is ready.');
      } catch (err) {
        this.showAuthError(this.formatAuthError(err));
      }
    },

    // Google Sign In
    async signInWithGoogle() {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await this.auth.signInWithPopup(provider);
        document.getElementById('auth-modal').style.display = 'none';
        this.clearAuthError();
      } catch (err) {
        this.showAuthError(this.formatAuthError(err));
      }
    },

    // Sign Out
    async signOut() {
      await this.auth.signOut();
      localStorage.removeItem('axiom_progress');
      window.location.reload();
    },

    // Format Firebase Auth Errors
    formatAuthError(err) {
      const codes = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account already exists with this email.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed.',
        'auth/network-request-failed': 'Network error. Check your connection.'
      };
      return codes[err.code] || err.message;
    },

    showAuthError(msg) {
      const el = document.getElementById('auth-error');
      if (el) el.textContent = msg;
    },

    clearAuthError() {
      const el = document.getElementById('auth-error');
      if (el) el.textContent = '';
    },

    // Show banner notification
    showBanner(msg) {
      const banner = document.getElementById('auth-banner');
      const message = document.getElementById('auth-message');
      if (banner && message) {
        message.textContent = msg;
        banner.style.display = 'flex';
        setTimeout(() => { banner.style.display = 'none'; }, 4000);
      }
    },

    // =====================
    // PROGRESS & DATA
    // =====================

    // Save reading progress
    async saveProgress(chapterId, percent) {
      const data = this.getLocalProgress();
      data[chapterId] = { percent, lastRead: Date.now() };
      localStorage.setItem('axiom_progress', JSON.stringify(data));

      if (this.user && this.db) {
        await this.db.collection('users').doc(this.user.uid)
          .collection('progress').doc(chapterId)
          .set({ percent, lastRead: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    },

    // Save bookmark
    async saveBookmark(url, isActive) {
      const bookmarks = JSON.parse(localStorage.getItem('axiom_bookmarks') || '[]');
      if (isActive) {
        if (!bookmarks.includes(url)) bookmarks.push(url);
      } else {
        const idx = bookmarks.indexOf(url);
        if (idx > -1) bookmarks.splice(idx, 1);
      }
      localStorage.setItem('axiom_bookmarks', JSON.stringify(bookmarks));

      if (this.user && this.db) {
        await this.db.collection('users').doc(this.user.uid)
          .update({ bookmarks });
      }
    },

    // Get local progress
    getLocalProgress() {
      return JSON.parse(localStorage.getItem('axiom_progress') || '{}');
    },

    // Sync local data to cloud
    async syncLocalToCloud() {
      if (!this.user || !this.db) return;

      const localProgress = this.getLocalProgress();
      const batch = this.db.batch();
      const ref = this.db.collection('users').doc(this.user.uid).collection('progress');

      Object.entries(localProgress).forEach(([chapterId, data]) => {
        batch.set(ref.doc(chapterId), {
          percent: data.percent,
          lastRead: new Date(data.lastRead)
        }, { merge: true });
      });

      await batch.commit();
      console.log('[Axiom] Local progress synced to cloud');
    },

    // Load user data from cloud
    async loadUserData() {
      if (!this.user || !this.db) return;

      try {
        const doc = await this.db.collection('users').doc(this.user.uid).get();
        if (doc.exists) {
          const data = doc.data();
          // Merge cloud progress with local
          const cloudProgress = data.progress || {};
          const localProgress = this.getLocalProgress();
          const merged = { ...localProgress, ...cloudProgress };
          localStorage.setItem('axiom_progress', JSON.stringify(merged));
        }
      } catch (e) {
        console.warn('[Axiom] Failed to load user data:', e);
      }
    },

    // =====================
    // STUDY PLAN GENERATOR
    // =====================

    async generateStudyPlan(userId, examType, examDate) {
      if (!this.db) return;

      const exam = examDate ? new Date(examDate) : null;
      const today = new Date();
      const daysUntilExam = exam ? Math.ceil((exam - today) / (1000 * 60 * 60 * 24)) : 180;

      // Topic lists by exam type
      const topics = {
        jamb: ['measurements', 'mechanics', 'thermal', 'waves', 'optics', 'electricity', 'modern'],
        waec: ['part1_mechanics', 'part2_thermal', 'part3_waves', 'part4_electricity', 'part5_atomic'],
        masterclass: ['vol0', 'vol1', 'vol2', 'vol3', 'vol4', 'vol5', 'vol6']
      };

      const selectedTopics = topics[examType] || topics.masterclass;
      const daysPerTopic = Math.floor(daysUntilExam / selectedTopics.length);

      const schedule = selectedTopics.map((topic, i) => ({
        date: new Date(today.getTime() + (i * daysPerTopic * 24 * 60 * 60 * 1000)),
        topic: topic,
        tasks: ['read', 'quiz', 'flashcards'],
        completed: false
      }));

      await this.db.collection('users').doc(userId).update({
        'study_track.schedule': schedule,
        'study_track.generatedAt': firebase.firestore.FieldValue.serverTimestamp()
      });
    },

    // =====================
    // UTILITIES
    // =====================

    relativeUrl(path) {
      const base = document.querySelector('meta[name="base-url"]')?.content || '';
      return base + path;
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.AxiomApp.init());
  } else {
    window.AxiomApp.init();
  }
})();
