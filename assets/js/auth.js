/**
 * Axiom Academy — Auth Module (Phase 4)
 * Firebase Auth: Anonymous, Email/Password, Google Sign-In
 * Auto-initializes user doc in Firestore on first visit.
 */

import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class AxiomAuth {
  constructor() {
    this.auth = getAuth(window.firebaseApp);
    this.db = getFirestore(window.firebaseApp);
    this.user = null;
    this.isAnonymous = true;
    this.listeners = [];
    this._ready = false;
    this._readyCallbacks = [];
    this._userData = null;

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.user = user;
        this.isAnonymous = user.isAnonymous;
        await this._ensureUserDoc(user);
        this._userData = await this._fetchUserData(user.uid);
        this._ready = true;
        this._notifyReady();
        this._notifyListeners();
      } else {
        await signInAnonymously(this.auth);
      }
    });
  }

  whenReady() {
    return new Promise((resolve) => {
      if (this._ready && this.user) resolve(this.user);
      else this._readyCallbacks.push(resolve);
    });
  }

  _notifyReady() {
    this._readyCallbacks.forEach(cb => cb(this.user));
    this._readyCallbacks = [];
  }

  async _ensureUserDoc(user) {
    const ref = doc(this.db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        profile: {
          displayName: user.displayName || "Learner",
          email: user.email || null,
          avatar: user.photoURL || null,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        },
        progress: {},
        quiz_scores: {},
        weak_topics: {},
        study_track: {
          currentGoal: null,
          dailyTargetMinutes: 60,
          streakDays: 0,
          lastStudyDate: null
        },
        flashcard_progress: {},
        analytics: {
          totalStudyMinutes: 0,
          totalQuizzesTaken: 0,
          totalCardsReviewed: 0,
          chaptersRead: 0,
          lastActiveDate: null
        }
      });
    } else {
      await updateDoc(ref, {
        "profile.lastActive": serverTimestamp(),
        "analytics.lastActiveDate": serverTimestamp()
      });
    }
  }

  async _fetchUserData(uid) {
    const ref = doc(this.db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }

  onAuthChange(callback) {
    this.listeners.push(callback);
    if (this.user) callback(this.user, this.isAnonymous);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  _notifyListeners() {
    this.listeners.forEach(cb => cb(this.user, this.isAnonymous));
  }

  // ---- Email/Password ----
  async signUp(email, password, displayName) {
    if (this.isAnonymous && this.auth.currentUser) {
      // Upgrade anonymous account
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(this.auth.currentUser, credential);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      // Update Firestore profile
      await updateDoc(doc(this.db, "users", result.user.uid), {
        "profile.displayName": displayName || email.split("@")[0],
        "profile.email": email
      });
      this.user = result.user;
      this.isAnonymous = false;
      this._notifyListeners();
      return result.user;
    } else {
      // Fresh sign up
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      await this._ensureUserDoc(result.user);
      this.user = result.user;
      this.isAnonymous = false;
      this._notifyListeners();
      return result.user;
    }
  }

  async signIn(email, password) {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    this.user = result.user;
    this.isAnonymous = false;
    this._userData = await this._fetchUserData(result.user.uid);
    this._notifyListeners();
    return result.user;
  }

  async resetPassword(email) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // ---- Google ----
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    if (this.isAnonymous && this.auth.currentUser) {
      const result = await linkWithCredential(this.auth.currentUser, provider);
      this.user = result.user;
      this.isAnonymous = false;
      await updateDoc(doc(this.db, "users", result.user.uid), {
        "profile.displayName": result.user.displayName,
        "profile.email": result.user.email,
        "profile.avatar": result.user.photoURL
      });
      this._notifyListeners();
      return result.user;
    }
    const result = await signInWithPopup(this.auth, provider);
    this.user = result.user;
    this.isAnonymous = false;
    await this._ensureUserDoc(result.user);
    this._notifyListeners();
    return result.user;
  }

  // ---- Sign Out ----
  async signOut() {
    await signOut(this.auth);
    this.user = null;
    this.isAnonymous = true;
    this._userData = null;
    this._notifyListeners();
  }

  // ---- User Data Helpers ----
  get uid() { return this.user ? this.user.uid : null; }
  get displayName() { return this.user ? (this.user.displayName || "Learner") : "Guest"; }
  get email() { return this.user ? this.user.email : null; }
  get photoURL() { return this.user ? this.user.photoURL : null; }
  get userData() { return this._userData; }

  async refreshUserData() {
    if (!this.user) return null;
    this._userData = await this._fetchUserData(this.user.uid);
    return this._userData;
  }
}

export const axiomAuth = new AxiomAuth();
export default axiomAuth;
