# Axiom Academy V1 — Canonical Data Model

This document is the source-of-truth contract for the Axiom V1 learning data model.

## 1. Core rule

Axiom has **one canonical learning taxonomy** and separate **assessment taxonomies**.

- Study answers: **what is this concept and where does it belong?**
- Exams answer: **which board/exam tests this concept?**
- Content answers: **what can the student read/practice?**
- Activity answers: **what has this student done?**

Do not create separate copies of the same academic concept for JAMB, WAEC, and study. A single canonical topic may be mapped to many exams.

## 2. Stable IDs

Every entity gets a stable, lowercase, hyphen-separated `id`. IDs are permanent identifiers, not display labels.

Examples:

- domain: `high-school`
- department: `sciences`
- subject: `physics`
- topic: `physics-mechanics`
- subtopic: `physics-kinematics`
- content: `chapter-high-school-physics-kinematics-01`
- exam: `jamb`
- question: `jamb-physics-kinematics-001`

Renaming a label must not require changing the ID.

## 3. Domain

```yaml
domain:
  id: high-school
  type: domain
  name: High School
  status: live
```

Allowed V1 domain IDs:

- `university`
- `high-school`
- `extras`

## 4. Study taxonomy

### High School

```text
Domain
└── Department
    └── Subject
        └── Topic
            └── Subtopic
                └── Content
```

The department layer is the navigation structure for **High School Study**. It is not an exam-board layer.

Example:

```yaml
department:
  id: sciences
  domain_id: high-school

subject:
  id: physics
  department_id: sciences

 topic:
  id: physics-mechanics
  subject_id: physics

subtopic:
  id: physics-kinematics
  topic_id: physics-mechanics
```

### University

V1 keeps the planned hierarchy without requiring full curriculum data:

```text
Domain → Faculty → Department → Programme → Course → Module → Topic
```

### Extras

```text
Domain → Collection → Volume → Chapter → Topic
```

## 5. Canonical topic

A topic is the central academic concept that connects Study, Quiz, Progress, Search, and AI.

```yaml
topic:
  id: physics-kinematics
  type: topic
  domain_id: high-school
  subject_id: physics
  parent_id: physics-mechanics
  name: Kinematics
  slug: kinematics
  status: live
  description: "Motion described using position, velocity and acceleration."
```

A topic may be linked to multiple exam mappings. Do **not** put `exam: jamb` on the canonical topic.

## 6. Content item

All readable/practice resources use a common content contract.

```yaml
content:
  id: chapter-high-school-physics-kinematics-01
  type: chapter
  domain_id: high-school
  subject_id: physics
  topic_ids:
    - physics-kinematics
  title: Motion in One Dimension
  slug: motion-in-one-dimension
  status: live
  url: /high-school/sciences/physics/mechanics/kinematics/motion-in-one-dimension/
  content_source: local-markdown
  estimated_minutes: 18
  order: 1
```

Allowed V1 content types:

- `chapter`
- `quiz`
- `flashcards`
- `exercise`

Content may reference one or more canonical topics. This is intentional: a worked example can legitimately teach several concepts.

## 7. Exam model

Exam boards/tracks are assessment context, not Study taxonomy.

```yaml
exam:
  id: jamb
  type: exam
  domain_id: high-school
  name: JAMB / UTME
  status: live
  mode: objective
```

V1 exam IDs:

- `jamb`
- `waec`
- `international` (roadmap only)

## 8. Exam-topic mapping

This is the bridge between canonical Study topics and exams.

```yaml
exam_mapping:
  id: jamb-physics-kinematics
  exam_id: jamb
  subject_id: physics
  topic_id: physics-kinematics
  exam_label: Kinematics
  syllabus_code: null
  status: live
```

The same canonical topic can have multiple mappings:

```text
physics-kinematics
       ├── JAMB mapping
       └── WAEC mapping
```

This prevents duplicated curriculum concepts and allows Progress to answer both:

- "How good am I at Kinematics?"
- "How good am I at JAMB Physics?"

## 9. Question model

Questions belong to an exam context but must also point back to canonical topics.

```yaml
question:
  id: jamb-physics-kinematics-001
  type: objective
  exam_id: jamb
  subject_id: physics
  topic_ids:
    - physics-kinematics
  difficulty: easy
  year: 2020
  question: "..."
  options:
    - "A. ..."
    - "B. ..."
    - "C. ..."
    - "D. ..."
  correct_index: 1
  explanation: "..."
  status: live
```

`correct_index` is zero-based. Existing question files currently use `correct`; the quiz implementation should migrate to the explicit `correct_index` name when the question engine is refactored.

A question may have multiple `topic_ids` when it genuinely tests more than one concept.

## 10. Quiz/session model

A quiz definition describes an available practice set. A quiz attempt describes a student's actual session.

```yaml
quiz:
  id: jamb-physics-kinematics-practice
  type: quiz
  domain_id: high-school
  exam_id: jamb
  subject_id: physics
  topic_ids:
    - physics-kinematics
  question_ids:
    - jamb-physics-kinematics-001
  mode: objective
  timed: true
  status: live
```

Attempt data is user activity, not curriculum data:

```yaml
quiz_attempt:
  id: attempt-<generated>
  user_id: <user>
  domain_id: high-school
  exam_id: jamb
  quiz_id: jamb-physics-kinematics-practice
  started_at: <timestamp>
  completed_at: <timestamp>
  duration_seconds: 420
  question_count: 10
  correct_count: 8
  score_percent: 80
  question_results:
    - question_id: jamb-physics-kinematics-001
      selected_index: 0
      correct: false
      topic_ids: [physics-kinematics]
```

## 11. Reading-progress model

Reading progress is attached to canonical content, not to a page URL alone.

```yaml
reading_progress:
  content_id: chapter-high-school-physics-kinematics-01
  user_id: <user-or-local-device>
  percent: 68
  position: 0.68
  last_read_at: <timestamp>
  completed: false
```

For V1 localStorage, the same shape is stored as JSON. When account persistence is introduced, this shape can move to Firestore without changing the UI contract.

## 12. Bookmark model

```yaml
bookmark:
  id: bookmark-<generated>
  user_id: <user-or-local-device>
  content_id: chapter-high-school-physics-kinematics-01
  created_at: <timestamp>
```

## 13. Topic mastery model

Mastery is derived from activity; it is not manually authored in curriculum files.

```yaml
topic_mastery:
  user_id: <user>
  topic_id: physics-kinematics
  exam_id: jamb
  attempts: 4
  questions_seen: 40
  questions_correct: 31
  mastery_percent: 77.5
  last_assessed_at: <timestamp>
```

Keep both `topic_id` and `exam_id`. This allows Axiom to distinguish general topic mastery from exam-specific performance.

## 14. Recommendation model

Recommendations are generated from activity and content relationships.

```yaml
recommendation:
  id: recommendation-<generated>
  user_id: <user>
  reason: weak-topic
  topic_id: physics-kinematics
  content_id: chapter-high-school-physics-kinematics-01
  quiz_id: jamb-physics-kinematics-practice
  priority: 1
  created_at: <timestamp>
```

V1 recommendation reasons:

- `continue-reading`
- `weak-topic`
- `unfinished-content`
- `new-topic`

## 15. AI context

The AI tutor receives references, not duplicated curriculum text where avoidable.

```yaml
ai_context:
  domain_id: high-school
  exam_id: jamb
  subject_id: physics
  topic_ids:
    - physics-kinematics
  content_id: chapter-high-school-physics-kinematics-01
  recent_question_ids:
    - jamb-physics-kinematics-001
  recent_attempt_id: attempt-<generated>
```

This lets Axiom answer questions such as "Explain my mistake" in the context of the student's actual lesson and attempt.

## 16. Search index contract

Search is generated from real content metadata. It should index:

- chapters
- quizzes
- flashcard decks
- exercises when they become real pages

Each result should contain:

```yaml
search_result:
  id: <content-id>
  type: chapter
  domain_id: high-school
  subject_id: physics
  topic_ids: [physics-kinematics]
  title: Motion in One Dimension
  url: /...
  status: live
```

No manually maintained list of search results.

## 17. What belongs where

| Concern | Canonical source |
|---|---|
| Domain navigation | `learning_taxonomy.yml` |
| Study hierarchy | taxonomy entities / future structured curriculum data |
| Exam hierarchy | exam + exam mappings |
| Chapter metadata | chapter front matter |
| Questions | `_data/quizzes/**` |
| Flashcards | `_data/flashcards/**` |
| Reading activity | localStorage / future Firestore |
| Quiz attempts | localStorage / future Firestore |
| Mastery | derived from attempts |
| Recommendations | derived from activity + content |
| Search | generated from real content metadata |
| AI context | derived at runtime |

## 18. V1 implementation order

1. Preserve existing `learning_taxonomy.yml` as the navigation contract.
2. Add stable canonical IDs to new Study entities.
3. Normalize chapter front matter to reference canonical topic IDs.
4. Add exam mappings instead of duplicating study topics per exam.
5. Normalize questions to `exam_id`, `subject_id`, and `topic_ids`.
6. Build the Study browser from the taxonomy + real content metadata.
7. Build Quiz sessions from question metadata.
8. Record attempts and reading progress using the activity contracts above.
9. Derive mastery and recommendations from activity.
10. Feed the same IDs into Search and Axiom AI.

## 19. Deliberate non-goals for V1

Do not model the following yet:

- Full University curriculum entities beyond the navigation contract.
- Every international examination board.
- Social/community graphs.
- Complex gamification economies.
- AI-generated curriculum as authoritative source data.

The model must remain extensible without making those features prerequisites for the High School V1 experience.
