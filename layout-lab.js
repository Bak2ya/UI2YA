'use strict';
(() => {
  const A = window.Atlas;
  const $=selector=>document.querySelector(selector);
  const walkthrough=['sidebar','header','workspace','drawer','dock'];
  const barChoices=[['auto','스타일 기본값'],['attached','밀착형'],['floating','플로팅형'],['capsule','캡슐형']];
  const getLesson=key=>A.lessons.find(item=>item.key===key);

  const showButton=(key,label='실제 화면에서 보기')=>
    `<button type="button" class="u-action lesson-button" data-spotlight="${key}">${A.icons.icon('scan-line')}${label}</button>`;
  function lessonControls(key){
    if(key==='header')return `<div class="lesson-controls"><fieldset class="form-segments"><legend>상단바 형태</legend>${barChoices.map(([value,label])=>`<label><input type="radio" name="bar-shape" value="${value}"><span>${label}</span></label>`).join('')}</fieldset></div>`;
    if(key==='sidebar')return `<div class="lesson-controls"><button type="button" class="u-action rail-switch" data-rail-toggle aria-pressed="false">${A.icons.icon('panel-left')}<span>사이드바 접기</span></button><p class="mobile-rail-note">좁은 화면에서는 상단 탐색 메뉴로 바뀌어.</p></div>`;
    return '';
  }
  function render(root,tiles){
    const h=A.html;
    const mapButton=(key,style,icon,label)=>`<button type="button" class="map-${style}" data-spotlight="${key}">${A.icons.icon(icon)}<span>${label}</span></button>`;
    const core=['header','sidebar','workspace','drawer','sticky','fixed','floating','capsule','rail','card','dock','toolbar','popover','floating-panel','modal','scrim','spotlight','coach','focus','tour','search'];
    root.innerHTML=`<section class="layout-intro">
      <div class="layout-lead">
        <p class="lab-eyebrow" lang="en">Interface anatomy</p>
        <h1>레이아웃 실험실</h1>
        <p>앱을 이루는 영역의 이름을 알아보고, 지금 보고 있는 화면에서 찾아봐.</p>
        <div class="layout-lead-actions"><button class="u-action primary" type="button" data-spotlight="tour">${A.icons.icon('play')}가이드 투어</button><a class="u-action" href="#catalog/component">컴포넌트 살펴보기</a></div>
      </div>
      <div class="layout-map">
        <div class="map-title"><span>화면 구조 지도</span><span>누르면 실제 위치를 강조해</span></div>
        <div class="layout-diagram">
          ${mapButton('sidebar','rail','panel-left','사이드바')}
          ${mapButton('header','bar','panel-top','상단바')}
          ${mapButton('workspace','main','layout-template','본문 작업공간')}
          ${mapButton('drawer','side','panel-left','드로어')}
          ${mapButton('dock','dock','shapes','하단 도크')}
        </div>
      </div>
    </section>
    <section class="u-section lesson-section" aria-labelledby="structure-title"><div class="u-section-title"><h2 id="structure-title">화면의 구성과 동작</h2><a href="#catalog/effect">글래스와 재질</a></div>
      <div class="lesson-grid">${core.map(key=>{
        const item=getLesson(key);
        const action=key==='tour'?'투어 시작':'화면에서 보기';
        return `<article class="lesson-card" data-lesson="${key}"><div class="lesson-card-title"><h3>${h(item.ko)}</h3><button type="button" class="chrome-icon lesson-spotlight" data-spotlight="${key}" aria-label="${h(item.ko)} · ${action}" title="${action}">${A.icons.icon('scan-line')}</button></div>
          <span class="lesson-term" lang="en">${h(item.en)}</span><p>${h(item.definition)}</p>${lessonControls(key)}</article>`;
      }).join('')}</div>
    </section>
    <section class="responsive-guide" aria-labelledby="responsive-heading">
      <div><h2 id="responsive-heading">반응형 레이아웃 <span lang="en">Responsive Layout</span></h2>
      <p>화면에 쓸 수 있는 너비에 맞춰 같은 내용을 다시 배치하는 방식이야. UI2YA에서는 화면이 좁아지면 왼쪽 탐색이 상단으로 이동하고, 나란히 보이던 작업 영역이 위아래로 쌓여.</p>
      <a class="u-action" href="#item/LAY-0003">미리보기 너비 조절해 보기</a></div>
    </section>
    <section class="u-section"><div class="u-section-title"><h2>작업공간 예제</h2></div>
      <div class="layout-motion-links">
        <a class="u-action" href="#motion/MOT-0025">Layout Reflow · 재배치</a>
        <a class="u-action" href="#motion/MOT-0028">Shared Element · 공유 요소</a>
        <a class="u-action" href="#item/LAY-1120">Sticky Inspector · 고정 조절 패널</a>
      </div>
    </section>${tiles}`;
    sync();
  }
  function sync(){
    const ui=window.AtlasUI;
    if(!ui)return;
    document.querySelectorAll('[name=bar-shape]').forEach(control=>control.checked=control.value===(ui.state.barShape||'auto'));
    document.querySelectorAll('[data-rail-toggle]').forEach(btn=>{
      btn.setAttribute('aria-pressed',String(!!ui.state.railCompact));
      const text=btn.querySelector('span');
      if(text)text.textContent=ui.state.railCompact?'사이드바 펼치기':'사이드바 접기';
    });
  }
  function layoutDemo(root,item){
    if(item.lessonKey){
      const lesson=getLesson(item.lessonKey);
      root.innerHTML=`${showButton(lesson.key)}<p>${A.html(lesson.example)}</p>`;
      if(item.key==='sticky'){
        const inline=document.createElement('div');
        root.append(inline);
        A.controls.mountLayout(inline,item);
      }
      return true;
    }
    if(item.key==='collapse-demo'){
      root.innerHTML=`<button type="button" data-rail-toggle class="u-action rail-switch" aria-pressed="false">${A.icons.icon('panel-left')}<span>사이드바 접기</span></button><p>데스크톱 너비에서 실제 탐색 영역을 접어 봐.</p>`;
      sync();return true;
    }
    if(item.key==='split-demo'){
      root.innerHTML='<div class="split-sample" style="--split:50%"><span>목록</span><span>작업 영역</span></div><label class="field">왼쪽 패널 너비 <input type="range" min="25" max="72" value="50"></label>';
      root.querySelector('input').addEventListener('input',event=>root.querySelector('.split-sample').style.setProperty('--split',event.target.value+'%'));
      return true;
    }
    if(item.key==='master-detail'){
      root.innerHTML='<div class="master-detail-sample"><div class="master-list" role="group" aria-label="프로젝트 선택"><button class="u-action" type="button" aria-pressed="true" data-master="0">초안</button><button class="u-action" type="button" aria-pressed="false" data-master="1">검토</button></div><p aria-live="polite">초안 · 2개 시안 작성 중</p></div>';
      root.addEventListener('click',event=>{
        const button=event.target.closest('[data-master]');
        if(!button)return;
        root.querySelectorAll('[data-master]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
        root.querySelector('p').textContent=['초안 · 2개 시안 작성 중','검토 · 편집 의견 3개 확인'][button.dataset.master];
      });
      return true;
    }
    return false;
  }
  function materialCompare(){
    return `<div class="material-comparison">
      <figure><div class="material-example solid-material"><div>패널 내용</div></div><figcaption>불투명 패널</figcaption></figure>
      <figure><div class="material-example single-material"><div>패널 내용</div></div><figcaption>개별 글래스 패널</figcaption></figure>
      <figure><div class="material-example glass-system"><i></i><div>패널 내용</div><b></b></div><figcaption>글래스모피즘 화면</figcaption></figure>
    </div>`;
  }
  function effectDemo(root,item){
    if(item.key==='glass-panel'){
      root.innerHTML=materialCompare()+'<p>두 글래스 예제는 같은 표면 처리야. 세 번째는 도구와 탐색에도 같은 재질을 적용해.</p>';
      return true;
    }
    if(item.key==='surface-opacity'){
      root.innerHTML='<div class="material-example single-material opacity-sample" style="--tile-opacity:70%"><div>패널 내용</div></div><label class="field">표면 불투명도 <output>70%</output><input type="range" min="45" max="100" value="70"></label>';
      root.querySelector('input').addEventListener('input',event=>{
        const value=event.target.value+'%';
        root.querySelector('.opacity-sample').style.setProperty('--tile-opacity',value);
        root.querySelector('output').textContent=value;
      });
      return true;
    }
    return false;
  }

  const dialog=$('#spotlight-dialog'), coach=dialog.querySelector('.coach-mark'), ring=dialog.querySelector('.spotlight-ring');
  let session=null;
  let frame=0;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function locate(item,opener){
    const target=$(item.target);
    if(target)return target;
    if(item.key==='card')return opener.closest('article');
    return null;
  }
  function prepare(item){
    const ui=window.UI2YAEnhance;
    const body=document.body;
    if(['fixed','sticky','floating','capsule'].includes(item.prepare)){
      const shape=body.dataset.barShape;
      if(item.prepare==='fixed')body.dataset.barPosition='fixed';
      else if(item.prepare!=='sticky')body.dataset.barShape=item.prepare;
      return ()=>{delete body.dataset.barPosition;body.dataset.barShape=shape;};
    }
    if(item.prepare==='rail'){
      const compact=body.dataset.railCompact;
      body.dataset.railCompact='true';
      return ()=>{body.dataset.railCompact=compact;};
    }
    if(item.prepare==='drawer'&&ui&&!ui.drawerIsOpen()){
      ui.openStyle(window.AtlasUI.state.style,false);
      return ()=>ui.closeStyle(false);
    }
    if(item.prepare==='popover'&&ui&&!ui.settingsIsOpen()){
      ui.setSettings(true);
      return ()=>ui.setSettings(false);
    }
    if(item.prepare==='modal'){
      const modal=$('#tour-modal-example');
      modal.showModal();
      return ()=>modal.close();
    }
    if(item.prepare==='search'&&ui&&!ui.searchIsOpen()){
      ui.expandSearch(false);
      return ()=>ui.collapseSearch(false);
    }
    return ()=>{};
  }
  function position(){
    if(!session?.target?.isConnected)return;
    const rect=session.target.getBoundingClientRect();
    const padding=6,gap=14;
    const left=Math.max(padding,rect.left-padding),right=Math.min(innerWidth-padding,rect.right+padding);
    const top=Math.max(padding,rect.top-padding),bottom=Math.min(innerHeight-padding,rect.bottom+padding);
    const width=Math.max(0,right-left),height=Math.max(0,bottom-top);
    ring.hidden=width<4||height<4;
    Object.assign(ring.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
    const {width:panelWidth,height:panelHeight}=coach.getBoundingClientRect();
    let x=Math.max(gap,Math.min(left,innerWidth-panelWidth-gap)), y;
    if(innerWidth-right>=panelWidth+gap*2){
      x=right+gap;y=top;
    }else if(left>=panelWidth+gap*2){
      x=left-panelWidth-gap;y=top;
    }else if(innerHeight-bottom>=panelHeight+gap){
      y=bottom+gap;
    }else if(top>=panelHeight+gap){
      y=top-panelHeight-gap;
    }else{
      y=top+height*.62;
    }
    coach.style.left=x+'px';
    coach.style.top=Math.max(gap,Math.min(y,innerHeight-panelHeight-gap))+'px';
  }
  function positionDuringTransition(){
    cancelAnimationFrame(frame);
    if(reduce.matches){position();return;}
    const end=performance.now()+420;
    function tick(time){
      position();
      if(time<end&&session)frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
  }
  function step(index){
    const active=session;
    active.restoreStep?.();
    active.index=index;
    let item=getLesson(active.steps[index]);
    if(item.key==='tour')item=getLesson('sidebar');
    active.restoreStep=prepare(item);
    active.target=locate(item,active.opener);
    const rect=active.target?.getBoundingClientRect();
    if(rect&&(rect.bottom<0||rect.top>=innerHeight))active.target.scrollIntoView({block:'center',behavior:'instant'});
    const h=A.html;
    const related=item.related.map(id=>A.byId.get(id)).filter(Boolean);
    const guided=active.steps.length>1;
    coach.innerHTML=`<header><div><p lang="en">${h(item.en)}</p><h2 id="coach-title">${h(item.ko)}</h2></div><button type="button" class="chrome-icon coach-close" data-close-coach aria-label="설명 닫기">${A.icons.icon('x')}</button></header>
      <p class="coach-definition">${h(item.definition)}</p>
      <dl><div><dt>사용처</dt><dd>${h(item.use)}</dd></div><div><dt>현재 UI2YA</dt><dd>${h(item.example)}</dd></div><div><dt>적용 기법</dt><dd>${h(item.motion)}</dd></div></dl>
      ${related.length?`<div class="coach-related" aria-label="관련 항목">${related.map(other=>`<a href="#item/${other.id}">${h(other.en||other.ko)}</a>`).join('')}</div>`:''}
      ${guided?`<footer><span>${index+1} / ${active.steps.length}</span><button type="button" class="u-action" data-coach-prev ${index===0?'disabled':''}>이전</button><button type="button" class="u-action primary" data-coach-next>${index===active.steps.length-1?'마치기':'다음'}</button></footer>`:''}`;
    if(!dialog.open)dialog.showModal();
    coach.querySelector('[data-close-coach]').focus({preventScroll:true});
    position();positionDuringTransition();
  }
  function close(restorePosition=true){
    if(!session)return;
    const {restoreStep,opener,scroll}=session;
    session=null;
    cancelAnimationFrame(frame);
    dialog.close();
    restoreStep?.();
    if(restorePosition){
      window.scrollTo({top:scroll,behavior:'instant'});
      if(opener.isConnected)opener.focus({preventScroll:true});
    }
  }
  function start(key,opener){
    const item=getLesson(key);
    if(!item)return;
    if(key==='inspector'&&!$(item.target)){
      location.hash='motion';
      window.addEventListener('hashchange',()=>requestAnimationFrame(()=>{
        const target=$('#motion-detail');
        if(target)start(key,target.querySelector('button')||target);
      }),{once:true});
      return;
    }
    close(false);
    session={steps:key==='tour'?walkthrough:[key],index:0,opener,scroll:window.scrollY};
    step(0);
  }
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('click',event=>{
    if(event.target===dialog||event.target.closest('[data-close-coach]'))close();
    if(event.target.closest('[data-coach-prev]'))step(session.index-1);
    if(event.target.closest('[data-coach-next]')){
      if(session.index+1===session.steps.length)close();
      else step(session.index+1);
    }
    if(event.target.closest('a'))close(false);
  });
  window.addEventListener('resize',position);
  window.addEventListener('scroll',position,{passive:true});
  window.addEventListener('hashchange',()=>close(false));
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-spotlight]');
    if(button)start(button.dataset.spotlight,button);
    const rail=event.target.closest('[data-rail-toggle]');
    if(rail){
      const ui=window.AtlasUI;
      ui.state.railCompact=!ui.state.railCompact;
      ui.applyTheme();
    }
  });
  document.addEventListener('input',event=>{
    if(event.target.name==='bar-shape'){
      window.AtlasUI.state.barShape=event.target.value;
      window.AtlasUI.applyTheme();
    }
  });
  A.layoutLab={render,sync,showButton,layoutDemo,effectDemo,materialCompare};
})();
