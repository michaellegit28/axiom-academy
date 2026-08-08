/**
 * Axiom Academy — Flashcard Engine with SM-2 Spaced Repetition
 * Offline-first (IndexedDB + localStorage), syncs to Firestore when authenticated.
 */

import { axiomAuth } from "./auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---- IndexedDB Helper (inline, no dependencies) ----
const DB_NAME = "AxiomFlashDB";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("progress")) {
        db.createObjectStore("progress", { keyPath: "deckId" });
      }
      if (!db.objectStoreNames.contains("decks")) {
        db.createObjectStore("decks", { keyPath: "deckId" });
      }
    };
  });
}

async function dbGet(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(store, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---- SM-2 Algorithm ----
class SM2Engine {
  review(card, quality) {
    // quality: 0=Again, 1=Hard, 2=Good, 3=Easy
    let interval = card.interval || 0;
    let repetition = card.repetition || 0;
    let ef = card.ef || 2.5;

    if (quality < 2) {
      repetition = 0;
      interval = 1;
    } else {
      repetition += 1;
      if (repetition === 1) interval = 1;
      else if (repetition === 2) interval = 6;
      else interval = Math.round(interval * ef);
    }

    ef = ef + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
    ef = Math.max(1.3, ef);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + interval);

    return {
      interval,
      repetition,
      ef,
      dueDate: dueDate.getTime(),
      lastReviewed: Date.now(),
      state: repetition === 0 ? "learning" : "review"
    };
  }
}

// ---- Deck Manager ----
export class FlashcardDeck {
  constructor(deckId, subject = "physics") {
    this.deckId = deckId;
    this.subject = subject;
    this.sm2 = new SM2Engine();
    this.cards = [];
    this.progress = {}; // { cardIndex: sm2State }
    this.db = null;
    this._initPromise = this._init();
  }

  async _init() {
    // Load from IndexedDB first
    const stored = await dbGet("progress", this.deckId);
    if (stored && stored.data) {
      this.progress = stored.data;
    } else {
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem(`axiom_flash_${this.deckId}`);
        if (raw) this.progress = JSON.parse(raw);
      } catch (e) { /* ignore */ }
    }

    // If authenticated, try to merge cloud data
    await this._loadFromCloud();
  }

  async ready() {
    await this._initPromise;
  }

  async loadCards(cardsData) {
    await this.ready();
    this.cards = cardsData.map((card, idx) => ({
      ...card,
      _index: idx,
      _progress: this.progress[idx] || {}
    }));
  }

  getDueCards() {
    const now = Date.now();
    return this.cards.filter(card => {
      const prog = card._progress;
      if (!prog || !prog.dueDate) return true;
      return prog.dueDate <= now;
    });
  }

  getStats() {
    const due = this.getDueCards().length;
    const known = this.cards.filter(c => (c._progress.repetition || 0) >= 3).length;
    const learning = this.cards.filter(c => c._progress.state === "learning").length;
    const newCards = this.cards.filter(c => !c._progress.state).length;
    return { due, known, learning, new: newCards, total: this.cards.length };
  }

  review(cardIndex, quality) {
    const card = this.cards[cardIndex];
    const updated = this.sm2.review(card._progress || {}, quality);

    this.progress[cardIndex] = updated;
    this.cards[cardIndex]._progress = updated;

    this._saveLocal();
    this._syncToCloud(cardIndex, updated);

    return updated;
  }

  async _saveLocal() {
    // IndexedDB
    await dbPut("progress", { deckId: this.deckId, data: this.progress, ts: Date.now() });
    // localStorage fallback
    try {
      localStorage.setItem(`axiom_flash_${this.deckId}`, JSON.stringify(this.progress));
    } catch (e) { /* quota exceeded */ }
  }

  async _syncToCloud(cardIndex, progress) {
    const user = axiomAuth.user;
    if (!user || axiomAuth.isAnonymous) return;

    try {
      const db = getFirestore(window.firebaseApp);
      const ref = doc(db, "users", user.uid, "flashcard_progress", this.deckId);
      await setDoc(ref, {
        [`card_${cardIndex}`]: progress,
        lastSync: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("[Flashcards] Cloud sync failed:", e);
    }
  }

  async _loadFromCloud() {
    const user = axiomAuth.user;
    if (!user || axiomAuth.isAnonymous) return;

    try {
      const db = getFirestore(window.firebaseApp);
      const ref = doc(db, "users", user.uid, "flashcard_progress", this.deckId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        let merged = false;
        Object.keys(data).forEach(key => {
          if (key.startsWith("card_")) {
            const idx = parseInt(key.replace("card_", ""), 10);
            const cloud = data[key];
            const local = this.progress[idx];
            // Keep whichever was reviewed more recently
            if (!local || (cloud.lastReviewed || 0) > (local.lastReviewed || 0)) {
              this.progress[idx] = cloud;
              merged = true;
            }
          }
        });
        if (merged) await this._saveLocal();
      }
    } catch (e) {
      console.warn("[Flashcards] Cloud load failed:", e);
    }
  }

  // Reset a card (for "hard reset" feature)
  resetCard(cardIndex) {
    delete this.progress[cardIndex];
    if (this.cards[cardIndex]) this.cards[cardIndex]._progress = {};
    this._saveLocal();
  }
}

// ---- UI Controller ----
export class FlashcardUI {
  constructor(containerSelector, deck) {
    this.container = document.querySelector(containerSelector);
    this.deck = deck;
    this.dueCards = [];
    this.currentIndex = 0;
    this.els = {};
    this._bindElements();
    this._bindEvents();
  }

  _bindElements() {
    const c = this.container;
    this.els = {
      card: c.querySelector(".flash-card"),
      front: c.querySelector(".card-front-content"),
      back: c.querySelector(".card-back-content"),
      controls: c.querySelector(".flash-controls"),
      empty: c.querySelector(".flash-empty"),
      stats: {
        due: c.querySelector(".stat-due"),
        total: c.querySelector(".stat-total"),
        known: c.querySelector(".stat-known")
      }
    };
  }

  _bindEvents() {
    // Flip on card tap
    this.els.card?.addEventListener("click", () => {
      this.els.card.classList.toggle("flipped");
    });

    // Rating buttons
    this.container.querySelectorAll("[data-quality]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const quality = parseInt(e.currentTarget.dataset.quality, 10);
        this._handleRating(quality);
      });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (!this.els.controls || this.els.controls.style.display === "none") return;
      const map = { "1": 0, "2": 1, "3": 2, "4": 3 };
      if (map[e.key] !== undefined) {
        e.preventDefault();
        this._handleRating(map[e.key]);
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.els.card.classList.toggle("flipped");
      }
    });
  }

  start() {
    this.dueCards = this.deck.getDueCards();
    this.currentIndex = 0;
    this._render();
  }

  _render() {
    if (this.dueCards.length === 0) {
      this.els.card.style.display = "none";
      this.els.controls.style.display = "none";
      this.els.empty.style.display = "flex";
      this._updateStats();
      return;
    }

    this.els.empty.style.display = "none";
    this.els.card.style.display = "block";
    this.els.controls.style.display = "grid";
    this.els.card.classList.remove("flipped");

    const card = this.dueCards[this.currentIndex];
    this.els.front.innerHTML = card.front;
    this.els.back.innerHTML = card.back;

    this._updateStats();
  }

  _updateStats() {
    const s = this.deck.getStats();
    if (this.els.stats.due) this.els.stats.due.textContent = s.due;
    if (this.els.stats.total) this.els.stats.total.textContent = s.total;
    if (this.els.stats.known) this.els.stats.known.textContent = s.known;
  }

  _handleRating(quality) {
    const card = this.dueCards[this.currentIndex];
    const realIndex = card._index;

    this.deck.review(realIndex, quality);

    // Remove from due if Good/Easy, else move to end of session
    if (quality >= 2) {
      this.dueCards.splice(this.currentIndex, 1);
    } else {
      this.currentIndex++;
    }

    if (this.currentIndex >= this.dueCards.length) {
      this.currentIndex = 0;
    }

    // Animate out
    this.els.card.classList.add("slide-out");
    setTimeout(() => {
      this.els.card.classList.remove("slide-out", "flipped");
      this._render();
    }, 250);
  }
}
