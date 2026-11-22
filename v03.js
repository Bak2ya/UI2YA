'use strict';
(() => {
  const U=window.AtlasUI, A=window.Atlas;
  const $=selector=>document.querySelector(selector);
  const strip=$('#quick-styles'),drawer=$('#motion-drawer'),help=$('#ui-learn-popover');
  const settings=$('#design-popover'),settingsToggle=$('#settings-toggle');
  const styleLabels=[['flat2','모던'],['glass','글래스'],['material-you','머티리얼'],['neo-brutal','네오브루탈']];
  strip.innerHTML=styleLabels.map(([id,name])=>`<div class="style-choice"><button type="button" data-select-style="${id}" aria-pressed="false" title="${name} · Press Feedback, Surface Transition" data-help="style-motion">${name}</button><button type="button" class="style-info" data-style-info="${id}" aria-controls="motion-drawer" aria-expanded="false" aria-label="${name} 스타일 설명">?</button></div>`).join('');
  $('#design-editor').innerHTML=U.themeEditor();
  A.icons.decorate(document);

  let describedStyle='',drawerOpener;
  const drawerIsOpen=()=>document.body.classList.contains('is-drawer-open');
  const settingsIsOpen=()=>settings.matches(':popover-open');
  function sync(){
    const open=drawerIsOpen();
    strip.querySelectorAll('[data-style-info]').forEach(button=>button.setAttribute('aria-expanded',String(open&&button.dataset.styleInfo===describedStyle)));
    $('.topbar .u-mode').style.setProperty('--mode-index',Math.max(0,['system','light','dark'].indexOf(U.state.mode)));
    const mode=$('[data-editor-mode]');
    if(mode)mode.value=U.state.mode;
    A.layoutLab.sync();
  }
  function openStyle(key,focus=true,opener=null){
    if(settingsIsOpen())setSettings(false);
    describedStyle=key;
    drawerOpener=opener;
    U.renderStory(key);
    drawer.scrollTop=0;
    drawer.inert=false;
    drawer.setAttribute('aria-hidden','false');
    document.body.classList.add('is-drawer-open');
    sync();
    if(focus)$('#drawer-close').focus({preventScroll:true});
  }
  function closeStyle(restoreFocus=true){
    if(!drawerIsOpen())return;
    document.body.classList.remove('is-drawer-open');
    drawer.inert=true;
    drawer.setAttribute('aria-hidden','true');
    describedStyle='';
    sync();
    if(restoreFocus)drawerOpener?.focus({preventScroll:true});
  }
  strip.addEventListener('click',event=>{
    const button=event.target.closest('[data-style-info]');
    if(!button)return;
    const key=button.dataset.styleInfo;
    if(drawerIsOpen()&&key===describedStyle)closeStyle();
    else openStyle(key,true,button);
  });
  $('#drawer-close').addEventListener('click',()=>closeStyle());
  drawer.addEventListener('click',event=>{if(event.target.closest('a[href^="#"]'))closeStyle(false);});

  function positionSettings(){
    if(!settingsIsOpen())return;
    const rect=settingsToggle.getBoundingClientRect();
    const margin=10;
    const below=innerHeight-rect.bottom-2*margin;
    const above=rect.top-2*margin;
    const useBelow=below>=250||below>=above;
    const available=useBelow?below:above;
    settings.style.maxHeight=(available>=180?available:innerHeight-2*margin)+'px';
    const left=Math.max(margin,Math.min(rect.right-settings.offsetWidth,innerWidth-settings.offsetWidth-margin));
    const top=available<180?margin:useBelow?rect.bottom+margin:rect.top-settings.offsetHeight-margin;
    settings.style.left=left+'px';
    settings.style.top=top+'px';
  }
  function setSettings(open){
    if(open&&!settingsIsOpen()){
      closeStyle(false);
      settings.showPopover({source:settingsToggle});
      positionSettings();
    }
    if(!open&&settingsIsOpen())settings.hidePopover();
  }
  settingsToggle.addEventListener('click',event=>{
    event.preventDefault();
    setSettings(!settingsIsOpen());
  });
  settings.addEventListener('toggle',()=>{
    const open=settingsIsOpen();
    settingsToggle.setAttribute('aria-expanded',String(open));
    if(open){closeStyle(false);positionSettings();}
  });
  settings.addEventListener('input',event=>{
    const control=event.target;
    if(control.matches('[data-editor-accent]'))U.state.colors[U.state.style]=control.value;
    else if(control.matches('[data-editor-bg]'))U.state.backgrounds[U.state.style]=control.value;
    else if(control.matches('[data-editor-surface]'))U.state.surfaces[U.state.style]=control.value;
    else if(control.matches('[data-editor-opacity]'))U.state.opacity=+control.value;
    else if(control.matches('[data-editor-blur]'))U.state.blur=+control.value;
    else if(control.matches('[data-editor-mode]'))U.state.mode=control.value;
    else if(control.matches('[data-editor-density]'))U.state.density=control.value;
    else return;
    U.applyTheme();
  });
  window.addEventListener('resize',positionSettings);
  window.addEventListener('scroll',positionSettings,{passive:true});
  document.addEventListener('pointerdown',event=>{
    if($('#spotlight-dialog').open)return;
    if(settingsIsOpen()&&!settings.contains(event.target)&&!settingsToggle.contains(event.target))setSettings(false);
  },true);

  const search=$('#global-search'),find=$('#find'),toggle=$('#search-expand');
  const searchIsOpen=()=>search.dataset.expanded==='true';
  function expandSearch(focus=true){
    search.dataset.expanded='true';
    toggle.setAttribute('aria-expanded','true');
    find.tabIndex=0;
    if(focus)find.focus({preventScroll:true});
  }
  function collapseSearch(focus=true){
    search.dataset.expanded='false';
    toggle.setAttribute('aria-expanded','false');
    find.tabIndex=-1;
    if(focus)toggle.focus({preventScroll:true});
  }
  toggle.addEventListener('click',()=>expandSearch());
  $('#search-collapse').addEventListener('click',()=>collapseSearch());
  toggle.dataset.help='search';
  $('.topbar .u-mode').removeAttribute('tabindex');
  $('.topbar .u-mode').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const modes=[...event.currentTarget.querySelectorAll('[data-mode]')];
    const index=modes.indexOf(event.target);
    if(index<0)return;
    const next=event.key==='Home'?0:event.key==='End'?modes.length-1:(index+(event.key==='ArrowRight'?1:-1)+modes.length)%modes.length;
    event.preventDefault();
    modes[next].click();
    modes[next].focus();
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||event.isComposing||$('#spotlight-dialog').open)return;
    if(!help.hidden){hideHelp();if(search.contains(document.activeElement)&&searchIsOpen())collapseSearch();return;}
    if(searchIsOpen()&&search.contains(document.activeElement))collapseSearch();
    else if(settingsIsOpen()){setSettings(false);settingsToggle.focus();}
    else if(drawerIsOpen())closeStyle();
  });

  const info={
    card:['컴포넌트','Component Demo','',''],
    search:['확장형 검색','Expandable Search / Expanding Search Field','검색 패턴의 이름이야. 너비는 Width Expansion으로 바뀌고 초점은 입력란으로 이동해.','MOT-0044'],
    mode:['표시 모드','Segmented Control · Sliding Indicator','지금 선택한 모드에 맞춰 선택 배경이 이동해.','MOT-0015'],
    'style-motion':['디자인 스타일 선택','Press Feedback · Surface Transition','누를 때 잠깐 작아지고, 선택한 디자인의 색과 표면이 적용돼.','MOT-0003'],
    color:['색상 견본','Color Swatch / Color Picker','원을 누르면 플랫폼에서 제공하는 색상 선택기가 열려.','CMP-0022'],
    segment:['세그먼트 컨트롤','Segmented Control · Sliding Indicator','연결된 선택지 중 하나를 선택하면 배경이 움직여.','MOT-0015'],
  };
  let pinned=false,activeHelp=null,hideTimer=0;
  const escape=A.html;
  function hideHelp(){
    clearTimeout(hideTimer);help.hidden=true;pinned=false;activeHelp=null;
  }
  function showHelp(button,pin=false){
    const meta=info[button.dataset.help];
    if(!meta)return;
    const item=button.dataset.targetId&&A.byId.get(button.dataset.targetId);
    const [name,en,description,id]=item?[item.ko,item.en,item.caution,item.id]:meta;
    clearTimeout(hideTimer);
    activeHelp=button;
    pinned=pin;
    help.innerHTML=`<strong>${escape(name)}</strong><small>${escape(en)}</small><p>${escape(description)}</p>${id?`<a href="#item/${id}">도감에서 자세히 보기</a>`:''}`;
    help.hidden=false;
    const rect=button.getBoundingClientRect();
    const left=Math.max(12,Math.min(rect.left,innerWidth-help.offsetWidth-12));
    const top=rect.bottom+help.offsetHeight+10<innerHeight?rect.bottom+7:Math.max(12,rect.top-help.offsetHeight-7);
    help.style.left=left+'px';help.style.top=top+'px';
  }
  function scheduleHide(){if(!pinned){clearTimeout(hideTimer);hideTimer=setTimeout(hideHelp,240);}}
  document.addEventListener('pointerover',event=>{
    const target=event.target.closest('[data-help]');
    if(target&&!pinned&&target!==activeHelp&&!$('#spotlight-dialog').open)showHelp(target);
  });
  document.addEventListener('pointerout',event=>{
    const target=event.target.closest('[data-help]');
    if(target&&!target.contains(event.relatedTarget))scheduleHide();
  });
  document.addEventListener('focusin',event=>{
    const target=event.target.closest('[data-help]');
    if(target&&!pinned&&!$('#spotlight-dialog').open)showHelp(target);
  });
  document.addEventListener('focusout',event=>{if(event.target.closest('[data-help]'))scheduleHide();});
  document.addEventListener('click',event=>{
    if(event.target.closest('#ui-learn-popover'))return;
    const button=event.target.closest('.u-learn[data-help]');
    if(!button){hideHelp();return;}
    if(pinned&&activeHelp===button)hideHelp();
    else showHelp(button,true);
  },true);
  help.addEventListener('pointerenter',()=>clearTimeout(hideTimer));
  help.addEventListener('pointerleave',scheduleHide);
  help.addEventListener('click',event=>{if(event.target.closest('a'))hideHelp();});
  window.addEventListener('hashchange',()=>{hideHelp();closeStyle(false);setSettings(false);});
  const header=$('.topbar');
  const measure=()=>{
    document.documentElement.style.setProperty('--chrome-height',header.offsetHeight+'px');
    document.documentElement.style.setProperty('--chrome-bottom',Math.max(74,header.offsetHeight+18)+'px');
  };
  new ResizeObserver(measure).observe(header);
  measure();
  window.UI2YAEnhance={sync,expandSearch,collapseSearch,searchIsOpen,openStyle,closeStyle,drawerIsOpen,setSettings,settingsIsOpen};
  U.applyTheme();
})();
