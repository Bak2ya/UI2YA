'use strict';
(() => {
  const A = window.Atlas;
  const {assets,rows,licenses}=window.UI2YAIconAssets;
  const libraries=[
    ['lucide','Lucide','https://lucide.dev/icons/','ISC · Feather 일부 MIT','둥근 선 끝과 일관된 스트로크','https://lucide.dev/license','lucide-icons/lucide','icons/{name}.svg'],
    ['tabler','Tabler','https://tabler.io/icons','MIT','넓은 범위의 24px 아웃라인 아이콘','https://github.com/tabler/tabler-icons/blob/main/LICENSE','tabler/tabler-icons','icons/outline/{name}.svg'],
    ['phosphor','Phosphor','https://phosphoricons.com/','MIT','Regular를 포함한 여섯 굵기·표현','https://github.com/phosphor-icons/core/blob/main/LICENSE','phosphor-icons/core','assets/regular/{name}.svg'],
    ['hero','Heroicons','https://heroicons.com/','MIT','Tailwind Labs의 Outline·Solid 계열','https://github.com/tailwindlabs/heroicons/blob/master/LICENSE','tailwindlabs/heroicons','optimized/24/outline/{name}.svg'],
    ['material','Material Symbols','https://fonts.google.com/icons','Apache 2.0','아웃라인 계열과 굵기·채움 축을 제공','https://developers.google.com/fonts/docs/material_symbols','google/material-design-icons','symbols/web/{name}/materialsymbolsoutlined/{name}_24px.svg'],
    ['bootstrap','Bootstrap Icons','https://icons.getbootstrap.com/','MIT','16px 격자에서 설계한 선형·채움 아이콘','https://github.com/twbs/icons/blob/main/LICENSE','twbs/icons','icons/{name}.svg'],
  ];
  const concepts={
    search:['검색','돋보기'],settings:['설정','톱니바퀴 조절 환경설정'],home:['홈','집 첫 화면'],
    menu:['메뉴','햄버거 목록'],close:['닫기','엑스 취소'],plus:['추가','더하기 새로 만들기'],
    check:['확인','체크 완료 체크표'],star:['즐겨찾기','별 별점'],
    calendar:['달력','일정 캘린더'],download:['다운로드','내려받기'],upload:['업로드','올리기'],
    trash:['삭제','휴지통 제거'],edit:['편집','연필 수정'],chevron:['꺾쇠','화살촉 펼치기 다음'],
    arrow:['화살표','방향 이동 오른쪽'],
  };
  const names={
    'layout-template':'레이아웃','component':'컴포넌트','activity':'활동 · 모션',
    'mouse-pointer-click':'포인터 클릭','shapes':'도형','panel-left':'사이드바','panel-top':'상단 패널',
    'circle-question-mark':'도움말','sun':'해','moon':'달','monitor':'모니터','pause':'일시정지',
    'play':'재생','scan-line':'강조','sliders-horizontal':'슬라이더','copy':'복사',
  };
  function icon(name,lib='lucide'){return assets[lib]?.[name]||'';}
  function decorate(root){
    root.querySelectorAll('[data-icon]').forEach(node=>{
      node.innerHTML=icon(node.dataset.icon);
      node.setAttribute('aria-hidden','true');
    });
    root.querySelectorAll('#primary-nav a').forEach(link=>{
      const name=link.querySelector('[data-icon]')?.dataset.icon;
      if(name)link.title=name+' · Lucide';
    });
  }
  function sourceURL(lib,name){
    const [key,,,,,,repo,template]=lib;
    if(key==='lucide')return 'https://lucide.dev/icons/'+name;
    if(key==='bootstrap')return 'https://icons.getbootstrap.com/icons/'+name+'/';
    return 'https://github.com/'+repo+'/blob/'+licenses[key].revision+'/'+template.replaceAll('{name}',name);
  }
  function matches(query){
    const terms=Object.entries(rows).map(([key,variants])=>({key,names:variants,label:concepts[key][0],aliases:concepts[key][1]}));
    const search=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const other=Object.entries(names).map(([name,label])=>({key:name,names:{lucide:name},label,aliases:''}));
    return [...terms,...(search.length?other:[])].filter(row=>{
      const haystack=[row.key,row.label,row.aliases,...Object.values(row.names)].join(' ').toLowerCase();
      return search.every(part=>haystack.includes(part));
    });
  }
  function hint(query){
    const hit=matches(query).slice(0,6);
    if(!query||!hit.length)return '';
    return `<section class="u-section icon-search-hint"><h2>관련 아이콘</h2><div>${hit.map(row=>`<a class="u-action" href="#icons/${encodeURIComponent(row.names.lucide)}">${icon(row.names.lucide)} ${A.html(row.label)} <small>${A.html(row.names.lucide)}</small></a>`).join('')}</div></section>`;
  }
  function render(root,query){
    const h=A.html;
    root.innerHTML=`<div class="section-head"><div><h1>아이콘 라이브러리</h1><p>같은 기능의 아이콘을 비교하고, 사용할 라이브러리와 아이콘 이름을 찾아봐.</p></div></div>
      <section class="library-notes" aria-labelledby="library-title">
        <h2 id="library-title">공식 라이브러리와 이용 조건</h2>
        <p>개인·상업적 이용이 가능해. 배포할 때는 라이브러리별 라이선스 고지를 확인해 줘.</p>
        <ul class="library-index">${libraries.map(([key,label,url,license,detail,licenseURL])=>`
          <li><a class="library-name" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>
            <span class="library-feature">${detail}</span>
            <details><summary>${license}</summary><a href="${licenseURL}" target="_blank" rel="noopener noreferrer">공식 라이선스</a><pre>${h(licenses[key].text)}</pre></details>
          </li>`).join('')}</ul>
      </section>
      <section class="icon-compare" aria-labelledby="icon-compare-title">
        <div class="u-section-title"><h2 id="icon-compare-title">아이콘 비교표</h2></div>
        <p class="icon-guide">아이콘을 누르면 정확한 이름과 원본 링크를 볼 수 있어.</p>
        <div class="icon-toolbar">
          <label>아이콘 검색 <input type="search" data-icon-search placeholder="예: 검색, calendar, chevron" value="${h(query||'')}"></label>
          <label>라이브러리 <select data-icon-filter><option value="">전체 라이브러리</option>${libraries.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label>
        </div>
        <p class="icon-scroll-hint" data-icon-scroll hidden>표를 옆으로 밀어 나머지 종류를 비교해.</p>
        <div class="icon-results" data-icon-results></div>
        <div class="icon-details" id="icon-details" popover aria-labelledby="icon-detail-name"></div>
      </section>`;
    const list=root.querySelector('[data-icon-results]');
    const search=root.querySelector('[data-icon-search]');
    const filter=root.querySelector('[data-icon-filter]');
    const hint=root.querySelector('[data-icon-scroll]');
    const detail=root.querySelector('.icon-details');
    const controller=new AbortController();
    let active=null;
    const isOpen=()=>detail.matches(':popover-open');
    function placeDetail(){
      if(!isOpen()||!active)return;
      const rect=active.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight){detail.hidePopover();return;}
      const left=Math.max(10,Math.min(rect.left+(rect.width-detail.offsetWidth)/2,innerWidth-detail.offsetWidth-10));
      const top=rect.bottom+8+detail.offsetHeight<=innerHeight-10?rect.bottom+8:Math.max(10,rect.top-detail.offsetHeight-8);
      Object.assign(detail.style,{left:left+'px',top:top+'px'});
    }
    function showScrollHint(){
      const scroller=list.querySelector('.icon-table-scroll');
      hint.hidden=!scroller||scroller.scrollWidth<=scroller.clientWidth+1;
      if(scroller)scroller.tabIndex=hint.hidden?-1:0;
    }
    function update(){
      if(isOpen())detail.hidePopover();
      const filtered=libraries.filter(lib=>!filter.value||filter.value===lib[0]);
      const result=matches(search.value).filter(row=>filtered.some(([key])=>icon(row.names[key],key)));
      const shown=filtered.filter(([key])=>result.some(row=>icon(row.names[key],key)));
      list.innerHTML=result.length?`<div class="icon-table-scroll" role="region" aria-label="아이콘 비교표 스크롤">
        <table class="icon-matrix"><caption class="sr-only">라이브러리별 아이콘 종류 비교</caption>
          <thead><tr><th scope="col">라이브러리</th>${result.map(row=>`<th scope="col" title="${h(row.key)}">${h(row.label)}</th>`).join('')}</tr></thead>
          <tbody>${shown.map(([key,label])=>`<tr><th scope="row">${label}</th>${result.map(row=>{
            const name=row.names[key];
            const glyph=icon(name,key);
            return glyph?`<td><button type="button" class="icon-sample" data-library="${key}" data-icon-name="${h(name)}"
              aria-label="${label} ${h(row.label)} · ${h(name)}" title="${h(name)}" aria-controls="icon-details" aria-expanded="false">${glyph}</button></td>`
              :'<td><span aria-label="예시 없음">–</span></td>';
          }).join('')}</tr>`).join('')}</tbody>
        </table></div>`:'<p class="u-empty">해당하는 아이콘이 없어. 검색어 또는 라이브러리를 바꿔 봐.</p>';
      showScrollHint();
    }
    function closeDetail(restoreFocus=false){
      if(!isOpen())return;
      detail.hidePopover();
      if(restoreFocus)active?.focus({preventScroll:true});
    }
    search.addEventListener('input',update);
    filter.addEventListener('change',update);
    list.addEventListener('click',event=>{
      const button=event.target.closest('.icon-sample');
      if(!button)return;
      if(isOpen()&&active===button){closeDetail(true);return;}
      active?.setAttribute('aria-expanded','false');
      active=button;
      const name=button.dataset.iconName;
      const lib=libraries.find(([key])=>key===button.dataset.library);
      detail.innerHTML=`<div class="icon-detail-head">${icon(name,lib[0])}<div><span>${lib[1]}</span><strong id="icon-detail-name">${h(name)}</strong></div>
        <button type="button" class="chrome-icon" data-close-icon aria-label="아이콘 상세 닫기">${icon('x')}</button></div>
        <div class="icon-detail-actions"><button type="button" class="u-action" data-copy-icon="${h(name)}">${icon('copy')} 이름 복사</button>
        <a class="u-action" href="${h(sourceURL(lib,name))}" target="_blank" rel="noopener noreferrer">공식 아이콘</a></div>`;
      if(!isOpen())detail.showPopover({source:button});
      active.setAttribute('aria-expanded','true');
      placeDetail();
      detail.querySelector('[data-copy-icon]').focus({preventScroll:true});
    });
    detail.addEventListener('click',event=>{
      if(event.target.closest('[data-close-icon]'))closeDetail(true);
      const name=event.target.closest('[data-copy-icon]')?.dataset.copyIcon;
      if(name)A.copy(name);
    });
    detail.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeDetail(true);}
    });
    detail.addEventListener('toggle',()=>{if(!isOpen())active?.setAttribute('aria-expanded','false');});
    list.addEventListener('scroll',()=>closeDetail(),true);
    window.addEventListener('resize',()=>{showScrollHint();placeDetail();},{signal:controller.signal});
    window.addEventListener('scroll',placeDetail,{passive:true,signal:controller.signal});
    update();
    return ()=>{closeDetail();controller.abort();};
  }

  A.icons={icon,decorate,render,hint};
})();
