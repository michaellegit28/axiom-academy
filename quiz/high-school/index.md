---
layout: app
title: High School Practice
permalink: /quiz/high-school/
---

<style>
.qdomain{padding-bottom:3rem}.qhero{padding:1rem 0 1.3rem}.qhero h1{margin:.25rem 0 .4rem;font:750 clamp(1.8rem,4vw,2.6rem)/1.08 var(--font-serif)}.qhero p{margin:0;color:var(--text-secondary);max-width:700px;line-height:1.55}.qcrumb{font-size:.7rem;color:var(--text-muted)}.qdept{margin-top:1.35rem}.qdept h2{margin:0 0 .25rem;font:700 1.25rem/1.15 var(--font-serif)}.qdept>p{margin:0 0 .7rem;color:var(--text-secondary);font-size:.74rem}.qsubjects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.qsubject{padding:.9rem;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}.qsubject h3{margin:0 0 .25rem;font-size:.95rem}.qsubject p{margin:0;color:var(--text-muted);font-size:.68rem}.qbank-list{display:grid;gap:.45rem;margin-top:.7rem}.qbank{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.6rem .7rem;border:1px solid var(--border-subtle);border-radius:10px;background:var(--bg-secondary);text-decoration:none;color:var(--text-primary)}.qbank strong{font-size:.7rem}.qbank span{color:var(--text-muted);font-size:.6rem}.qcoming{margin-top:.7rem;padding:.55rem .65rem;border:1px dashed var(--border-medium);border-radius:9px;color:var(--text-muted);font-size:.63rem}.qsmart{margin-top:1.4rem;padding:1rem;background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}.qsmart h2{margin:0 0 .3rem;font:700 1.1rem/1.2 var(--font-serif)}.qsmart p{margin:0;color:var(--text-secondary);font-size:.72rem;line-height:1.5}.qsmart-links{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.7rem}.qsmart-links a{padding:.45rem .65rem;border-radius:9px;background:var(--bg-card);border:1px solid var(--border-subtle);color:var(--text-primary);text-decoration:none;font-size:.65rem;font-weight:750}@media(max-width:700px){.qsubjects{grid-template-columns:1fr}}
</style>

<div class="qdomain">
  <section class="qhero"><div class="qcrumb"><a href="{{ '/quiz/' | relative_url }}">Quiz</a> / High School</div><h1>High School practice</h1><p>Quizzes belong to the High School academic structure: <strong>Department → Subject → Topic → Quiz</strong>. JAMB, WAEC, and international examinations are filters and mappings on top of that structure.</p></section>

  {% for department in site.data.learning_taxonomy.high_school.study.departments %}
  <section class="qdept">
    <h2>{{ department.name }}</h2>
    <p>Choose a subject. Live question banks appear inside their canonical topic.</p>
    <div class="qsubjects">
      {% for subject in department.subjects %}
      <article class="qsubject">
        <h3>{{ subject | replace: '-', ' ' | capitalize }}</h3>
        <p>Department: {{ department.name }}</p>
        {% assign banks = site.data.quiz_catalog.high_school | where: 'department', department.id | where: 'subject', subject %}
        {% if banks.size > 0 %}
          <div class="qbank-list">
          {% for bank in banks %}
            <a class="qbank" href="{{ bank.path | relative_url }}"><strong>{{ bank.title }}</strong><span>{% if bank.question_count %}{{ bank.question_count }} questions{% else %}Practice bank{% endif %} →</span></a>
          {% endfor %}
          </div>
        {% else %}
          <div class="qcoming">Topic-level question banks are being added here.</div>
        {% endif %}
      </article>
      {% endfor %}
    </div>
  </section>
  {% endfor %}

  <section class="qsmart"><h2>Smart examination navigation</h2><p>Exam preparation stays available without taking ownership away from the academic hierarchy. A future exam filter can show JAMB/UTME, WAEC, or international questions that map back to the same High School subjects and topics.</p><div class="qsmart-links"><a href="{{ '/quiz/' | relative_url }}?exam=jamb">JAMB / UTME</a><a href="{{ '/quiz/' | relative_url }}?exam=waec">WAEC</a><a href="{{ '/quiz/' | relative_url }}?exam=international">International</a></div></section>
</div>
