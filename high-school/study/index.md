---
layout: app-shell
title: High School Study
permalink: /high-school/study/
---

<section class="axiom-page" data-study-landing="high-school">
  <div class="page-heading">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="{{ '/' | relative_url }}">Home</a>
      <span aria-hidden="true">/</span>
      <span>High School</span>
      <span aria-hidden="true">/</span>
      <span>Study</span>
    </nav>
    <p class="eyebrow">High School · Study</p>
    <h1>Study by department</h1>
    <p class="page-lede">Choose your academic department, then move into subjects and published topics.</p>
  </div>

  <div class="section-heading">
    <div>
      <span class="eyebrow">Your learning path</span>
      <h2>Departments</h2>
    </div>
    <span class="section-note">Department → Subject → Topic → Subtopic</span>
  </div>

  <div class="track-grid" id="department-list" aria-live="polite"></div>

  <aside class="study-note" aria-label="Study and Quiz distinction">
    <strong>Preparing for an examination?</strong>
    <span>Use Quiz for JAMB, WAEC, and other examination practice. Study is where you learn the academic material.</span>
    <a class="btn btn-secondary" href="{{ '/quiz/' | relative_url }}">Go to Quiz</a>
  </aside>
</section>

<script type="module">
import { getHighSchoolStudyDepartments } from "{{ '/assets/js/learning-taxonomy.js' | relative_url }}";

const root = document.getElementById('department-list');
const departments = getHighSchoolStudyDepartments();

if (!departments.length) {
  root.innerHTML = '<div class="empty-state"><h3>Departments are being prepared</h3><p>Published curriculum will appear here as it becomes available.</p></div>';
} else {
  departments.forEach(department => {
    const card = document.createElement('a');
    card.className = 'track-card';
    card.href = `{{ '/high-school/subject/' | relative_url }}?department=${encodeURIComponent(department.id)}`;
    card.innerHTML = `
      <div class="track-icon" aria-hidden="true">${department.icon || '📚'}</div>
      <h3>${department.name}</h3>
      <p>${department.description || 'Explore subjects and published learning material.'}</p>
      <div class="track-meta"><span>${department.subjects.length} subject${department.subjects.length === 1 ? '' : 's'}</span><span aria-hidden="true">→</span></div>
    `;
    root.appendChild(card);
  });
}
</script>
