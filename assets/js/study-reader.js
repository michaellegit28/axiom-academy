(function(){'use strict';
function init(){
 const article=document.querySelector('.study-lesson, .study-content, article.content-card'); if(!article)return;
 const headings=[...article.querySelectorAll('h2,h3')];
 const toc=document.querySelector('[data-study-toc]');
 headings.forEach((h,i)=>{if(!h.id)h.id='study-section-'+(i+1);});
 if(toc){toc.innerHTML=headings.map(h=>`<a href="#${h.id}">${h.textContent}</a>`).join('');}
 const bar=document.querySelector('[data-reading-progress]');
 const update=()=>{if(!bar)return;const top=article.getBoundingClientRect().top+window.scrollY;const total=Math.max(1,article.scrollHeight-window.innerHeight);bar.style.width=Math.min(100,Math.max(0,((window.scrollY-top)/total)*100))+'%';};
 window.addEventListener('scroll',update,{passive:true});update();
 const key='axiom-bookmark:'+location.pathname;
 const bookmark=document.querySelector('[data-study-bookmark]');
 if(bookmark){bookmark.classList.toggle('active',localStorage.getItem(key)==='1');bookmark.addEventListener('click',()=>{const on=localStorage.getItem(key)==='1';localStorage.setItem(key,on?'0':'1');bookmark.classList.toggle('active',!on);});}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
