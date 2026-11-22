'use strict';
(() => {
  const A=window.Atlas;
  const selected=new Map();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const variants=item=>A.componentMotions[item.key]||[];
  const getChoice=item=>selected.get(item.id)||'default';
  const motionID=item=>getChoice(item)==='default'?variants(item)[0]?.[0]:getChoice(item);
  function controls(item){
    const choices=variants(item);
    const lesson=A.componentLessons[item.key];
    if(!choices.length&&!lesson)return '';
    const h=A.html;
    const value=getChoice(item);
    let target=motionID(item);
    if(target==='none')target=choices[0]?.[0];
    return `<div class="component-tools" data-component-tools="${item.id}">
      ${choices.length?`<label>적용할 모션 <select data-component-motion="${item.id}">
        <option value="default"${value==='default'?' selected':''}>기본</option>
        <option value="none"${value==='none'?' selected':''}>모션 없음</option>
        ${choices.map(([id,label])=>`<option value="${id}"${value===id?' selected':''}>${h(label)}</option>`).join('')}
      </select></label><a data-component-motion-link href="#motion/${target}">모션 설정</a>` : ''}
      ${lesson?A.layoutLab.showButton(lesson,'현재 페이지에서 보기'):''}
      ${choices.length&&['drawer','modal','accordion','segmented'].includes(item.key)?`<button class="u-action" type="button" data-compose-component="${item.id}">예제와 모션 조합</button>`:''}
    </div>`;
  }
  function inlineFrames(item,id,element){
    const kind=item.key;
    if(id==='MOT-0017')return [{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}];
    if(id==='MOT-0010')return [{transform:kind==='radio'?'scale(.7)':'scale(1)'},{transform:'scale(1.14)',offset:.5},{transform:'scale(1)'}];
    if(id==='MOT-0001'||id==='MOT-0029')return [{opacity:kind==='radio'?.45:.14},{opacity:1}];
    if(id==='MOT-0003')return [{transform:'scale(.94)'},{transform:'scale(1)'}];
    if(id==='MOT-0046')return [{filter:'saturate(.15)'},{filter:'saturate(1)'}];
    if(id==='MOT-0016')return [{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}];
    if(id==='MOT-0048')return [{opacity:0,transform:'scale(.94)'},{opacity:1,transform:'scale(1)'}];
    if(id==='MOT-0045')return [{boxShadow:'0 0 0 0 transparent'},{boxShadow:'0 0 0 3px var(--s-accent)'}];
    if(id==='MOT-0013'){
      const height=element.scrollHeight;
      return [{clipPath:'inset(0 0 100% 0)',maxHeight:'0px',overflow:'hidden'},{clipPath:'inset(0 0 0 0)',maxHeight:height+'px',overflow:'hidden'}];
    }
    if(id==='MOT-0008')return [{rotate:'-90deg'},{rotate:'0deg'}];
    if(id==='MOT-0002')return [{transform:'translateX(100%)'},{transform:'translateX(0)'}];
    if(id==='MOT-0004')return [{transform:kind==='drawer'?'translateX(100%)':'translateX(-5px)'},{transform:'translateX(2px)',offset:.72},{transform:'translateX(-1px)',offset:.89},{transform:'translateX(0)'}];
    if(id==='MOT-0047')return [{translate:'0 0'},{translate:'0 -6px',offset:.45},{translate:'0 0'}];
    if(id==='MOT-0022')return [{transform:'perspective(440px) rotateY(0deg)'},{transform:'perspective(440px) rotateY(9deg)',offset:.45},{transform:'perspective(440px) rotateY(0deg)'}];
    if(id==='MOT-0020')return [{transform:'translateY(5px)',opacity:.3},{transform:'translateY(0)',opacity:1}];
    if(id==='MOT-0044')return [{maxWidth:'42%'},{maxWidth:'100%'}];
    return null;
  }
  function mount(host,item){
    if(!variants(item).length)return;
    const controller=new AbortController();
    const listener={signal:controller.signal};
    let anim,ripple;
    const apply=()=>host.dataset.liveMotion=getChoice(item);
    apply();
    const stopMotion=()=>{anim?.cancel();ripple?.remove();};
    reduced.addEventListener('change',event=>{if(event.matches)stopMotion();},listener);
    function run(element,id=motionID(item)){
      if(id==='none'||!id||!element||reduced.matches)return;
      const itemMotion=A.byId.get(id);
      const options=A.motionSettings[id]||A.motion.defaults(itemMotion);
      const duration=options.duration;
      const easing={linear:'linear',in:'ease-in',out:'ease-out',inout:'ease-in-out'}[options.ease]||'ease-out';
      const frames=inlineFrames(item,id,element);
      anim?.cancel();
      if(frames)anim=element.animate(frames,{duration,easing});
      if(id==='MOT-0027'){
        ripple?.remove();
        ripple=document.createElement('span');ripple.className='component-ripple';
        element.append(ripple);
        anim=ripple.animate([{transform:'scale(0)',opacity:.45},{transform:'scale(6)',opacity:0}],{duration,easing});
        anim.addEventListener('finish',()=>ripple?.remove(),{once:true});
      }
      if(id==='MOT-0015'){
        element.style.setProperty('--demo-duration',duration+'ms');
      }
      if(id==='MOT-0014'){
        const sample=element.closest('.s-progress-wrap')||element;
        anim=sample.animate([{clipPath:'inset(0 35% 0 0)'},{clipPath:'inset(0)'}],{duration:Math.min(450,duration),easing});
      }
    }
    host._applyMotion=apply;
    host.addEventListener('input',event=>{
      const changed=event.target;
      if(['checkbox','radio','switch'].includes(item.key)){
        const node=item.key==='switch'?host.querySelector('.switch-track'):changed;
        run(node);
      }
      if(item.key==='segmented'){
        const id=motionID(item);
        if(id==='MOT-0015')run(host.querySelector('.s-segmented'));
        else run(host.querySelector('[data-segment-preview]'),id);
      }
      if(item.key==='progress')run(host.querySelector('progress'));
    },listener);
    host.addEventListener('focusin',event=>{
      if(item.key==='text'&&event.target.matches('input'))run(event.target);
      if(item.key==='search'&&event.target.matches('input'))run(event.target);
      if(item.key==='tooltip'&&event.target.closest('.s-tooltip'))run(host.querySelector('[role=tooltip]'));
    },listener);
    host.addEventListener('toggle',event=>{
      if(!event.target.open)return;
      if(item.key==='accordion')run(motionID(item)==='MOT-0008'?event.target.querySelector('summary'):event.target.querySelector('p'));
      if(item.key==='popover')run(event.target.querySelector('.popover-body')||event.target.lastElementChild);
    },{...listener,capture:true});
    host.addEventListener('click',event=>{
      const action=event.target.closest('[data-action]');
      if(['drawer','modal'].includes(item.key)&&action?.dataset.action==='dialog')run(host.querySelector('dialog'));
      if(item.key==='buttons'&&action)run(action);
      if(item.key==='card'&&action?.dataset.action==='card'){
        const note=host.querySelector('[data-card-note]:not([hidden])');
        run(motionID(item)==='MOT-0013'?note:host.querySelector('.s-card'));
      }
      if(item.key==='tooltip'&&event.target.closest('.s-tooltip button'))run(host.querySelector('[role=tooltip]'));
      if(item.key==='badge'&&action)run(host.querySelector('[data-badge]'));
      if(item.key==='tabs'&&event.target.closest('[role=tab]'))run(host.querySelector('[role=tabpanel]:not([hidden])'));
    },listener);
    host.addEventListener('keyup',event=>{
      if(item.key==='tabs'&&['ArrowRight','ArrowLeft','Home','End'].includes(event.key))run(host.querySelector('[role=tabpanel]:not([hidden])'));
    },listener);
    return ()=>{controller.abort();stopMotion();delete host._applyMotion;};
  }
  function setChoice(control){
    const id=control.dataset.componentMotion,item=A.byId.get(id);
    selected.set(id,control.value);
    const context=control.closest('.u-demo-card,.u-input-studio');
    const target=context.querySelector('[data-component-motion-link]');
    const selectedID=motionID(item);
    target.href='#motion/'+(selectedID==='none'?variants(item)[0][0]:selectedID);
    context.querySelector('[data-demo-id]')?._applyMotion?.();
  }
  A.componentMotion={controls,mount,setChoice,motionID};
})();
