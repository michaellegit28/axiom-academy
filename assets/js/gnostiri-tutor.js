/**
 * GNOSTIRI Tutor — personal study planning layer.
 * Local-first: no API key, no external AI call. Uses GNOSTIRI progress data
 * to create and continuously update a domain-scoped plan.
 */
import { progressTracker } from "./progress.js";
import { getState, setDomain } from "./axiom-state.js";

const DOMAINS = ["high-school", "university", "extras"];
const KEY = "gnostiri_tutor_profile_v1";

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = v => localStorage.setItem(KEY, JSON.stringify(v));
const activeDomain = () => DOMAINS.includes(getState().domain) ? getState().domain : "high-school";
const todayKey = () => new Date().toISOString().slice(0,10);
const daysBetween = (a,b) => Math.max(1, Math.ceil((new Date(b)-new Date(a))/86400000));

export class GnostiriTutor {
  constructor(){ this.profile = load(); this.profile.domains ||= {}; }

  getDomainProfile(domain=activeDomain()) { return this.profile.domains[domain] || {}; }

  saveProfile({domain=activeDomain(), examName="", examDate="", dailyMinutes=60}={}) {
    this.profile.domains[domain] = { ...this.getDomainProfile(domain), examName, examDate, dailyMinutes:Number(dailyMinutes)||60, updatedAt:Date.now() };
    save(this.profile); return this.getDomainProfile(domain);
  }

  clearProfile(domain=activeDomain()) { delete this.profile.domains[domain]; save(this.profile); }

  getInsights(domain=activeDomain()) {
    const summary = progressTracker.getProfileSummary(domain);
    const breakdown = progressTracker.getTopicBreakdown(domain);
    const weak = breakdown.filter(x=>x.accuracy<50).slice(0,5);
    const practice = breakdown.filter(x=>x.accuracy>=50 && x.accuracy<75).slice(0,5);
    return { summary, breakdown, weak, practice };
  }

  generatePlan(domain=activeDomain()) {
    const profile=this.getDomainProfile(domain), insights=this.getInsights(domain);
    const topics=[...insights.weak,...insights.practice];
    const fallback = insights.breakdown.slice(0,5);
    const pool = topics.length ? topics : fallback;
    const minutes=Math.max(20, Number(profile.dailyMinutes)||60);
    const days=profile.examDate ? Math.min(14,daysBetween(todayKey(),profile.examDate)) : 7;
    const plan=[];
    for(let i=0;i<days;i++){
      const focus=pool.length ? pool[i%pool.length].topic : "New topic + review";
      const accuracy=pool.length ? pool[i%pool.length].accuracy : null;
      const review=Math.round(minutes*.2), quiz=Math.round(minutes*.3), study=minutes-review-quiz;
      plan.push({day:i+1,date:new Date(Date.now()+i*86400000).toISOString().slice(0,10),focus,accuracy,tasks:[
        {type:"study",label:`Study: ${focus.replace(/_/g," ")}`,minutes:study},
        {type:"quiz",label:`Practice: ${focus.replace(/_/g," ")}`,minutes:quiz},
        {type:"review",label:"Review mistakes & recall",minutes:review}
      ],completed:false});
    }
    return {domain,generatedAt:Date.now(),examName:profile.examName||"Study goal",examDate:profile.examDate||null,dailyMinutes:minutes,plan,source:{weak:insights.weak.length,practice:insights.practice.length}};
  }

  updatePlanFromProgress(domain=activeDomain()) {
    const generated=this.generatePlan(domain);
    const existing=this.profile.domains[domain]?.plan;
    if(existing?.plan?.length){
      const completedByDate=new Map(existing.plan.map(d=>[d.date,!!d.completed]));
      generated.plan.forEach(d=>{d.completed=completedByDate.get(d.date)||false;});
    }
    this.profile.domains[domain]={...this.getDomainProfile(domain),plan:generated,planUpdatedAt:Date.now()};
    save(this.profile); return generated;
  }

  getPlan(domain=activeDomain()) { return this.getDomainProfile(domain).plan || this.updatePlanFromProgress(domain); }

  markTodayComplete(domain=activeDomain()) {
    const plan=this.getPlan(domain), today=todayKey(); const day=plan.plan.find(x=>x.date===today);
    if(day) day.completed=true;
    this.profile.domains[domain]={...this.getDomainProfile(domain),plan,planUpdatedAt:Date.now()}; save(this.profile);
    return plan;
  }

  getToday(domain=activeDomain()) { return this.getPlan(domain).plan.find(x=>x.date===todayKey()) || this.getPlan(domain).plan[0]; }
}

export const gnostiriTutor = new GnostiriTutor();

export function renderTutorDashboard(root){
  if(!root) return;
  const domain=activeDomain(); setDomain(domain);
  const p=gnostiriTutor.getDomainProfile(domain), insights=gnostiriTutor.getInsights(domain), plan=gnostiriTutor.getPlan(domain);
  const today=gnostiriTutor.getToday(domain);
  const dname=domain==='high-school'?'High School':domain==='university'?'University':'Extras';
  const weak=insights.weak.length ? insights.weak.map(x=>`<span>${x.topic.replace(/_/g,' ')} · ${x.accuracy}%</span>`).join('') : '<span>No weak topics detected yet</span>';
  root.innerHTML=`<section class="tutor-hero"><div><p class="tutor-kicker">GNOSTIRI TUTOR</p><h1>Your personal study tutor</h1><p class="tutor-lead">Your plan adapts to your progress instead of remaining a fixed timetable.</p></div><div class="tutor-domain">${dname}</div></section>
  <section class="tutor-grid">
    <article class="tutor-card tutor-today"><div class="tutor-card-head"><div><small>TODAY</small><h2>${today?.focus||'Set a study goal'}</h2></div><strong>${today?.completed?'Done':'Next'}</strong></div>${today?`<ul>${today.tasks.map(t=>`<li><span>${t.label}</span><b>${t.minutes} min</b></li>`).join('')}</ul><button id="tutor-done" class="tutor-primary">${today.completed?'Completed':'Mark today complete'}</button>`:'<p>Set your examination date and available study time to create a plan.</p>'}</article>
    <article class="tutor-card"><small>YOUR PROGRESS</small><div class="tutor-stats"><div><b>${insights.summary.avgAccuracy}%</b><span>Accuracy</span></div><div><b>${insights.summary.totalQuizzesTaken}</b><span>Quizzes</span></div><div><b>${insights.summary.streakDays}</b><span>Day streak</span></div></div><h3>Priority topics</h3><div class="tutor-chips">${weak}</div></article>
  </section>
  <section class="tutor-card"><div class="tutor-card-head"><div><small>PERSONAL PLAN</small><h2>${p.examName||'Study plan'}</h2></div><span>${p.examDate?`${daysBetween(todayKey(),p.examDate)} days left`:'Self-paced'}</span></div><div class="tutor-plan">${plan.plan.slice(0,7).map(d=>`<div class="tutor-day ${d.completed?'is-done':''}"><div><b>Day ${d.day}</b><small>${d.date}</small></div><span>${d.focus.replace(/_/g,' ')}</span><strong>${d.completed?'✓':'→'}</strong></div>`).join('')}</div></section>
  <section class="tutor-card"><small>PLAN SETTINGS</small><form id="tutor-form" class="tutor-form"><label>Exam / goal<input id="tutor-exam" value="${p.examName||''}" placeholder="e.g. JAMB 2027"></label><label>Target date<input id="tutor-date" type="date" value="${p.examDate||''}"></label><label>Minutes per day<input id="tutor-minutes" type="number" min="20" max="720" value="${p.dailyMinutes||60}"></label><button class="tutor-primary" type="submit">Save & update plan</button></form></section>`;
  root.querySelector('#tutor-form')?.addEventListener('submit',e=>{e.preventDefault();gnostiriTutor.saveProfile({domain,examName:root.querySelector('#tutor-exam').value,examDate:root.querySelector('#tutor-date').value,dailyMinutes:root.querySelector('#tutor-minutes').value});gnostiriTutor.updatePlanFromProgress(domain);renderTutorDashboard(root);});
  root.querySelector('#tutor-done')?.addEventListener('click',()=>{gnostiriTutor.markTodayComplete(domain);renderTutorDashboard(root);});
}

document.addEventListener('DOMContentLoaded',()=>renderTutorDashboard(document.getElementById('gnostiri-tutor')));
