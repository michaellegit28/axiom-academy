/**
 * Axiom Academy — Assessment Question Selector
 *
 * One selection layer for Exam Practice, Topic Practice, Weak Areas,
 * Mixed Practice, Timed Drill and Revision.
 * It only returns real questions marked live.
 */
(function (window) {
  'use strict';

  function normalize(value) {
    return Array.isArray(value) ? value : (value == null ? [] : [value]);
  }

  function includesAny(values, requested) {
    if (!requested.length) return true;
    return requested.some(function (value) { return values.indexOf(value) !== -1; });
  }

  function filterQuestions(questions, criteria) {
    criteria = criteria || {};
    return (questions || []).filter(function (question) {
      if (question.status && question.status !== 'live') return false;
      if (criteria.exam_id && question.exam_id !== criteria.exam_id) return false;
      if (criteria.subject_id && question.subject_id !== criteria.subject_id) return false;
      if (!includesAny(normalize(question.topic_ids), normalize(criteria.topic_ids))) return false;
      if (!includesAny(normalize(question.skill_ids), normalize(criteria.skill_ids))) return false;
      if (criteria.difficulty && question.difficulty !== criteria.difficulty) return false;
      if (criteria.type && question.type !== criteria.type) return false;
      return true;
    });
  }

  function shuffle(items) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function sample(items, count) {
    if (!count || count >= items.length) return shuffle(items);
    return shuffle(items).slice(0, count);
  }

  function selectMixed(questions, criteria) {
    var topics = normalize(criteria.topic_ids);
    if (!topics.length) return sample(filterQuestions(questions, criteria), criteria.question_count);

    var groups = topics.map(function (topic) {
      return filterQuestions(questions, Object.assign({}, criteria, { topic_ids: [topic] }));
    });

    var selected = [];
    var exhausted = false;
    while (selected.length < (criteria.question_count || questions.length) && !exhausted) {
      exhausted = true;
      groups.forEach(function (group) {
        if (group.length) {
          selected.push(group.shift());
          exhausted = false;
        }
      });
    }
    return shuffle(selected).slice(0, criteria.question_count || selected.length);
  }

  function select(questions, mode, criteria) {
    criteria = criteria || {};

    switch (mode) {
      case 'mixed-practice':
        return selectMixed(questions, criteria);
      case 'weak-areas':
        // The caller supplies weak topic/skill IDs from real mastery data.
        return sample(filterQuestions(questions, {
          exam_id: criteria.exam_id,
          subject_id: criteria.subject_id,
          topic_ids: criteria.weak_topic_ids,
          skill_ids: criteria.weak_skill_ids,
          difficulty: criteria.difficulty,
          type: criteria.type
        }), criteria.question_count);
      case 'revision':
        // The caller supplies IDs from recent study/assessment activity.
        return sample((questions || []).filter(function (question) {
          return question.status === 'live' && (!criteria.recent_question_ids || criteria.recent_question_ids.indexOf(question.id) !== -1);
        }), criteria.question_count);
      default:
        return sample(filterQuestions(questions, criteria), criteria.question_count);
    }
  }

  window.AxiomQuizSelector = {
    filter: filterQuestions,
    select: select,
    shuffle: shuffle
  };
})(window);
