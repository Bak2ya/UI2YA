'use strict';
(() => {
  const A=window.Atlas;
  const categories=[
    ['basic','기본 전환','기본 전환'],['physics','물리·탄성','탄성·물리'],
    ['controls','버튼·컨트롤','마이크로 인터랙션'],['graphic','텍스트·그래픽','확장 표현'],
    ['screens','스크롤·화면','목록·화면'],
  ];
  const categoryFor=item=>categories.find(([, ,group])=>group===item.group)?.[0]||'basic';

  function mount(root,current,onChange){
    const h=A.html;
    const all=A.motions;
    const titles=categories.map(([value,title])=>`<button type="button" data-motion-group="${value}" aria-pressed="false">${title}</button>`).join('');
    root.innerHTML=`<div class="section-head motion-page-head"><div><h1>모션 실험실</h1><p>움직임을 골라 재생하고 개발에 쓸 설정값을 조절해 봐.</p></div></div>
      <div class="motion-workspace">
        <section class="motion-browser" aria-labelledby="motion-browser-title">
          <header><h2 id="motion-browser-title">모션 탐색</h2><span>${all.length}개</span></header>
          <div class="motion-group-tabs" role="group" aria-label="모션 분류">${titles}</div>
          <div class="motion-list-view"></div>
        </section>
        <section class="motion-detail" id="motion-detail" aria-labelledby="lab-heading"></section>
      </div>
      <details class="u-section motion-concepts"><summary>관련 모션 개념 ${A.pendingMotions.length}개</summary>
        <div>${A.pendingMotions.map(item=>`<a class="u-action" href="#item/${item.id}">${h(item.ko)} <small>${h(item.en)}</small></a>`).join('')}</div>
      </details>`;
    const list=root.querySelector('.motion-list-view'), detail=root.querySelector('#motion-detail');
    let currentItem=current,activeCategory=categoryFor(current),activePreset,disposeLab=null,disposePreviews=[];
    function drawList(){
      disposePreviews.forEach(dispose=>dispose());
      disposePreviews=[];
      root.querySelectorAll('[data-motion-group]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.motionGroup===activeCategory)));
      list.innerHTML=all.filter(item=>categoryFor(item)===activeCategory).map(item=>`<article class="motion-row">
        <button type="button" class="motion-row-select" data-motion-id="${item.id}" aria-pressed="${currentItem.id===item.id}">
          <strong>${h(item.ko)}</strong><small lang="en">${h(item.en)}</small><span class="row-description">${h(item.definition)}</span>
        </button>
        <div class="u-motion-preview" inert aria-hidden="true"><div class="motion-stage"></div></div>
      </article>`).join('');
      list.scrollTop=0;
      list.querySelectorAll('.motion-row').forEach(row=>{
        const item=all.find(motion=>motion.id===row.querySelector('button').dataset.motionId);
        disposePreviews.push(A.motion.hoverPreview(row,row.querySelector('.motion-stage'),item));
      });
    }
    function drawDetail(){
      disposeLab?.();
      const presets=A.presets.filter(preset=>preset.motion===currentItem.id);
      detail.innerHTML=`<div class="motion-detail-head"><div><p lang="en">${h(currentItem.en)}</p><h2 id="lab-heading" tabindex="-1">${h(currentItem.ko)}</h2></div>
        <div class="motion-detail-actions"><button class="u-action" type="button" data-favorite="${currentItem.id}" aria-label="${h(currentItem.ko)} 즐겨찾기" aria-pressed="${window.AtlasUI?.isFavorite(currentItem.id)||false}">${A.icons.icon('star')}</button>
        <button class="u-action" type="button" data-copy-item="${currentItem.id}">단독 복사</button><button class="u-action primary" type="button" data-add="${currentItem.id}">조합 추가</button></div>
      </div><p class="motion-definition">${h(currentItem.definition)}</p>
      ${presets.length?`<div class="workspace-presets" role="group" aria-label="추천 프리셋"><span>추천 프리셋</span>${presets.map(preset=>`<button class="u-action" type="button" data-workspace-preset="${preset.id}" aria-pressed="${activePreset===preset.id}" title="${h(preset.description)}">${h(preset.name)} <small>${preset.duration}ms</small></button>`).join('')}</div>`:''}
      <div id="motion-lab"></div>
      <div class="motion-detail-links">${(currentItem.related||[]).map(id=>A.byId.get(id)).filter(Boolean).map(item=>`<a href="#item/${item.id}">${h(item.en)}</a>`).join('')}</div>`;
      disposeLab=A.motion.mount(detail.querySelector('#motion-lab'),currentItem);
    }
    function select(id){
      const selected=all.find(item=>item.id===id);
      if(!selected||selected===currentItem)return;
      currentItem=selected;
      activePreset=null;
      list.querySelectorAll('[data-motion-id]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.motionId===id)));
      drawDetail();
      onChange(selected);
      if(matchMedia('(max-width: 1050px)').matches)detail.scrollIntoView({block:'start',behavior:'instant'});
    }
    root.querySelector('.motion-group-tabs').addEventListener('click',event=>{
      const group=event.target.closest('[data-motion-group]')?.dataset.motionGroup;
      if(!group||group===activeCategory)return;
      activeCategory=group;drawList();
    });
    list.addEventListener('click',event=>{
      const id=event.target.closest('[data-motion-id]')?.dataset.motionId;
      if(id)select(id);
    });
    detail.addEventListener('click',event=>{
      const id=event.target.closest('[data-workspace-preset]')?.dataset.workspacePreset;
      if(!id)return;
      const preset=A.presets.find(row=>row.id===id);
      A.motionSettings[currentItem.id]=A.motion.presetOptions(currentItem,preset);
      activePreset=id;
      drawDetail();
      detail.querySelector(`[data-workspace-preset="${id}"]`).focus({preventScroll:true});
      const replacement=detail.querySelector('#motion-lab');
      replacement.querySelector('[data-motion-action="play"]').click();
      window.AtlasUI.notify(preset.ko+' 프리셋 적용');
      onChange(currentItem);
    });
    detail.addEventListener('input',event=>{
      if(!activePreset||!event.target.closest('[data-motion-form]'))return;
      detail.querySelector(`[data-workspace-preset="${activePreset}"]`)?.setAttribute('aria-pressed','false');
      activePreset=null;
    });
    drawList();
    drawDetail();
    return ()=>{disposeLab?.();disposePreviews.forEach(dispose=>dispose());};
  }
  A.motionWorkspace={mount};
})();
