# GNOSTIRI — Assessment & University Access Architecture

## 1. Domain ownership

GNOSTIRI has three independent learning domains:

- **High School** — Department → Subject → Topic → Quiz
- **University** — Faculty → Department → Programme → Course → Module → Topic → Assessment
- **Extras** — Collection → Volume → Chapter → Topic → Assessment

A quiz must never silently fall back to another domain's question bank.

## 2. High School examinations

JAMB/UTME, WAEC, and future international examinations are **assessment contexts**, not replacement taxonomies.

The primary path remains:

`High School → Department → Subject → Topic → Quiz`

An exam mapping may then filter that question bank:

`Exam → Subject → Topic`

This lets one canonical topic serve multiple examinations without duplicating curriculum concepts.

## 3. University courses

University courses are original GNOSTIRI learning products. The catalogue supports:

- free previews;
- paid full courses;
- an initial target price of **$3 per course**;
- course-level entitlement;
- course-linked assessments;
- module/topic progress;
- mastery and recommendations.

The current GitHub Pages implementation is **catalogue-ready**, not a secure payment system. A real commercial launch requires authenticated entitlement verification backed by a payment provider and server-side rules. A client-side flag must never be treated as proof of payment.

## 4. Content and copyright boundary

GNOSTIRI should publish original explanations, examples, diagrams, questions, and course structures, or material for which it has the necessary licence/permission. University course titles, concepts, and subject matter can be taught independently, but protected third-party expression must not be copied wholesale merely because it is educational.

## 5. Access flow

`Preview → Purchase/Subscribe → Verified entitlement → Unlock course → Study → Assess → Progress`

The access decision belongs to the course/content entitlement layer, not to the navigation hierarchy.
