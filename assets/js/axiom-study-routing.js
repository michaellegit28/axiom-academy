/** Axiom Academy — Phase B study routing */
import { getState, setActivity, subscribe } from "./axiom-state.js";

const routes = Object.freeze({
  university: "/university/",
  "high-school": "/high-school/",
  extras: "/extras/"
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
