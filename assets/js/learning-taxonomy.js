/** Axiom Academy — shared learning taxonomy helpers */

// Canonical V1 hierarchy: Department → Subject → Topic → Subtopic.
// Mathematics is its own High School department. Its subject is Mathematics.
export const HIGH_SCHOOL_STUDY_DEPARTMENTS = Object.freeze([
  { id: "mathematics", name: "Mathematics", subjects: ["mathematics"] },
  { id: "sciences", name: "Sciences", subjects: ["physics", "chemistry", "biology"] },
  { id: "languages", name: "Languages", subjects: ["english"] },
  { id: "social-sciences", name: "Social Sciences", subjects: ["economics", "geography", "government"] },
  { id: "arts-humanities", name: "Arts & Humanities", subjects: ["literature", "history", "religious-studies"] },
  { id: "commercial", name: "Commercial", subjects: ["accounting", "commerce"] },
  { id: "technology", name: "Technology", subjects: ["computer-science"] }
]);

export const HIGH_SCHOOL_EXAMS = Object.freeze([
  { id: "jamb", name: "JAMB / UTME", status: "live" },
  { id: "waec", name: "WAEC", status: "live" },
  { id: "international", name: "International", status: "roadmap" }
]);

export function getHighSchoolStudyDepartments() {
  return HIGH_SCHOOL_STUDY_DEPARTMENTS;
}

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
  getHighSchoolStudyDepartments,
  getHighSchoolStudyDepartment,
  getHighSchoolExam,
  isHighSchoolStudyContent,
  isHighSchoolExamContent
});
