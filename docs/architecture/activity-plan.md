# GNOSTIRI — Activity Plan

The activity system remains a core product layer. It connects Study, Quiz, Progress, Home, Search, and future AI recommendations.

## Activity chain

`Study / Quiz event → activity record → aggregation → mastery → recommendation → next action`

## Events

- lesson opened
- lesson progress changed
- lesson completed
- bookmark created
- quiz started
- question answered
- quiz completed
- quiz abandoned
- assessment score recorded

Every event should retain the domain and canonical academic IDs needed to interpret it.

## Derived signals

### Learning activity
- minutes studied by day/week
- sessions completed
- lessons completed
- questions answered
- quizzes attempted
- current and longest streak

### Mastery
- overall accuracy
- subject performance
- topic mastery
- skill mastery when skill metadata exists
- exam-specific performance for High School
- course/module mastery for University

### Recommendations
Priority can be derived from:

1. weak topic;
2. unfinished content;
3. recent assessment error;
4. scheduled/revision need;
5. new topic;
6. continued momentum.

## Home

Home receives a compact version of these signals:

- current learning domain;
- mastery snapshot;
- study time;
- questions/quiz activity;
- streak;
- continue-learning cards;
- recommended next action;
- recent activity.

## Progress

Progress is the full analytical surface. It can expose:

- mastery ring;
- weekly activity;
- topic breakdown;
- quiz history;
- subject performance;
- weak areas;
- recommended actions;
- course/module progress for University.

## Domain isolation

Activity records must preserve `domain_id` and relevant owner IDs. High School, University, and Extras metrics are never merged accidentally.

## Storage evolution

V1 may use localStorage with stable JSON contracts. When authenticated persistence is enabled, the same logical records can be written to Firestore. The UI should consume the contract rather than depend on a storage implementation.
