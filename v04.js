/* UI2YA v0.4: learnable chrome details + input tooltips + sliding selection indicator. */
'use strict';
(() => {
  const q=s=>document.querySelector(s), main=q('#main');
  q('.rail-source-link').addEventListener('click',()=>{q('#ui-learn-popover').hidden=true;});
  // The HTML role=radio example is functionally a segmented control. The visual
  // selection slides inside its own shared surface rather than becoming 3 pills.
  document.addEventListener('change',e=>{
    const choice=e.target.closest('.s-segmented input[data-segment]');if(!choice)return;
    const control=choice.closest('.s-segmented');const labels=[...control.querySelectorAll('.s-segment-choice')];
    const index=labels.indexOf(choice.closest('.s-segment-choice'));
    if(index>=0)control.style.setProperty('--segment-index',`${index*100}%`);
  });
  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return; scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;
    document.querySelectorAll('.s-segmented:not([data-init-slide])').forEach(el=>{
      el.dataset.initSlide='true';const labels=[...el.querySelectorAll('.s-segment-choice')],index=labels.findIndex(l=>l.querySelector('input')?.checked);
      el.style.setProperty('--segment-index',`${Math.max(0,index)*100}%`);
      el.dataset.help='segment';el.title='Segmented Control — 연결형 단일 선택 / Sliding Indicator — 움직이는 선택 배경';
    });
    document.querySelectorAll('[data-color-studio]').forEach(el=>{
      if(el.dataset.learnReady)return;el.dataset.learnReady='true';
      el.querySelectorAll('[data-color-tab]').forEach(button=>button.title=`Color Picker mode · ${button.textContent.trim()}`);
    });
    });
  });observer.observe(main,{childList:true,subtree:true});
  // A tooltip with a helpful cross-reference for the toolbar theme segmented control.
  q('.u-mode').dataset.help='mode';q('.u-mode').title='Segmented Control — 표시 모드 (단일 선택)';
  q('.u-color-inline').dataset.help='color';q('.u-color-inline').title='Color Swatch / Color Picker — 현재 강조색';
  q('.topbar').title='Sticky Toolbar — 스크롤 위치와 관계없이 상단에 유지되는 도구막대';
  window.UI2YA_04={version:'0.4.0'};
})();
