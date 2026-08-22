/*
 * Axiom Academy — Question Bank ↔ Quiz Bridge
 * Connects question selection with the existing Quiz Engine.
 */
(function (window) {
  'use strict';

  window.AxiomQuizBridge = {
    start(questions, mode, criteria) {
      const selected = window.AxiomQuizSelector
        ? window.AxiomQuizSelector.select(questions, mode, criteria)
        : questions;

      if (!selected || !selected.length) {
        console.warn('[Axiom Quiz Bridge] No questions available');
        return [];
      }

      window.QUIZ_CONFIG = Object.assign({}, window.QUIZ_CONFIG || {}, {
        questionSource: 'question-bank',
        questionCount: selected.length
      });

      return selected;
    },

    fromBank(bank, criteria) {
      return this.start(
        bank || [],
        criteria?.mode || 'practice',
        criteria || {}
      );
    }
  };
})(window);
