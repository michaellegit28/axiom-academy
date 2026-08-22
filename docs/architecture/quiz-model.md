# Axiom V1 — Assessment-First Quiz Architecture

Quiz is intentionally **not** a second copy of the High School Study hierarchy.

Study answers: **where should I learn this?**

Quiz answers: **what should I practice right now?**

## Student-facing modes

1. **Exam Practice** — JAMB, WAEC, and future international exams.
2. **Topic Practice** — focused practice on one or more canonical Study topics.
3. **Weak Areas** — automatically targets topics/skills with weak mastery.
4. **Mixed Practice** — balances questions across multiple topics.
5. **Timed Drill** — short, time-bounded exam-speed practice.
6. **Revision** — uses recently studied or previously assessed material.

## Question metadata

Every live question should identify:

- `id`
- `exam_id`
- `subject_id`
- `topic_ids`
- `difficulty`
- `type`
- `status`

Questions may also carry `skill_ids` when fine-grained skill tracking is available.

A question can map to multiple canonical topics when it genuinely tests more than one concept.

## Skill layer

Topics are not the smallest useful unit of assessment.

Example:

```text
Physics
└── Mechanics
    └── Newton's Laws
        ├── Identify forces
        ├── Draw free-body diagrams
        ├── Apply F = ma
        ├── Resolve forces
        └── Solve multi-step problems
```

Progress can therefore distinguish:

- topic mastery
- skill mastery
- exam-specific performance

## Selection flow

```text
Student chooses a mode
        ↓
Mode creates selection criteria
        ↓
Question bank is filtered/scored
        ↓
Only live real questions are selected
        ↓
Quiz session begins
        ↓
Results update topic/skill mastery
        ↓
Recommendations can be generated
```

## Important rule

The UI must never manufacture a question because a selected topic exists.

If a topic has no live questions, Axiom should say so and offer another valid practice route.

## V1 implementation sequence

1. Keep existing question files working.
2. Add normalized `exam_id`, `subject_id`, `topic_ids` metadata.
3. Add `skill_ids` incrementally where the source content supports them.
4. Build a single question-selection service used by every quiz mode.
5. Build quiz sessions on top of that selector.
6. Record attempts.
7. Derive mastery and recommendations from attempts.
