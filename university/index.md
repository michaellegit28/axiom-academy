---
layout: app
title: University — Courses & Study
permalink: /university/
---

<style>
.uni-hub{padding-bottom:3rem}.uni-hero{padding:1.2rem 0 1.5rem}.uni-hero .eyebrow{margin-bottom:.45rem}.uni-hero h1{margin:0 0 .45rem;font:750 clamp(1.8rem,4vw,2.8rem)/1.08 var(--font-serif);letter-spacing:-.03em}.uni-hero p{max-width:680px;margin:0;color:var(--text-secondary);line-height:1.6}.uni-note{margin-top:1rem;padding:.8rem 1rem;border:1px solid var(--border-subtle);border-left:3px solid var(--g-gold);border-radius:var(--radius-md);background:var(--bg-card);color:var(--text-secondary);font-size:.78rem;line-height:1.5}.uni-section{margin-top:1.5rem}.uni-section h2{margin:0 0 .3rem;font:700 1.35rem/1.15 var(--font-serif)}.uni-section>p{margin:0 0 .8rem;color:var(--text-secondary);font-size:.78rem}.uni-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}.uni-card{padding:1rem;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm)}.uni-card h3{margin:.6rem 0 .3rem;font-size:1rem}.uni-card p{margin:0;color:var(--text-secondary);font-size:.75rem;line-height:1.5}.uni-card-top{display:flex;align-items:center;justify-content:space-between;gap:.5rem}.uni-badge{padding:.22rem .5rem;border-radius:999px;background:var(--bg-secondary);color:var(--text-secondary);font-size:.6rem;font-weight:800}.uni-price{font-weight:850;color:var(--g-gold);font-size:.82rem}.uni-meta{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.7rem}.uni-meta span{padding:.22rem .5rem;border-radius:999px;background:var(--bg-secondary);color:var(--text-muted);font-size:.6rem}.uni-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.9rem}.uni-btn{display:inline-flex;align-items:center;justify-content:center;padding:.55rem .75rem;border-radius:9px;background:var(--g-gold);color:#fff;text-decoration:none;font-size:.67rem;font-weight:800}.uni-btn.secondary{background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-subtle)}.uni-roadmap{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem}.uni-step{padding:.8rem;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-md)}.uni-step strong{display:block;font-size:.75rem}.uni-step span{display:block;margin-top:.25rem;color:var(--text-muted);font-size:.65rem;line-height:1.4}@media(max-width:700px){.uni-grid,.uni-roadmap{grid-template-columns:1fr}}
</style>

<div class="uni-hub">
  <section class="uni-hero">
    <div class="eyebrow">University · Study</div>
    <h1>University learning, built as courses.</h1>
    <p>University is intentionally separate from High School. Courses follow Faculty → Department → Programme → Course → Module → Topic, with assessment attached to the course rather than mixed into the High School exam system.</p>
    <div class="uni-note"><strong>Access model:</strong> every course can expose a useful free preview while full original GNOSTIRI course material can be offered as a paid course. The initial catalogue price is <strong>$3 per course</strong>.</div>
  </section>

  <section class="uni-section" aria-labelledby="uni-courses-heading">
    <h2 id="uni-courses-heading">Courses</h2>
    <p>Subscription-ready catalogue. Full payment and entitlement enforcement will be connected to authenticated billing before commercial launch.</p>
    <div class="uni-grid">
      {% for course in site.data.university_courses %}
      <article class="uni-card">
        <div class="uni-card-top"><span class="uni-badge">{{ course.status | capitalize }}</span><span class="uni-price">{% if course.price_usd == 0 %}Free{% else %}${{ course.price_usd }}{% endif %}</span></div>
        <h3>{{ course.title }}</h3>
        <p>{{ course.description }}</p>
        <div class="uni-meta"><span>{{ course.faculty }}</span><span>{{ course.department }}</span><span>{{ course.programme }}</span>{% for module in course.modules limit:3 %}<span>{{ module }}</span>{% endfor %}</div>
        <div class="uni-actions">
          {% if course.status == 'available' %}<a class="uni-btn" href="{{ '/read/physics/vol0/' | relative_url }}">Open preview →</a>{% else %}<span class="uni-btn secondary">Course in development</span>{% endif %}
        </div>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="uni-section" aria-labelledby="uni-assessment-heading">
    <h2 id="uni-assessment-heading">University assessment</h2>
    <p>University quizzes will inherit course access and stay independent from High School JAMB/WAEC practice.</p>
    <div class="uni-grid">
      <article class="uni-card"><div class="uni-card-top"><span class="uni-badge">Course → Module → Topic</span><span class="uni-price">Planned</span></div><h3>Course assessments</h3><p>Module checks, topic practice, worked problems, and end-of-course assessments tied directly to enrolled courses.</p></article>
      <article class="uni-card"><div class="uni-card-top"><span class="uni-badge">Progress</span><span class="uni-price">Included</span></div><h3>Course mastery</h3><p>Reading activity, assessment results, module completion, and recommendations feed the same GNOSTIRI activity system.</p></article>
    </div>
  </section>

  <section class="uni-section" aria-labelledby="uni-roadmap-heading">
    <h2 id="uni-roadmap-heading">How access will work</h2>
    <div class="uni-roadmap">
      <div class="uni-step"><strong>1. Preview</strong><span>Read selected lessons and understand the course before paying.</span></div>
      <div class="uni-step"><strong>2. Subscribe</strong><span>Purchase access to the original full course through the future billing layer.</span></div>
      <div class="uni-step"><strong>3. Learn + assess</strong><span>Unlocked modules, quizzes, progress, mastery, and recommendations stay connected.</span></div>
    </div>
  </section>
</div>
