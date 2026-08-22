---
layout: app
title: High School Study
permalink: /high-school/
---

<div class="landing-hero">
  <h1>High School Study</h1>
  <p>Build strong subject foundations by department, then move into focused topics and subtopics at your own pace.</p>
</div>

<section class="section-block" aria-labelledby="study-departments-heading">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Study</span>
      <h2 id="study-departments-heading">Choose a department</h2>
    </div>
    <span class="section-note">Department → Subject → Topic → Subtopic</span>
  </div>

  <div class="track-selector" id="high-school-study-departments">
    {% for department in site.data.learning_taxonomy.high_school.study.departments %}
    <a href="{{ '/high-school/' | relative_url }}#{{ department.id }}" class="track-card study-department" data-department="{{ department.id }}">
      <div class="track-icon">
        {% case department.id %}
          {% when 'sciences' %}🔬
          {% when 'mathematics' %}📐
          {% when 'languages' %}📚
          {% when 'social-sciences' %}🌍
          {% when 'arts-humanities' %}🎨
          {% else %}📖
        {% endcase %}
      </div>
      <h3>{{ department.name }}</h3>
      <p>Explore subjects, then progress through topics and subtopics.</p>
      <div class="track-meta">
        {% for subject in department.subjects %}
        <span>{{ subject | replace: '-', ' ' | capitalize }}</span>
        {% endfor %}
      </div>
    </a>
    {% endfor %}
  </div>
</section>

<section class="section-block study-exam-note" aria-labelledby="exam-prep-heading">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Assessment</span>
      <h2 id="exam-prep-heading">Preparing for an exam?</h2>
    </div>
  </div>
  <p>Exam preparation is separate from Study. Use Quiz to choose JAMB / UTME, WAEC, or future international examination tracks.</p>
  <a href="{{ '/quiz/' | relative_url }}" class="btn btn-primary">Go to Quiz</a>
</section>

<section class="section-block">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Quick revision</span>
      <h2>Flashcards</h2>
    </div>
  </div>
  <div class="track-selector">
    <a href="{{ '/flash/jamb/' | relative_url }}" class="track-card jamb">
      <div class="track-icon">🎴</div>
      <h3>JAMB Flashcards</h3>
    </a>
    <a href="{{ '/flash/waec/' | relative_url }}" class="track-card waec">
      <div class="track-icon">🎴</div>
      <h3>WAEC Flashcards</h3>
    </a>
  </div>
</section>
