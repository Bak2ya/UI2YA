'use strict';
(() => {
  const A = window.Atlas;
  const types = [
    ['sample','색상 견본','Color Swatch','색 하나를 보여 주고 누르면 선택해.','현재 강조색이나 반복 사용하는 사전 정의 색.','한색을 빠르게 확인할 수 있어. 선택지 전체를 보여 주려면 견본 격자가 필요해.'],
    ['swatch','견본 격자','Swatch Grid','여러 개의 색상 견본을 배열해 직접 골라.','디자인 토큰, 태그 색, 일관된 팀 색상.','비교가 쉬워. 목록의 색만 선택할 수 있어.'],
    ['palette','팔레트 선택','Palette Picker','서로 어울리는 색을 팔레트 단위로 바꿔서 봐.','테마, 차트, 일러스트의 색 묶음을 탐색할 때.','묶음의 관계를 확인할 수 있어. 비슷한 색은 이름과 코드도 표시해.'],
    ['spectrum','색상 영역','Color Area / Spectrum','가로에서는 채도, 세로에서는 밝기 값을 골라.','같은 색조에서 다양한 명암을 직접 찾을 때.','직관적이지만 정확한 값은 숫자 입력이나 키보드용 슬라이더로 보완해.'],
    ['wheel','색상환','Color Wheel','원의 각도로 색조를 선택해.','주변 색조와의 관계를 보면서 색을 바꿀 때.','색조를 훑기 쉬워. 명암과 채도는 다른 조절이 필요해.'],
    ['hue','색조 슬라이더','Hue Slider','색조 각도를 한 축에서 바꿔.','채도와 밝기를 유지하며 색만 변경할 때.','키보드로 세밀하게 바꿀 수 있어. 값은 도 단위로 표시해.'],
    ['alpha','알파 슬라이더','Alpha Slider','색을 유지하면서 색상 자체의 불투명도를 바꿔.','오버레이, 배경색, 반투명 재질.','체크무늬 위에서 비교할 수 있어. 실제 배경에서도 대비를 확인해.'],
    ['code','색상 코드 입력','Color Field','HEX, RGB, HSL 중 편한 형식으로 값을 입력해.','개발 지시문, 디자인 토큰, 특정 값을 다시 쓸 때.','값이 정확해. 잘못된 형식을 입력하면 오류를 표시해.'],
    ['native','시스템 색상 선택기','Native Color Picker','브라우저의 기본 색상 입력 컨트롤이 선택기를 열어.','시스템에서 익숙한 색상 선택 동작이 필요할 때.','팔레트와 외형은 운영체제와 브라우저에 따라 달라져.'],
    ['eye','스포이트','Eyedropper','지원되는 브라우저에서 화면의 한 픽셀을 선택해.','기존 화면에서 보이는 색을 견본으로 가져올 때.','사용자가 직접 시작해야 해. 지원되지 않는 곳에서는 값을 입력하거나 견본을 골라.'],
  ];
  const palettes = {
    '기본':['#3478F6','#58876D','#DE8351','#AF62B6','#EFBE4F','#1C2840'],
    '차분한 색':['#30365C','#696FA5','#ACC8EE','#BFABEA','#566D83','#E6EAF8'],
    '강한 대비':['#6934E0','#087DA1','#C33771','#B44D18','#267145','#121B2E'],
  };
  const clamp = (value,max=1)=>Math.min(max,Math.max(0,value));
  const hex = values=>'#'+values.map(value=>Math.round(value).toString(16).padStart(2,'0')).join('').toUpperCase();
  const rgbFromHSV = ({h,s,v})=>{
    const component=n=>{
      const k=(n+h/60)%6;
      return 255*v*(1-s*Math.max(0,Math.min(k,4-k,1)));
    };
    return [component(5),component(3),component(1)];
  };
  function hsvFromRGB([red,green,blue], fallbackHue){
    const [r,g,b]=[red,green,blue].map(value=>value/255);
    const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
    let hue=fallbackHue;
    if(delta){
      const segment=max===r?(g-b)/delta:max===g?2+(b-r)/delta:4+(r-g)/delta;
      hue=(60*segment+360)%360;
    }
    return {h:hue,s:max?delta/max:0,v:max};
  }
  function parseColor(raw) {
    const color=raw.trim();
    if(!/^(#[0-9a-f]{3,8}$|(?:rgba?|hsla?)\([\d\s.%+,/\-a-z]+\)$)/i.test(color)||!CSS.supports('color',color))return null;
    const context=document.createElement('canvas').getContext('2d');
    context.fillStyle=color;
    const value=context.fillStyle;
    if(value.startsWith('#'))return {rgb:[1,3,5].map(index=>parseInt(value.slice(index,index+2),16)),alpha:1};
    const [r,g,b,alpha=1]=value.match(/[+-]?\d*\.?\d+/g).map(Number);
    return {rgb:[r,g,b],alpha};
  }

  function mount(root, start='swatch'){
    const h=A.html;
    const id='color-'+(root.dataset.demoId||'standalone');
    const swatches=values=>values.map(color=>`<button type="button" class="color-swatch" data-color-swatch="${color}" style="--swatch:${color}" aria-label="${color} 색상 견본" title="${color} · Color Swatch" aria-pressed="false"></button>`).join('');
    const range=(label,name,max,extra='')=>`<label class="color-range">${label}<input type="range" min="0" max="${max}" ${extra} data-color-range="${name}"></label>`;
    const body={
      sample:swatches(['#3478F6']),
      swatch:`<div class="color-swatches">${swatches(palettes['기본'])}</div>`,
      palette:`<label>팔레트 <select data-palette>${Object.keys(palettes).map(name=>`<option>${name}</option>`).join('')}</select></label><div class="color-swatches" data-palette-colors>${swatches(palettes['기본'])}</div>`,
      spectrum:`<div class="color-area" data-spectrum aria-hidden="true"><i></i></div>${range('채도','s',100)}${range('밝기','v',100)}`,
      wheel:'<div class="color-wheel" data-color-wheel role="slider" tabindex="0" aria-label="색상환의 색조 각도" aria-valuemin="0" aria-valuemax="359"><i></i></div>',
      hue:range('색조','h',359),
      alpha:range('불투명도','alpha',100,'class="alpha-range"'),
      code:'<label class="color-format">형식 <select data-color-format><option>HEX</option><option>RGB</option><option>HSL</option></select></label><label>색상 코드 <input data-color-hex aria-describedby="'+id+'-error" type="text" maxlength="52" spellcheck="false"></label><p id="'+id+'-error" class="color-error" data-color-error role="status"></p>',
      native:'<label class="color-native">기본 색상 선택기 <input type="color" data-native-color></label>',
      eye:`<button type="button" class="u-action" data-eyedropper ${'EyeDropper' in window?'':'disabled'}>화면에서 색 추출</button><p data-eye-status role="status">${'EyeDropper' in window?'':'이 브라우저에서 화면 색 추출을 지원하지 않아.'}</p>`,
    };
    root.innerHTML=`<div class="color-lab" data-color-studio data-tabs>
      <div class="color-lab-tabs" role="tablist" aria-label="색상 선택 방식">${types.map(([key,ko])=>`<button type="button" role="tab" id="${id}-${key}-tab" data-color-tab="${key}" aria-controls="${id}-${key}-panel" aria-selected="${key===start}" tabindex="${key===start?0:-1}">${h(ko)}</button>`).join('')}</div>
      <div class="color-lab-body">${types.map(([key,ko,en,definition,use,tradeoff])=>`<section role="tabpanel" id="${id}-${key}-panel" data-color-panel="${key}" aria-labelledby="${id}-${key}-tab" ${key===start?'':'hidden'}>
        <div class="color-operation">${body[key]}</div>
        <div class="color-description"><strong>${h(ko)} <small lang="en">${h(en)}</small></strong><p>${h(definition)}</p><p><b>사용처</b> ${h(use)}</p><p><b>비교</b> ${h(tradeoff)}</p><a href="#item/CMP-0022">색상 선택기와 관련 방식</a></div>
      </section>`).join('')}</div>
      <div class="color-value"><span class="color-checker"><i data-color></i></span><output data-color-output></output><button type="button" class="u-action" data-copy-color>값 복사</button></div>
    </div>`;
    const $=selector=>root.querySelector(selector);
    const colorField=$('[data-color-hex]'), wheel=$('[data-color-wheel]');
    const format=$('[data-color-format]');
    const error=$('[data-color-error]');
    let state={...hsvFromRGB([88,135,109],147),alpha:1};

    function serialize(mode='HEX'){
      const rgb=rgbFromHSV(state).map(Math.round);
      const opacity=+(state.alpha.toFixed(3));
      if(mode==='RGB')return `rgb(${rgb.join(' ')}${opacity<1?' / '+opacity:''})`;
      if(mode==='HSL'){
        const {h,s,v}=state;
        const light=v*(1-s/2);
        const saturation=light===0||light===1?0:(v-light)/Math.min(light,1-light);
        return `hsl(${Math.round(h)} ${Math.round(saturation*100)}% ${Math.round(light*100)}%${opacity<1?' / '+opacity:''})`;
      }
      return hex(state.alpha<1?[...rgb,state.alpha*255]:rgb);
    }
    function sync(keepField=false){
      const lab=$('.color-lab');
      const rgb=hex(rgbFromHSV(state));
      const value=serialize();
      lab.style.setProperty('--sample-color',value);
      lab.style.setProperty('--hue',state.h);
      lab.style.setProperty('--sat',state.s*100+'%');
      lab.style.setProperty('--value',100-state.v*100+'%');
      $('[data-color-output]').textContent=value;
      $('[data-native-color]').value=rgb.toLowerCase();
      wheel.setAttribute('aria-valuenow',String(Math.round(state.h)%360));
      wheel.setAttribute('aria-valuetext',Math.round(state.h)%360+'도');
      root.querySelectorAll('[data-color-range]').forEach(input=>{
        const key=input.dataset.colorRange;
        input.value=Math.round(state[key]*(key==='h'?1:100));
      });
      root.querySelectorAll('[data-color-swatch]').forEach(button=>{
        button.setAttribute('aria-pressed',String(button.dataset.colorSwatch===rgb));
      });
      if(!keepField)colorField.value=serialize(format.value);
    }
    function useRaw(raw,keepField){
      const parsed=parseColor(raw);
      if(!parsed)return false;
      state={...hsvFromRGB(parsed.rgb,state.h),alpha:parsed.alpha};
      sync(keepField);
      return true;
    }
    function validate(confirm=false){
      const valid=useRaw(colorField.value,true);
      colorField.setAttribute('aria-invalid',String(confirm&&!valid));
      error.textContent=confirm&&!valid?'유효한 HEX, RGB 또는 HSL 색상 코드를 넣어 줘.':'';
      if(valid&&confirm)colorField.value=serialize(format.value);
    }
    const lab=$('.color-lab');
    lab.querySelector('[role=tablist]').addEventListener('click',event=>{
      const tab=event.target.closest('[role=tab]');
      if(tab)A.controls.tabActivate(lab,[...lab.querySelectorAll('[role=tab]')].indexOf(tab));
    });
    lab.querySelector('[role=tablist]').addEventListener('keydown',event=>{
      const options=[...lab.querySelectorAll('[role=tab]')];
      const index=options.indexOf(event.target);
      if(index<0)return;
      const next={ArrowRight:(index+1)%options.length,ArrowLeft:(index+options.length-1)%options.length,Home:0,End:options.length-1}[event.key];
      if(next!==undefined){event.preventDefault();A.controls.tabActivate(lab,next,true);}
    });
    lab.addEventListener('click',event=>{
      const chip=event.target.closest('[data-color-swatch]');
      if(chip){
        const previousAlpha=state.alpha;
        useRaw(chip.dataset.colorSwatch);
        state.alpha=previousAlpha;
        sync();
      }
      if(event.target.closest('[data-copy-color]'))A.copy(serialize(format.value));
    });
    lab.addEventListener('input',event=>{
      const control=event.target;
      if(control.dataset.colorRange){
        const key=control.dataset.colorRange;
        state[key]=+control.value/(key==='h'?1:100);
        sync();
      }
      if(control.matches('[data-native-color]')){
        const alpha=state.alpha;
        useRaw(control.value);state.alpha=alpha;sync();
      }
      if(control===colorField)validate(false);
    });
    const area=$('[data-spectrum]');
    function updateArea(event){
      if(event.type==='pointermove'&&!area.hasPointerCapture(event.pointerId))return;
      if(event.type==='pointerdown')area.setPointerCapture(event.pointerId);
      const bounds=area.getBoundingClientRect();
      state.s=clamp((event.clientX-bounds.left)/bounds.width);
      state.v=1-clamp((event.clientY-bounds.top)/bounds.height);
      sync();
    }
    area.addEventListener('pointerdown',updateArea);
    area.addEventListener('pointermove',updateArea);
    wheel.addEventListener('pointerdown',event=>{
      const bounds=wheel.getBoundingClientRect();
      state.h=(Math.atan2(event.clientY-bounds.top-bounds.height/2,event.clientX-bounds.left-bounds.width/2)*180/Math.PI+450)%360;
      sync();
    });
    wheel.addEventListener('keydown',event=>{
      const next={ArrowRight:state.h+5,ArrowUp:state.h+5,ArrowLeft:state.h-5,ArrowDown:state.h-5,Home:0,End:359}[event.key];
      if(next!==undefined){event.preventDefault();state.h=(next+360)%360;sync();}
    });
    $('[data-palette]').addEventListener('change',event=>{
      $('[data-palette-colors]').innerHTML=swatches(palettes[event.target.value]);
      sync();
    });
    format.addEventListener('change',()=>{error.textContent=''; colorField.removeAttribute('aria-invalid');sync();});
    colorField.addEventListener('change',()=>validate(true));
    colorField.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();validate(true);}});
    $('[data-eyedropper]').addEventListener('click',async()=>{
      try {const result=await new EyeDropper().open();useRaw(result.sRGBHex);$('[data-eye-status]').textContent='색상을 가져왔어.';}
      catch {$('[data-eye-status]').textContent='색상 추출을 취소했거나 현재 환경에서 사용할 수 없어.';}
    });
    sync();
  }
  A.colors={mount,types};
})();
