/** Axiom Academy — study routing */
import { getState, setActivity, subscribe } from "./axiom-state.js";

// GitHub Pages serves the app from /axiom-academy, not from the domain root.
// Keep the routing base in sync with Jekyll's configured baseurl.
const base = (window.AXIOM_BASE_URL || "").replace(/\/$/, "");
const routes = Object.freeze({
  university: `${base}/university/`,
  "high-school": `${base}/high-school/`,
  extras: `${base}/extras/`
});

function currentStudyRoute() {
  return routes[getState().domain] || routes["high-school"];
}

export function initStudyRouting() {
  const studyLinks = document.querySelectorAll('[data-activity="study"], #mobile-study-link');
  studyLinks.forEach(link => {
    link.href = currentStudyRoute();
    link.addEventListener("click", () => setActivity("study"));
  });

  subscribe(state => {
    const route = routes[state.domain] || routes["high-school"];
    studyLinks.forEach(link => { link.href = route; });
  });
}

window.AxiomStudyRouting = Object.freeze({ currentStudyRoute, initStudyRouting });
