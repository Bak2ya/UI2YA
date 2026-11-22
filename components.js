'use strict';
(() => {
  const A=window.Atlas;
  const button=(label,action='',classes='')=>'<button type="button" class="s-button '+classes+'"'+(action?' data-action="'+action+'"':'')+'>'+label+'</button>';
  const field=(label,input)=>'<label class="field"><span>'+label+'</span>'+input+'</label>';
  const result=(value='')=>'<output class="demo-result" data-result role="status">'+value+'</output>';
  const checks=(p,labels,type='checkbox',name='choose')=>labels.map((label,i)=>'<label class="choice"><input type="'+type+'" name="'+p+'-'+name+'" value="'+label+'"'+(type==='radio'&&i===0?' checked':'')+'><span>'+label+'</span></label>').join('');
  const menuOptions=options=>options.map(v=>'<option>'+v+'</option>').join('');
  const dialog=(p,kind,title,body)=>`<dialog class="sample-dialog ${kind}" id="${p}-dialog" aria-labelledby="${p}-dialog-title"><form method="dialog"><h3 id="${p}-dialog-title">${title}</h3>${body}<div class="sample-row"><button type="submit" class="s-button" value="close">닫기</button></div></form></dialog>`;
  const tabs=(p,labels,bodies)=>`<div class="demo-tabs" data-tabs><div role="tablist" aria-label="보기 선택">
    ${labels.map((label,i)=>`<button type="button" role="tab" id="${p}-tab-${i}" aria-controls="${p}-panel-${i}" aria-selected="${!i}" tabindex="${i?-1:0}">${label}</button>`).join('')}
    </div>${bodies.map((body,i)=>`<section role="tabpanel" id="${p}-panel-${i}" aria-labelledby="${p}-tab-${i}" tabindex="0" ${i?'hidden':''}>${body}</section>`).join('')}</div>`;
  function tabActivate(root,index,focus=false) {
    const options=[...root.querySelectorAll('[role=tab]')];
    options.forEach((el,i)=>{
      const active=i===index;
      el.setAttribute('aria-selected',String(active));
      el.tabIndex=active?0:-1;
      const panel=el.closest('[data-tabs]').querySelector('#'+el.getAttribute('aria-controls'));
      if(panel) panel.hidden=!active;
    });
    if(focus)options[index]?.focus();
  }
  function bindTabs(root,onSelect) {
    root.querySelectorAll('[data-tabs]').forEach(t=>{
      const tabs=[...t.querySelectorAll('[role=tab]')];
      t.addEventListener('click',event=>{
        const index=tabs.indexOf(event.target.closest('[role=tab]'));
        if(index>=0){tabActivate(t,index);onSelect?.(index,tabs[index]);}
      });
      t.addEventListener('keydown',event=>{
        const index=tabs.indexOf(event.target);
        if(index<0)return;
        const next={ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
        if(next===undefined)return;
        event.preventDefault();tabActivate(t,next,true);onSelect?.(next,tabs[next]);
      });
    });
  }
  function showDialog(el,opener) {
    if(!el||el.open)return;
    if(typeof el.showModal==='function')el.showModal();
    else el.setAttribute('open','');
    if(opener)el.addEventListener('close',()=>opener.focus(),{once:true});
  }
  function openPopover(details) {
    const dismiss=e=>{
      if(e.key==='Escape'&&details.open){details.open=false;details.querySelector('summary')?.focus();}
    };
    const outside=e=>{
      if(details.open&&!details.contains(e.target))details.open=false;
    };
    document.addEventListener('keydown',dismiss);
    document.addEventListener('pointerdown',outside);
    return ()=>{document.removeEventListener('keydown',dismiss);document.removeEventListener('pointerdown',outside);};
  }
  const vocabulary=['관찰 노트','구성 요소','대시보드','모션 실험','베타 테스트','스타일 시안'];
  const demoData=[['프로토타입',7],['사용성 검토',3],['스타일 조사',5]];
  const simpleInput=(type,label,attributes='')=>field(label,'<input type="'+type+'" '+attributes+' data-value>');
  const tooltip=()=>'<span class="s-tooltip"><button type="button" class="s-button" aria-describedby="demo-tip">?</button><span role="tooltip" id="demo-tip">저장한 항목은 즐겨찾기에 표시됩니다.</span></span>';
  const demos={
    checkbox:p=>'<fieldset><legend>보고 싶은 자료</legend>'+checks(p,['컴포넌트','모션','스타일'])+'</fieldset>'+result('선택한 자료 없음'),
    tristate:p=>'<fieldset><legend>파일 그룹 선택</legend><label class="choice"><input type="checkbox" data-all> 전체 선택</label><div class="sample-nest">'+checks(p,['스케치','프로토타입','검토 기록'])+'</div></fieldset>'+result('선택한 항목 없음'),
    switch:()=>'<label class="s-switch"><input type="checkbox" role="switch" data-switch><span class="switch-track" aria-hidden="true"></span><span>알림 받기</span></label>'+result('꺼짐'),
    toggle:()=>'<button class="s-button" type="button" data-action="toggle" aria-pressed="false">상단 고정</button>'+result('고정 해제됨'),
    radio:p=>'<fieldset><legend>보기 밀도</legend>'+checks(p,['넉넉하게','기본','촘촘하게'],'radio')+'</fieldset>'+result('넉넉하게'),
    segmented:p=>'<fieldset><legend>보기 선택</legend><div class="s-segmented" role="radiogroup" aria-label="보기 선택">'+['목록','격자','보드'].map((v,i)=>'<label class="s-segment-choice"><input type="radio" name="'+p+'-segment" value="'+v+'" data-segment '+(!i?'checked':'')+'><span>'+v+'</span></label>').join('')+'</div><div class="s-segment-preview" data-segment-preview data-view="목록"><i></i><i></i><i></i></div></fieldset>'+result('목록 보기'),
    slider:()=>field('가로 크기','<input type="range" min="20" max="100" value="58" data-size>')+'<div class="s-meter"><div data-scale-bar style="width:58%"></div></div>'+result('58%'),
    range:()=>'<fieldset><legend>선택 범위 <output data-range-output>20–70</output></legend><div class="s-dual-range" style="--lo:20%;--hi:70%"><div class="s-range-base"></div><div class="s-range-selected"></div><input type="range" min="0" max="100" value="20" data-bound="min" aria-label="최솟값"><input type="range" min="0" max="100" value="70" data-bound="max" aria-label="최댓값"></div><div class="s-range-values"><span>최솟값 <output data-low>20</output></span><span>최댓값 <output data-high>70</output></span></div></fieldset>'+result('20–70'),
    stepper:()=>'<div class="sample-row">'+button('−','minus')+'<output data-number aria-live="polite">2</output>'+button('+','plus')+'</div>'+result('2개'),
    select:()=>field('분류','<select data-value>'+menuOptions(['전체','검토 중','완료'])+'</select>')+result('전체'),
    combobox:p=>field('프로젝트 검색','<input list="'+p+'-matches" data-value placeholder="예: 모션"><datalist id="'+p+'-matches">'+menuOptions(vocabulary)+'</datalist>')+result(),
    multiselect:()=>field('검토할 범주','<select multiple size="4" data-multi>'+menuOptions(['입력','탐색','시각 효과','피드백'])+'</select>')+result('선택한 범주 없음'),
    rating:p=>'<fieldset><legend>만족도</legend><div class="s-star-rating" role="radiogroup" aria-label="만족도 5점 척도">'+[1,2,3,4,5].map(n=>'<label class="s-star-option" title="'+n+'점"><input type="radio" name="'+p+'-rating" value="'+n+'" data-rating '+(n===3?'checked':'')+' aria-label="'+n+'점"><span aria-hidden="true">★</span></label>').join('')+'<output data-stars>3 / 5</output></div></fieldset>'+result('3점'),
    chip:()=>'<div class="sample-row">'+['입문','실습 가능','저장됨'].map(v=>'<button type="button" class="s-button s-chip" data-action="chip" aria-pressed="false">'+v+'</button>').join('')+'</div>'+result('활성 필터 없음'),
    text:()=>simpleInput('text','프로젝트 이름','placeholder="프로젝트 이름을 입력" autocomplete="off"')+result(),
    textarea:()=>field('노트','<textarea rows="3" data-value placeholder="관찰한 내용을 입력"></textarea>')+result(),
    search:()=>field('프로젝트 찾기','<input type="search" data-query placeholder="예: 스타일">')+'<ul data-results>'+vocabulary.map(v=>'<li>'+v+'</li>').join('')+'</ul>'+result(vocabulary.length+'개'),
    password:()=>field('데모 암호','<input type="password" data-password autocomplete="off" placeholder="예시용 문자만 입력">')+button('암호 보이기','password')+result('가려짐'),
    number:()=>simpleInput('number','항목 수','min="1" max="12" value="3"')+result('3'),
    date:()=>simpleInput('date','검토일','value="2026-11-15"')+result('2026-11-15'),
    time:()=>simpleInput('time','알림 시간','value="09:00"')+result('09:00'),

    file:()=>field('로컬 파일','<input type="file" data-file>')+result('선택된 파일 없음'),
    tags:()=>'<form data-tags>'+field('태그','<input name="tag" maxlength="24" required placeholder="태그를 입력한 뒤 Enter">')+'<button class="s-button" type="submit">추가</button></form><div class="sample-row" data-tag-list></div>'+result('태그 0개'),
    otp:()=>field('인증 코드 6자리','<input inputmode="numeric" pattern="[0-9]{6}" autocomplete="one-time-code" maxlength="6" data-otp placeholder="000000">')+result('0 / 6자리'),
    inline:()=>'<div class="sample-row"><strong data-name>관찰 기록</strong>'+button('이름 변경','edit')+'</div><form data-edit hidden>'+field('새 이름','<input name="name" required maxlength="40">')+'<div class="sample-row"><button type="submit" class="s-button">저장</button>'+button('취소','cancel-edit')+'</div></form>'+result(),
    counter:()=>field('짧은 소개','<textarea data-count maxlength="60" rows="3"></textarea>')+result('0 / 60자'),
    validation:p=>'<form data-validate novalidate>'+field('이메일','<input type="email" name="email" aria-describedby="'+p+'-error" placeholder="name@example.com" required>')+'<button type="submit" class="s-button primary">확인</button><output id="'+p+'-error" data-result aria-live="polite"></output></form>',
    buttons:()=>'<div class="sample-row">'+button('저장','notice','primary')+button('미리보기','notice')+button('더 알아보기','notice','quiet-button')+button('삭제 예시','notice','danger')+'<button type="button" class="s-button" disabled>비활성화</button></div>'+result('버튼을 눌러 보세요.'),
    'icon-button':()=>'<button type="button" class="s-button icon" data-action="icon" aria-label="즐겨찾기 표시" aria-pressed="false">☆</button>'+result('즐겨찾기 해제됨'),
    split:()=>'<div class="sample-row compact">'+button('저장','notice','primary')+'<details class="s-popover"><summary>옵션</summary><div>'+button('복사본 저장','notice')+button('임시 저장','notice')+'</div></details></div>'+result(),
    fab:()=>'<div class="fab-stage"><span>프로젝트 목록</span><button type="button" class="s-button fab" data-action="count-add" aria-label="프로젝트 추가">+</button></div>'+result('프로젝트 3개'),
    loading:()=>button('동기화 시작','load','primary')+result('준비됨'),
    copy:()=>'<code>CMP-0034</code>'+button('복사','copy')+result()+'<textarea data-copy-fallback aria-label="복사할 값" readonly hidden></textarea>',
    tabs:p=>tabs(p,['개요','작업','기록'],['프로젝트의 목표와 마지막 변경일.','검토할 인터랙션 3개.','최근 저장한 결과.']),
    sidebar:()=>'<div class="demo-split"><nav aria-label="샘플 사이드바">'+['개요','할 일','설정'].map(v=>button(v,'side')).join('')+'</nav><div data-result>개요 화면</div></div>',
    breadcrumb:()=>'<nav class="sample-row" aria-label="샘플 경로">'+button('홈','crumb')+'<span aria-hidden="true">›</span>'+button('프로젝트','crumb')+'<span data-crumb-current aria-current="location">인터랙션</span></nav>'+result('현재 위치 · 인터랙션'),
    pagination:()=>'<div class="sample-row">'+button('이전','prev')+'<output data-page>1 / 4</output>'+button('다음','next')+'</div>'+result('페이지 1의 항목'),
    wizard:()=>'<ol class="demo-steps"><li aria-current="step">프로젝트</li><li>보기</li><li>확인</li></ol><div data-wizard>'+field('프로젝트 이름','<input type="text" value="탐색 도구 시안">')+'</div><div class="sample-row">'+button('이전','prev')+button('다음','next','primary')+'</div>'+result('1 / 3단계'),
    card:()=>'<article class="s-card"><small>검토 중</small><h3>웨어러블 대시보드</h3><p>실험 항목 3개를 정리했습니다.</p>'+button('기록 표시','card')+'<p data-card-note hidden>다음 할 일은 상태를 색과 라벨로 함께 표시하는 것입니다.</p></article>',
    accordion:()=>'<details class="s-disclosure"><summary>왜 스타일을 비교하나요?</summary><p>같은 기능을 두 표면에 놓고 가독성과 발견 가능성을 비교합니다.</p></details><details class="s-disclosure"><summary>모션은 어떻게 선택하나요?</summary><p>조작 목적과 상태 전환을 먼저 정한 뒤 효과를 고릅니다.</p></details>',
    table:()=>'<table class="s-table"><thead><tr><th scope="col">프로젝트</th><th scope="col" aria-sort="none">'+button('항목 수 ↕','sort')+'</th></tr></thead><tbody></tbody></table>',
    modal:p=>button('대화상자 열기','dialog','primary')+dialog(p,'','보기를 바꿀까요?','<p>확인하는 동안 뒤쪽 화면을 잠시 멈춥니다.</p>')+result(),
    alert:()=>button('경고 배너 표시','alert')+'<div class="s-alert" role="alert" hidden>저장 공간을 확인해 주세요. '+button('안내 닫기','hide-alert')+'</div>',
    popover:()=>'<details class="s-popover"><summary>정렬 옵션</summary><div>'+button('최신순','notice')+button('이름순','notice')+'</div></details>'+result(),
    tooltip,
    drawer:p=>button('사이드 패널 열기','dialog','primary')+dialog(p,'drawer','보기 설정',field('표시 방식','<select>'+menuOptions(['기본','간단히','자세히'])+'</select>')),
    sheet:p=>button('하단 패널 열기','dialog','primary')+dialog(p,'bottom-sheet','작업 보기', '<p>화면 하단에서 추가 선택을 표시합니다.</p>'),
    carousel:()=>'<div class="demo-carousel" data-slide><strong>1 · 발견</strong><span>용어와 개념을 찾아봅니다.</span></div><div class="sample-row">'+button('이전','prev')+'<output data-page>1 / 3</output>'+button('다음','next')+'</div>',
    badge:()=>'<div class="sample-row">'+button('알림 추가','count-add')+button('읽음 처리','clear-count')+'<span class="s-badge" data-badge>2</span></div>'+result('읽지 않은 알림 2개'),
    toast:()=>button('샘플 저장','toast','primary')+'<div class="s-toast" data-toast hidden><span role="status">샘플을 저장했습니다.</span>'+button('닫기','hide-toast')+'</div>',
    progress:()=>field('완료율','<input type="range" min="0" max="100" value="42" data-progress>')+'<progress max="100" value="42" aria-label="완료율"></progress>'+result('42% 완료'),
    skeleton:()=>button('로딩 전환','skeleton')+'<div class="s-card" data-loaded>보고서 · 인터랙션 검토</div><div class="s-skeleton" data-skeleton hidden aria-hidden="true"><i></i><i></i><i></i></div>'+result('콘텐츠 준비됨'),
    empty:()=>'<div class="s-card" data-empty>아직 등록된 프로젝트가 없습니다.</div><div class="sample-row">'+button('프로젝트 만들기','fill-empty')+button('비우기','clear-empty')+'</div>',
    palette:p=>button('명령 팔레트 열기','dialog','primary')+dialog(p,'','명령 찾기',field('명령어','<input type="search" data-query placeholder="예: 스타일" autofocus>')+'<ul data-results>'+['프로젝트 검색','스타일 열기','모션 설정'].map(v=>'<li>'+v+'</li>').join('')+'</ul>')+result(),
    dropzone:()=>'<div class="dropzone" data-dropzone>여기에 파일을 놓거나 '+field('파일 선택','<input type="file" data-file multiple>')+'</div>'+result('선택된 파일 없음'),
    'date-range':()=>field('시작 날짜','<input type="date" data-dates="start" value="2026-11-15">')+field('종료 날짜','<input type="date" data-dates="end" value="2026-11-19">')+result('2026-11-15 ~ 2026-11-19'),
  };
  function mount(root,item, options={}) {
    const kind=item.key;
    if(kind==='color'||item.colorMode){A.colors.mount(root,item.colorMode);return;}
    const h=A.html;
    const id='example-'+item.id.toLowerCase();
    const controller=new AbortController();
    const on=(type,listener)=>root.addEventListener(type,listener,{signal:controller.signal});
    root.innerHTML=demos[kind](id);
    const $=selector=>root.querySelector(selector);
    const $$=selector=>[...root.querySelectorAll(selector)];
    const report=text=>{const output=$('[data-result]');if(output)output.textContent=text;};
    let page=0, tally=kind==='badge'?2:kind==='fab'?3:2, reversed=false, timers=[], cleanups=[], tags=[];
    const play=el=>{
      const active=options.motion?.();
      if(active) A.motion.trigger(el,active,A.motionSettings[active.id]||A.motion.defaults(active));
    };
    bindTabs(root,(_index,button)=>play(button));
    if(kind==='rating')$$('[data-rating]').forEach(r=>r.closest('label').classList.toggle('is-filled',+r.value<=3));
    $$('.s-popover').forEach(el=>cleanups.push(openPopover(el)));
    const delay=(fn,time)=>{timers.push(setTimeout(fn,time));};
    const setPage=()=>{
      const max=kind==='pagination'?4:3;
      page=Math.max(0,Math.min(page,max-1));
      if($('[data-page]'))$('[data-page]').textContent=(page+1)+' / '+max;
      root.querySelector('[data-action=prev]').disabled=page===0;
      root.querySelector('[data-action=next]').disabled=page===max-1;
      if(kind==='carousel') {
        const slides=[['발견','용어와 개념을 찾아봅니다.'],['체험','직접 값을 바꿔 봅니다.'],['활용','선택한 규칙을 개발에 반영합니다.']];
        $('[data-slide]').innerHTML='<strong>'+(page+1)+' · '+slides[page][0]+'</strong><span>'+slides[page][1]+'</span>';
      }
      if(kind==='wizard') {
        $$('[data-wizard] input').forEach(el=>el.hidden=page!==0);
        $('[data-wizard]').hidden=page!==0;
        $$('.demo-steps li').forEach((el,i)=>{if(i===page)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
        report((page+1)+' / 3단계 · '+['이름을 입력하세요','기본 보기가 선택되었습니다','입력한 이름 · '+($('[data-wizard] input')?.value||'미입력')][page]);
      }
      if(kind==='pagination')report('페이지 '+(page+1)+'의 항목');
    };
    if(['pagination','wizard','carousel'].includes(kind))setPage();
    const renderTable=()=>{
      const ordered=reversed?[...demoData].sort((a,b)=>b[1]-a[1]):[...demoData].sort((a,b)=>a[1]-b[1]);
      $('tbody').innerHTML=ordered.map(([name,n])=>'<tr><th scope="row">'+name+'</th><td>'+n+'</td></tr>').join('');
      $('[aria-sort]').setAttribute('aria-sort',reversed?'descending':'ascending');
    };
    if(kind==='table')renderTable();
    const showTags=()=>{
      $('[data-tag-list]').innerHTML=tags.map((v,i)=>'<button type="button" class="s-button s-chip" data-action="remove-tag" data-tag-index="'+i+'" aria-label="'+h(v)+' 삭제">'+h(v)+' ×</button>').join('');
      report('태그 '+tags.length+'개');
    };
    function files(list) {report(list.length?Array.from(list,file=>file.name).join(', '):'선택된 파일 없음');}
    on('dragover',e=>{if(e.target.closest('[data-dropzone]'))e.preventDefault();});
    on('drop',e=>{if(e.target.closest('[data-dropzone]')){e.preventDefault();files(e.dataTransfer.files);}});
    on('input',e=>{
      const el=e.target;
      if (el.matches('[data-value]')) {report(el.value||'입력 없음');}
      if (el.matches('[data-hour]'))report(el.value);
      if (el.matches('[data-file]'))files(el.files);
      if (el.matches('[data-count]'))report(el.value.length+' / 60자');
      if (el.matches('[data-multi]'))report([...el.selectedOptions].map(o=>o.textContent).join(', ')||'선택한 범주 없음');
      if (el.matches('[data-switch]'))report(el.checked?'켜짐':'꺼짐');
      if (el.matches('[data-otp]')) {el.value=el.value.replace(/[^0-9]/g,'').slice(0,6);report(el.value.length===6?'6자리 입력 완료':el.value.length+' / 6자리');}
      if (el.matches('[data-size]')) {$('[data-scale-bar]').style.width=el.value+'%';report(el.value+'%');}
      if (el.matches('[data-progress]')) {$('progress').value=el.value;report(el.value+'% 완료');}
      if (el.matches('[data-bound]')) {
        const low=$('[data-bound=min]'), high=$('[data-bound=max]');
        // Keep both handles reachable: never allow minimum to exceed maximum.
        if(el===low && +low.value>+high.value)low.value=high.value;
        if(el===high && +high.value<+low.value)high.value=low.value;
        const track=$('.s-dual-range');
        track.style.setProperty('--lo',low.value+'%');track.style.setProperty('--hi',high.value+'%');
        $('[data-range-output]').textContent=low.value+'–'+high.value;
        $('[data-low]').textContent=low.value;$('[data-high]').textContent=high.value;
        report(low.value+'–'+high.value);
      }
      if(el.matches('[data-segment]')) {
        const preview=$('[data-segment-preview]');preview.dataset.view=el.value;
        preview.setAttribute('aria-label',el.value+' 형태 미리보기');report(el.value+' 보기');
      }
      if(el.matches('[data-rating]')) {
        const chosen=+el.value;
        $$('[data-rating]').forEach(r=>r.closest('label').classList.toggle('is-filled',+r.value<=chosen));
        $('[data-stars]').textContent=chosen+' / 5';report(chosen+'점');
      }
      if (el.matches('[data-query]')) {
        const items=kind==='palette'?['프로젝트 검색','스타일 열기','모션 설정']:vocabulary;
        const matches=items.filter(item=>item.includes(el.value.trim()));
        $('[data-results]').innerHTML=matches.length?matches.map(v=>'<li>'+v+'</li>').join(''):'<li>일치하는 항목 없음</li>';
        report(matches.length+'개');
      }
      if(el.matches('[data-dates]')) {
        const start=$('[data-dates=start]'),end=$('[data-dates=end]');
        const wrong=!!(start.value&&end.value&&end.value<start.value);
        end.setAttribute('aria-invalid',String(wrong));
        report(wrong?'종료 날짜가 시작 날짜보다 앞섭니다.':start.value&&end.value?start.value+' ~ '+end.value:'시작 날짜와 종료 날짜를 선택하세요.');
      }
      if(el.matches('fieldset input[type=checkbox]')&&['checkbox','tristate'].includes(kind)){
        const children=$$('fieldset input[name]');
        const all=$('[data-all]');
        if(el===all)children.forEach(child=>child.checked=all.checked);
        const selected=children.filter(child=>child.checked);
        if(all){all.checked=selected.length===children.length;all.indeterminate=selected.length>0&&selected.length<children.length;}
        report(selected.map(child=>child.value).join(', ')||'선택한 항목 없음');
      }
      if(el.matches('input[type=radio]')&&!el.matches('[data-segment],[data-rating]'))report(el.value);
    });
    on('submit',e=>{
      const form=e.target;
      if(form.matches('[method=dialog]')) {
        report('대화상자를 닫았습니다.');
        if(typeof form.closest('dialog').close!=='function'){e.preventDefault();form.closest('dialog').removeAttribute('open');}
        return;
      }
      e.preventDefault();
      if(form.matches('[data-tags]')) {
        const value=form.elements.tag.value.trim();if(value&&!tags.includes(value)&&tags.length<8){tags.push(value);showTags();}
        form.reset(); form.elements.tag.focus();
      }
      if(form.matches('[data-edit]')) {
        const value=form.elements.name.value.trim();
        if(!value)return;
        $('[data-name]').textContent=value;form.hidden=true;report('이름을 저장했습니다.');$('[data-action=edit]').focus();
      }
      if(form.matches('[data-validate]')) {
        const input=form.elements.email;
        const valid=input.validity.valid;
        input.setAttribute('aria-invalid',String(!valid));
        if(!valid)input.focus();
        report(valid?'이메일 형식이 맞습니다.':'이메일 주소를 확인해 주세요.');
        play(valid?form.querySelector('button'):input);
      }
    });
    on('click',async e=>{
      const element=e.target.closest('[data-action]');
      if(!element)return;
      const key=element.dataset.action;
      play(element);
      if(['toggle','icon','chip'].includes(key)) {
        const pressed=element.getAttribute('aria-pressed')!=='true';
        element.setAttribute('aria-pressed',String(pressed));
        if(key==='icon')element.textContent=pressed?'★':'☆';
        report(key==='chip'?$$('[data-action=chip][aria-pressed=true]').map(el=>el.textContent).join(', ')||'활성 필터 없음':pressed?'활성화됨':'해제됨');
      }
      if(['plus','minus','count-add','clear-count'].includes(key)) {
        const max=kind==='stepper'?9:99;
        tally=key==='clear-count'?0:Math.max(0,Math.min(max,tally+(key==='minus'?-1:1)));
        if($('[data-number]'))$('[data-number]').textContent=tally;
        if($('[data-badge]'))$('[data-badge]').textContent=tally;
        report((kind==='badge'?'읽지 않은 알림 ':kind==='fab'?'프로젝트 ':'')+tally+'개');
      }
      if(key==='notice'){report(element.textContent+' 선택');element.closest('details')?.removeAttribute('open');}
      if(key==='side'){$$('[data-action=side]').forEach(el=>el.toggleAttribute('aria-current',el===element));report(element.textContent+' 화면');}
      if(key==='crumb'){$('[data-crumb-current]').textContent=element.textContent;report('현재 위치 · '+element.textContent);}
      if(key==='dialog')showDialog($('dialog'),element);
      if(key==='toast'||key==='hide-toast') {
        $('[data-toast]').hidden=key==='hide-toast';
        if(key==='hide-toast')$('[data-action=toast]').focus();
        if(key==='toast')play($('[data-toast]'));
      }
      if(key==='alert'||key==='hide-alert')$('.s-alert').hidden=key==='hide-alert';
      if(key==='sort'){reversed=!reversed;renderTable();}
      if(key==='prev'||key==='next'){page+=key==='prev'?-1:1;setPage();if(kind==='carousel')play($('[data-slide]'));}
      if(key==='password'){
        const input=$('[data-password]');input.type=input.type==='password'?'text':'password';
        element.textContent=input.type==='password'?'암호 보이기':'암호 숨기기';report(input.type==='password'?'가려짐':'표시 중');input.focus();
      }
      if(key==='edit'){const f=$('[data-edit]');f.hidden=false;f.elements.name.value=$('[data-name]').textContent;f.elements.name.focus();}
      if(key==='cancel-edit'){$('[data-edit]').hidden=true;$('[data-action=edit]').focus();}
      if(key==='remove-tag'){tags.splice(+element.dataset.tagIndex,1);showTags();$('[data-tags] input').focus();}
      if(key==='load'){
        element.disabled=true;element.textContent='동기화 중';report('진행 중');
        delay(()=>{element.textContent='다시 동기화';element.disabled=false;report('동기화를 완료했습니다.');},700);
      }
      if(key==='copy') {const success=await A.copy('CMP-0034',$('[data-copy-fallback]'));report(success?'복사했습니다.':'텍스트를 선택했습니다.');}
      if(key==='card'){const note=$('[data-card-note]');note.hidden=!note.hidden;element.textContent=note.hidden?'기록 표시':'기록 숨기기';element.setAttribute('aria-expanded',String(!note.hidden));}
      if(key==='skeleton'){const waiting=$('[data-skeleton]');waiting.hidden=!waiting.hidden;$('[data-loaded]').hidden=!waiting.hidden;report(waiting.hidden?'콘텐츠 준비됨':'불러오는 중');}
      if(key==='fill-empty'||key==='clear-empty')$('[data-empty]').textContent=key==='fill-empty'?'새 프로젝트 · 초안':'아직 등록된 프로젝트가 없습니다.';
    });
    return ()=>{controller.abort();timers.forEach(clearTimeout);cleanups.forEach(fn=>fn());};
  }
  for(const entry of A.components) if(demos[entry.key])entry.implementation='실습 가능';
  const layoutDemos={
    hero:'<div class="layout-hero"><strong>프로젝트를 시작하세요</strong><span>첫 문장과 다음 행동의 우선순위</span><a href="#catalog">항목 탐색 ↗</a></div>',
    bento:'<div class="layout-bento"><span>프로젝트</span><span>검토</span><span>기록</span><span>다음 할 일</span></div>',
    responsive:'<div class="layout-responsive"><span>탐색</span><span>콘텐츠</span><span>상세</span></div>',
    'sidebar-layout':'<div class="layout-sidebar"><span>내비게이션</span><span>본문</span></div>',
    sticky:'<div class="layout-scroll" tabindex="0" aria-label="스크롤하여 고정 헤더 비교"><strong>고정 헤더</strong><span>첫 문단</span><span>두 번째 문단</span><span>세 번째 문단</span></div>',
    'split-layout':'<div class="layout-split"><span>목록</span><span>상세</span></div>',
    grid:'<div class="layout-grid">'+['1','2','3','4','5','6'].map(x=>'<span>'+x+'</span>').join('')+'</div>',
    flex:'<div class="layout-flex"><span>짧은 레이블</span><span>조금 더 긴 텍스트</span><span>작업</span></div>',
    dashboard:'<div class="layout-dashboard"><strong>프로젝트 상태</strong><div class="layout-grid"><span>초안 1</span><span>검토 1</span><span>완료 1</span></div><a href="#catalog/component">실제 샘플 대시보드 열기 ↗</a></div>',
    'card-layout':'<div class="layout-grid"><span>탐색 노트</span><span>입력 상태</span><span>모션 속도</span></div>',
  };
  const mountLayout=(root,item)=>{
    const sample='<div class="layout-sample">'+layoutDemos[item.key]+'</div>';
    root.innerHTML=item.key==='responsive'?'<div class="responsive-sample">'+sample+'</div>':sample;
    if(!['responsive','bento','grid','flex','split-layout','sidebar-layout','dashboard','card-layout'].includes(item.key))return;
    root.insertAdjacentHTML('beforeend','<label class="field">미리보기 너비 <input type="range" min="43" value="100" max="100"></label>');
    root.querySelector('input').addEventListener('input',e=>{root.querySelector('.layout-sample').style.width=e.target.value+'%';});
  };
  for(const layout of A.layouts)layout.implementation='실습 가능';
  const mountEffect=(root,item)=>{
    const descriptor={blur:['배경 블러','blur','px',24,8],shadow:['그림자 거리','depth','px',18,8],mask:['표시 범위','clip','%',100,35]}[item.key];
    const [label,key,unit,max,start]=descriptor;
    root.innerHTML='<div class="effect-demo '+key+'" style="--effect:'+start+unit+'"><strong>표면과 경계</strong></div>'+field(label,'<input type="range" min="0" max="'+max+'" value="'+start+'">');
    root.querySelector('input').addEventListener('input',e=>root.querySelector('.effect-demo').style.setProperty('--effect',e.target.value+unit));
  };
  for(const fx of A.effects)fx.implementation='실습 가능';
  const patternDemos={'drag-drop':'dropzone','typeahead':'search','filter-sort':'table','progressive':'accordion'};
  function mountPattern(root,entry) {
    if(patternDemos[entry.key])return mount(root,{...entry,key:patternDemos[entry.key]});
    if(entry.key==='undo'){
      let history=['초안'], index=0;
      root.innerHTML=field('노트 이름','<input data-edit-value value="초안" maxlength="28">')+'<div class="sample-row">'+button('이름 저장','save')+button('되돌리기','undo')+button('다시 실행','redo')+'</div>'+result('저장된 값 · 초안');
      const input=root.querySelector('input'), out=root.querySelector('output'), undo=root.querySelector('[data-action=undo]'),redo=root.querySelector('[data-action=redo]');
      const update=()=>{undo.disabled=index===0;redo.disabled=index===history.length-1;out.textContent='저장된 값 · '+history[index];}; update();
      root.addEventListener('click',e=>{
        const key=e.target.closest('[data-action]')?.dataset.action;
        if(key==='save'){const value=input.value.trim();if(value&&value!==history[index]){history=history.slice(0,index+1);history.push(value);index++;}}
        if(key==='undo')index=Math.max(0,index-1);
        if(key==='redo')index=Math.min(history.length-1,index+1);
        if(key){input.value=history[index];update();}
      });
    }
  }
  for(const pattern of A.patterns)if(pattern.key==='undo'||patternDemos[pattern.key])pattern.implementation='실습 가능';
  A.controls={mount,mountLayout,mountEffect,mountPattern,bindTabs,tabActivate,showDialog,openPopover,tabs,button,field};
})();
