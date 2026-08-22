/**
 * Axiom Academy — Progress Tracker (Phase 4 + Phase A)
 * Domain-aware reading progress and quiz history.
 */
import { axiomAuth } from "./auth.js";
import { getState } from "./axiom-state.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const LS_KEY = "axiom_progress";
const DOMAINS = ["university", "high-school", "extras"];
const local = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } };
const save = data => localStorage.setItem(LS_KEY, JSON.stringify(data));
const domain = () => DOMAINS.includes(getState().domain) ? getState().domain : "high-school";
const chapterId = (s,v,c) => `chapter:${String(s).toLowerCase()}:vol-${v}:ch-${c}`;
const quizId = (e,s,t) => `quiz:${String(e).toLowerCase()}:${String(s).toLowerCase()}:${String(t).toLowerCase()}`;
const scoped = (d,id) => `${d}::${id}`;

export class ProgressTracker {
  constructor() {
    this.db = getFirestore(window.firebaseApp); this.cache = local();
    this.cache.progress ||= {}; this.cache.quiz_scores ||= {}; this.cache.quiz_history ||= [];
    this._syncQueue = []; this._syncing = false; this._migrateLegacyRecords();
  }
  _migrateLegacyRecords() {
    const d = domain(); let changed = false;
    Object.entries(this.cache.progress).forEach(([k,e]) => { if (!e || e.domain) return; const id=chapterId(e.subject,e.volume,e.chapter), nk=scoped(d,id); if(!this.cache.progress[nk]) this.cache.progress[nk]={...e,domain:d,contentId:id,contentType:"chapter"}; delete this.cache.progress[k]; changed=true; });
    Object.entries(this.cache.quiz_scores).forEach(([k,e]) => { if (!e || e.domain) return; const id=quizId(e.exam,e.subject,e.topic), nk=scoped(d,id); if(!this.cache.quiz_scores[nk]) this.cache.quiz_scores[nk]={...e,domain:d,contentId:id,contentType:"quiz"}; delete this.cache.quiz_scores[k]; changed=true; });
    this.cache.quiz_history=this.cache.quiz_history.map(e=>e.domain?e:{...e,domain:d,contentId:e.contentId||quizId(e.exam,e.subject,e.topic)});
    if(changed) save(this.cache);
  }
  trackChapterProgress(subject,volume,chapter,percentRead=0,completed=false,d=domain()) {
    const safe=DOMAINS.includes(d)?d:domain(), contentId=chapterId(subject,volume,chapter), key=scoped(safe,contentId), old=this.cache.progress[key]||{};
    const entry={domain:safe,contentId,contentType:"chapter",subject,volume,chapter,percentRead:Math.min(100,Math.max(0,percentRead)),completed:Boolean(completed),lastRead:Date.now(),readTime:(old.readTime||0)+1};
    this.cache.progress[key]=entry; save(this.cache); this._queueSync("progress",key,entry); this._updateStreak(); return entry;
  }
  initReadingProgress(subject,volume,chapter) {
    let last=0; const saveScroll=()=>{const h=document.documentElement.scrollHeight-window.innerHeight,p=h>0?Math.round(window.scrollY/h*100):0;if(Math.abs(p-last)>=5){last=p;this.trackChapterProgress(subject,volume,chapter,p,p>=95);}};
    window.addEventListener("scroll",()=>requestAnimationFrame(saveScroll),{passive:true}); this.trackChapterProgress(subject,volume,chapter,0,false);
  }
  async submitQuizScore(exam,subject,topic,score,total,timeSpentSeconds=0,d=domain()) {
    const safe=DOMAINS.includes(d)?d:domain(), contentId=quizId(exam,subject,topic), key=scoped(safe,contentId), old=this.cache.quiz_scores[key]||{};
    const entry={domain:safe,contentId,contentType:"quiz",exam,subject,topic,score,total,accuracy:total?Math.round(score/total*100):0,attempts:(old.attempts||0)+1,best:Math.max(score,old.best||0),timeSpentSeconds:(old.timeSpentSeconds||0)+timeSpentSeconds,lastAttempt:Date.now()};
    this.cache.quiz_scores[key]=entry; this.cache.quiz_history.push({...entry,date:Date.now()}); if(this.cache.quiz_history.length>200)this.cache.quiz_history=this.cache.quiz_history.slice(-200);
    save(this.cache); this._computeWeakTopics(safe); this._queueSync("quiz_scores",key,entry); this._queueSync("weak_topics",safe,this.cache.weak_topics?.[safe]||{}); this._updateAnalytics("quiz",timeSpentSeconds/60); return entry;
  }
  _computeWeakTopics(d=domain()) {
    const topics={}; Object.values(this.cache.quiz_scores).filter(e=>e.domain===d).forEach(e=>{topics[e.topic] ||= {total:0,correct:0,attempts:0};topics[e.topic].total+=e.total;topics[e.topic].correct+=e.score;topics[e.topic].attempts+=1;});
    const r={weak:[],needsPractice:[],strong:[]}; Object.entries(topics).forEach(([t,x])=>{const a=x.total?x.correct/x.total:0;if(a<.5&&x.attempts>=2)r.weak.push(t);else if(a<.75&&x.attempts>=2)r.needsPractice.push(t);else if(a>=.75&&x.attempts>=2)r.strong.push(t);});
    this.cache.weak_topics ||= {}; this.cache.weak_topics[d]=r; save(this.cache); return r;
  }
  getWeakTopics(d=domain()){return this._computeWeakTopics(d);}
  getTopicMastery(topic,d=domain()){const a=Object.values(this.cache.quiz_scores).filter(s=>s.domain===d&&s.topic===topic);if(!a.length)return null;const c=a.reduce((n,s)=>n+s.score,0),t=a.reduce((n,s)=>n+s.total,0);return{accuracy:t?Math.round(c/t*100):0,attempts:a.length,best:Math.max(...a.map(s=>s.best)),lastAttempt:Math.max(...a.map(s=>s.lastAttempt))};}
  _updateAnalytics(type,minutes=0){this.cache.analytics ||= {totalStudyMinutes:0,totalQuizzesTaken:0,totalCardsReviewed:0,chaptersRead:0,lastActiveDate:null};const a=this.cache.analytics;a.totalStudyMinutes+=minutes;a.lastActiveDate=Date.now();if(type==="quiz")a.totalQuizzesTaken++;if(type==="flashcard")a.totalCardsReviewed++;if(type==="chapter")a.chaptersRead++;if(minutes>0){this.cache.daily_activity ||= {};const k=new Date().toDateString();this.cache.daily_activity[k]=(this.cache.daily_activity[k]||0)+minutes;}save(this.cache);this._queueSync("analytics","summary",a);}
  _updateStreak(){const today=new Date().toDateString(),t=this.cache.study_track||{streakDays:0,lastStudyDate:null};if(t.lastStudyDate){const diff=(new Date(today)-new Date(t.lastStudyDate))/86400000;if(diff>=2)t.streakDays=1;else if(diff>=1)t.streakDays++;}else t.streakDays=1;t.lastStudyDate=today;this.cache.study_track=t;save(this.cache);this._queueSync("study_track","streak",t);}
  getStreak(){return this.cache.study_track?.streakDays||0;}
  _queueSync(collection,key,data){this._syncQueue.push({collection,key,data});this._flushSync();}
  async _flushSync(){if(this._syncing||!this._syncQueue.length||!axiomAuth.user||axiomAuth.isAnonymous)return;this._syncing=true;const uid=axiomAuth.uid;while(this._syncQueue.length){const i=this._syncQueue.shift();try{await setDoc(doc(this.db,"users",uid,i.collection,i.key),{...i.data,_syncedAt:serverTimestamp()},{merge:true});}catch(e){console.warn("[Progress] Sync failed:",e);this._syncQueue.unshift(i);break;}}this._syncing=false;if(this._syncQueue.length)setTimeout(()=>this._flushSync(),5000);}
  async loadFromCloud(){if(!axiomAuth.user||axiomAuth.isAnonymous)return;try{const uid=axiomAuth.uid;for(const c of ["progress","quiz_scores","weak_topics","study_track","analytics"]){const s=await getDoc(doc(this.db,"users",uid,c,"_summary"));if(s.exists())this.cache[c]={...(this.cache[c]||{}),...s.data()};}save(this.cache);}catch(e){console.warn("[Progress] Cloud load failed:",e);}}
  getProfileSummary(d=null){const scores=Object.values(this.cache.quiz_scores).filter(s=>!d||s.domain===d),progress=Object.values(this.cache.progress).filter(p=>!d||p.domain===d),total=scores.reduce((n,q)=>n+q.total,0),correct=scores.reduce((n,q)=>n+q.score,0);return{displayName:axiomAuth.displayName,email:axiomAuth.email,photoURL:axiomAuth.photoURL,isAnonymous:axiomAuth.isAnonymous,streakDays:this.getStreak(),totalStudyMinutes:this.cache.analytics?.totalStudyMinutes||0,totalQuizzesTaken:scores.length,totalCardsReviewed:this.cache.analytics?.totalCardsReviewed||0,chaptersCompleted:progress.filter(p=>p.completed).length,totalChapters:progress.length,avgAccuracy:total?Math.round(correct/total*100):0,weakTopics:this.getWeakTopics(d||domain())};}
  getQuizHistory(limit=20,d=null){const h=d?this.cache.quiz_history.filter(q=>q.domain===d):this.cache.quiz_history;return h.slice(-limit).reverse();}
  getWeeklyActivity(){const daily=this.cache.daily_activity||{},labels=[],minutes=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);labels.push(d.toLocaleDateString(undefined,{weekday:"short"}));minutes.push(Math.round(daily[d.toDateString()]||0));}return{labels,minutes};}
  getTopicBreakdown(d=domain()){const topics={};Object.values(this.cache.quiz_scores).filter(e=>e.domain===d).forEach(e=>{topics[e.topic] ||= {total:0,correct:0,attempts:0};topics[e.topic].total+=e.total;topics[e.topic].correct+=e.score;topics[e.topic].attempts++;});return Object.entries(topics).map(([topic,x])=>({topic,accuracy:x.total?Math.round(x.correct/x.total*100):0,attempts:x.attempts})).sort((a,b)=>a.accuracy-b.accuracy);}
  getRecommendedActions(d=domain()){const weak=this.getTopicBreakdown(d).filter(t=>t.accuracy<50).slice(0,3);return weak.length?weak.map(t=>({text:`Practice ${t.topic.replace(/_/g," ")} — currently ${t.accuracy}% accuracy`,href:`/quiz/jamb/physics/${t.topic}/`})):[{text:"Take a new quiz to keep building your mastery profile.",href:"/quiz/"}];}
}
export const progressTracker=new ProgressTracker();
export default progressTracker;
