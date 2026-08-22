# Axiom Academy — Reconstruction Audit

This document is the working contract for the V1 reconstruction. The goal is to simplify the application without deleting working learning infrastructure.

## 1. Protected foundation

These systems are not to be removed during the UI reconstruction:

- Firebase initialization and project configuration
- Firebase Authentication
- Anonymous sessions
- Email/password authentication
- Google sign-in
- Anonymous-account upgrade/linking
- Firestore user documents
- Existing learning/progress persistence
- Existing educational content and current real quiz data
- Jekyll collections and content-index generation
- PWA/service-worker capability unless a change is proven necessary

## 2. Architectural problems found

### Critical

**Multiple application shells/layouts exist.**

`_layouts/app.html` and `_layouts/app-shell.html` both implement application-level HTML, navigation, styles and scripts. They do not provide the same infrastructure: `app-shell.html` includes Firebase initialization, auth UI and the newer shell, while `app.html` has a different page structure and does not include the Firebase/auth module pair.

This is the main structural reason Axiom can behave differently between pages.

**Multiple navigation systems exist.**

`_includes/nav.html`, `_includes/bottom-nav.html`, and legacy navigation logic in `assets/js/app-shell.js` overlap. The app shell must eventually have one canonical navigation contract.

**Multiple styling layers overlap.**

The project currently has `app.scss`, `premium.scss`, `phase2-additions.scss`, `phase6.css`, `page-rhythm.css`, `home-workspace.css`, `profile.css`, `flashcards.css`, plus legacy inline CSS in `default.html`. This should be consolidated into a token layer plus feature/page modules.

**Routing is split across Liquid and JavaScript.**

The repository correctly declares `baseurl: /axiom-academy`, but older routes and newer routing helpers have existed simultaneously. All internal application URLs should use one canonical route helper based on `site.baseurl`.

### Medium

- `default.html` is an older standalone visual system and should not remain an alternate application shell.
- `app-shell.html` and `app.html` should converge into one canonical application layout.
- Global state is already centralized in `assets/js/axiom-state.js`; new UI should use it rather than introducing new localStorage keys.
- Authentication is already centralized in `assets/js/auth.js`; UI should consume its public contract rather than reimplement auth behavior.

## 3. Canonical target architecture

```text
Jekyll
  |
  +-- canonical application layout
  |      |
  |      +-- app shell/navigation
  |      +-- auth + Firebase foundation
  |      +-- page content
  |      +-- AI layer
  |
  +-- content collections
  |
  +-- data/taxonomy
  |
  +-- shared state
         |
         +-- domain: university | high-school | extras
         +-- activity: study | quiz | progress
```

## 4. UI contract

Top toolbar:

- left: menu + Axiom/current context
- right: search + theme
- no large marketing header

Drawer:

- University
- High School
- Extras
- Profile anchored at bottom

Mobile:

- compact top toolbar remains visible
- bottom navigation: Home / Study / Quiz / Progress
- AI is a floating action, not a navigation tab

## 5. Reconstruction order

1. Consolidate application layouts.
2. Establish canonical routing/base URL helper.
3. Establish one navigation component and one responsive shell.
4. Consolidate design tokens and remove legacy global styling conflicts.
5. Rebuild Home workspace.
6. Rebuild Study workspace and domain landing pages.
7. Rebuild reader experience.
8. Rebuild Quiz UI around the existing selector/engine contracts; defer large past-question ingestion.
9. Rebuild Progress/Profile UI around existing Firestore/local state.
10. Test mobile, desktop, authentication, persistence and all routes.

## 6. Non-negotiable product behavior

- Never fabricate learning activity or quiz results.
- Never break authentication while changing UI.
- Never hard-code root-relative routes that bypass `site.baseurl`.
- Never create a second state system when an existing canonical contract can be extended.
- Do not present Axiom-authored questions as official past questions.
- Be honest when content is not yet available.

## 7. Decision rule for future edits

Before each significant edit, classify it:

- KEEP — sound foundation
- REFACTOR — useful but structurally weak
- REBUILD — conflicts with the canonical architecture
- REMOVE — obsolete duplicate
- PROTECTED — do not alter without an explicit data/compatibility reason

A visual request must not silently change data, authentication, routing, or learning behavior.
