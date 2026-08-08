# Axiom Academy — Phase 4: Auth & User Data

This package adds **user authentication**, **progress tracking**, and the **profile dashboard** to your Jekyll site.

## What's Included

| File | Purpose |
|------|---------|
| `firestore.rules` | Updated security rules for user data |
| `_layouts/app-shell.html` | Updated with auth modal + profile CSS |
| `_layouts/profile.html` | Profile dashboard layout |
| `_includes/auth-modal.html` | Sign In / Sign Up / Google modal |
| `assets/js/auth.js` | Full auth: anonymous, email, Google, sign out |
| `assets/js/progress.js` | Reading progress, quiz scores, weak topics, analytics |
| `assets/js/app-shell.js` | Auth UI updates, active tabs |
| `assets/css/profile.css` | Profile page + auth modal styles |
| `profile/index.md` | Profile page |

## Setup Instructions

### 1. Merge Files

Copy all folders into your Jekyll repo root. **Overwrite** these Phase 3 files:
- `_layouts/app-shell.html`
- `assets/js/auth.js`
- `assets/js/app-shell.js`

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Enable Authentication Methods

In Firebase Console → Authentication → Sign-in method, enable:
- **Email/Password**
- **Google**
- **Anonymous** (should already be on from Phase 3)

### 4. Build & Test

```bash
bundle exec jekyll serve
```

Visit:
- `http://localhost:4000/profile/` — Profile dashboard
- Click **Sign In** in header → Auth modal appears

## Features

### Authentication
| Method | Status |
|--------|--------|
| Anonymous (auto) | ✅ Already works from Phase 3 |
| Email + Password Sign Up | ✅ Creates account or upgrades anonymous |
| Email + Password Sign In | ✅ |
| Google Sign-In | ✅ |
| Password Reset | ✅ |
| Sign Out | ✅ |

### Progress Tracking
| Feature | How It Works |
|---------|--------------|
| Chapter Reading | Scroll-based % tracking, auto-saves |
| Quiz Scores | Submits score + accuracy + attempts |
| Weak Topics | Auto-computed from quiz accuracy |
| Study Streak | Tracks consecutive study days |
| Study Time | Cumulative minutes tracked |

### Profile Dashboard
- **Avatar** — Google photo or initial
- **Stats Grid** — Streak, chapters, quizzes, cards
- **Mastery Ring** — Overall accuracy visualization
- **Topic Breakdown** — Weak / Needs Practice / Strong
- **Study Time** — Minutes and hours
- **Guest CTA** — Prompts anonymous users to sign up

## Data Schema (Firestore)

```
users/{uid}
├── profile
│   ├── displayName
│   ├── email
│   ├── avatar
│   ├── createdAt
│   └── lastActive
├── progress
│   └── {subject}_vol{N}_ch{N}: { percentRead, completed, lastRead }
├── quiz_scores
│   └── {exam}_{subject}_{topic}: { score, total, accuracy, attempts, best }
├── weak_topics
│   └── physics: ["topic1", "topic2"]
├── study_track
│   ├── streakDays
│   └── lastStudyDate
├── flashcard_progress
│   └── (from Phase 3)
└── analytics
    ├── totalStudyMinutes
    ├── totalQuizzesTaken
    ├── totalCardsReviewed
    └── lastActiveDate
```

## Using Progress Tracker in Your Code

```javascript
import { progressTracker } from "./assets/js/progress.js";

// Track chapter reading (call on scroll)
progressTracker.initReadingProgress("physics", 0, 1);

// Submit quiz score
await progressTracker.submitQuizScore("jamb", "physics", "kinematics", 15, 20, 480);

// Get weak topics
const topics = progressTracker.getWeakTopics();
console.log(topics.weak);        // ["thermodynamics"]
console.log(topics.strong);      // ["kinematics"]

// Get profile summary
const summary = progressTracker.getProfileSummary();
```

## Anonymous → Account Upgrade Flow

1. User visits site → auto anonymous auth
2. Progress saves to localStorage + Firestore (anonymous UID)
3. User clicks "Create Free Account"
4. `auth.js` detects anonymous user → calls `linkWithCredential()`
5. **Same UID preserved** — all progress automatically linked
6. No data migration needed

## Next Steps (Phase 5)

1. AI chat context awareness (inject current page data)
2. Score analysis charts (Chart.js)
3. Study track scheduler
4. Daily mission widget

## Troubleshooting

**"Sign In" button does nothing?**
→ Check browser console for Firebase errors. Ensure your domain is in Firebase Auth → Authorized domains.

**Profile shows all zeros?**
→ Normal for new users. Complete a quiz or read a chapter to generate data.

**Weak topics not appearing?**
→ Requires at least 2 quiz attempts with <50% accuracy on a topic.
