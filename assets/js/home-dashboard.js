/**
 * Axiom Academy — Home Dashboard
 * Phase C.5: Home behaves like a learning workspace rather than a marketing landing page.
 * Widgets remain hidden until real local activity exists.
 */
import { getState } from "./axiom-state.js";

(function () {
  const readProgress = () => { try { return JSON.parse(localStorage.getItem('axiom_progress')) || {}; } catch (e) { return {}; } };
  const timeAgo = ts => { if (!ts) return ''; const diff=Date.now()-ts,mins=Math.floor(diff/60000); if(mins<1)return'just now';if(mins<60)return mins+'m ago';const hrs=Math.floor(mins/60);if(hrs<24)return hrs+'h ago';return Math.floor(hrs/24)+'d ago'; };
  const chapterUrl = e => (window.AXIOM_BASEURL || '') + '/read/' + e.subject + '/vol' + e.volume + '/ch' + e.chapter + '/';
  const domainLabels = { university:'University', 'high-school':'High School', extras:'Extras' };

  function buildDashboard() {
    const cache=readProgress(), state=getState(), domain=state.domain;
    const dashboard=document.getElementById('home-dashboard'), domains=document.getElementById('axiom-domains');
    const intro=document.getElementById('axiom-home-intro');
    if(!dashboard || !intro) return;

    const progress=cache.progress && typeof cache.progress === 'object' ? Object.values(cache.progress) : [];
    const quizHistory=Array.isArray(cache.quiz_history) ? cache.quiz_history : Object.values(cache.quiz_history || {});
    const chapterEntries=progress.filter(v=>v&&v.domain===domain&&'percentRead'in v);
    const inProgress=chapterEntries.filter(e=>e.percentRead>0&&!e.completed).sort((a,b)=>(b.lastRead||0)-(a.lastRead||0)).slice(0,3);
    const scores=cache.quiz_scores && typeof cache.quiz_scores === 'object' ? cache.quiz_scores : {};
    const domainQuizHistory=quizHistory.filter(q=>q&&q.domain===domain);
    const analytics=cache.analytics||{};
    const streak=cache.study_track?.streakDays||0;
    const hasWeakTopics=Boolean((cache.weak_topics?.[domain]?.weak||[]).length || (cache.weak_topics?.[domain]?.needsPractice||[]).length);
    const hasActivity=Boolean(inProgress.length || chapterEntries.length || domainQuizHistory.length || streak || analytics.totalCardsReviewed || hasWeakTopics);

    dashboard.style.display=hasActivity?'block':'none';
    domains.style.display=hasActivity?'none':'grid';
    intro.classList.toggle('is-workspace',hasActivity);

    if(hasActivity){
      const label=document.getElementById('dashboard-domain-label');
      if(label) label.textContent=domainLabels[domain] || 'Your learning workspace';
      const title=document.getElementById('dashboard-title');
      if(title) title.textContent='Good morning.';
      const subtitle=document.getElementById('dashboard-subtitle');
      if(subtitle) subtitle.textContent='Continue where you left off.';
    } else {
      const label=document.getElementById('axiom-home-subtitle');
      if(label) label.textContent='Choose a learning domain to begin. Axiom will keep your place as you learn.';
    }

    const continueSection=document.getElementById('continue-learning-section'),continueCards=document.getElementById('continue-cards');
    if(inProgress.length&&continueCards){
      continueSection.style.display='block';
      continueCards.innerHTML=inProgress.map(e=>`<a href="${chapterUrl(e)}" class="continue-card"><div class="continue-card-top"><span class="continue-card-subject">${(e.subject||'Physics').charAt(0).toUpperCase()+(e.subject||'physics').slice(1)} · Vol ${e.volume}</span><span class="continue-card-time">${timeAgo(e.lastRead)}</span></div><div class="continue-card-progress-bar"><div class="continue-card-progress-fill" style="width:${Math.max(0,Math.min(100,e.percentRead))}%"></div></div><div class="continue-card-bottom"><span>${e.percentRead}% complete</span><span class="continue-card-cta">Continue →</span></div></a>`).join('');
    } else if(continueSection) continueSection.style.display='none';

    const snapshotEl=document.getElementById('snapshot-stats'),snapshotSection=document.getElementById('todays-learning-section');
    if(snapshotEl){
      snapshotEl.innerHTML=[
        {label:'Day Streak',value:streak},
        {label:'Quizzes Taken',value:domainQuizHistory.length},
        {label:'Chapters Read',value:chapterEntries.length},
        {label:'Cards Reviewed',value:analytics.totalCardsReviewed||0}
      ].map(s=>`<div class="stat-pill"><span class="stat-pill-value">${s.value}</span><span class="stat-pill-label">${s.label}</span></div>`).join('');
      snapshotSection.style.display=hasActivity?'block':'none';
    }

    const weakTopics=cache.weak_topics?.[domain]||{}, weak=[...(weakTopics.weak||[]),...(weakTopics.needsPractice||[])], recSection=document.getElementById('recommended-section'),recCards=document.getElementById('recommended-cards');
    if(weak.length&&recCards){
      recSection.style.display='block';
      recCards.innerHTML=weak.slice(0,4).map(topic=>{const found=Object.values(scores).find(s=>s&&s.domain===domain&&s.topic===topic),exam=found?.exam||'';return `<a href="${window.AXIOM_BASEURL||''}/quiz/${exam}/${topic}/" class="recommended-card"><span class="recommended-icon" aria-hidden="true">↗</span><div><div class="recommended-title">${topic.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</div><div class="recommended-sub">${exam?exam.toUpperCase()+' · ':''}Needs review</div></div></a>`;}).join('');
    } else if(recSection) recSection.style.display='none';

    const history=domainQuizHistory.slice(-5).reverse(),recentEl=document.getElementById('recent-activity-list'),recentSection=document.getElementById('recent-activity-section');
    if(history.length&&recentEl){
      recentSection.style.display='block';
      recentEl.innerHTML=history.map(h=>`<li class="recent-activity-item"><span class="recent-activity-icon" aria-hidden="true">Q</span><span class="recent-activity-text">Scored <b>${h.accuracy}%</b> on ${(h.exam||domainLabels[domain]||domain).toUpperCase()} ${(h.topic||'').replace(/_/g,' ')}</span><span class="recent-activity-time">${timeAgo(h.date)}</span></li>`).join('');
    } else if(recentSection) recentSection.style.display='none';
  }

  document.addEventListener('DOMContentLoaded',buildDashboard);
  window.addEventListener('axiom:state-change',buildDashboard);
})();
