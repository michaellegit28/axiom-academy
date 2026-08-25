/** GNOSTIRI — canonical product state. */

const STORAGE_KEY = "gnostiri-app-state";
const LEGACY_DOMAIN_KEY = "axiom-domain";
export const DOMAINS = Object.freeze({ UNIVERSITY: "university", HIGH_SCHOOL: "high-school", EXTRAS: "extras" });
export const ACTIVITIES = Object.freeze({ STUDY: "study", QUIZ: "quiz", PROGRESS: "progress" });
const DEFAULT_STATE = Object.freeze({ domain: DOMAINS.HIGH_SCHOOL, activity: ACTIVITIES.STUDY });
function isValidDomain(value) { return Object.values(DOMAINS).includes(value); }
function isValidActivity(value) { return Object.values(ACTIVITIES).includes(value); }
function readState() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const parsed = JSON.parse(raw); return { domain: isValidDomain(parsed.domain) ? parsed.domain : DEFAULT_STATE.domain, activity: isValidActivity(parsed.activity) ? parsed.activity : DEFAULT_STATE.activity }; } } catch (error) { console.warn("[GNOSTIRI State] Could not read state:", error); } const legacy = localStorage.getItem(LEGACY_DOMAIN_KEY); return { ...DEFAULT_STATE, domain: isValidDomain(legacy) ? legacy : DEFAULT_STATE.domain }; }
let state = readState();
const listeners = new Set();
function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); localStorage.setItem(LEGACY_DOMAIN_KEY, state.domain); } catch (error) { console.warn("[GNOSTIRI State] Could not persist state:", error); } }
function notify() { const snapshot = getState(); listeners.forEach(listener => listener(snapshot)); window.dispatchEvent(new CustomEvent("gnostiri:state-change", { detail: snapshot })); }
export function getState() { return { ...state }; }
export function setDomain(domain) { if (!isValidDomain(domain)) throw new Error(`Invalid GNOSTIRI domain: ${domain}`); if (state.domain === domain) return getState(); state = { ...state, domain }; persist(); notify(); return getState(); }
export function setActivity(activity) { if (!isValidActivity(activity)) throw new Error(`Invalid GNOSTIRI activity: ${activity}`); if (state.activity === activity) return getState(); state = { ...state, activity }; persist(); notify(); return getState(); }
export function setState(nextState = {}) { const nextDomain = nextState.domain ?? state.domain; const nextActivity = nextState.activity ?? state.activity; if (!isValidDomain(nextDomain) || !isValidActivity(nextActivity)) throw new Error("Invalid GNOSTIRI state"); state = { domain: nextDomain, activity: nextActivity }; persist(); notify(); return getState(); }
export function subscribe(listener) { listeners.add(listener); listener(getState()); return () => listeners.delete(listener); }
window.GnostiriState = Object.freeze({ DOMAINS, ACTIVITIES, getState, setDomain, setActivity, setState, subscribe });
persist();
