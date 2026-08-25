/** Axiom Academy — canonical quiz engine. Loads the question bank, filters by textbook subtopic, scores attempts, and persists results. */
(function(){
  'use strict';
  class QuizEngine {
    constructor(){
      this.config=window.QUIZ_CONFIG||{}; this.questions=[]; this.currentIndex=0; this.answers={}; this.score=0; this.startTime=null; this.timer=null;
      this.container=document.getElementById('quiz-container'); this.controls=document.getElementById('quiz-controls'); this.results=document.getElementById('quiz-results'); this.progressEl=document.getElementById('quiz-progress'); this.timerEl=document.getElementById('quiz-timer');
      this.init();
    }
    async init(){
      await this.loadQuestions();
      if(!this.questions.length){this.showLoadError('No questions are available for this quiz yet.');return;}
      if(this.controls)this.controls.style.display='flex'; this.startTime=Date.now(); this.renderQuestion(); this.setupControls(); this.startTimer();
    }
    async loadQuestions(){
      try{
        const dataEl=document.getElementById('quiz-data');
        let data=null;
        if(dataEl)data=JSON.parse(dataEl.textContent);
        else if(this.config.dataUrl){const resp=await fetch(this.config.dataUrl,{cache:'no-store'});if(!resp.ok)throw new Error('Question bank request failed');data=await resp.json();}
        let bank=(data&&data.questions)||[];
        const params=new URLSearchParams(location.search); const subtopic=params.get('subtopic');
        if(subtopic)bank=bank.filter(q=>q.topic===subtopic);
        this.questions=this.selectBalanced(bank,Number(this.config.questionCount)||20);
      }catch(e){console.error('[Axiom Quiz]',e);this.questions=[];this.showLoadError('We could not load the question bank. Please try again.');}
    }
    selectBalanced(bank,count){
      if(bank.length<=count)return bank;
      const groups={};bank.forEach(q=>(groups[q.topic]||(groups[q.topic]=[])).push(q));
      const keys=Object.keys(groups);const out=[];let i=0;
      while(out.length<count){const key=keys[i%keys.length];const group=groups[key];if(group.length)out.push(group.shift());i++;if(i>count*keys.length*2)break;}
      return out;
    }
    renderQuestion(){
      const q=this.questions[this.currentIndex]; if(!q)return this.showResults(); this.updateProgress();
      let html='<div class="quiz-question" data-index="'+this.currentIndex+'"><div class="question-number">Question '+(this.currentIndex+1)+' of '+this.questions.length+'</div><div class="question-text">'+q.question+'</div>';
      html+='<div class="options-list">';(q.options||[]).forEach((opt,i)=>{const selected=this.answers[q.id]===i?' selected':'';html+='<button type="button" class="option-item'+selected+'" data-index="'+i+'" aria-pressed="'+(this.answers[q.id]===i)+'"><span class="option-letter">'+String.fromCharCode(65+i)+'</span><span>'+opt+'</span></button>';});html+='</div></div>';
      this.container.innerHTML=html;this.container.querySelectorAll('.option-item').forEach(btn=>btn.addEventListener('click',()=>this.selectOption(q.id,Number(btn.dataset.index))));if(window.MathJax)window.MathJax.typesetPromise?.([this.container]);
    }
    selectOption(id,index){this.answers[id]=index;this.renderQuestion();}
    setupControls(){document.getElementById('btn-prev')?.addEventListener('click',()=>{if(this.currentIndex>0){this.currentIndex--;this.renderQuestion();}});document.getElementById('btn-next')?.addEventListener('click',()=>{if(this.currentIndex<this.questions.length-1){this.currentIndex++;this.renderQuestion();}});document.getElementById('btn-submit')?.addEventListener('click',()=>this.submitQuiz());}
    updateProgress(){if(this.progressEl)this.progressEl.textContent='Question '+(this.currentIndex+1)+' of '+this.questions.length;const p=document.getElementById('btn-prev'),n=document.getElementById('btn-next'),s=document.getElementById('btn-submit');if(p)p.disabled=this.currentIndex===0;if(n)n.style.display=this.currentIndex<this.questions.length-1?'inline-flex':'none';if(s)s.style.display=this.currentIndex===this.questions.length-1?'inline-flex':'none';}
    startTimer(){if(!this.config.timeLimit||!this.timerEl)return;let left=Number(this.config.timeLimit)*60;const tick=()=>{this.timerEl.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');if(left<=0){clearInterval(this.timer);this.submitQuiz();}left--;};tick();this.timer=setInterval(tick,1000);}
    submitQuiz(){clearInterval(this.timer);let correct=0;const breakdown=[];const weak=new Set();this.questions.forEach(q=>{const ok=this.answers[q.id]===q.correct;if(ok)correct++;else weak.add(q.topic);breakdown.push({question:q.question,correct:ok,topic:q.topic,explanation:q.explanation});});this.score=Math.round(correct/this.questions.length*100);const result={exam:this.config.exam,subject:this.config.subject,topic:this.config.topic,subtopic:new URLSearchParams(location.search).get('subtopic')||null,score:this.score,correct,totalQuestions:this.questions.length,timeSpent:Math.round((Date.now()-this.startTime)/1000),weakTopics:[...weak],timestamp:new Date().toISOString()};const history=JSON.parse(localStorage.getItem('axiom_quiz_history')||'[]');history.push(result);localStorage.setItem('axiom_quiz_history',JSON.stringify(history));this.saveCloud(result);this.showResults(breakdown,[...weak]);}
    async saveCloud(result){if(!window.AxiomApp?.user||!window.AxiomApp.db)return;try{await window.AxiomApp.db.collection('users').doc(window.AxiomApp.user.uid).collection('quiz_results').add({...result,timestamp:firebase.firestore.FieldValue.serverTimestamp()});}catch(e){console.warn('[Axiom Quiz] Cloud save failed',e);}}
    showResults(breakdown,weak){this.container.style.display='none';if(this.controls)this.controls.style.display='none';if(this.results)this.results.style.display='block';const value=document.getElementById('score-value');if(value)value.textContent=this.score+'%';const circle=document.getElementById('score-circle');if(circle)circle.style.setProperty('--score-deg',(this.score/100*360)+'deg');const list=document.getElementById('results-breakdown');if(list)list.innerHTML=breakdown.map(x=>'<div class="breakdown-item"><div class="breakdown-status '+(x.correct?'correct':'incorrect')+'">'+(x.correct?'✓':'✗')+'</div><div class="breakdown-text"><strong>'+x.question+'</strong><small>'+x.topic.replace(/-/g,' ')+'</small><p>'+x.explanation+'</p></div></div>').join('');const alert=document.getElementById('weak-topics-alert'),wl=document.getElementById('weak-topics-list');if(alert&&weak.length){alert.style.display='block';if(wl)wl.innerHTML=weak.map(t=>'<li>'+t.replace(/-/g,' ')+'</li>').join('');}}
    showLoadError(message){if(this.container)this.container.innerHTML='<div class="quiz-loading"><p>'+message+'</p></div>';}
  }
  if(document.querySelector('.quiz-wrapper'))window.quiz=new QuizEngine();
})();
