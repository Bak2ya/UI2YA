'use strict';
(() => {
  const A = window.Atlas;
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const ease = {
    linear: ['선형', p => p],
    out: ['빠르게 시작 · 느리게 끝', p => 1 - (1 - p) ** 3],
    in: ['느리게 시작', p => p ** 3],
    inout: ['천천히 시작·끝', p => p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2],
  };
  const opt = (key,label,min,max,step,value,unit='') => ({key,label,min,max,step,value,unit});
  const travel = opt('distance','이동 거리',10,160,1,105,' px');
  const angle = opt('angle','최대 회전 각도',5,70,1,25,'°');
  const count = (p,n) => Math.round(p*n);
  const tx = (x,y=0) => 'translate(' + x + 'px,' + y + 'px)';
  const scale = n => 'scale(' + n + ')';
  const rotate = n => 'rotate(' + n + 'deg)';
  const stretch = (x,y) => 'scale(' + x + ',' + y + ')';
  const num = (value, fallback) => Number.isFinite(+value) ? +value : fallback;
  const spring = (ms, o) => {
    const t = ms / 1000;
    const a = o.damping / (2 * o.mass);
    const w = Math.sqrt(o.stiffness / o.mass);
    const v = o.velocity;
    const x0 = -1;
    const d = w*w - a*a;
    let x;
    if (Math.abs(d) < 1e-7) {
      x = (x0 + (v + a*x0)*t) * Math.exp(-a*t);
    } else if (d > 0) {
      const q = Math.sqrt(d);
      x = Math.exp(-a*t) * (x0*Math.cos(q*t) + (v+a*x0)/q*Math.sin(q*t));
    } else {
      const q = Math.sqrt(-d);
      const r1 = -a + q;
      const r2 = -a - q;
      const c = (v - r2*x0)/(r1-r2);
      x = c*Math.exp(r1*t) + (x0-c)*Math.exp(r2*t);
    }
    return 1 + x;
  };
  const one = (n,key,ko,en,group,description,aliases,covers,controls,frame,extra={}) => ({
    id:'MOT-'+n, key, ko, en, group, kind:'motion', definition:description, aliases, related:covers, controls, frame,
    sources:extra.sources || ['mdnMotion','mdnEase','reduce'], difficulty:extra.difficulty || '입문', mode:extra.mode || 'single',
    implementation: '실습 가능', rights: '일반 기법 · 자체 계산 및 작성', duration:extra.duration || 900,
    curve: extra.curve || 'ease', use:extra.use || '시작과 끝 상태를 연결하거나 조작 결과를 보여주고 싶을 때 비교해 보세요.',
    caution:extra.caution || '상태는 즉시 이해할 수 있게 제공하고, 운영체제가 움직임 감소를 요청하면 전환을 단순화하세요.',
    applicable:extra.applicable === true, extra,
  });
  const motions = [
    one('0001','fade','페이드','Fade','기본 전환','투명도를 바꿔 대상을 서서히 드러냅니다.', ['투명도','사라짐','부드러운 전환','smooth transition'], ['CMP-0043','CMP-0046','CMP-0051'], [opt('opacity','시작 불투명도',0,1,.05,.15)],
      (p,o)=>({opacity:o.opacity+(1-o.opacity)*p}), {applicable:true}),
    one('0002','slide','슬라이드','Slide','기본 전환','대상을 한 방향에서 목표 위치로 이동합니다.', ['옆에서 나오는 메뉴','밀기','slide in','page transition'], ['CMP-0047','CMP-0049'], [travel,{key:'side',label:'시작 위치',value:'left',options:[['left','왼쪽'],['right','오른쪽'],['top','위'],['bottom','아래']]}],
      (p,o)=>{const d=(1-p)*o.distance; return {transform:o.side==='top'?tx(0,-d):o.side==='bottom'?tx(0,d):tx(o.side==='left'?-d:d)};}, {applicable:true}),
    one('0003','scale','스케일','Scale','기본 전환','기준점을 중심으로 요소의 크기를 바꿉니다.', ['크기','팝','zoom','pop'], ['CMP-0040','CMP-0029'], [opt('start','시작 배율',.25,1.4,.05,.55)],
      (p,o)=>({transform:scale(o.start+(1-o.start)*p)}), {applicable:true}),
    one('0004','spring','스프링','Spring','탄성·물리','강성·감쇠·질량을 이용해 목표 위치로 복귀하는 움직임을 계산합니다.', ['누르면 튕기는 버튼','탄성','오버슈트','elastic','overshoot','snap back'], ['CMP-0029','CMP-0003','CMP-0007'], [
      opt('stiffness','강성',15,340,1,145,' N/m'),opt('damping','감쇠',1,70,1,11,' N·s/m'),opt('mass','질량',.2,4,.1,1,' kg'),opt('velocity','초기 속도',-6,12,.1,0,' /s'),opt('distance','이동 거리',10,125,1,86,' px'),
    ], (p,o,ms)=>({transform:tx((spring(ms,o)-1)*o.distance)}), {applicable:true,curve:'spring',duration:1100,difficulty:'고급',
      caution:'강한 감쇠나 큰 질량에서는 지정한 시간 안에 목표에 다다르지 않을 수 있습니다. 그래프와 마지막 프레임에서 확인하세요.'}),
    one('0005','bounce','바운스','Bounce','탄성·물리','공이 바닥에서 몇 번 튀듯 진폭이 작아집니다.', ['튀기기','버튼 튕김','반동','bounce'], ['CMP-0029','CMP-0040'], [
      opt('height','높이',8,120,1,70,' px'),opt('bounces','반동 횟수',1,6,1,3),
    ], (p,o)=>({transform:tx(0,-Math.abs(Math.sin(Math.PI*o.bounces*p))*o.height*(1-p)**1.4)}), {applicable:true,curve:'direct',difficulty:'중급'}),
    one('0006','shake','오류 흔들기','Shake','탄성·물리','요소가 좌우로 빠르게 흔들렸다가 멈춥니다.', ['wiggle','error shake','오류 떨림'], ['CMP-0028','CMP-0015'],
      [opt('distance','흔들림 폭',2,32,1,14,' px'),opt('waves','횟수',1,7,1,3)], (p,o)=>({transform:tx(Math.sin(2*Math.PI*o.waves*p)*o.distance*(1-p))}), {applicable:true,curve:'direct',duration:550}),
    one('0007','stagger','차례로 등장','Stagger','목록·화면','각 항목에 조금씩 다른 시작 시간을 줍니다.', ['순차','시차 등장','stagger animation'], ['CMP-0041','CMP-0049','LAY-0002'],
      [opt('items','항목 수',2,8,1,5),opt('gap','개별 시작 간격',0,360,5,95,' ms'),{key:'order',label:'진행 순서',value:'forward',options:[['forward','앞에서부터'],['backward','뒤에서부터']]}],
      (p)=>({opacity:p,transform:tx(0,(1-p)*25)}), {mode:'rows',difficulty:'중급',duration:450,
        caution:'한 항목의 지속시간과 항목 사이 간격을 더하면 전체 시간이 늘어납니다. 읽는 순서와 등장 순서도 함께 확인하세요.'}),
    one('0008','rotate','회전','Rotate','기본 전환','기준점을 중심으로 각도를 바꿉니다.', ['돌리기','회전 아이콘','icon rotation'], ['CMP-0030','CMP-0041'],
      [opt('angle','회전 각도',15,720,15,180,'°')], (p,o)=>({transform:rotate(o.angle*p)}), {applicable:true}),
    one('0009','flip','뒤집기','Flip','기본 전환','요소를 3D 축으로 뒤집어 앞면과 뒷면을 전환합니다.', ['3d','카드 뒤집기'], ['CMP-0040'],
      [], p=>({transform:'perspective(500px) rotateY('+180*p+'deg)'}), {mode:'flip',difficulty:'중급'}),
    one('0010','pulse','맥동','Pulse','탄성·물리','크기가 짧게 커졌다가 돌아와 상태 변화를 강조합니다.', ['배지 팝','badge pop','pulsing','heart pop','깜박'], ['CMP-0050','CMP-0030'],
      [opt('strength','확대량',.05,.6,.05,.22)], (p,o)=>({transform:scale(1+Math.sin(Math.PI*p)*o.strength)}), {applicable:true,duration:600}),
    one('0011','reveal','영역 드러내기','Reveal / Wipe','기본 전환','가시 영역의 경계를 이동시켜 안의 콘텐츠를 드러냅니다.', ['wipe','클립','가림막'], ['CMP-0041','VFX-0003'],
      [], p=>({clipPath:'inset(0 '+(1-p)*100+'% 0 0)'}), {sources:['mdnClip','reduce']}),
    one('0012','morph','형태 변형','Morphing','기본 전환','도형의 둥근 정도를 연속적으로 바꿉니다.', ['border morph','모핑','둥글게','icon morphing'], ['CMP-0022','CMP-0033','VFX-0003'],
      [opt('roundness','최종 모서리',8,50,1,50,'%')], (p,o)=>({borderRadius:(4+(o.roundness-4)*p)+'%',transform:stretch(1-.22*p,1+.16*p)}), {difficulty:'중급',caution:'이 데모는 모서리와 비율 보간입니다. 임의 SVG 경로의 점 대응은 별도의 구현입니다.'}),
    one('0013','grow','펼치기·접기','Expand / Collapse','기본 전환','크기를 바꾸며 감춰둔 공간을 열거나 닫습니다.', ['height width transition','아코디언','열고 닫기'], ['CMP-0041','PAT-0006'],
      [opt('height','최종 높이',35,150,1,110,' px')], (p,o)=>({height:(22+(o.height-22)*p)+'px',minHeight:'0',overflow:'hidden'}), {difficulty:'중급'}),
    one('0014','progress-fill','진행 채움','Progress Fill','마이크로 인터랙션','전체 구간 중 완료된 비율까지 채웁니다.', ['퍼센트','프로그레스','progress bar'], ['CMP-0052','CMP-0039'],
      [opt('goal','목표 진행률',10,100,1,80,'%')], (p,o)=>({width:p*o.goal+'%'}), {mode:'progress'}),
    one('0015','indicator','슬라이딩 인디케이터','Sliding Indicator','마이크로 인터랙션','탭이나 옵션의 선택 표시가 새 위치로 이동합니다.', ['움직이는 밑줄','animated underline','sliding pill','탭 표시'], ['CMP-0035','CMP-0006'],
      [], p=>({left: p*66.6667+'%'}), {mode:'indicator'}),
    one('0016','toast-slide','토스트 등장','Toast Slide','마이크로 인터랙션','작업 결과 메시지가 작은 거리에서 들어오며 보입니다.', ['알림 등장','스낵바','toast'], ['CMP-0051','CMP-0044'],
      [opt('distance','이동 거리',6,75,1,36,' px')], (p,o)=>({transform:tx(0,(1-p)*o.distance),opacity:p}), {applicable:true,duration:450}),
    one('0017','check-draw','체크 그리기','Check Draw','마이크로 인터랙션','짧은 선과 긴 선을 순서대로 드러내 체크를 완성합니다.', ['animated checkbox','success checkmark','체크 표시','선 그리기','line drawing'], ['CMP-0001','CMP-0002','CMP-0033'],
      [], p=>({clipPath:'inset(0 '+(1-p)*100+'% 0 0)'}), {mode:'check',duration:500}),
    one('0018','typewriter','타자 효과','Typewriter','확장 표현','문자를 한 글자씩 보여줍니다.', ['타이핑 효과','글자 순서','text reveal'], ['CMP-0053'],
      [{key:'text',label:'표시 문구',value:'입력하고, 선택하고, 움직입니다.',text:true}], (p,o)=>({text:Array.from(o.text).slice(0,count(p,Array.from(o.text).length)).join('')}), {mode:'text',curve:'direct',duration:1500}),
    one('0019','scramble','문자 뒤섞기','Text Scramble','확장 표현','임시 기호를 바꾸다가 실제 문자를 차례대로 고정합니다.', ['스크램블','해독','글자 뒤섞기'], [],
      [{key:'text',label:'표시 문구',value:'INTERACTION ATLAS',text:true}], (p,o)=>{const chars='@#%*80AΩ'; const steps=Math.floor(p*27); return {text:Array.from(o.text).map((c,i)=>c===' '||i<Math.floor(p*Array.from(o.text).length)?c:chars[(i*11+steps*5)%chars.length]).join('')};}, {mode:'text',curve:'direct',duration:1200}),
    one('0020','count','숫자 세기','Count-up','마이크로 인터랙션','숫자를 시작값에서 새 값까지 점차 변화시킵니다.', ['카운트업','counter animation','숫자 올라감'], ['CMP-0050','CMP-0052'],
      [opt('goal','목표 값',10,2000,1,100)], (p,o)=>({text:count(p,o.goal).toLocaleString('ko-KR')}), {mode:'text'}),
    one('0021','path','곡선 경로 이동','Motion Path','확장 표현','요소가 지정된 경로를 따라 움직입니다. 이 예시는 반타원 궤도입니다.', ['경로','곡선 이동','orbit'], ['CMP-0040'],
      [opt('height','곡선 높이',12,95,1,65,' px'),opt('width','곡선 너비',25,145,1,95,' px')], (p,o)=>({transform:tx(-Math.cos(Math.PI*p)*o.width,-Math.sin(Math.PI*p)*o.height)}), {difficulty:'중급'}),
    one('0022','tilt','3D 기울기','3D Tilt','확장 표현','관찰하는 방향이 다른 것처럼 면의 기울기를 변경합니다.', ['기울어진 카드','magnetic button','입체'], ['CMP-0040'],
      [angle,opt('sensitivity','기울기 민감도',.2,2,.1,1),opt('returnSpeed','복귀 속도',.3,2.5,.1,1,'×')], (p,o)=>{
        const wave= p<.4 ? p/.4 : Math.max(0,1-(p-.4)/.6)**o.returnSpeed;
        const y=wave*Math.min(o.angle, o.angle*.65*o.sensitivity);
        return {transform:'perspective(460px) rotateY('+y+'deg) rotateX('+(-y*.44)+'deg)'};
      }, {difficulty:'중급',caution:'이 데모는 기울기와 복귀를 타임라인으로 재생합니다. 포인터 추적은 별도 확장 항목입니다.'}),
    one('0023','scroll-snap','스크롤 스냅','Scroll Snap','목록·화면','사용자가 스크롤하면 가까운 정지 위치에 열이 맞춰집니다.', ['가로 스크롤','horizontal scroll','스크롤 락','sticky transition'], ['CMP-0049','LAY-0005','MOT-0040'],
      [], p=>({left:Math.round(p*2)*33.3333+'%'}), {mode:'scroll',curve:'direct',sources:['mdnScroll','reduce'],use:'실제 가로 레인을 밀거나 버튼을 눌러 위치를 옮겨 보세요. 타임라인은 가장 가까운 정지점을 택합니다.'}),
    one('0024','shimmer','시머','Shimmer','확장 표현','밝은 띠가 표면을 지나가며 대기 상태를 표현합니다.', ['광택','로딩 빛','펄스 플레이스홀더'], ['CMP-0053'],
      [opt('strength','최대 밝기',.1,1,.05,.7)], (p,o)=>({left:(p*150-38)+'%',opacity:o.strength}), {mode:'shimmer'}),
    one('0025','flip-layout','레이아웃 전환','FLIP / Layout Reflow','목록·화면','이전 위치와 새 위치 차이를 변환으로 계산해 자연스럽게 재배치합니다.', ['재정렬','list item removal','layout animation','카드 확장'], ['PAT-0003','PAT-0007'],
      [], p=>({transform:tx(0, (1-p)*54)}), {mode:'reflow',difficulty:'고급',caution:'실험실은 두 행의 위치 차이를 계산한 시뮬레이션입니다. DOM 변경 전후 측정 방식은 설명에서 확인할 수 있습니다.'}),
    one('0026','confetti','색종이','Confetti','확장 표현','성공 지점에서 작은 조각이 정해진 경로로 퍼집니다.', ['입자','particle effect','컨페티','폭죽'], ['CMP-0033','CMP-0051'],
      [opt('pieces','조각 개수',6,22,1,15),opt('spread','확산 폭',12,135,1,90,' px')], p=>({opacity:1-p}), {mode:'particles',curve:'direct',difficulty:'중급'}),
    one('0027','ripple','리플','Ripple','마이크로 인터랙션','입력점 부근에서 원형 파문이 커지며 사라집니다.', ['물결','파문','hover lift','press scale'], ['CMP-0029','CMP-0007'],
      [opt('spread','최대 크기',45,170,1,125,' px')], (p,o)=>({transform:scale(p*o.spread/42),opacity:(1-p)*.6}), {mode:'ripple',duration:650}),
    one('0028','shared','공유 요소 전환','Shared Element Transition','목록·화면','두 화면에서 같은 대상으로 보이는 요소의 위치와 크기를 이어 줍니다.', ['view transition','페이지 전환','shared element'], ['CMP-0040','MOT-0025'],
      [], p=>({transform:tx(-72+144*p,34-68*p)+' '+scale(.62+.58*p)}), {mode:'shared',difficulty:'고급',sources:['views','mdnMotion','reduce'],
        caution:'이 데모는 시작·종료 좌표를 보간합니다. 실제 페이지 전환에서는 공유 요소의 식별과 전후 문서 상태를 추가로 다룹니다.'}),
    one('0040','parallax','시차 스크롤','Parallax Scrolling','목록·화면','같은 스크롤 위치 변화에서 전경과 배경을 서로 다른 거리만큼 이동시켜 층의 깊이를 표현합니다.', ['패럴랙스','시차','parallax design'],['MOT-0023','LAY-0005'],[opt('depth','전경·배경 속도 차이',.1,.9,.05,.55)],
      (p,o)=>({front:tx(0,50-100*p),back:tx(0,(50-100*p)*(1-o.depth))}),{mode:'parallax',curve:'direct',difficulty:'중급',sources:['mdnScroll','reduce'],
        use:'타임라인을 스크롤 위치로 보고 두 층의 이동 거리를 비교합니다.',
        caution:'실제 스크롤에 연결하려면 거리와 정지 범위를 정하세요. 움직임 감소 설정에서는 정적 배경을 제공하세요.'}),
  ];
  motions.push(
    one('0029','crossfade','교차 페이드','Crossfade','기본 전환','두 요소의 불투명도를 반대 방향으로 바꾸어 콘텐츠를 교체합니다.',['교차 전환','content crossfade'],['MOT-0001','CMP-0035'],[],p=>({opacity:p}),{mode:'crossfade',duration:420}),
    one('0044','width-expansion','검색 폭 확장','Width Expansion','마이크로 인터랙션','접힌 검색 버튼에서 입력란으로 가로 공간을 넓힙니다.',['expandable search','expanding search field','검색창 펼치기','검색 확장','ease-out'],['LAY-1119','CMP-0017','MOT-0045'],[opt('width','최종 너비',100,340,4,240,' px')],(p,o)=>({width:(38+(o.width-38)*p)+'px'}),{mode:'search',duration:280}),
    one('0045','focus-transition','포커스 전환','Focus Transition','마이크로 인터랙션','입력 초점을 받았다는 표시가 외곽선과 색상으로 나타납니다.',['focus ring transition','입력 초점','focus-visible'],['LAY-1117','CMP-0015'],[],p=>({boxShadow:'0 0 0 3px '+ 'color-mix(in srgb, var(--s-accent) '+(p*100)+'%, transparent)'}),{mode:'field',duration:240}),
    one('0046','color-transition','색상 전환','Color Transition','마이크로 인터랙션','비활성 표면에서 강조색 표면으로 색상을 보간합니다.',['surface transition','color blend','색상 변화'],['CMP-0003','CMP-0029'],[],p=>({background:'color-mix(in srgb, var(--s-accent) '+(p*100)+'%, var(--s-line))'}),{duration:300}),
    one('0047','lift','호버 리프트','Hover Lift','마이크로 인터랙션','포인터나 포커스에 따라 카드를 살짝 올려 입체감을 줍니다.',['hover effect','hover lift','떠오르기'],['CMP-0040','CMP-0029'],[opt('height','이동 높이',2,20,1,8,' px')],(p,o)=>({transform:tx(0,-o.height*p),boxShadow:'0 '+(4+12*p)+'px '+(10+12*p)+'px #0e183c38'}),{duration:260,applicable:true}),
    one('0048','fade-scale','페이드와 크기 전환','Fade + Scale','기본 전환','대화상자가 투명도와 크기를 함께 바꾸며 나타납니다.',['modal entrance','dialog transition','fade scale'],['CMP-0043','MOT-0001','MOT-0003'],[opt('start','시작 배율',.65,1,.01,.94)],(p,o)=>({opacity:p,transform:scale(o.start+(1-o.start)*p)}),{duration:280,applicable:true}),
  );
  A.pendingMotions = [
    ['0030','marquee','흐르는 문구','Marquee','목록·화면','내용이 한 방향으로 반복해서 이동합니다.', ['전광판'], ['MOT-0018']],
    ['0031','pin','고정형 스크롤 서사','Pin / Scrollytelling','목록·화면','스크롤 진행 중 요소가 일정 구간 고정되고 내용이 단계적으로 바뀝니다.', ['핀','스크롤 서사'], ['LAY-0005','MOT-0040']],
    ['0032','magnetic','자석 버튼','Magnetic Button','확장 표현','버튼이 가까운 포인터 방향으로 살짝 이동합니다.', ['커서 따라오는 버튼'], ['MOT-0022']],
    ['0033','custom-cursor','맞춤 커서','Custom Cursor','확장 표현','포인터에 부가적인 시각 단서를 연동합니다.', ['마우스 커서'], ['MOT-0032']],
    ['0034','split-text','텍스트 분할 모션','Split Text','확장 표현','글자·단어·줄을 구분해 개별 요소로 애니메이션합니다.', ['글자 분할'], ['MOT-0007','MOT-0018']],
    ['0035','line-drawing','경로 선 그리기','SVG Stroke Drawing','확장 표현','경로가 길이에 따라 점진적으로 나타나거나 사라집니다.', ['line drawing','윤곽선'], ['MOT-0017','MOT-0021']],
    ['0036','gooey','점성 효과','Gooey / Liquid Motion','확장 표현','여러 표면이 서로 붙고 분리되는 것처럼 경계를 변형합니다.', ['액체','구이'], ['MOT-0012','VFX-0003']],
    ['0037','inertia','관성·모멘텀','Inertia & Momentum','탄성·물리','입력이 끝난 후 이전 속도와 감쇠가 계속 이동에 영향을 줍니다.', ['고무줄','follow through','rubber band','anticipation','squash stretch'], ['MOT-0004','MOT-0005']],
    ['0038','easing','이징','Easing','탄성·물리','같은 거리 또는 값 변화를 시간에 따라 다르게 배분하는 함수입니다.', ['ease in','ease out','duration','delay','loop','재생 속도'], ['MOT-0001','MOT-0002']],
    ['0039','visual-state','시각 상태 전환','State Feedback Transitions','마이크로 인터랙션','포커스, 호버, 눌림, 오류처럼 의미가 다른 상태를 색·윤곽·움직임으로 표현합니다.', ['focus highlight','tooltip fade','toggle thumb slide','button loading morph','색상 전환','blur transition'], ['MOT-0016','MOT-0006','CMP-0029']],
    ['0041','scroll-reveal','스크롤 등장','Scroll Reveal','목록·화면','요소가 화면에 들어오는 조건에 맞춰 보이기 시작합니다.', ['스크롤 리빌','스크롤 나타남'], ['MOT-0011','MOT-0040']],
    ['0042','micro','마이크로 인터랙션','Micro-interaction','마이크로 인터랙션','조작과 피드백으로 이루어진 작은 상호작용 단위입니다.', ['상태 반응','미세 상호작용'], ['MOT-0017','CMP-0003']],
    ['0043','page-transition','페이지 전환','Page Transition','목록·화면','페이지 이동 시 이전과 새 화면의 관계를 위치·투명도 또는 배치 변화로 전달합니다.', ['화면 전환'], ['MOT-0001','MOT-0028']],
  ].map(([n,key,ko,en,group,definition,aliases,related])=>({id:'MOT-'+n,key,ko,en,group,definition,aliases,related,kind:'motion',sources:['mdnMotion','mdnEase','reduce'],difficulty:'중급',rights:'일반 기법 · 독립 구현 검토',implementation:'설명 제공'}));
  A.motions = motions;
  const defaultOptions = d => Object.fromEntries(d.controls.map(c=>[c.key,c.value]));
  const defaults = d => ({duration:d.duration, delay:0, rate:1, ease:'out', direction:'normal', loop:false, ...defaultOptions(d)});
  const activeDuration = (d,o) => o.duration+(d.mode==='rows'?(o.items-1)*o.gap:0);
  const total = (d,o) => o.delay+activeDuration(d,o);
  const eased = (d, p, o) => d.curve==='ease' ? ease[o.ease][1](p) : p;
  function convertTime(d,o,ms,iteration=0) {
    const span=activeDuration(d,o);
    const forward=clamp((ms-o.delay)/span);
    const reverse=o.direction==='reverse'||(o.direction==='alternate'&&iteration%2===1);
    return (reverse?1-forward:forward)*span;
  }
  function stageHTML(d) {
    switch(d.mode) {
      case 'rows': return '<div class="motion-list"></div>';
      case 'reflow': return '<div class="motion-list"><div class="demo-item">새 순서 · 리뷰</div><div class="demo-item">새 순서 · 초안</div></div>';
      case 'particles': return '<div class="particle-origin" aria-hidden="true"></div><span class="motion-object">완료</span>';
      case 'flip': return '<div class="motion-flip"><span>앞면</span><span>뒷면</span></div>';
      case 'progress': return '<div class="motion-progress"><div></div></div><span class="stage-count"></span>';
      case 'indicator': return '<div class="motion-tabs"><span>전체</span><span>검토</span><span>완료</span><i></i></div>';
      case 'check': return '<div class="motion-check"><span>✓</span></div>';
      case 'text': return '<span class="motion-text"></span>';
      case 'scroll': return '<div class="snap-content" tabindex="0" aria-label="가로 캐러셀"><span>01 · 초안</span><span>02 · 검토</span><span>03 · 완료</span></div><div class="snap-buttons"><button type="button" data-snap="0">1</button><button type="button" data-snap="1">2</button><button type="button" data-snap="2">3</button></div>';
      case 'shimmer': return '<div class="motion-skeleton"><i></i></div>';
      case 'ripple': return '<div class="motion-ripple"><span>저장</span><i></i></div>';
      case 'shared': return '<div class="shared-guides"><i></i><i></i></div><div class="motion-object">프로젝트</div>';
      case 'parallax': return '<div class="demo-parallax-back"></div><div class="demo-parallax-front">전경</div><span class="compare-label">두 레이어의 이동 거리</span>';
      case 'crossfade': return '<div class="motion-crossfade"><span>개요</span><span>상세</span></div>';
      case 'search': return '<div class="motion-search"><span>⌕</span><span>프로젝트 검색</span></div>';
      case 'field': return '<div class="motion-focus">프로젝트 이름</div>';
      default: return '<div class="motion-object">프로젝트</div>';
    }
  }
  function paint(stage,d,o,ms,iteration=0) {
    const t = convertTime(d,o,ms,iteration);
    const p = eased(d,clamp(t/o.duration),o);
    const sample = d.frame(p,o,Math.min(o.duration,t));
    const put = (selector, attributes=sample) => {
      const el=stage.querySelector(selector);
      const {text,...style}=attributes;
      Object.assign(el.style,style);
      if (text!==undefined) el.textContent=text;
    };
    switch(d.mode) {
      case 'rows': {
        const list=stage.querySelector('.motion-list');
        if (list.children.length!==o.items) list.innerHTML=Array.from({length:o.items},(_,i)=>'<div class="demo-item">프로젝트 '+(i+1)+'</div>').join('');
        for(const [index,row] of [...list.children].entries()) {
          const delay=(o.order==='backward'?o.items-1-index:index)*o.gap;
          Object.assign(row.style,d.frame(eased(d,clamp((t-delay)/o.duration),o),o, t));
        }
        break;
      }
      case 'reflow': put('.demo-item:first-child',{transform:tx(0,(1-p)*50)});put('.demo-item:last-child',{transform:tx(0,-(1-p)*50)});break;
      case 'particles': {
        const holder=stage.querySelector('.particle-origin');
        if (holder.children.length!==o.pieces) holder.innerHTML='<i></i>'.repeat(o.pieces);
        for(const [i,el] of [...holder.children].entries()) {
          const a=Math.PI*2*i/o.pieces;
          const radius=o.spread*p*(.45+(i*13%9)/15);
          el.style.transform=tx(Math.cos(a)*radius,Math.sin(a)*radius+p*p*38)+' '+rotate(280*p+i*13);
          el.style.opacity=String((1-p)*Math.min(1,p*14));
        }
        break;
      }
      case 'flip': put('.motion-flip'); break;
      case 'progress': put('.motion-progress > div'); put('.stage-count',{text:count(p,o.goal)+'%'}); break;
      case 'indicator': put('.motion-tabs > i'); break;
      case 'check': put('.motion-check > span'); break;
      case 'text': put('.motion-text'); break;
      case 'scroll': {
        const content=stage.querySelector('.snap-content');
        const index=Math.round(p*2);
        if (Math.abs(content.scrollLeft - index*content.clientWidth)>1) content.scrollLeft=index*content.clientWidth;
        stage.querySelectorAll('[data-snap]').forEach(button=>button.setAttribute('aria-pressed',String(+button.dataset.snap===index)));
        break;
      }
      case 'shimmer': put('.motion-skeleton > i'); break;
      case 'parallax': put('.demo-parallax-back',{transform:sample.back});put('.demo-parallax-front',{transform:sample.front});break;
      case 'ripple': put('.motion-ripple > i'); break;
      case 'crossfade': put('.motion-crossfade > span:first-child',{opacity:1-p});put('.motion-crossfade > span:last-child');break;
      case 'search': put('.motion-search');put('.motion-search > span:last-child',{opacity:clamp((p-.24)/.76)});break;
      case 'field': put('.motion-focus');break;
      default: put('.motion-object');
    }
  }
  function presetOptions(item,preset){
    const options=defaults(item);
    if(!preset)return options;
    for(const key of ['duration',...item.controls.map(control=>control.key)]){
      if(key in preset)options[key]=preset[key];
    }
    if(preset.easing in ease)options.ease=preset.easing;
    return options;
  }
  function previewStage(root,item,options){
    root.dataset.previewMode=item.mode;
    root.dataset.previewKey=item.key;
    root.innerHTML=stageHTML(item);
    const object=root.querySelector('.motion-object');
    if(object&&['fade','slide','scale','tilt','shared'].includes(item.key))object.innerHTML='<i></i><i></i><i></i>';
    if(object&&['bounce','path','morph'].includes(item.key))object.textContent='';
    if(item.key==='spring')object.textContent='이동';
    if(item.key==='toast-slide')object.textContent='✓ 저장됨';
    paint(root,item,options,activeDuration(item,options)*.72);
  }
  function hoverPreview(owner,root,item){
    const options=defaults(item);
    const duration=activeDuration(item,options);
    previewStage(root,item,options);
    let frame=0;
    function play(){
      cancelAnimationFrame(frame);
      if(reduced())return;
      const start=performance.now();
      function tick(time){
        const elapsed=Math.min(duration,time-start);
        paint(root,item,options,elapsed);
        if(elapsed<duration&&!document.hidden&&!reduced())frame=requestAnimationFrame(tick);
      }
      frame=requestAnimationFrame(tick);
    }
    function stop(){cancelAnimationFrame(frame);paint(root,item,options,duration*.72);}
    owner.addEventListener('pointerenter',play);
    owner.addEventListener('pointerleave',stop);
    owner.addEventListener('focusin',play);
    owner.addEventListener('focusout',stop);
    owner.addEventListener('click',event=>{if(event.pointerType==='touch')play();});
    return stop;
  }
  function preview(entries,isPaused){
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const visible=new Set();
    const previews=new Map(entries.map(({root,item,preset})=>{
      const options=presetOptions(item,preset);
      previewStage(root,item,options);
      return [root,{item,options,elapsed:0}];
    }));
    let frame=0,last=0;
    function sync(){
      const playing=visible.size&&!preference.matches&&!document.hidden&&!isPaused();
      if(playing&&!frame)frame=requestAnimationFrame(tick);
      if(!playing){cancelAnimationFrame(frame);frame=0;last=0;}
    }
    function tick(now){
      const delta=last?Math.min(now-last,50):0;
      last=now;
      for(const root of visible){
        const sample=previews.get(root);
        const duration=activeDuration(sample.item,sample.options);
        sample.elapsed=(sample.elapsed+delta)%(duration+1250);
        paint(root,sample.item,sample.options,Math.min(duration,Math.max(0,sample.elapsed-180)));
      }
      frame=requestAnimationFrame(tick);
    }
    const observer='IntersectionObserver' in window?new IntersectionObserver(records=>{
      for(const record of records){
        if(record.isIntersecting)visible.add(record.target);
        else visible.delete(record.target);
      }
      sync();
    }):null;
    previews.forEach((_,root)=>observer?.observe(root));
    document.addEventListener('visibilitychange',sync);
    preference.addEventListener('change',sync);
    return {sync,dispose(){
      observer?.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange',sync);
      preference.removeEventListener('change',sync);
    }};
  }
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const triggered = new WeakMap();
  function trigger(el,d,o=defaults(d)) {
    if (!el || !d.applicable || reduced() || typeof el.animate!=='function') return;
    triggered.get(el)?.cancel();
    const frames = Array.from({length:41},(_,i)=>{
      const t=convertTime(d,o, o.delay+o.duration*i/40);
      return d.frame(eased(d,clamp(t/o.duration),o),o,t);
    });
    const anim=el.animate(frames,{duration:o.duration,delay:o.delay});
    triggered.set(el,anim);
    anim.playbackRate=o.rate;
  }
  function drawCurve(canvas,d,o) {
    const ctx=canvas.getContext('2d');
    const theme=getComputedStyle(document.body);
    const {width:w,height:h}=canvas;
    ctx.clearRect(0,0,w,h);
    const span=d.curve==='spring'?1.65:1.15, padding=13;
    const map=(p,n)=>[padding+p*(w-2*padding),h-padding-n/span*(h-2*padding)];
    ctx.strokeStyle=theme.getPropertyValue('--s-line').trim(); ctx.lineWidth=1;
    for(const y of [0,1]) {
      ctx.beginPath();ctx.moveTo(...map(0,y));ctx.lineTo(...map(1,y));ctx.stroke();
    }
    ctx.strokeStyle=theme.getPropertyValue('--s-accent').trim();ctx.lineWidth=2.6;ctx.beginPath();
    for(let i=0;i<=100;i++) {
      const p=i/100, y=d.curve==='spring'?spring(p*o.duration,o):eased(d,p,o);
      if(i===0) ctx.moveTo(...map(p,y)); else ctx.lineTo(...map(p,y));
    }
    ctx.stroke();
  }
  function mount(root,d) {
    const h=A.html;
    let values={...defaults(d),...(A.motionSettings[d.id]||{})}, changing=null;
    let t=0, iteration=0, last=0, frame=0, running=false, compare='none';
    const mini=(label,action)=>'<button type="button" class="button small" data-motion-action="'+action+'"'+(action==='start'?' aria-label="시작 시점"':action==='end'?' aria-label="마지막 시점"':'')+'>'+label+'</button>';
    root.innerHTML=`<div class="lab-layout">
      <section class="lab-play" aria-label="모션 미리보기">
        <div class="lab-top"><span>미리보기</span><label>비교 <select data-motion-compare>
          <option value="none">비교 끔</option><option value="default">이 모션의 기본값</option>
          ${d.mode==='single'?motions.filter(item=>item.mode==='single'&&item!==d).map(item=>'<option value="'+item.id+'">'+h(item.ko)+'</option>').join(''):''}
        </select></label></div>
        <div class="lab-stages"><div class="motion-stage" data-stage="current">${stageHTML(d)}</div>
          <div class="motion-stage" data-stage="compare" hidden></div></div>
        <div class="timeline"><div><label for="motion-time">타임라인</label><output data-motion-readout>0 ms</output></div>
          <input id="motion-time" data-motion-time type="range" min="0" value="0" step="1" aria-label="모션 타임라인">
          <div class="transport">${mini('⏮','start')}${mini('− 1프레임','prev')}${mini('재생','play')}${mini('일시정지','pause')}${mini('다시 재생','restart')}${mini('+ 1프레임','next')}${mini('⏭','end')}</div>
        </div>
        <p class="quiet reduced-note" ${reduced()?'':'hidden'}>움직임 감소가 켜져 있습니다. 타임라인으로 프레임을 직접 확인할 수 있습니다.</p>
      </section>
      <section class="lab-settings" aria-label="모션 설정">
        <h2>모션 설정</h2>
        <form data-motion-form></form>
        <div class="curve-wrap" ${d.curve==='direct'?'hidden':''}><span>${d.curve==='spring'?'스프링 응답':'이징 곡선'}</span><canvas width="280" height="110" aria-label="시간에 따른 동작 진행 시각화"></canvas></div>
        <div class="lab-copy">${mini('기본값으로 복원','reset')}${mini('설정과 설명 복사','copy')}</div>
        <textarea class="copy-fallback" hidden aria-label="설정 설명 복사할 텍스트" readonly></textarea>
      </section>
    </div>`;
    const form=root.querySelector('form');
    const time=root.querySelector('[data-motion-time]');
    const readout=root.querySelector('[data-motion-readout]');
    const stage=root.querySelector('[data-stage=current]');
    const comparison=root.querySelector('[data-stage=compare]');
    const canvas=root.querySelector('canvas');
    const base=[
      opt('duration','지속시간',100,2800,10,d.duration,' ms'),
      opt('delay','시작 지연',0,1500,10,0,' ms'),
      {key:'rate',label:'재생 속도',value:1,options:[[.25,'0.25×'],[.5,'0.5×'],[1,'1×'],[1.5,'1.5×'],[2,'2×'],[3,'3×']]},
      ...(d.curve==='ease'?[{key:'ease',label:'이징',value:'out',options:Object.entries(ease).map(([k,v])=>[k,v[0]])}]:[]),
      {key:'direction',label:'방향',value:'normal',options:[['normal','정방향'],['reverse','역방향'],['alternate','왕복 · 두 구간']]},
      {key:'loop',label:'반복',value:false,check:true},
    ];
    const controlHTML = c => {
      const id='opt-'+c.key;
      if(c.options) return '<label class="lab-control inline" for="'+id+'">'+h(c.label)+'<select id="'+id+'" name="'+c.key+'">'+c.options.map(([v,l])=>'<option value="'+h(v)+'"'+(String(values[c.key])===String(v)?' selected':'')+'>'+h(l)+'</option>').join('')+'</select></label>';
      if(c.check) return '<label class="lab-control inline" for="'+id+'">'+h(c.label)+'<input id="'+id+'" name="'+c.key+'" type="checkbox"'+(values[c.key]?' checked':'')+'></label>';
      if(c.text) return '<label class="lab-control" for="'+id+'">'+h(c.label)+'<input id="'+id+'" name="'+c.key+'" type="text" maxlength="36" value="'+h(values[c.key])+'"></label>';
      return '<div class="lab-control"><div><label for="'+id+'">'+h(c.label)+'</label><output for="'+id+'" data-value="'+c.key+'">'+h(values[c.key]+c.unit)+'</output></div><input id="'+id+'" name="'+c.key+'" type="range" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+h(values[c.key])+'"></div>';
    };
    const layOut=()=>{form.innerHTML=[...base,...d.controls].map(controlHTML).join('');};
    const render=()=> {
      const length=total(d,values);
      time.max=Math.round(length);
      time.value=Math.round(t);
      time.setAttribute('aria-valuetext',Math.round(t)+' 밀리초 / '+Math.round(length)+' 밀리초');
      readout.textContent=Math.round(t)+' / '+Math.round(length)+' ms';
      paint(stage,d,values,t,iteration);
      if (compare!=='none') {
        const other=compare==='default'?d:motions.find(item=>item.id===compare);
        const defaultsOther=defaults(other);
        paint(comparison,other,defaultsOther,t/length*total(other,defaultsOther));
      }
    };
    const setRunning=flag=>{
      running=flag;
      root.querySelector('[data-motion-action=play]').disabled=flag;
      root.querySelector('[data-motion-action=pause]').disabled=!flag;
      if(!flag) { cancelAnimationFrame(frame); frame=0; last=0; }
    };
    const seek=ms=>{setRunning(false);t=clamp(ms,0,total(d,values));render();};
    function tick(now) {
      if(!running||!root.isConnected) {setRunning(false);return;}
      const size=total(d,values);
      if(last) t+=(now-last)*values.rate;
      last=now;
      if(t>=size) {
        if(values.loop|| (values.direction==='alternate'&&iteration===0)) {
          t-=size;
          iteration++;
          if(t>=size) t=0;
        } else {t=size;setRunning(false);render();return;}
      }
      render();
      frame=requestAnimationFrame(tick);
    }
    function play(restart=false) {
      if(restart || t>=total(d,values)) {t=0;iteration=0;}
      if(reduced()) {seek(total(d,values));return;}
      if(!running){setRunning(true);last=0;frame=requestAnimationFrame(tick);}
    }
    layOut();render();setRunning(false);
    if(d.curve!=='direct') drawCurve(canvas,d,values);
    time.addEventListener('input',()=>{iteration=0;seek(+time.value);});
    form.addEventListener('submit',e=>e.preventDefault());
    form.addEventListener('input',e=>{
      const c=[...base,...d.controls].find(item=>item.key===e.target.name);
      if(!c) return;
      const prev=total(d,values);
      values[c.key]=c.check ? e.target.checked : c.text || typeof c.value==='string' ? e.target.value : num(e.target.value,c.value);
      const output=form.querySelector('[data-value="'+c.key+'"]');
      if(output) output.textContent=values[c.key]+c.unit;
      if(c.key==='direction') iteration=0;
      if(c.key==='loop'&&!values.loop&&iteration>1) iteration=values.direction==='alternate'?iteration%2:0;
      t=clamp(t/prev*total(d,values),0,total(d,values));
      A.motionSettings[d.id]={...values};
      root.dispatchEvent(new Event('motion-settings-change',{bubbles:true}));
      render();if(d.curve!=='direct') drawCurve(canvas,d,values);
    });
    root.querySelector('[data-motion-compare]').addEventListener('change',e=>{
      compare=e.target.value;
      comparison.hidden=compare==='none';
      const other=compare==='default'?d:motions.find(item=>item.id===compare);
      if(other) comparison.innerHTML=stageHTML(other)+'<span class="compare-label">'+h(compare==='default'?'기본값':other.ko)+'</span>';
      root.querySelector('.lab-stages').classList.toggle('comparing',compare!=='none');
      render();
    });
    root.addEventListener('click',async e=>{
      const snap=e.target.closest('[data-snap]');
      if(snap){iteration=0;const pp=+snap.dataset.snap/2;seek(values.delay+(values.direction==='reverse'?1-pp:pp)*activeDuration(d,values));return;}
      const action=e.target.closest('[data-motion-action]')?.dataset.motionAction;
      if(!action) return;
      if(action==='start') {iteration=0;seek(0);}
      if(action==='end') {iteration=0;seek(total(d,values));}
      if(action==='prev') seek(t-1000/60);
      if(action==='next') seek(t+1000/60);
      if(action==='play') play();
      if(action==='pause') setRunning(false);
      if(action==='restart'){setRunning(false);play(true);}
      if(action==='reset'){values=defaults(d);delete A.motionSettings[d.id];iteration=0;seek(0);layOut();if(d.curve!=='direct')drawCurve(canvas,d,values);root.dispatchEvent(new Event('motion-settings-change',{bubbles:true}));}
      if(action==='copy') {
        const text=d.id+' · '+d.ko+' ('+d.en+')\n'+d.definition+'\n브라우저의 움직임 감소 설정을 존중하고, 아래 값을 자체 구현에 적용합니다.\n'+JSON.stringify(values,null,2);
        await A.copy(text,root.querySelector('.copy-fallback'));
      }
    });
    if(d.mode==='scroll') {
      const content=stage.querySelector('.snap-content');
      content.addEventListener('scroll',()=>{
        if(running)return;
        const index=Math.round(content.scrollLeft/Math.max(1,content.clientWidth));
        const target=values.delay+(values.direction==='reverse'?1-index/2:index/2)*activeDuration(d,values);
        if(Math.round(t)!==Math.round(target) && Math.round(convertTime(d,values,t,iteration)/activeDuration(d,values)*2)!==index) seek(target);
      },{passive:true});
    }
    changing=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{root.querySelector('.reduced-note').hidden=!reduced();if(reduced()&&running)seek(total(d,values));};
    changing.addEventListener('change',change);
    return ()=>{setRunning(false);changing.removeEventListener('change',change);};
  }
  A.motionSettings={};
  A.motion={mount,trigger,defaults,spring,paint,eased,total,preview,presetOptions,hoverPreview};
})();
