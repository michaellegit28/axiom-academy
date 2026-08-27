/* GNOSTIRI Tutor — contextual quiz explanation bridge. */
document.addEventListener('DOMContentLoaded',()=>{
  const results=document.getElementById('quiz-results');
  if(!results)return;
  const observer=new MutationObserver(()=>{
    if(results.querySelector('[data-gnostiri-tutor]'))return;
    if(results.style.display==='none' || !results.textContent.trim())return;
    const button=document.createElement('button');
    button.type='button';button.dataset.gnostiriTutor='1';button.className='btn-outline btn-block';
    button.textContent='Ask GNOSTIRI Tutor to explain my mistakes';
    button.addEventListener('click',()=>{
      const toggle=document.getElementById('ai-toggle'),input=document.getElementById('ai-input');
      if(toggle)toggle.click();
      setTimeout(()=>{if(input){input.value='Explain my incorrect quiz answers and teach me the concepts I need to review.';input.focus();}},100);
    });
    results.appendChild(button);
  });
  observer.observe(results,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
});
