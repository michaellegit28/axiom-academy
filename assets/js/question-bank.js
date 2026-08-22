/*
 * Axiom Question Bank Engine
 * Loads and filters question collections.
 * Ready for WAEC/JAMB/NECO/Axiom content.
 */

window.AxiomQuestionBank = {
  filter(questions, filters = {}) {
    return questions.filter((q) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        return q[key] === filters[key];
      });
    });
  },

  getExamQuestions(questions, exam, subject, topic) {
    return this.filter(questions, { exam, subject, topic });
  },

  createSession(questions) {
    return {
      questions,
      current: 0,
      answers: [],
      score: 0
    };
  }
};
