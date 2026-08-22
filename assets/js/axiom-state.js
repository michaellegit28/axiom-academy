/**
 * Axiom Academy — canonical product state (Phase A)
 *
 * Domain answers WHAT the learner is learning.
 * Activity answers WHAT the learner is doing.
 *
 * This module intentionally has no UI dependencies so every page can use the
 * same state contract. State is persisted locally and exposed on window for
 * non-module/Jekyll templates.
 */

const STORAGE_KEY = "axiom-app-state";
const LEGACY_DOMAIN_KEY = "axiom-domain";

export const DOMAINS = Object.freeze({
  UNIVERSITY: "university",
  HIGH_SCHOOL: "high-school",
  EXTRAS: "extras"
});

export const ACTIVITIES = Object.freeze({
  STUDY: "study",
  QUIZ: "quiz",
  PROGRESS: "progress"
});

const DEFAULT_STATE = Object.freeze({
  domain: DOMAINS.HIGH_SCHOOL,
  activity: ACTIVITIES.STUDY
});

function isValidDomain(value) {
  return Object.values(DOMAINS).includes(value);
}

function isValidActivity(value) {
  return Object.values(ACTIVITIES).includes(value);
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        domain: isValidDomain(parsed.domain) ? parsed.domain : DEFAULT_STATE.domain,
        activity: isValidActivity(parsed.activity) ? parsed.activity : DEFAULT_STATE.activity
      };
    }
  } catch (error) {
    console.warn("[Axiom State] Could not read state:", error);
  }

  const legacy = localStorage.getItem(LEGACY_DOMAIN_KEY);
  return {
    ...DEFAULT_STATE,
    domain: isValidDomain(legacy) ? legacy : DEFAULT_STATE.domain
  };
}

let state = readState();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Keep the old key in sync while existing pages migrate to this module.
    localStorage.setItem(LEGACY_DOMAIN_KEY, state.domain);
  } catch (error) {
    console.warn("[Axiom State] Could not persist state:", error);
  }
}

function notify() {
  const snapshot = getState();
  listeners.forEach(listener => listener(snapshot));
  window.dispatchEvent(new CustomEvent("axiom:state-change", { detail: snapshot }));
}

export function getState() {
  return { ...state };
}

export function setDomain(domain) {
  if (!isValidDomain(domain)) {
    throw new Error(`Invalid Axiom domain: ${domain}`);
  }
  if (state.domain === domain) return getState();
  state = { ...state, domain };
  persist();
  notify();
  return getState();
}

export function setActivity(activity) {
  if (!isValidActivity(activity)) {
    throw new Error(`Invalid Axiom activity: ${activity}`);
  }
  if (state.activity === activity) return getState();
  state = { ...state, activity };
  persist();
  notify();
  return getState();
}

export function setState(nextState = {}) {
  const nextDomain = nextState.domain ?? state.domain;
  const nextActivity = nextState.activity ?? state.activity;
  if (!isValidDomain(nextDomain) || !isValidActivity(nextActivity)) {
    throw new Error("Invalid Axiom state");
  }
  state = { domain: nextDomain, activity: nextActivity };
  persist();
  notify();
  return getState();
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(getState());
  return () => listeners.delete(listener);
}

// Make the state contract available to legacy inline scripts/templates.
window.AxiomState = Object.freeze({
  DOMAINS,
  ACTIVITIES,
  getState,
  setDomain,
  setActivity,
  setState,
  subscribe
});

persist();
