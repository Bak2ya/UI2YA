'use strict';
(() => {
  const A=window.Atlas;
  const h=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  A.html=h;
  const activeStyleKeys=new Set(['flat2','glass','material-you','neo-brutal']);
  for(const [index,[key,ko,en,definition,use,caution]] of A.colors.types.entries()){
    A.components.push({
      id:'CMP-'+(1101+index),key:'color-'+key,ko,en,definition,use,caution,kind:'component',
      group:'색상 선택 방식',difficulty:'입문',implementation:'실습 가능',
      aliases:[ko,en],related:['CMP-0022'],sources:['mdnForms','reactColors'],colorMode:key,searchOnly:true,
    });
  }
  const baseColor=A.components.find(item=>item.id==='CMP-0022');
  baseColor.implementation='실습 가능';
  baseColor.related.push(...A.components.filter(item=>item.colorMode).map(item=>item.id));
  const allRaw=[...A.components,...A.styles,...A.motions,...A.pendingMotions,...A.patterns,...A.layouts,...A.effects];
  const all=allRaw.filter(x=>x.kind!=='style'||activeStyleKeys.has(x.key));
  A.byId=new Map(allRaw.map(x=>[x.id,x]));
  for(const [source,ids] of Object.entries(A.videoRefs||{}))for(const id of ids){const item=A.byId.get(id);if(item&&!item.sources.includes(source))item.sources.push(source);}
  const main=document.getElementById('main'),find=document.getElementById('find');
  const status=document.getElementById('app-status');
  const storageKey='UI2YA.settings.v02'; // migrate existing local preferences
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(storageKey))||{};}catch{return {};}})();
  const initial={barShape:'auto',railCompact:false,style:'flat2',mode:'system',density:'normal',opacity:76,blur:15,palette:'plum',backdrop:'cool',colors:{},backgrounds:{},surfaces:{},favorites:[],prompt:{components:[],motions:[],examples:{},preset:null},labMotion:'MOT-0004',paused:false};
  const state={...initial,...saved,colors:saved.colors||{},backgrounds:saved.backgrounds||{},surfaces:saved.surfaces||{},prompt:{...initial.prompt,...saved.prompt}};
  if(saved.motionSettings&&typeof saved.motionSettings==='object')A.motionSettings=saved.motionSettings;
  state.motionSettings=A.motionSettings;
  const styleList=['flat2','glass','material-you','neo-brutal'].map(key=>A.styles.find(s=>s.key===key)).filter(Boolean);
  const selectedStyle=()=>styleList.find(s=>s.key===state.style)||styleList[0];
  if(!styleList.some(s=>s.key===state.style))state.style=styleList[0].key;
  const favorites=new Set(state.favorites.filter(id=>A.byId.has(id)));
  const presetById=new Map(A.presets.map(p=>[p.id,p]));
  const filters={kind:'component',group:'',query:'',difficulty:'all',ready:false};
  const groupSlugs={selection:'선택·값 조정',input:'입력',actions:'버튼·실행',navigation:'탐색',panels:'패널·정보',feedback:'피드백'};
  const groupLabels={all:'전체',selection:'선택·조절',input:'입력',actions:'버튼',navigation:'내비게이션',panels:'패널·팝업',feedback:'정보·피드백'};
  const inputFamilies=[{id:'text',name:'텍스트 입력',items:['text','textarea','search','password','number','counter']},{id:'choice',name:'선택·값 입력',items:['combobox','date','time','date-range','color','file']},{id:'advanced',name:'구조화 입력',items:['tags','otp','inline','validation','dropzone']}];
  const inputChoice={text:'text',choice:'color',advanced:'tags'};
  const featuredIds=['CMP-0006','CMP-0035','CMP-0043','CMP-0047','CMP-0029','CMP-0051'];
  const names={catalog:'컴포넌트',search:'검색 결과',motion:'모션 실험실',layout:'레이아웃',pattern:'UX 패턴',effect:'시각 효과',references:'프로젝트 정보',favorites:'즐겨찾기',icons:'아이콘 라이브러리'};
  let currentRoute='',disposers=[],observer,liveStage=null,noticeTimer,previewController;
  let tabFocus='';
  function store(){try{state.favorites=[...favorites];localStorage.setItem(storageKey,JSON.stringify(state));return true;}catch{return false;}}
  const ui=(str)=>document.querySelector(str);
  ui('.skip').addEventListener('click',event=>{event.preventDefault();main.focus();});
  function notify(message){clearTimeout(noticeTimer);status.textContent=message;status.classList.add('visible');noticeTimer=setTimeout(()=>status.classList.remove('visible'),2400);}
  A.copy=async(text,fallback)=>{
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);notify('클립보드에 복사했어.');return true;}}catch{}
    // Works in browsers where Clipboard API is unavailable (e.g. local file pages).
    const tmp=document.createElement('textarea');tmp.value=text;tmp.readOnly=true;tmp.setAttribute('aria-label','복사할 개발 지시문');
    tmp.style.cssText='position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:.01;z-index:9999';document.body.append(tmp);tmp.focus();tmp.select();
    let ok=false;try{ok=!!document.execCommand?.('copy');}catch{}tmp.remove();
    if(ok){notify('클립보드에 복사했어.');return true;}
    const dock=ui('#dock-content');if(dock?.hidden){dock.hidden=false;ui('#dock-toggle').setAttribute('aria-expanded','true');ui('#prompt-dock').classList.add('is-open');}
    const manual=fallback||ui('#prompt-output');
    manual.hidden=false;manual.value=text;manual.focus();manual.select();
    notify('자동 복사가 제한됐어. 표시된 내용을 선택해 복사해 줘.');return false;
  };

  function hexColor(raw){
    const color=raw?.trim()||'';
    if(/^#[a-f0-9]{6}(?:[a-f0-9]{2})?$/i.test(color))return color.slice(0,7);
    if(/^#[a-f0-9]{3,4}$/i.test(color))return '#'+[...color.slice(1,4)].map(x=>x+x).join('');
    return '#3478F6';
  }
  function contrastColor(hex){const values=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*values[0]+.7152*values[1]+.0722*values[2]>.19?'#172033':'#ffffff';}
  function darkMode(){return state.mode==='dark'||(state.mode==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);}
  function currentAccent(){return hexColor(state.colors[state.style]||getComputedStyle(document.body).getPropertyValue('--s-accent'));}
  function applyTheme(){
    const body=document.body;
    body.dataset.theme=state.style;body.dataset.dark=String(darkMode());body.dataset.density=state.density;
    body.dataset.barShape=['attached','floating','capsule'].includes(state.barShape)?state.barShape:state.style==='glass'?'capsule':'attached';
    body.dataset.railCompact=String(!!state.railCompact);
    body.dataset.palette=state.palette;body.dataset.backdrop=state.backdrop;
    body.style.setProperty('--glass-opacity',(state.opacity/100).toFixed(2));
    body.style.setProperty('--u-blur',(['glass','liquid','acrylic'].includes(state.style)?state.blur:0)+'px');
    if(state.colors[state.style]){body.style.setProperty('--s-accent',state.colors[state.style]);body.style.setProperty('--s-on-accent',contrastColor(state.colors[state.style]));}
    else{body.style.removeProperty('--s-accent');body.style.removeProperty('--s-on-accent');}
    for(const [key,css] of [['backgrounds','--s-shell'],['surfaces','--s-card']]){if(state[key][state.style])body.style.setProperty(css,state[key][state.style]);else body.style.removeProperty(css);}
    ui('#quick-accent').value=currentAccent();
    if(ui('#current-style-label'))ui('#current-style-label').textContent=selectedStyle().ko;
    ui('meta[name="theme-color"]').content=darkMode()?'#20252f':'#f4f3ec';
    document.querySelectorAll('[data-mode]').forEach(btn=>btn.setAttribute('aria-pressed',String(state.mode===btn.dataset.mode)));
    document.querySelectorAll('[data-select-style]').forEach(btn=>{btn.setAttribute('aria-pressed',String(btn.dataset.selectStyle===state.style));btn.dataset.selected=String(btn.dataset.selectStyle===state.style);});
    const theme=getComputedStyle(body);
    for(const [name,property] of [['accent','--s-accent'],['bg','--s-shell'],['surface','--s-card']]){
      const input=ui(`[data-editor-${name}]`);
      if(input)input.value=hexColor(theme.getPropertyValue(property));
    }
    const opacity=ui('[data-editor-opacity]');if(opacity)opacity.value=state.opacity;
    const alpha=ui('[data-opacity-output]');if(alpha)alpha.textContent=state.opacity+'%';
    const blur=ui('[data-editor-blur]');if(blur)blur.value=state.blur;
    const blurLabel=ui('[data-blur-output]');if(blurLabel)blurLabel.textContent=state.blur+'px';
    const density=ui('[data-editor-density]');if(density)density.value=state.density;
    document.querySelectorAll('[data-material-options]').forEach(material=>material.hidden=state.style!=='glass');
    updatePrompt();store();A.layoutLab.sync();window.UI2YAEnhance?.sync();
  }
  function chooseStyle(key){if(!styleList.some(s=>s.key===key))return;state.style=key;state.prompt.style=key;applyTheme();notify(selectedStyle().ko+' 디자인 적용');}
  const title=(heading,desc,aside='')=>`<div class="section-head"><div><h1>${h(heading)}</h1><p>${h(desc)}</p></div>${aside}</div>`;
  function themeEditor(){return `<section class="u-editor" aria-label="디자인 직접 조절">
    <div class="design-colors">
      <label class="u-edit-group">강조색<input type="color" data-editor-accent></label>
      <label class="u-edit-group">배경색<input type="color" data-editor-bg></label>
      <label class="u-edit-group">패널 색상<input type="color" data-editor-surface></label>
    </div>
    <div class="u-edit-group">추천 색상<div class="u-swatch-list">${['#3478F6','#258565','#A668C6','#D87542','#F1C847','#26394E'].map(c=>`<button type="button" style="background:${c}" data-accent-preset="${c}" aria-label="강조색 ${c}"></button>`).join('')}</div></div>
    <label class="u-edit-group">표시 모드<select data-editor-mode><option value="system">시스템</option><option value="light">라이트</option><option value="dark">다크</option></select></label>
    <label class="u-edit-group">표시 밀도<select data-editor-density><option value="normal">기본</option><option value="compact">촘촘하게</option></select></label>
    <div data-material-options class="material-settings" ${state.style==='glass'?'':'hidden'}>
      <div><label for="editor-opacity">표면 불투명도</label><output for="editor-opacity" data-opacity-output>${state.opacity}%</output><input type="range" id="editor-opacity" data-editor-opacity min="48" max="98" step="2" value="${state.opacity}"></div>
      <div><label for="editor-blur">배경 흐림</label><output for="editor-blur" data-blur-output>${state.blur}px</output><input type="range" id="editor-blur" data-editor-blur min="0" max="35" step="1" value="${state.blur}"></div>
    </div>
    <div class="design-export"><button class="u-action" type="button" data-copy-design>스타일 단독 복사</button><button class="u-action" type="button" data-add-design>스타일 조합 추가</button></div>
    <button class="u-action" type="button" data-reset-style>현재 스타일 초기화</button>
  </section>`;}
  function renderStory(key=state.style){
    const root=ui('#drawer-style-story');
    const style=styleList.find(item=>item.key===key)||selectedStyle();
    const facts=[['배경과 역사',style.history],['시각적 특징',style.features],['대표 사용 사례',style.example],['장점',style.pros],['주의점',style.caution],['적합한 환경',style.use],['플랫폼과 HTML',style.platformGap]].filter(([,value])=>value);
    if(style.key==='glass')facts.unshift(['재질과 스타일','개별 Glass Panel은 한 표면의 반투명 처리를 뜻해. Glassmorphism은 여러 요소에 이 표현을 일관되게 적용한 디자인 스타일이야.']);
    const related=(style.related||[]).map(id=>A.byId.get(id)).filter(item=>item&&(item.kind!=='style'||activeStyleKeys.has(item.key)));
    root.innerHTML=`<div class="style-drawer-title" data-style-sample="${h(style.key)}"><p lang="en">${h(style.en)}</p><h3>${h(style.ko)}</h3></div><p>${h(style.definition)}</p>
      <dl class="style-facts">${facts.map(([label,value])=>`<div><dt>${h(label)}</dt><dd>${h(value)}</dd></div>`).join('')}</dl>
      ${style.key==='glass'?'<a href="#item/VFX-1101">Glass Panel 비교하기</a>':''}
      ${related.length?`<div class="story-links">${related.map(item=>`<a href="#item/${item.id}">${h(item.en)}</a>`).join('')}</div>`:''}
      <h3>출처</h3><div class="story-links">${(style.sources||[]).map(id=>A.sources[id]).filter(Boolean).map(source=>`<a href="${h(source.url)}" target="_blank" rel="noopener noreferrer">${h(source.name)}</a>`).join('')}</div>`;
  }
  function miniMotion(item,preset){
    return `<div class="u-motion-preview" data-motion-preview="${item.id}"${preset?` data-preview-preset="${preset.id}"`:''} aria-hidden="true" inert><div class="motion-stage"></div></div>`;
  }
  function markFavorite(item){return `<button class="u-icon-action" type="button" data-favorite="${item.id}" aria-label="${h(item.ko)} 즐겨찾기" aria-pressed="${favorites.has(item.id)}">${A.icons.icon('star')}</button>`;}
  function card(item){
    const isReady=item.implementation==='실습 가능';
    const showDemo=isReady&&['component','layout','pattern','effect'].includes(item.kind);
    const inlineMotion=item.kind==='motion'&&isReady;
    const stage=showDemo?`<div data-demo-id="${item.id}"><span class="u-help">조작 예제 준비</span></div>`:inlineMotion?miniMotion(item):`<div class="u-no-demo">${h(item.en||item.ko)}<br>설명과 개념</div>`;
    const isPromptable=inlineMotion||item.kind==='pattern'&&/motion|drag|reorder|swipe|undo|expand|transition/i.test(item.key)||['split-demo','master-detail','glass-panel'].includes(item.key);
    return `<article class="u-demo-card ${item.group==='입력'?'u-compact-form-card':''}" id="entry-${item.id}" data-item-id="${item.id}">
      <div class="u-demo-card-head"><div class="u-card-heading"><h3>${h(item.ko)}</h3><small lang="en">${h(item.en)}</small></div>
      <div class="u-card-actions">${markFavorite(item)}<button type="button" class="u-learn" data-help="card" data-target-id="${h(item.id)}" aria-label="${h(item.ko)} 구성 설명">?</button></div></div>
      <div class="u-demo-stage">${stage}</div>
      <div class="u-card-overview"><p>${h(item.definition)}</p>
      ${item.key==='segmented'?'<p class="u-related">관련 모션 <a href="#motion/MOT-0015">Sliding Indicator · 움직이는 선택 표시</a></p>':''}
      ${item.key==='sticky'?'<p class="u-related">연관 용어 <span>Fixed Header · 화면 기준으로 고정되는 헤더</span></p>':''}
      ${item.key==='card'?'<p><a href="#item/VFX-1101">패널의 글래스 재질 비교</a></p>':''}
      <details class="u-card-notes"><summary>사용처와 주의사항</summary><p><b>사용처</b> ${h(item.use||'동작과 적용 맥락을 확인해 봐.')}</p><p><b>주의</b> ${h(item.caution||'접근성과 입력 방법을 함께 고려해.')}</p>${relatedLinks(item)}</details>
      ${item.kind==='component'?A.componentMotion.controls(item):''}</div>
      ${isPromptable?`<div class="u-demo-card-foot"><small>${h(item.group)} · ${h(item.difficulty)}</small><div>${inlineMotion?`<a class="u-add-prompt" href="#motion/${item.id}">조절</a> <button type="button" class="u-add-prompt" data-copy-item="${item.id}">단독 복사</button> `:''}<button type="button" class="u-add-prompt" data-add="${item.id}">＋ 조합</button></div></div>`:''}
    </article>`;
  }
  function relatedLinks(item){
    const related=(item.related||[]).map(id=>A.byId.get(id)).filter(Boolean);
    if(!related.length)return '';
    return `<div class="item-related" aria-label="관련 항목">${related.map(other=>`<a href="#item/${other.id}">${h(other.en)}</a>`).join('')}</div>`;
  }
  function teardown(){
    for(const dispose of disposers)dispose?.();
    disposers=[];
    observer?.disconnect();observer=null;
    liveStage?.(); liveStage=null;
  }
  function mountCard(host){
    const item=A.byId.get(host.dataset.demoId);
    if(!item||host.dataset.mounted)return;
    host.dataset.mounted='true';
    let cleanup;
    try{
      if(item.kind==='component'){
        const disposeControl=A.controls.mount(host,item);
        const disposeMotion=A.componentMotion.mount(host,item);
        cleanup=()=>{disposeMotion?.();disposeControl?.();};
      }
      if(item.kind==='layout'&&!A.layoutLab.layoutDemo(host,item))cleanup=A.controls.mountLayout(host,item);
      if(item.kind==='effect'&&!A.layoutLab.effectDemo(host,item))cleanup=A.controls.mountEffect(host,item);
      if(item.kind==='pattern'){
        if(item.key==='contextual-help')host.innerHTML=A.layoutLab.showButton('coach','문맥 도움말 보기');
        else cleanup=A.controls.mountPattern(host,item);
      }
      if(cleanup){
        host._cleanup=cleanup;
        disposers.push(()=>{if(host._cleanup===cleanup){host._cleanup=null;cleanup();}});
      }
    }catch(error){
      console.error('Demo failed',item.id,error);
      host.innerHTML='<p class="u-help">이 예제를 표시할 수 없어.</p>';
    }
  }
  function activateDemos(){
    const targets=main.querySelectorAll('[data-demo-id]');
    if(!('IntersectionObserver' in window))targets.forEach(mountCard);
    else{
      observer=new IntersectionObserver(entries=>{
        for(const entry of entries){
          if(!entry.isIntersecting)continue;
          mountCard(entry.target);
          observer.unobserve(entry.target);
        }
      },{rootMargin:'280px 0px'});
      targets.forEach(el=>observer.observe(el));
    }
    const previews=[...main.querySelectorAll('[data-motion-preview]')].map(el=>({
      root:el.querySelector('.motion-stage'),
      item:A.byId.get(el.dataset.motionPreview),
      preset:presetById.get(el.dataset.previewPreset),
    }));
    if(previews.length){
      previewController=A.motion.preview(previews,()=>state.paused);
      disposers.push(()=>{previewController.dispose();previewController=null;});
    }
  }
  function inputStudio(items){
    const entries=items.filter(i=>i.group==='입력');if(!entries.length)return '';
    const families=inputFamilies.map(f=>({ ...f, matches:f.items.map(key=>entries.find(i=>i.key===key)).filter(Boolean)})).filter(f=>f.matches.length);
    return `<section class="u-section u-input-section" data-group="입력"><div class="u-section-title"><div><h2>입력 컨트롤의 종류</h2><p>동일한 영역에서 타입을 바꾸며 차이를 비교해 봐.</p></div><span class="u-section-count">${entries.length}종</span></div><div class="u-input-studios">${families.map(f=>{
      const preferred=f.matches.find(i=>i.key===inputChoice[f.id])||f.matches[0];inputChoice[f.id]=preferred.key;
      return `<article class="u-input-studio" data-input-family="${f.id}"><header class="u-input-head"><div><h3>${f.name}</h3><span>${f.matches.length}가지 변형</span></div></header><div class="u-input-tabs" role="group" aria-label="${f.name} 종류 선택">${f.matches.map(i=>`<button type="button" data-input-variant="${i.key}" data-input-family="${f.id}" aria-pressed="${i.key===preferred.key}">${h(i.ko)}</button>`).join('')}</div><div class="u-input-detail" data-input-detail>${inputDescription(preferred)}</div><div class="u-input-demo" data-demo-id="${preferred.id}"></div></article>`;
    }).join('')}</div></section>`;
  }
  function inputDescription(item){
    const colorLink=item.key==='color'&&!filters.item?'<a class="color-large-link" href="#item/CMP-0022">색상 선택 방식 넓게 비교하기</a>':'';
    return `<strong>${h(item.ko)} <small>${h(item.en)}</small></strong><p>${h(item.definition)}</p><p><b>사용처</b> ${h(item.use)}</p><p class="u-quick-caution"><b>주의</b> ${h(item.caution)}</p>${colorLink}${A.componentMotion.controls(item)}`;
  }
  function gallery(items){
    if(!items.length)return '<div class="u-empty">찾은 항목이 없어. 다른 표현으로 검색해 봐.</div>';
    const groups=new Map();for(const i of items){const key=i.group||i.kind;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);}
    return [...groups.entries()].map(([group,entries])=>group==='입력'&&entries.some(x=>x.kind==='component')?inputStudio(entries):`<section class="u-section" data-group="${h(group)}"><div class="u-section-title"><h2>${h(group)}</h2><span class="u-section-count">${entries.length}개</span></div><div class="u-gallery">${entries.map(card).join('')}</div></section>`).join('');
  }
  function glassSample(){
    return `<div class="glass-scene" data-material="glass">
      <div class="glass-sample" aria-label="불투명 표면과 글래스 비교">
        <fieldset class="glass-switch"><legend class="sr-only">표면 재질</legend>
          <label><input type="radio" name="sample-material" value="solid"><span>불투명</span></label>
          <label><input type="radio" name="sample-material" value="glass" checked><span>글래스</span></label>
        </fieldset>
        <label class="glass-range"><span>배경 흐림 <output data-sample-value="blur" aria-live="off">12px</output></span><input type="range" aria-label="배경 흐림" data-sample="blur" min="0" max="32" value="12"></label>
        <label class="glass-range"><span>표면 불투명도 <output data-sample-value="opacity" aria-live="off">68%</output></span><input type="range" aria-label="표면 불투명도" data-sample="opacity" min="54" max="100" value="68"></label>
      </div>
    </div>`;
  }
  function materialIntro(){
    return `<section class="catalog-intro" aria-labelledby="catalog-title">
      <div class="catalog-intro-copy"><p class="catalog-label" lang="en">Material study</p><h1 id="catalog-title">글래스와 재질</h1>
      <p>같은 배경에 불투명 표면과 글래스를 겹쳐 봐. 흐림은 배경의 경계를, 불투명도는 배경색이 비치는 정도를 바꿔.</p>
      <a class="intro-link" href="#item/VFX-1101">패널과 화면 재질 비교</a></div>
      <div class="catalog-intro-demo"><div class="catalog-intro-caption"><strong>글래스 패널</strong><span lang="en">Glass Surface</span></div>${glassSample()}</div>
    </section>`;
  }
  const componentOverview=()=>currentRoute==='catalog'&&filters.kind==='component'&&!filters.group&&!filters.item;
  const componentPage=()=>currentRoute==='catalog'&&filters.kind==='component'&&!filters.item;
  const previewLabel=()=>state.paused?'미리보기 재생':'미리보기 일시정지';
  const previewButton=(hidden=false)=>`<button type="button" class="u-action" data-pause-previews${hidden?' hidden':''}>${previewLabel()}</button>`;
  function categoryTabs(){
    const active=filters.group||'all';
    return `<div class="component-tabs" role="tablist" aria-label="컴포넌트 분류">${Object.entries(groupLabels).map(([key,label])=>
      `<button type="button" role="tab" id="component-tab-${key}" aria-selected="${key===active}" tabindex="${key===active?0:-1}" aria-controls="component-panel-${key}" data-component-group="${key}">${label}</button>`).join('')}</div>`;
  }
  function itemDetail(item){
    const back={component:['#catalog/component','컴포넌트'],layout:['#layout','레이아웃'],effect:['#catalog/effect','시각 효과'],pattern:['#catalog/pattern','UX 패턴'],motion:['#motion','모션 실험실']}[item.kind];
    const returnLink=back?`<a class="u-action" href="${back[0]}">${back[1]} 둘러보기</a>`:'';
    const isColor=item.key==='color'||item.colorMode;
    const refs=(item.sources||[]).map(id=>A.sources[id]).filter(Boolean);
    main.innerHTML=title(item.ko,item.en,returnLink)+`<div id="catalog-results" class="item-focus">
      ${isColor?`<article id="entry-${item.id}" class="wide-color-example"><div data-demo-id="${item.id}"></div>
        <footer>${A.layoutLab.showButton('color','앱의 색상 견본 보기')}${markFavorite(item)}</footer></article>`:card(item)}
      ${refs.length?`<section class="item-sources" aria-label="출처"><h2>출처</h2><div>${refs.map(source=>`<a href="${h(source.url)}" target="_blank" rel="noopener noreferrer">${h(source.name)}</a>`).join('')}</div></section>`:''}
    </div>`;
    activateDemos();
  }
  function catalog(kind){
    if(kind&&A.categories[kind]&&kind!=='style')filters.kind=kind;
    const labels={component:'컴포넌트',layout:'레이아웃',pattern:'UX 패턴',effect:'시각 효과',motion:'모션'};
    const itemPage=filters.item&&A.byId.get(filters.query);
    if(itemPage){itemDetail(itemPage);return;}
    const head=currentRoute==='search'?'검색 결과':itemPage?.ko||labels[filters.kind]||'컴포넌트';
    const component=componentPage();
    const tools=`<section class="u-catalog-tools"><div class="u-filter-search"><label class="u-search-inline"><span class="sr-only">현재 분류에서 검색</span><input type="search" data-catalog-search placeholder="이름이나 보이는 동작을 검색" value="${h(itemPage?'':filters.query)}"></label>
      <label class="u-small-filter">난이도 <select data-difficulty><option value="all">전체</option><option value="입문">입문</option><option value="중급">중급</option><option value="고급">고급</option></select></label>
      <label class="u-checkline"><input type="checkbox" data-ready> 체험 가능</label><button type="button" class="u-action" data-clear-filter>지우기</button></div></section>
      <div class="catalog-status"><p class="result-count" id="catalog-count"></p>${previewButton(true)}</div><div id="catalog-results"></div>`;
    const heading=component?title('컴포넌트','화면의 컨트롤을 직접 조작하고, 선택한 모션이 어떻게 적용되는지 비교해 봐.')
      : currentRoute!=='search'&&filters.kind==='effect'&&!filters.item?materialIntro()
      : title(head,itemPage?itemPage.en:'이름과 동작을 함께 확인해 봐.');
    main.innerHTML=heading+(component?categoryTabs()+Object.keys(groupLabels).map(key=>
      `<div role="tabpanel" id="component-panel-${key}" aria-labelledby="component-tab-${key}" ${key===(filters.group||'all')?'':'hidden'}>${key===(filters.group||'all')?tools:''}</div>`).join(''):tools);
    ui('[data-difficulty]').value=filters.difficulty;
    ui('[data-ready]').checked=filters.ready;
    refreshCatalog();
    if(tabFocus){main.querySelector(`[data-component-group="${tabFocus}"]`)?.focus({preventScroll:true});tabFocus='';}
  }
  const intentQueries=[
    {words:['스르륵움직이는탭','선택하면움직이는버튼','움직이는밑줄','선택표시가이동'], ids:['MOT-0015','CMP-0006','CMP-0035']},
    {words:['스크롤해도위에','따라오는상단','위에붙는메뉴','따라오는메뉴'], ids:['LAY-0005']},
    {words:['옆에서나오는','옆에서튀어나오는','측면에서열리는','옆으로열리는'], ids:['CMP-0047','CMP-0045','MOT-0002']},
    {words:['삭제하면위로','빈자리를채우는','목록이자리를채우는'], ids:['MOT-0025','PAT-0003']},
    {words:['색깔고르는','색상을고르는','색상견본','팔레트'], ids:['CMP-0022']},
    {words:['누르면통통','눌렀다가튀는','탄성있는버튼'], ids:['MOT-0004','MOT-0005']},
    {words:['글래스','glassmorphism','뒤가비치는','반투명패널'], ids:['VFX-0001','STY-0002']},
  ];
  function matches(item,q){
    const normalize=s=>String(s||'').toLocaleLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'');
    if(!q.trim())return true;
    const normalized=normalize(q);
    if(intentQueries.some(entry=>entry.words.some(w=>normalized.includes(normalize(w)))&&entry.ids.includes(item.id)))return true;
    const text=normalize([item.id,item.ko,item.en,item.group,item.definition,item.use,item.caution,...(item.aliases||[])].join(' '));
    return q.trim().split(/\s+/).every(token=>text.includes(normalize(token)));
  }
  function refreshCatalog(){
    const holder=ui('#catalog-results');if(!holder)return;
    teardown();
    let results=all.filter(x=>(!x.searchOnly||filters.query.trim())&&(filters.kind==='all'||x.kind===filters.kind)&&(filters.difficulty==='all'||filters.difficulty===x.difficulty)&&(!filters.ready||x.implementation==='실습 가능')&&matches(x,filters.query));
    if(filters.group&&filters.kind==='component')results=results.filter(x=>x.group===groupSlugs[filters.group]);
    const isInput=results.some(x=>x.group==='입력');
    ui('#catalog-count').textContent=`${results.length}개 항목${isInput?' · 입력은 관련 유형을 묶어 비교':''}`;
    const pause=ui('[data-pause-previews]');
    pause.hidden=!results.some(item=>item.kind==='motion'&&item.frame);
    const featured=componentOverview()&&!filters.query&&filters.difficulty==='all'&&!filters.ready
      ?featuredIds.map(id=>A.byId.get(id)) : [];
    holder.innerHTML=(featured.length?`<section class="u-section u-featured"><div class="u-section-title"><h2>대표 컴포넌트</h2></div><div class="u-gallery">${featured.map(card).join('')}</div></section>`:'')+gallery(results.filter(item=>!featured.includes(item)))+(currentRoute==='search'?A.icons.hint(filters.query):'');
    activateDemos();
  }
  function motion(id){
    const item=A.byId.get(id);
    const chosen=item?.frame?item:A.byId.get(state.labMotion)||A.motions[0];
    state.labMotion=chosen.id;
    liveStage=A.motionWorkspace.mount(main,chosen,selected=>{
      state.labMotion=selected.id;
      history.replaceState(null,'','#motion/'+selected.id);
      updatePrompt();store();
    });
    store();
  }
  function references(){const sources=Object.values(A.sources).filter(s=>s.url);const groups=new Map();for(const s of sources){const k=s.tag||'공식 문서';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(s);}main.innerHTML=title('프로젝트 정보·출처','UI2YA에서 참고한 디자인 시스템과 웹 표준을 확인할 수 있어.', '<a class="u-action" href="#icons">아이콘 라이선스</a>')+`<div class="reference-list">${[...groups.entries()].map(([tag,items])=>`<h2>${h(tag)}</h2><div class="reference-grid">${items.map(s=>`<article><h3><a target="_blank" rel="noopener noreferrer" href="${h(s.url)}">${h(s.name)} ↗</a></h3><p>${h(s.scope)}</p><p class="quiet">${h(s.license||'원본별 이용 조건 확인')}</p></article>`).join('')}</div>`).join('')}</div>`;}
  function favoritePage(){const list=all.filter(x=>favorites.has(x.id));main.innerHTML=title('즐겨찾기','나중에 비교하거나 개발 프로젝트에 적용할 만한 항목을 모았어.')+`<div class="catalog-status"><p class="result-count">${list.length}개</p>${previewButton(!list.some(item=>item.kind==='motion'&&item.frame))}</div>${gallery(list)}`;activateDemos();}
  function render(){
    teardown();
    const [route,encoded,sub]=(location.hash.slice(1)||'layout').split('/');
    let arg=encoded;
    try{if(encoded)arg=decodeURIComponent(encoded);}catch{}
    filters.item=route==='item';
    const item=filters.item?A.byId.get(arg):null;
    const page=route==='item'?'catalog':route==='catalog'&&arg==='layout'?'layout':names[route]?route:'layout';
    currentRoute=page;
    if(item?.kind==='motion'&&item.frame){location.hash='motion/'+arg;return;}
    if(item?.kind==='style'){
      location.hash='layout';
      if(activeStyleKeys.has(item.key)){
        window.addEventListener('hashchange',()=>window.UI2YAEnhance?.openStyle(item.key),{once:true});
      }
      return;
    }
    const navSection=page==='catalog'&&['pattern','effect'].includes(arg)?arg:page;
    document.querySelectorAll('[data-section]').forEach(el=>{
      if(el.dataset.section===navSection)el.setAttribute('aria-current','page');
      else el.removeAttribute('aria-current');
    });
    if(item){
      filters.kind=item.kind;filters.group='';filters.query=item.id;
      filters.difficulty='all';filters.ready=false;
    }else if(['pattern','effect'].includes(page)){
      filters.kind=page;filters.group='';filters.query='';
    }else if(page==='catalog'){
      filters.kind=A.categories[arg]?arg:'component';filters.group=groupSlugs[sub]?sub:'';filters.query='';
    }else if(page==='search'){
      filters.kind='all';filters.group='';filters.query=arg||'';filters.difficulty='all';filters.ready=false;
    }
    ui('#location-label').textContent=names[navSection];
    if(page==='layout'){
      A.layoutLab.render(main,gallery(A.layouts.filter(entry=>!entry.lessonKey||entry.id==='LAY-0005')));
      activateDemos();
    }else if(['layout','catalog','pattern','effect','search'].includes(page))catalog();
    else if(page==='motion')motion(arg);
    else if(page==='references')references();
    else if(page==='favorites')favoritePage();
    else if(page==='icons')disposers.push(A.icons.render(main,arg));
    applyTheme();
    window.scrollTo({top:0,behavior:'instant'});
    if(page==='motion'&&A.byId.get(arg)?.frame&&matchMedia('(max-width: 1050px)').matches){
      ui('#motion-detail').scrollIntoView({block:'start',behavior:'instant'});
    }
    if(item?.group==='입력'){
      const tab=main.querySelector(`[data-input-variant="${item.key}"]`);
      tab?.click();
    }
  }
  function designContext(){
    const surface=state.style==='glass'?{surfaceOpacity:state.opacity,backdropBlurPx:state.blur}:{};
    return {style:selectedStyle().en,mode:darkMode()?'dark':'light',accent:currentAccent(),
      toolbar:document.body.dataset.barShape,
      ...(state.backgrounds[state.style]?{background:state.backgrounds[state.style]}:{}),
      ...(state.surfaces[state.style]?{panel:state.surfaces[state.style]}:{}),...surface};
  }
  function promptText(){
    const prompt=state.prompt;
    const entries=[...prompt.components,...prompt.motions].map(id=>A.byId.get(id)).filter(Boolean);
    if(!entries.length)return '';
    const design=designContext();
    const parts=entries.map(item=>(item.kind==='style'?'style-reference':item.kind)+'='+item.en);
    const legacyPreset=presetById.get(prompt.preset);
    if(legacyPreset)parts.push('preset='+legacyPreset.name);
    const params=Object.fromEntries(entries.filter(item=>item.frame).map(item=>[item.en,A.motionSettings[item.id]||A.motion.defaults(item)]));
    const examples=Object.entries(prompt.examples||{}).filter(([key])=>prompt.components.includes(key))
      .map(([key,value])=>({target:A.byId.get(key).en,...value}));
    if(!ui('#prompt-detailed').checked){
      return 'UI2YA | '+[...parts,...Object.entries(design).map(([key,value])=>key+'='+value),
        ...(Object.keys(params).length?['params='+JSON.stringify(params)]:[]),
        ...(examples.length?['examples='+JSON.stringify(examples)]:[]),'reducedMotion=respect'].join(' | ');
    }
    return `Design reference: UI2YA (independent patterns)\n${parts.join('\n')}\nDesign: ${JSON.stringify(design)}\nParameters: ${JSON.stringify(params)}${examples.length?'\nExamples: '+JSON.stringify(examples):''}\nPreserve semantic behavior, accessible names, keyboard focus and platform conventions. Respect prefers-reduced-motion.`;
  }
  function updatePrompt(){
    const p=state.prompt,chips=[...p.components,...p.motions].filter(id=>A.byId.has(id)).map(id=>({id,name:A.byId.get(id).ko}));
    if(p.preset&&presetById.has(p.preset))chips.push({id:p.preset,name:presetById.get(p.preset).ko});
    ui('#dock-count').textContent=chips.length?`${chips.length}개 담김`:'비어 있음';
    ui('#dock-tokens').innerHTML=chips.length?chips.map(c=>`<span class="u-chip">${h(c.name)}<button type="button" data-remove="${h(c.id)}" aria-label="${h(c.name)} 제거">×</button></span>`).join(''):'<span class="u-help">모션의 ‘＋ 조합’을 누르면 여기에 담겨. 한 가지만 필요하면 ‘단독 복사’를 사용해.</span>';
    ui('#prompt-output').value=promptText();ui('#prompt-copy').disabled=!chips.length;ui('#prompt-clear').disabled=!chips.length;
    ui('#prompt-output').hidden=!chips.length;
  }
  function flyToDock(source,label){if(matchMedia('(prefers-reduced-motion:reduce)').matches||document.hidden)return;const from=source.getBoundingClientRect(),to=ui('#dock-toggle').getBoundingClientRect();const dx=to.left+Math.min(190,to.width*.5)-from.left,dy=to.top-from.top;const token=document.createElement('span');token.className='u-fly-token';token.textContent=label;token.style.left=from.left+'px';token.style.top=from.top+'px';document.body.append(token);const keyframes=[{transform:'translate(0px,0px) scale(1)',opacity:1},{transform:`translate(${dx*.48}px,${dy*.52-90}px) scale(.91)`,opacity:1,offset:.56},{transform:`translate(${dx}px,${dy}px) scale(.18)`,opacity:0}];if(token.animate){token.animate(keyframes,{duration:650,easing:'cubic-bezier(.22,.7,.2,1)',fill:'forwards'}).finished.finally(()=>token.remove());}else token.remove();}
  function queueItem(item){
    const prompt=state.prompt;
    const items=item.kind==='motion'?prompt.motions:prompt.components;
    if(!items.includes(item.id))items.push(item.id);
  }
  function addToPrompt(id,source){
    const item=A.byId.get(id);
    if(!item)return;
    queueItem(item);
    if(item.kind==='style')state.prompt.examples[id]=designContext();
    if(item.key==='split-demo'){
      const size=source.closest('article').querySelector('input[type=range]')?.value;
      if(size)state.prompt.examples[id]={leftPane:size+'%'};
    }
    flyToDock(source,item.ko);updatePrompt();store();notify(item.ko+' · 조합에 추가했어.');
  }
  function combineComponent(id,source){
    const item=A.byId.get(id);
    const motion=A.byId.get(A.componentMotion.motionID(item));
    if(motion)queueItem(motion);
    state.prompt.examples[id]={interaction:motion?.en||'No animation'};
    addToPrompt(id,source);
  }
  function selectInputVariant(button){
    const f=button.dataset.inputFamily,key=button.dataset.inputVariant;
    const studio=button.closest('.u-input-studio');if(!studio)return;
    const item=A.components.find(x=>x.key===key);if(!item)return;
    inputChoice[f]=key;
    studio.querySelectorAll('[data-input-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    studio.querySelector('[data-input-detail]').innerHTML=inputDescription(item);
    const host=studio.querySelector('.u-input-demo');host._cleanup?.();host._cleanup=null;host.innerHTML='';host.dataset.mounted='';host.dataset.demoId=item.id;
    mountCard(host);
  }
  function copySingleItem(id,preset){
    const item=A.byId.get(id);if(!item)return;
    const s=selectedStyle(),opts=preset?A.motion.presetOptions(item,preset):A.motionSettings[id]||A.motion.defaults(item);
    const txt=`UI2YA | motion=${item.en} | target=chosenUI | style=${s.en} | trigger=${preset?.trigger||'stateChange'} | params=${JSON.stringify(opts)}${preset?' | preset='+preset.name:''} | prefers-reduced-motion=respect`;
    A.copy(txt,ui('#prompt-output'));
  }
  function setAccent(value){state.colors[state.style]=hexColor(value);applyTheme();}
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.selectStyle){chooseStyle(b.dataset.selectStyle);return;}
    if(b.dataset.mode){state.mode=b.dataset.mode;applyTheme();return;}
    if(b.dataset.accentPreset){setAccent(b.dataset.accentPreset);return;}
    if(b.dataset.resetStyle!==undefined){delete state.colors[state.style];delete state.backgrounds[state.style];delete state.surfaces[state.style];state.opacity=76;state.blur=15;applyTheme();notify('현재 디자인의 색상·재질 설정 복원');return;}
    if(b.dataset.kind){location.hash='catalog/'+b.dataset.kind;return;}
    if(b.dataset.inputVariant){selectInputVariant(b);return;}
    if(b.dataset.copyItem){copySingleItem(b.dataset.copyItem,presetById.get(b.dataset.copyPreset));return;}
    if(b.dataset.componentGroup){selectComponentGroup(b.dataset.componentGroup,true);return;}
    if(b.dataset.clearFilter!==undefined){Object.assign(filters,{query:'',difficulty:'all',ready:false});if(ui('[data-catalog-search]'))ui('[data-catalog-search]').value='';if(ui('[data-difficulty]'))ui('[data-difficulty]').value='all';if(ui('[data-ready]'))ui('[data-ready]').checked=false;refreshCatalog();return;}
    if(b.dataset.favorite){const id=b.dataset.favorite;if(favorites.has(id))favorites.delete(id);else favorites.add(id);b.setAttribute('aria-pressed',String(favorites.has(id)));store();if(currentRoute==='favorites')render();return;}
    if(b.dataset.add){addToPrompt(b.dataset.add,b);return;}
    if(b.dataset.composeComponent){combineComponent(b.dataset.composeComponent,b);return;}
    if(b.hasAttribute('data-add-design')){addToPrompt(selectedStyle().id,b);return;}
    if(b.hasAttribute('data-copy-design')){A.copy('UI2YA | '+Object.entries(designContext()).map(([key,value])=>key+'='+value).join(' | '),ui('#prompt-output'));return;}
    if(b.dataset.pausePreviews!==undefined){state.paused=!state.paused;previewController?.sync();b.textContent=previewLabel();store();return;}
    if(b.dataset.remove){
      const id=b.dataset.remove,prompt=state.prompt;
      prompt.components=prompt.components.filter(item=>item!==id);
      prompt.motions=prompt.motions.filter(item=>item!==id);
      const removed=A.byId.get(id);
      delete prompt.examples[id];
      if(removed?.kind==='motion'){
        for(const [key,value] of Object.entries(prompt.examples))if(value.interaction===removed.en)delete prompt.examples[key];
      }
      if(prompt.preset===id)prompt.preset=null;
      updatePrompt();store();
      return;
    }
  });
  main.addEventListener('input',e=>{const el=e.target;
    if(el.name==='sample-material'){
      const scene=el.closest('.glass-scene');
      scene.dataset.material=el.value;
      scene.querySelectorAll('[data-sample]').forEach(control=>control.disabled=el.value==='solid');
    }
    if(el.dataset.sample){
      const property=el.dataset.sample;
      const scene=el.closest('.glass-scene');
      const value=el.value+(property==='blur'?'px':'%');
      scene.style.setProperty(`--sample-${property}`,value);
      scene.querySelector(`[data-sample-value="${property}"]`).textContent=value;
    }
    if(el.matches('[data-catalog-search]')){filters.query=el.value;refreshCatalog();}
    if(el.matches('[data-difficulty]')){filters.difficulty=el.value;refreshCatalog();}
    if(el.matches('[data-ready]')){filters.ready=el.checked;refreshCatalog();}
    if(el.matches('[data-editor-accent]'))setAccent(el.value);
    if(el.matches('[data-editor-bg]')){state.backgrounds[state.style]=hexColor(el.value);applyTheme();}
    if(el.matches('[data-editor-surface]')){state.surfaces[state.style]=hexColor(el.value);applyTheme();}
    if(el.matches('[data-editor-opacity]')){state.opacity=+el.value;applyTheme();}
    if(el.matches('[data-editor-blur]')){state.blur=+el.value;applyTheme();}
    if(el.matches('[data-editor-density]')){state.density=el.value;applyTheme();}
    if(el.matches('[data-editor-mode]')){state.mode=el.value;applyTheme();}
  });
  function selectComponentGroup(key,focus){
    const next='catalog/component'+(key==='all'?'':'/'+key);
    if(location.hash.slice(1)===next)return;
    tabFocus=focus?key:'';
    location.hash=next;
  }
  main.addEventListener('keydown',event=>{
    const tab=event.target.closest('[data-component-group]');
    if(!tab)return;
    const groups=Object.keys(groupLabels),index=groups.indexOf(tab.dataset.componentGroup);
    const next={ArrowRight:(index+1)%groups.length,ArrowLeft:(index+groups.length-1)%groups.length,Home:0,End:groups.length-1}[event.key];
    if(next!==undefined){event.preventDefault();selectComponentGroup(groups[next],true);}
  });
  main.addEventListener('change',event=>{
    if(event.target.matches('[data-component-motion]'))A.componentMotion.setChoice(event.target);
  });
  main.addEventListener('motion-settings-change',()=>{updatePrompt();store();});
  ui('#quick-accent').addEventListener('input',e=>setAccent(e.target.value));
  
  ui('#global-search').addEventListener('submit',e=>{
    e.preventDefault();
    const query=find.value.trim();
    const next=query?'search/'+encodeURIComponent(query):'catalog/component';
    if(location.hash.slice(1)===next)return;
    location.hash=next;
  });
  ui('#dock-toggle').addEventListener('click',()=>{const open=ui('#dock-content').hidden;ui('#dock-content').hidden=!open;ui('#dock-toggle').setAttribute('aria-expanded',String(open));ui('#prompt-dock').classList.toggle('is-open',open);});
  ui('#prompt-clear').addEventListener('click',()=>{state.prompt={components:[],motions:[],examples:{},preset:null};updatePrompt();store();});
  ui('#prompt-detailed').addEventListener('change',updatePrompt);
  ui('#prompt-copy').addEventListener('click',()=>A.copy(promptText(),ui('#prompt-output')));
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&['k','f'].includes(e.key.toLowerCase())){e.preventDefault();window.UI2YAEnhance?.expandSearch();find.focus();find.select();}});
  window.addEventListener('hashchange',render);
  matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(state.mode==='system')applyTheme();});
  window.AtlasUI={state,isFavorite:id=>favorites.has(id),chooseStyle,applyTheme,themeEditor,renderStory,selectedStyle,get darkMode(){return darkMode()},get currentAccent(){return currentAccent()},notify};
  applyTheme();updatePrompt();render();
})();
