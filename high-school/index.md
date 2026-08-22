---
layout: app
title: High School Study
permalink: /high-school/
---

<section class="section-block page-content-start" aria-labelledby="study-departments-heading">
  <div class="section-heading">
    <div>
      <span class="eyebrow">High School · Study</span>
      <h2 id="study-departments-heading">Choose a department</h2>
    </div>
    <span class="section-note">Department → Subject → Topic → Subtopic</span>
  </div>

  <div class="track-selector" id="high-school-study-departments">
    {% for department in site.data.learning_taxonomy.high_school.study.departments %}
    <a href="{{ '/high-school/subject/' | relative_url }}?department={{ department.id }}" class="track-card study-department" data-department="{{ department.id }}">
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

<section class="section-block study-next-step" aria-labelledby="study-next-heading">
  <div>
    <span class="eyebrow">Need exam preparation?</span>
    <h2 id="study-next-heading">Keep Study and Quiz separate</h2>
    <p>Study is organised by academic department. When you are ready to practise for an examination, use Quiz to choose JAMB / UTME, WAEC, or a future international examination track.</p>
  </div>
  <a href="{{ '/quiz/' | relative_url }}" class="btn btn-primary">Go to Quiz</a>
</section>
