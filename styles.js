'use strict';
(() => {
  const A=window.Atlas;
  const styleOptions=()=>A.styleStages.map(stage=>'<optgroup label="'+A.html(stage.label)+'">'+stage.ids.map(id=>A.byId.get(id)).map(s=>'<option value="'+s.key+'">'+A.html(s.ko)+'</option>').join('')+'</optgroup>').join('');
  const defaults=()=>({styleA:'glass',styleB:'skeuo',comparison:false,themeMode:'default',palette:'plum',opacity:80,backdrop:'cool',motion:'none',query:'',filter:'all',panel:'dashboard',tab:0,email:'',density:'기본',alerts:true,task:false,progress:64,toast:false});
  A.styleState=defaults();
  const workspaceData=[['탐색 구조 검토','계획','초안'],['입력 상태 개선','설계','검토 중'],['모션 속도 테스트','실험','완료']];
  const allowed=['MOT-0001','MOT-0003','MOT-0004','MOT-0005','MOT-0010','MOT-0015','MOT-0017'];
  const details=(style,h)=>`<details class="s-disclosure style-story" open>
    <summary>${h(style.ko)} <small>${h(style.en)}</small></summary>
    <p>${h(style.definition)}</p>
    <dl><dt>배경과 역사</dt><dd>${h(style.history)}</dd><dt>시각적 특징</dt><dd>${h(style.features)}</dd>
    <dt>사례</dt><dd>${h(style.example)}</dd><dt>장점</dt><dd>${h(style.pros)}</dd>
    <dt>가독성과 접근성</dt><dd>${h(style.caution)}</dd><dt>적합한 환경</dt><dd>${h(style.use)}</dd>
    ${style.platformGap?'<dt>플랫폼과 HTML</dt><dd>'+h(style.platformGap)+'</dd>':''}</dl>
    <div class="story-links">${style.sources.map(key=>'<a target="_blank" rel="noopener" href="'+h(A.sources[key].url)+'">'+h(A.sources[key].name)+' ↗</a>').join('')}</div>
    <div class="story-links">${style.related.filter(id=>A.byId.has(id)).map(id=>'<a href="#item/'+id+'">'+h(A.byId.get(id).ko)+'</a>').join('')}</div>
  </details>`;
  function shell(host,side,state,theme) {
    const h=A.html;
    const p='studio-'+side;
    host.innerHTML=`<article class="sample-window collection" data-theme="${theme}">
      <div class="sample-toolbar">
        <div class="sample-product"><b aria-hidden="true">◈</b><span>프로젝트 데스크</span></div>
        <label class="toolbar-search"><span class="sr-only">${side.toUpperCase()} 프로젝트 검색</span><input data-sync="query" type="search" placeholder="프로젝트 찾기"></label>
        <details class="s-popover"><summary>보기 옵션</summary><div><button type="button" class="s-button" data-panel="dashboard">대시보드</button><button type="button" class="s-button" data-panel="settings">설정</button></div></details>
        <span class="s-tooltip"><button type="button" class="s-button icon" aria-describedby="${p}-tip">?</button><span id="${p}-tip" role="tooltip">두 보기는 같은 샘플 상태를 공유합니다.</span></span>
      </div>
      <div class="sample-structure">
        <nav class="sample-sidebar" aria-label="${side.toUpperCase()} 샘플 앱 메뉴">
          <span>작업 공간</span>
          <button type="button" data-panel="dashboard"><b aria-hidden="true">◫</b> 대시보드</button>
          <button type="button" data-panel="settings"><b aria-hidden="true">☷</b> 설정</button>
          <button type="button" data-studio="drawer"><b aria-hidden="true">▤</b> 작업 패널</button>
        </nav>
        <div class="sample-main">
          <section data-view="dashboard">
            <div class="sample-head"><div><small>내 프로젝트</small><h3>인터랙션 검토</h3></div><button class="s-button primary" type="button" data-studio="modal">노트 남기기</button></div>
            <div class="sample-kpis">
              <article class="s-card"><span>전체 작업</span><strong>3<span>개</span></strong></article>
              <article class="s-card"><span>검토 상태</span><strong data-task-status>진행 중</strong></article>
              <article class="s-card sample-progress"><span>완료율</span><strong data-progress-label>64%</strong><progress aria-label="작업 완료율" max="100" value="64"></progress></article>
            </div>
            <section class="s-card sample-board" aria-label="프로젝트 목록">
              ${A.controls.tabs(p,['작업 목록','요약','기록'],[
                '<div class="sample-filter"><label>상태 <select data-sync="filter"><option value="all">모든 상태</option><option value="review">검토 중</option><option value="done">완료</option></select></label></div><div class="project-list" data-projects></div>',
                '<p>세 작업의 보기 방식과 동작을 검토합니다.</p><label class="choice sample-check"><input type="checkbox" data-sync="task"><span class="sample-tick" aria-hidden="true">✓</span><span>접근성 점검 완료</span></label>',
                '<p data-studio-history>아직 저장한 노트가 없습니다.</p>',
              ])}
            </section>
          </section>
          <section data-view="settings" hidden>
            <div class="sample-head"><div><small>내 프로젝트</small><h3>보기와 알림 설정</h3></div><button class="s-button primary" type="button" data-studio="save">설정 저장</button></div>
            <div class="s-card settings-form">
              ${A.controls.field('연락처 이름','<input type="text" data-sync="email" maxlength="40" placeholder="예: 디자인 검토">')}
              <label class="s-switch"><input type="checkbox" data-sync="alerts" role="switch"><span class="switch-track" aria-hidden="true"></span><span>검토 알림 받기</span></label>
              ${A.controls.field('작업 완료율','<input type="range" data-sync="progress" min="0" max="100">')}
              <fieldset><legend>목록 밀도</legend><div class="sample-row">
              ${['기본','촘촘하게'].map(value=>'<label class="choice"><input type="radio" name="'+p+'-density" data-sync="density" value="'+value+'">'+value+'</label>').join('')}</div></fieldset>
              <details class="s-disclosure"><summary>보기 선택 도움말</summary><p>촘촘한 목록은 한 화면에서 더 많은 항목을 보여 줍니다.</p></details>
            </div>
          </section>
          <div class="s-toast" data-studio-toast hidden><span role="status">샘플 설정을 저장했습니다.</span><button type="button" class="s-button" data-studio="dismiss">닫기</button></div>
          <section class="style-description" aria-label="선택한 디자인 설명"></section>
        </div>
      </div>
      <dialog class="sample-dialog" id="${p}-note" aria-labelledby="${p}-note-label"><form data-note-form>
        <h3 id="${p}-note-label">검토 노트</h3>${A.controls.field('노트','<textarea data-note rows="3" maxlength="120" required></textarea>')}
        <div class="sample-row"><button class="s-button primary" type="submit">저장</button><button type="button" class="s-button" data-studio="close-note">취소</button></div>
      </form></dialog>
      <dialog class="sample-dialog drawer" id="${p}-drawer" aria-labelledby="${p}-drawer-label"><form method="dialog">
        <h3 id="${p}-drawer-label">작업 패널</h3><p>현재 대시보드의 상태를 확인할 수 있습니다.</p>
        <label class="choice sample-check"><input type="checkbox" data-sync="task"><span class="sample-tick" aria-hidden="true">✓</span><span>접근성 점검 완료</span></label>
        <div class="sample-row"><button class="s-button" type="submit">닫기</button></div>
      </form></dialog>
    </article>`;
    return host.firstElementChild;
  }
  function mount(root, styleTarget) {
    const h=A.html;
    const state=A.styleState;
    if(styleTarget)state.styleA=styleTarget;
    root.innerHTML=`<section class="studio-controls" aria-label="스타일 비교 설정">
      <label>A 스타일 <select data-control="styleA">${styleOptions()}</select></label>
      <label class="inline-choice"><input data-control="comparison" type="checkbox">A/B 나란히</label>
      <label data-side-b>B 스타일 <select data-control="styleB">${styleOptions()}</select></label>
      <label>접근성 테마 <select data-control="themeMode"><option value="default">스타일 기본값</option><option value="light">라이트</option><option value="dark">다크</option><option value="contrast">고대비</option></select></label>
      <label>조작 모션 <select data-control="motion"><option value="none">스타일 기본 반응</option>
        ${A.motions.filter(item=>allowed.includes(item.id)).map(item=>'<option value="'+item.id+'">'+h(item.ko)+'</option>').join('')}
      </select></label>
      <div class="studio-glass"><label>유리 표면 불투명도 <output data-alpha></output><input type="range" min="56" max="100" data-control="opacity"></label>
      <label>유리 뒤 배경 <select data-control="backdrop"><option value="cool">차가운 색</option><option value="warm">따뜻한 색</option></select></label></div>
      <label data-material-palette>머티리얼 팔레트 <select data-control="palette"><option value="plum">라일락</option><option value="fern">고사리</option><option value="sand">모래</option></select></label>
    </section>
    <p class="quiet studio-motion-copy" data-motion-meaning>작업 목록, 저장한 노트와 설정은 두 스타일에서 함께 바뀝니다.</p>
    <div class="studio-views"><div class="studio-side"><div class="side-label" data-side-label="a"></div><div data-studio-host="a"></div></div>
    <div class="studio-side" data-side-b hidden><div class="side-label" data-side-label="b"></div><div data-studio-host="b"></div></div></div>`;
    const windows={a:null,b:null};
    const cleanup=[];
    const panel=name=>{state.panel=name;if(name==='dashboard')state.tab=0;update();};
    const appearance=()=>{
      const choices=root.querySelectorAll('[data-control]');
      for(const input of choices){const value=state[input.dataset.control];if(input.type==='checkbox')input.checked=value;else input.value=value;}
      root.querySelectorAll('[data-side-b]').forEach(el=>el.hidden=!state.comparison);
      root.querySelector('.studio-views').classList.toggle('comparing',state.comparison);
      const visible=[state.styleA,...(state.comparison?[state.styleB]:[])];
      root.querySelector('.studio-glass').hidden=!visible.some(key=>['glass','liquid'].includes(key))||state.themeMode==='contrast';
      root.querySelector('[data-material-palette]').hidden=!visible.includes('material-you')||state.themeMode==='contrast';
      root.querySelector('[data-alpha]').textContent=state.opacity+'%';
      const motion=A.byId.get(state.motion);
      root.querySelector('[data-motion-meaning]').textContent=motion?'적용 대상 · '+(motion.id==='MOT-0017'?'접근성 체크박스의 체크 표시':motion.id==='MOT-0015'?'작업 탭의 선택 표시':'노트·설정의 실행 버튼')+' · '+motion.ko:'작업 목록, 저장한 노트와 설정은 두 스타일에서 함께 바뀝니다.';
    };
    const currentMotion=()=>A.byId.get(state.motion);
    const makeWindow=side=>{
      if(windows[side])return;
      const view=shell(root.querySelector('[data-studio-host="'+side+'"]'),side,state,state['style'+side.toUpperCase()]);
      windows[side]=view;
      const tabRoot=view.querySelector('[data-tabs]');
      A.controls.bindTabs(view,index=>{
        const previous=state.tab;
        state.tab=index;update();
        if(state.motion==='MOT-0015' && previous!==index && !matchMedia('(prefers-reduced-motion: reduce)').matches){
          for(const v of Object.values(windows).filter(Boolean)) {
            const buttons=v.querySelectorAll('[role=tab]');
            const bar=v.querySelector('[role=tablist]');
            const next=buttons[index],old=buttons[previous];
            bar.querySelector('.sliding-selection')?.remove();
            if(!next.offsetWidth)continue;
            const indicator=document.createElement('i');
            indicator.className='sliding-selection';
            indicator.setAttribute('aria-hidden','true');
            const delta=A.motionSettings[state.motion]?.duration ?? 260;
            indicator.style.width=next.offsetWidth+'px';
            indicator.style.transform='translate('+next.offsetLeft+'px,'+(next.offsetTop+next.offsetHeight-3)+'px)';
            bar.append(indicator);
            const animation=indicator.animate([
              {width:old.offsetWidth+'px',transform:'translate('+old.offsetLeft+'px,'+(old.offsetTop+old.offsetHeight-3)+'px)'},
              {width:next.offsetWidth+'px',transform:indicator.style.transform},
            ],{duration:delta,easing:'ease-out'});
            animation.onfinish=()=>indicator.remove();
          }
        }
      });
      view.querySelectorAll('.s-popover').forEach(el=>cleanup.push(A.controls.openPopover(el)));
      view.addEventListener('input',event=>{
        const input=event.target, key=input.dataset.sync;
        if(!key)return;
        state[key]=input.type==='checkbox'?input.checked:input.type==='range'?+input.value:input.value;
        update(input);
        if(key==='task'&&state.task&&state.motion==='MOT-0017'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
          const length=A.motionSettings[state.motion]?.duration ?? 400;
          for(const v of Object.values(windows).filter(Boolean))v.querySelectorAll('.sample-tick').forEach(tick=>tick.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],length));
        }
      });
      view.addEventListener('click',event=>{
        const el=event.target.closest('button');
        if(!el)return;
        if(el.dataset.panel){panel(el.dataset.panel);el.closest('details')?.removeAttribute('open');}
        const action=el.dataset.studio;
        if(action==='drawer')A.controls.showDialog(view.querySelector('dialog.drawer'),el);
        if(action==='modal'){view.querySelector('[data-note]').value=state.note||'';A.controls.showDialog(view.querySelector('dialog:not(.drawer)'),el);}
        if(action==='close-note')el.closest('dialog').close();
        if(action==='save'){state.toast=true;update();}
        if(action==='dismiss'){state.toast=false;update();view.querySelector(state.panel==='dashboard'?'[data-studio=modal]':'[data-studio=save]').focus();}
        if(['save','modal'].includes(action)){
          const motion=currentMotion();
          if(motion)A.motion.trigger(el,motion,A.motionSettings[motion.id]||A.motion.defaults(motion));
        }
      });
      view.querySelector('[data-note-form]').addEventListener('submit',event=>{
        event.preventDefault();
        state.note=view.querySelector('[data-note]').value.trim();
        if(!state.note)return;
        view.querySelector('dialog:not(.drawer)').close();
        state.toast=true;state.tab=2;update();
      });
      return tabRoot;
    };
    function update(origin) {
      appearance();makeWindow('a');if(state.comparison)makeWindow('b');
      for(const [side,view] of Object.entries(windows)){
        if(!view)continue;
        const key=state['style'+side.toUpperCase()];
        const style=A.styles.find(item=>item.key===key);
        if(view.dataset.theme!==key || !view.querySelector('.style-story')){
          view.dataset.theme=key;
          view.querySelector('.style-description').innerHTML=details(style,h);
        }
        root.querySelector('[data-side-label="'+side+'"]').textContent=(state.comparison?side.toUpperCase()+' · ':'')+style.ko;
        view.dataset.dark=String(state.themeMode==='dark');
        view.dataset.contrast=String(state.themeMode==='contrast');
        view.dataset.appearance=state.themeMode;
        view.dataset.palette=state.palette;
        view.dataset.backdrop=state.backdrop;
        view.dataset.density=state.density==='촘촘하게'?'dense':'normal';
        view.style.setProperty('--glass-opacity',(state.opacity/100).toFixed(2));
        view.querySelectorAll('[data-sync]').forEach(input=>{
          if(input===origin)return;
          const value=state[input.dataset.sync];
          if(input.type==='checkbox')input.checked=value;
          else if(input.type==='radio')input.checked=input.value===value;
          else if(String(input.value)!==String(value))input.value=value;
        });
        view.querySelectorAll('[data-panel]').forEach(el=>{
          if(el.dataset.panel===state.panel)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
        });
        view.querySelectorAll('[data-view]').forEach(el=>el.hidden=el.dataset.view!==state.panel);
        view.querySelector('[data-task-status]').textContent=state.task?'점검 완료':'진행 중';
        view.querySelector('progress').value=state.progress;
        view.querySelector('[data-progress-label]').textContent=state.progress+'%';
        view.querySelector('[data-studio-history]').textContent=state.note||'아직 저장한 노트가 없습니다.';
        view.querySelector('[data-studio-toast]').hidden=!state.toast;
        A.controls.tabActivate(view.querySelector('[data-tabs]'),state.tab);
        const q=state.query.trim().toLowerCase();
        const status={review:'검토 중',done:'완료'}[state.filter];
        const data=workspaceData.filter(row=>row.join(' ').toLowerCase().includes(q)&&(!status||row[2]===status));
        const rows=view.querySelector('[data-projects]');
        const markup=data.map(([name,category,phase])=>'<div><strong>'+name+'</strong><span>'+category+'</span><span class="s-badge">'+phase+'</span></div>').join('')||'<p>조건에 맞는 프로젝트가 없습니다.</p>';
        if(rows.innerHTML!==markup)rows.innerHTML=markup;
      }
    }
    root.addEventListener('input',event=>{
      const el=event.target;
      if(!el.dataset.control)return;
      state[el.dataset.control]=el.type==='checkbox'?el.checked:el.type==='range'?+el.value:el.value;
      update(el);
    });
    update();
    return ()=>cleanup.forEach(fn=>fn());
  }
  A.studio={mount,styleOptions,allowed};
})();
