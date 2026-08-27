---
layout: app
title: Study
description: Choose a GNOSTIRI study domain and continue learning with domain-safe routes.
permalink: /study/
---

<!--
  GNOSTIRI Study Hub
  Domains served: Global entry point for High School, University, and Extras.
  Architectural decision: This Jekyll Markdown page creates the root /study/
  route required by the deployment workflow while keeping learners routed into
  domain-specific sections instead of mixing domain content or progress.
-->

<section class="study-hub hero-section" aria-labelledby="study-hub-title">
  <div class="section-kicker">Study hub</div>

  <h1 id="study-hub-title">Choose your learning path.</h1>

  <p>
    GNOSTIRI keeps High School, University, and Extras separate so your progress,
    quizzes, recommendations, and Tutor plans remain attached to the correct domain.
  </p>

  <div class="domain-card-grid">
    <article class="domain-card">
      <span class="domain-card__eyebrow">High School</span>
      <h2>Department → Subject → Topic → Subtopic</h2>
      <p>
        Build foundations through structured school-level study paths, beginning
        with published Mathematics topics.
      </p>
      <a class="button primary" href="{{ '/high-school/' | relative_url }}">
        Open High School
      </a>
    </article>

    <article class="domain-card">
      <span class="domain-card__eyebrow">University</span>
      <h2>Faculty → Department → Programme → Course</h2>
      <p>
        Explore university-level course previews and future full-course pathways
        without merging your university progress into school learning.
      </p>
      <a class="button primary" href="{{ '/university/' | relative_url }}">
        Open University
      </a>
    </article>

    <article class="domain-card">
      <span class="domain-card__eyebrow">Extras</span>
      <h2>Masterclasses and lifelong learning</h2>
      <p>
        Access advanced explorations, premium masterclass tracks, and enrichment
        resources without mixing them into school or university progress.
      </p>
      <a class="button primary" href="{{ '/extras/' | relative_url }}">
        Open Extras
      </a>
    </article>
  </div>
</section>
