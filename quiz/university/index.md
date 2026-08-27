---
layout: app
title: University Assessments
permalink: /quiz/university/
---

<section class="section-block page-content-start">
  <div class="section-heading"><div><span class="eyebrow">University · Assessment</span><h2>Course assessments</h2></div><span class="section-note">Course → Module → Topic</span></div>
  <div class="quiz-empty" style="margin-top:1rem;">University assessments are intentionally separate from High School JAMB/WAEC practice. They will inherit the access level of the university course they belong to.</div>
  <div class="track-selector" style="margin-top:1rem;">
    {% for course in site.data.university_courses %}
    <article class="track-card">
      <div class="track-icon">🎓</div><h3>{{ course.title }}</h3><p>{{ course.description }}</p><div class="track-meta"><span>{% if course.price_usd == 0 %}Free{% else %}${{ course.price_usd }} course{% endif %}</span><span>{{ course.status | capitalize }}</span></div>
    </article>
    {% endfor %}
  </div>
</section>
