/**
 * GNOSTIRI — Home Dashboard
 * Home is a learning command centre. All metrics are derived from local activity.
 */
import { getState } from "./axiom-state.js";

(function () {
  const readProgress = () => { try { return JSON.parse(localStorage.getItem('axiom_progress')) || {}; } catch (e) { return {}; } };
  const timeAgo = ts => { if (!ts) return ''; const diff=Date.now()-ts,mins=Math.floor(diff/60000); if(mins<1)return'just now';if(mins<60)return mins+'m ago';const hrs=Math.floor(mins/60);if(hrs<24)return hrs+'h ago';return Math.floor(hrs/24)+'d ago'; };
  const chapterUrl = e => (window.AXIOM_BASEURL || '') + '/read/' + e.subject + '/vol' + e.volume + '/ch' + e.chapter + '/';
  const domainLabels = { university:'University', 'high-school':'High School', extras:'Extras' };
  const domainQuizRoot = domain => `${window.AXIOM_BASEURL || ''}/quiz/${domain}/`;
  const titleCase = value => String(value || '').replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase());

  function buildSnapshot(cache, domain) {
    const grid=document.getElementById('home-snapshot-grid');
    if(!grid) return;
    const scores=cache.quiz_scores && typeof cache.quiz_scores==='object' ? Object.values(cache.quiz_scores).filter(s=>s&&s.domain===domain) : [];
    const history=Array.isArray(cache.quiz_history) ? cache.quiz_history.filter(q=>q&&q.domain===domain) : [];
    const progress=cache.progress && typeof cache.progress==='object' ? Object.values(cache.progress).filter(p=>p&&p.domain===domain) : [];
    const analytics=cache.analytics||{};
    const streak=cache.study_track?.streakDays||0;
    const total=scores.reduce((n,s)=>n+(Number(s.total)||0),0);
    const correct=scores.reduce((n,s)=>n+(Number(s.score)||0),0);
    const accuracy=total?Math.round(correct/total*100):0;
    const hours=Math.floor((Number(analytics.totalStudyMinutes)||0)/60);
    const mins=(Number(analytics.totalStudyMinutes)||0)%60;
    const studyLabel=hours?`${hours}h ${mins}m`:`${mins}m`;
    const topics=Object.values(scores.reduce((m,s)=>{const k=s.topic||'General';m[k] ||= {total:0,score:0};m[k].total+=Number(s.total)||0;m[k].score+=Number(s.score)||0;return m;},{}));
    const weak=Object.entries(scores.reduce((m,s)=>{const k=s.topic||'General';m[k] ||= {total:0,score:0};m[k].total+=Number(s.total)||0;m[k].score+=Number(s.score)||0;return m;},{})).map(([topic,v])=>({topic,accuracy:v.total?Math.round(v.score/v.total*100):0})).sort((a,b)=>a.accuracy-b.accuracy)[0];

    const cards=[
      {label:'Mastery',value:total?accuracy+'%':'—',meta:total?'Across recorded quizzes':'Start with a quiz'},
      {label:'Study time',value:studyLabel,meta:'Recorded learning time'},
      {label:'Questions',value:scores.reduce((n,s)=>n+(Number(s.total)||0),0),meta:'In completed quizzes'},
      {label:'Streak',value:streak+'d',meta:streak?'Keep the momentum':'Begin your streak'}
    ];
    grid.innerHTML=cards.map(c=>`<div class="home-stat-card"><span class="home-stat-label">${c.label}</span><strong>${c.value}</strong><span class="home-stat-meta">${c.meta}</span></div>`).join('');

    const note=document.getElementById('home-snapshot-note');
    if(note) note.textContent=total?`${domainLabels[domain]||'Current track'} · based on your recorded activity`:'No study data yet — this area will update automatically as you learn.';

    const daily=cache.daily_activity||{};
    const bars=document.getElementById('home-week-bars');
    const values=[];
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);values.push({day:d.toLocaleDateString(undefined,{weekday:'narrow'}),minutes:Math.round(Number(daily[d.toDateString()]||0))});}
    const max=Math.max(1,...values.map(v=>v.minutes));
    if(bars) bars.innerHTML=values.map(v=>`<div class="home-week-bar-wrap" title="${v.minutes} min"><div class="home-week-bar" style="height:${Math.max(4,Math.round(v.minutes/max*100))}%"></div><span>${v.day}</span></div>`).join('');
    const totalWeek=values.reduce((n,v)=>n+v.minutes,0);
    const weekTotal=document.getElementById('home-week-total'); if(weekTotal) weekTotal.textContent=totalWeek+' min';

    const focus=document.getElementById('home-next-focus');
    const focusLink=focus?.nextElementSibling;
    if(focus){
      if(weak && weak.accuracy<75){focus.textContent=`Review ${titleCase(weak.topic)} — ${weak.accuracy}% recorded accuracy.`; if(focusLink) focusLink.href=domainQuizRoot(domain);}
      else if(history.length){focus.textContent='Your latest results are on track. Continue with another focused practice session.'; if(focusLink) focusLink.href=domainQuizRoot(domain);}
      else focus.textContent='Take your first quiz to start building your mastery profile.';
    }
  }

  function buildDashboard() {
    const cache=readProgress(), state=getState(), domain=state.domain;
    const dashboard=document.getElementById('home-dashboard'), domains=document.getElementById('axiom-domains'), intro=document.getElementById('axiom-home-intro');
    if(!dashboard || !intro) return;
    buildSnapshot(cache,domain);

    const progress=cache.progress && typeof cache.progress==='object' ? Object.values(cache.progress) : [];
    const quizHistory=Array.isArray(cache.quiz_history) ? cache.quiz_history : Object.values(cache.quiz_history || {});
    const chapterEntries=progress.filter(v=>v&&v.domain===domain&&'percentRead'in v);
    const inProgress=chapterEntries.filter(e=>e.percentRead>0&&!e.completed).sort((a,b)=>(b.lastRead||0)-(a.lastRead||0)).slice(0,3);
    const scores=cache.quiz_scores && typeof cache.quiz_scores==='object' ? cache.quiz_scores : {};
    const domainQuizHistory=quizHistory.filter(q=>q&&q.domain===domain);
    const analytics=cache.analytics||{};
    const streak=cache.study_track?.streakDays||0;
    const hasWeakTopics=Boolean((cache.weak_topics?.[domain]?.weak||[]).length || (cache.weak_topics?.[domain]?.needsPractice||[]).length);
    const hasActivity=Boolean(inProgress.length || chapterEntries.length || domainQuizHistory.length || streak || analytics.totalCardsReviewed);

    dashboard.style.display=hasActivity?'block':'none';
    domains.style.display='grid';
    intro.classList.toggle('is-workspace',hasActivity);

    const label=document.getElementById('dashboard-domain-label'); if(label) label.textContent=domainLabels[domain] || 'Your learning workspace';
    const title=document.getElementById('dashboard-title'); if(title) title.textContent='Continue your learning.';
    const subtitle=document.getElementById('dashboard-subtitle'); if(subtitle) subtitle.textContent='Your recent work and next steps are below.';

    const continueSection=document.getElementById('continue-learning-section'),continueCards=document.getElementById('continue-cards');
    if(inProgress.length&&continueCards){
      continueSection.style.display='block';
      continueCards.innerHTML=inProgress.map(e=>`<a href="${chapterUrl(e)}" class="continue-card"><div class="continue-card-top"><span class="continue-card-subject">${titleCase(e.subject)} · Vol ${e.volume}</span><span class="continue-card-time">${timeAgo(e.lastRead)}</span></div><div class="continue-card-progress-bar"><div class="continue-card-progress-fill" style="width:${Math.max(0,Math.min(100,e.percentRead))}%"></div></div><div class="continue-card-bottom"><span>${e.percentRead}% complete</span><span class="continue-card-cta">Continue →</span></div></a>`).join('');
    } else if(continueSection) continueSection.style.display='none';

    const snapshotEl=document.getElementById('snapshot-stats'),snapshotSection=document.getElementById('todays-learning-section');
    if(snapshotEl){
      snapshotEl.innerHTML=[{label:'Day Streak',value:streak},{label:'Quizzes Taken',value:domainQuizHistory.length},{label:'Chapters Read',value:chapterEntries.length},{label:'Cards Reviewed',value:analytics.totalCardsReviewed||0}].map(s=>`<div class="stat-pill"><span class="stat-pill-value">${s.value}</span><span class="stat-pill-label">${s.label}</span></div>`).join('');
      snapshotSection.style.display=hasActivity?'block':'none';
    }

    const weakTopics=cache.weak_topics?.[domain]||{}, weak=[...(weakTopics.weak||[]),...(weakTopics.needsPractice||[])], recSection=document.getElementById('recommended-section'),recCards=document.getElementById('recommended-cards');
    if(weak.length&&recCards){
      recSection.style.display='block';
      recCards.innerHTML=weak.slice(0,4).map(topic=>{const found=Object.values(scores).find(s=>s&&s.domain===domain&&s.topic===topic),exam=found?.exam||'';return `<a href="${domainQuizRoot(domain)}" class="recommended-card"><span class="recommended-icon" aria-hidden="true">↗</span><div><div class="recommended-title">${titleCase(topic)}</div><div class="recommended-sub">${exam?exam.toUpperCase()+' · ':''}Needs review</div></div></a>`;}).join('');
    } else if(recSection) recSection.style.display='none';

    const history=domainQuizHistory.slice(-5).reverse(),recentEl=document.getElementById('recent-activity-list'),recentSection=document.getElementById('recent-activity-section');
    if(history.length&&recentEl){
      recentSection.style.display='block';
      recentEl.innerHTML=history.map(h=>`<li class="recent-activity-item"><span class="recent-activity-icon" aria-hidden="true">Q</span><span class="recent-activity-text">Scored <b>${h.accuracy}%</b> on ${(h.exam||domainLabels[domain]||domain).toUpperCase()} ${titleCase(h.topic)}</span><span class="recent-activity-time">${timeAgo(h.date)}</span></li>`).join('');
    } else if(recentSection) recentSection.style.display='none';
  }

  document.addEventListener('DOMContentLoaded',buildDashboard);
  window.addEventListener('axiom:state-change',buildDashboard);
})();
