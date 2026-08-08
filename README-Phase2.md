# Axiom Academy — Phase 2: Flashcards, Volume Index & PWA

## What's New in Phase 2

| Feature | Files | Description |
|---------|-------|-------------|
| 🎴 Flashcard System | `_layouts/flash.html`, `assets/js/flashcards.js` | 3D flip cards with SM-2 spaced repetition |
| 📚 Volume Index | `_layouts/volume-index.html` | Auto-generated chapter listing with progress |
| 🧭 Quiz Browsers | `jamb-quiz-index.md`, `waec-quiz-index.md` | Topic-by-topic quiz navigation |
| 📱 PWA | `sw.js`, `sw-register.js` | Offline caching, update banners |
| 📝 WAEC Theory | `waec/part1/measurements.yml` | Essay-type questions with mark schemes |
| 🗂️ Data Files | `flashcards/`, `quizzes/` | 10+ flashcards, 10+ quiz questions |

## Integration Steps

### 1. Merge CSS
Append the contents of `assets/css/phase2-additions.scss` to your existing `assets/css/app.scss`.

### 2. Register Service Worker
Add this to `_layouts/app.html` before the closing `</body>` tag:
```html
<script src="{{ '/sw-register.js' | relative_url }}"></script>
```

### 3. Add SW to Root
Copy `sw.js` to your repo root (not in a folder). GitHub Pages serves it from the root.

### 4. Create Volume Index Pages
For each volume, create an `index.md` using the `volume-index` layout. Example for Vol 0:
```yaml
---
layout: volume-index
title: Volume 0 — Learning Like a Physicist
volume: 0
volume_title: "Learning Like a Physicist"
description: "..."
permalink: /read/physics/vol0/
chapters:
  - id: vol0_ch1
    number: 1
    title: "Dimensional Analysis and Estimation"
    url: /read/physics/vol0/ch1/
    read_time: 25
    topics: [dimensional_analysis]
---
```

### 5. Create Flashcard Deck Pages
For each topic, create a page using the `flash` layout. Example:
```yaml
---
layout: flash
title: "Measurements & Units Flashcards"
subject: physics
topic: measurements
card_count: 10
permalink: /flash/physics/measurements/
---
```

### 6. Create Quiz Pages
For each JAMB/WAEC topic, create a page using the `quiz` layout. Example:
```yaml
---
layout: quiz
title: "JAMB Physics — Kinematics"
exam: jamb
subject: physics
topic: kinematics
topic_slug: mechanics/kinematics
question_count: 20
time_limit: 20
permalink: /quiz/jamb/mechanics/kinematics/
---
```

## File Structure After Integration

```
axiom-academy/
├── _config.yml
├── _layouts/
│   ├── app.html          (from Phase 1)
│   ├── chapter.html      (from Phase 1)
│   ├── quiz.html         (from Phase 1)
│   ├── flash.html        ← NEW
│   └── volume-index.html ← NEW
├── _includes/
│   ├── nav.html
│   ├── auth-modal.html
│   └── ai-chat.html
├── _data/
│   ├── jamb-topics.yml
│   ├── waec-topics.yml   ← NEW
│   ├── flashcards/
│   │   └── physics/
│   │       └── measurements.yml ← NEW
│   └── quizzes/
│       ├── jamb/
│       │   ├── mechanics/
│       │   │   └── kinematics.yml
│       │   └── thermal/
│       │       └── thermal.yml ← NEW
│       └── waec/
│           └── part1/
│               └── measurements.yml ← NEW
├── assets/
│   ├── css/
│   │   └── app.scss      (merge phase2-additions.scss into this)
│   └── js/
│       ├── app.js
│       ├── quiz-engine.js
│       ├── flashcards.js ← NEW
│       ├── study-track.js
│       └── leaderboard.js
├── sw.js                 ← NEW (repo root)
├── sw-register.js        ← NEW
├── index.md
├── flash-index.md        ← NEW
├── jamb-quiz-index.md    ← NEW
├── waec-quiz-index.md    ← NEW
├── profile.md
├── study-track.md
└── read/
    └── physics/
        ├── vol0/
        │   ├── index.md  ← NEW (volume index)
        │   ├── ch1.md
        │   └── ch2.md
        └── vol1/
            └── index.md  ← NEW
```

## Flashcard Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Flip card |
| `1` | Rate: Again (< 1 min) |
| `2` | Rate: Hard (2 days) |
| `3` | Rate: Good (4 days) |
| `4` | Rate: Easy (7 days) |
| `←` | Previous card |
| `→` | Next card |

## Quiz Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `A/B/C/D` | Select option (objective) |
| `←` | Previous question |
| `→` | Next question |

## Next Steps (Phase 3 Preview)
- Masterclass quiz browser
- AI essay grading for WAEC theory
- Social features (study groups, direct messaging)
- Push notifications for daily missions
- Export study data to PDF
