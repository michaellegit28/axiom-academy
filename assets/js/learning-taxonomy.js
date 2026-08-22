/** Axiom Academy — shared learning taxonomy helpers */

export const HIGH_SCHOOL_STUDY_DEPARTMENTS = Object.freeze([
  { id: "sciences", name: "Sciences", subjects: ["physics", "chemistry", "biology"] },
  { id: "mathematics", name: "Mathematics", subjects: ["mathematics"] },
  { id: "languages", name: "Languages", subjects: ["english"] },
  { id: "social-sciences", name: "Social Sciences", subjects: ["economics", "geography", "government"] },
  { id: "arts-humanities", name: "Arts & Humanities", subjects: ["literature", "history", "religious-studies"] }
]);

export const HIGH_SCHOOL_EXAMS = Object.freeze([
  { id: "jamb", name: "JAMB / UTME", status: "live" },
  { id: "waec", name: "WAEC", status: "live" },
  { id: "international", name: "International", status: "roadmap" }
]);

export function getHighSchoolStudyDepartment(id) {
  return HIGH_SCHOOL_STUDY_DEPARTMENTS.find(department => department.id === id) || null;
}

export function getHighSchoolExam(id) {
  return HIGH_SCHOOL_EXAMS.find(exam => exam.id === id) || null;
}

export function isHighSchoolStudyContent(content) {
  return content?.domain === "high-school" && content?.department;
}

export function isHighSchoolExamContent(content) {
  return content?.domain === "high-school" && content?.exam;
}

window.AxiomLearningTaxonomy = Object.freeze({
  HIGH_SCHOOL_STUDY_DEPARTMENTS,
  HIGH_SCHOOL_EXAMS,
  getHighSchoolStudyDepartment,
  getHighSchoolExam,
  isHighSchoolStudyContent,
  isHighSchoolExamContent
});
