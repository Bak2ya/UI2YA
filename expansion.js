'use strict';
(() => {
  const A=window.Atlas;
  const addSource=(key,name,url,scope,tag='창작물')=>{
    A.sources[key]={name,url,scope,tag,license:'참고 링크 · 원본 자산과 코드 미사용',licenseUrl:'',codeUsed:false,modified:false};
  };
  addSource('gallery','Living UI Design Gallery','https://mdsagormunshi.github.io/UIDesignGallery/','브라우저에서 16개 목표 명칭과 레이아웃·모션·접근성 메뉴를 확인. 갤러리의 분류는 참고용이며 데모는 자체 제작');
  addSource('flat2','NN/g · Flat 2.0','https://www.nngroup.com/articles/flat-design/','Flat 2.0의 시각적 클릭 단서와 원 연구 설명','공개 연구');
  addSource('clay','Michal Malewicz · Claymorphism','https://uxdesign.cc/claymorphism-in-user-interfaces-1757fabaa377','부풀고 둥근 면의 공개 표현 사례');
  addSource('swiss','Poster House · The Swiss Grid','https://swissgrid.posterhouse.org/','전시 소장 자료로 확인하는 스위스 양식과 그래픽 그리드','전시 자료');
  addSource('gumroad','Gumroad · 공개 사이트','https://gumroad.com/','두꺼운 경계와 강한 대비를 쓰는 상업용 웹 표현 사례');
  addSource('aurora','Fredrin · 디자인 테마','https://www.fredrin.com/themes','개발자 공개 테마 사례. 오로라 계열의 색 띠와 레이어 표현을 참고');
  addSource('yp','Microsoft · Windows XP Media Bonus Pack','https://news.microsoft.com/source/2001/12/13/windows-media-bonus-pack-delivers-special-holiday-gift-to-users-of-windows-xp/','2001년 플레이어 스킨과 사용자화 사례','공식 문서');
  addSource('nes','Nintendo · Super Mario Bros. (1985)','https://www.nintendo.com/jp/character/mario/en/history/smb/index.html','제약된 색상과 도트 그래픽을 쓴 게임 화면 사례','공식 문서');
  A.sources.videoA.scope='브라우저에서 제목·영상 설명·챕터의 24개 용어를 대조. 전체 영상의 각 데모 재생은 검증 보류';
  A.sources.videoB.scope='브라우저에서 제목·영상 설명·챕터의 24개 모션 용어를 대조. 전체 영상의 각 데모 재생은 검증 보류';

  const additions=[
    {id:'STY-0025',key:'flat2',ko:'플랫 2.0',en:'Flat 2.0',group:'디자인 표현',aliases:['세미 플랫','flat design 2.0','semi-flat'],
      definition:'플랫 디자인의 간결한 표면에 약한 깊이와 분명한 조작 단서를 되돌려 놓는 접근.',
      history:'2010년대 중반 플랫 버튼을 찾기 어렵다는 지적이 늘자 완만한 그림자, 경계, 호버와 눌림 표시를 다시 쓰기 시작했습니다.',
      features:'절제된 깊이, 선명한 클릭 경계, 명암이 완만한 표면, 상태마다 구별되는 버튼.',
      example:'NN/g의 Flat 2.0 연구 글에 수록된 클릭 단서 비교 사례.',
      pros:'정보의 단순함을 유지하면서 링크와 작업 버튼의 위치를 발견하기 쉽습니다.',
      caution:'가벼운 그림자보다 레이블·초점·윤곽이 더 안정적인 조작 단서입니다.',
      use:'정보 밀도가 높고 링크와 조작을 함께 제공하는 웹 도구.',sources:['flat2','wcag','gallery'],related:['STY-0004','STY-0005']},
    {id:'STY-0026',key:'aurora',ko:'오로라 UI',en:'Aurora UI',group:'디자인 표현',aliases:['오로라 배경','aurora gradient','색상 띠'],
      definition:'오로라처럼 다른 색의 넓은 빛 띠를 겹쳐 공간과 분위기를 만드는 표현.',
      history:'웹의 다중 그라데이션과 블러를 이용하는 현대적 시각 표현입니다. 단일한 시작 시기나 표준이 있는 용어는 아닙니다.',
      features:'대각선 방향의 빛 띠, 깊은 기저색, 단계가 다른 색 면, 본문을 받치는 불투명 표면.',
      example:'Fredrin의 Aurora 웹 콘셉트와 Living UI Design Gallery의 공개 예시.',
      pros:'적은 이미지 자산으로 배경에 방향성과 큰 스케일의 깊이를 더할 수 있습니다.',
      caution:'조작부 아래에 명암 변화가 들어오면 가독성이 떨어집니다. 색 띠는 정적으로 유지하고 표면 명암을 확보하세요.',
      use:'크리에이티브 도구, 안내 페이지, 어두운 작업 공간의 배경.',sources:['aurora','gallery','wcag'],related:['STY-0002','STY-0019','VFX-0001']},
  ];
  A.styles.push(...additions.map(item=>({...item,kind:'style',difficulty:'중급',implementation:'실습 가능',rights:'일반 기법 · 자체 작성'})));
  const enriched={
    'STY-0006':{
      history:'2022년 전후 디자인 글에서 가볍고 볼록한 3D 질감을 클레이모피즘이라는 이름으로 다뤘습니다.',
      features:'둥근 윤곽, 안쪽 하이라이트, 짧은 바닥 그림자, 색마다 독립된 볼륨.',
      example:'Michal Malewicz의 공개 설명에 실린 독립적인 클레이 표면 예시.',
      pros:'조작 요소의 구획이 분명하고 친근한 분위기를 만들 수 있습니다.',
      caution:'그림자만으로 버튼의 경계를 표시하지 마세요. 큰 곡률에는 작은 글자가 눌려 보일 수 있습니다.',
      use:'친근한 학습 도구, 작은 작업 대시보드, 창작 앱.',sources:['clay','mdnShadow','gallery']},
    'STY-0007':{
      history:'정보에 집중하고 불필요한 조형을 덜어내는 그래픽 디자인과 제품 디자인의 방향을 UI에 적용합니다. 별도의 플랫폼 표준을 뜻하지는 않습니다.',
      features:'넓은 여백, 장식이 적은 선, 제한된 포인트 색, 역할을 드러내는 제목 크기와 간격.',
      example:'Living UI Design Gallery의 미니멀 예시. 샘플 앱에서는 정렬과 구분선으로 제어를 남겼습니다.',
      pros:'화면을 빠르게 훑고 현재 할 일을 찾기 쉽습니다.',
      caution:'제어부 윤곽과 도움말이 줄어들면 새 사용자가 기능을 발견하기 어렵습니다.',
      use:'읽기·작성 도구, 조작의 수가 적고 집중이 중요한 화면.',sources:['gallery','wcag']},
    'STY-0009':{
      en:'Neo-Brutalism',aliases:['Neobrutalism','두꺼운 테두리','하드 섀도'],
      history:'브루탈리즘에서 따온 직설적인 경계에 선명한 색과 오프셋 그림자를 더한 웹 표현으로 쓰입니다.',
      features:'굵은 윤곽선, 낮은 곡률, 방향이 뚜렷한 접촉 그림자, 대비가 큰 색면.',
      example:'Gumroad 공개 사이트의 그래픽 표현과 갤러리의 굵은 선 예시.',
      pros:'어떤 표면이 버튼인지 빨리 구별되고 중요한 블록이 두드러집니다.',
      caution:'모든 블록이 강하면 중요도가 사라집니다. 경계 두께와 강조 색을 기능 우선순위에 맞추세요.',
      use:'창작 제품, 제어 요소 개수가 적은 도구, 뚜렷한 개성을 주고 싶은 서비스.',sources:['gumroad','gallery','wcag']},
    'STY-0010':{
      ko:'스위스 디자인',en:'Swiss Design',aliases:['Swiss Style','International Typographic Style','스위스 스타일'],
      history:'전후 스위스의 그래픽 디자인 계보에서 객관적 타이포그래피와 수학적인 정렬이 정리됐습니다.',
      features:'기준선과 격자, 비대칭 구성, 굵기와 크기의 계층, 크게 드러나는 숫자.',
      example:'Poster House 전시에 수록된 Josef Müller-Brockmann의 콘서트 포스터. 앱의 격자와 글자 위계에 원리를 적용했습니다.',
      pros:'정렬이 뚜렷하고 복잡한 데이터를 구조적으로 비교하기 쉽습니다.',
      caution:'고정 폭에 맞춰 텍스트를 자르지 말고, 화면이 좁으면 읽는 순서대로 줄을 바꾸세요.',
      use:'편집 시스템, 데이터 데스크, 프로그램 문서 탐색.',sources:['swiss','mdnLayout','gallery']},
    'STY-0012':{
      ko:'픽셀 아트 디자인',en:'Pixel Art Design',aliases:['Pixel Art UI','8-bit','픽셀 UI','도트'],
      history:'초기 게임기의 해상도·팔레트 제약에서 도트 기반 시각 어휘가 발전했습니다. 이후 의도적인 레트로 도구의 표현으로 재사용됐습니다.',
      features:'직각과 계단형 경계, 제한된 팔레트, 명확한 명암 단계와 고정폭 숫자.',
      example:'Nintendo의 1985년 NES 계열 게임 화면은 도트 미학의 사례입니다. 이 앱은 원작 게임 자산을 사용하지 않습니다.',
      pros:'경계와 상태가 뚜렷하고 스타일을 간결한 그래픽으로 전달합니다.',
      caution:'한국어 본문은 읽기 쉬운 시스템 글꼴을 유지하고, 상징과 숫자에 픽셀 느낌을 집중하세요.',
      use:'게임 도구, 창작 실습, 작은 규모의 레트로 앱.',sources:['nes','gallery','wcag']},
    'STY-0013':{
      ko:'Y2K 디자인',en:'Y2K Design',aliases:['밀레니엄 UI','Y2K / Futuristic UI','크롬'],
      definition:'밀레니엄 전후 사용자화 소프트웨어의 미래 감각을 크롬, 파스텔, 광택 면으로 재해석합니다.',
      history:'2000년 전후 일부 플레이어와 데스크톱 앱에서 스킨을 통해 외형을 바꾸는 경험이 퍼졌습니다.',
      features:'메탈 프레임, 렌즈 같은 버튼, 젤리형 포인트 색, 가는 광택 라인.',
      example:'Microsoft가 2001년에 소개한 Windows Media Player 스킨. 본 앱 화면은 자체 제작한 데스크를 사용합니다.',
      pros:'앱의 정체성이 강하고 별도 테마에 유쾌한 감각을 줄 수 있습니다.',
      caution:'크롬 경계와 실제 초점·활성 상태가 겹치지 않게 하세요. 본문 배경은 읽기 쉬운 색으로 고정합니다.',
      use:'미디어·창작 작업 공간, 행사 도구, 레트로 시안.',sources:['yp','gallery','wcag']},
    'STY-0017':{
      ko:'Apple HIG 스타일',en:'Apple HIG Style',aliases:['Apple Human Interface Design','iOS','Apple 가이드라인'],
      history:'Apple의 HIG는 제품군에 따라 인터페이스를 설계하는 공식 지침입니다. 여기서는 가독성, 계층, 그룹으로 묶인 설정을 참고했습니다.',
      features:'크기 차이가 뚜렷한 제목, 인셋 설정 그룹, 명시적 제어, 연속적인 컨테이너 곡률.',
      example:'Apple HIG가 설명하는 내비게이션과 설정·제어 관례의 웹 적용.',
      pros:'조작 패턴을 플랫폼 사용자에게 친숙한 방향으로 정리할 때 도움이 됩니다.',
      caution:'모든 Apple 플랫폼에서 레이아웃이나 제어 방식이 같지는 않습니다. 지나치게 작은 텍스트와 회색 경계를 피하세요.',
      use:'Apple 제품의 사용 관례를 참고한 작업·설정 화면.',
      platformGap:'이 화면은 HIG 관례의 HTML 해석입니다. SwiftUI·UIKit, SF Symbols, 시스템 글자 크기와 제어 동작은 실제 Apple 플랫폼에서 별도로 확인해야 합니다.',sources:['apple','gallery','wcag']},
    'STY-0018':{
      ko:'플루언트 UI',en:'Fluent UI',aliases:['Microsoft Fluent Design','Fluent 2','Windows Fluent'],
      history:'Microsoft Fluent는 여러 플랫폼에 일관된 컴포넌트와 공간·색상·모션 규칙을 제공하는 디자인 시스템입니다.',
      features:'작은 곡률의 토큰 기반 표면, 앱 바와 측면 탐색, 미세한 배경 재질, 강조와 기본 버튼의 구별.',
      example:'Fluent 2가 공개하는 웹·Windows 컴포넌트 및 Windows의 Mica와 Acrylic 용도 구분.',
      pros:'밀도가 높은 작업 도구에도 일관된 제어 패턴을 적용하기 좋습니다.',
      caution:'팝오버, 명령 도구, 창 배경의 재질 역할을 구분하세요.',
      use:'업무용 웹, 데스크톱 도구, 복잡한 조작이 많은 화면.',
      platformGap:'Fluent UI React나 WinUI를 사용하지 않은 HTML 해석입니다. Windows의 Mica·Acrylic 시스템 브러시와 OS 토큰은 이 화면에 포함되지 않습니다.',sources:['fluent','mica','acrylic','gallery']},
    'STY-0019':{
      ko:'리퀴드 글래스 디자인',en:'Liquid Glass Design',aliases:['Liquid Glass','Apple Liquid Glass','유기적인 유리'],
      definition:'표면의 윤곽과 빛이 움직임과 배경에 맞물리는 유리 재질 표현. 샘플은 웹의 시각적 근사입니다.',
      history:'갤러리의 Liquid Glass Design은 흐르는 유리와 유기적인 외형을 중심으로 이름을 붙였습니다. Apple은 2025년에 별도의 시스템 재질 Liquid Glass를 공개했습니다.',
      features:'둥글게 이어지는 제어 그룹, 두 겹의 하이라이트와 테두리, 배경이 일부 보이는 플로팅 도구막대.',
      example:'Apple WWDC25에서 소개된 시스템 제어·내비게이션과 갤러리의 공개 표현.',
      pros:'조작 표면을 떠 있는 층으로 분리하면서 배경과 이어지는 인상을 줄 수 있습니다.',
      caution:'유리 표면은 복잡한 배경에서 읽기 어려울 수 있습니다. 대비를 먼저 확인하고 불투명한 대체 표면을 준비하세요.',
      use:'툴바, 짧은 제어 묶음, 콘텐츠 위에 뜨는 팝업.',
      platformGap:'HTML은 그라데이션·경계·배경 흐림으로 표현합니다. Apple 시스템의 적응형 광학 효과와 네이티브 동작은 별도입니다.',sources:['liquid','apple','gallery','mdnBlur','wcag']},
    'STY-0022':{
      history:'Material 3의 개인화 방향으로, 선택된 색을 역할별 색 체계로 적용하고 화면 구성 전반에 이어갑니다.',
      features:'톤 계열이 맞춰진 표면과 버튼, 넓은 곡률, 캡슐 형태의 활성 내비게이션, 표면 색상에 따른 계층.',
      example:'Android Compose의 Material 3 동적 색상과 색상 역할 예시.',
      pros:'사용자가 선호하는 색을 반영하면서도 요소 역할을 일관되게 유지할 수 있습니다.',
      caution:'새 팔레트마다 라벨과 상태 대비를 유지하세요. 색만으로 활성 여부를 표현하지 마세요.',
      use:'개인 설정의 비중이 높은 앱과 Android 앱 시안.',
      platformGap:'이 HTML은 선택 가능한 세 가지 자체 팔레트를 사용합니다. Android의 배경화면 색 추출, OS 컴포넌트와 제스처는 적용되지 않습니다.',sources:['google','gallery','wcag']},
  };
  A.styleStages=[
    {label:'기초 디자인 · 4종',ids:['STY-0004','STY-0001','STY-0002','STY-0003']},
    {label:'핵심 디자인 확장 · 8종',ids:['STY-0025','STY-0007','STY-0022','STY-0017','STY-0018','STY-0009','STY-0006','STY-0010']},
    {label:'표현 확장 · 4종',ids:['STY-0026','STY-0019','STY-0013','STY-0012']},
  ];
  for(const stage of A.styleStages)for(const id of stage.ids) {
    const style=A.styles.find(item=>item.id===id);
    Object.assign(style,enriched[id]||{}, {implementation:'실습 가능',rights:'일반 기법 · 자체 작성'});
    style.sources=[...new Set([...style.sources,'gallery'])];
  }
  for(const id of ['STY-0023','STY-0024']){
    const item=A.styles.find(e=>e.id===id);
    Object.assign(item,{kind:'theme',implementation:'실습 가능',rights:'접근성 표현 · 자체 작성',aliases:id==='STY-0024'?['고대비','High Contrast']:['라이트','다크','light','dark']});
  }
  A.categories.theme='테마·접근성';
  const makeLayout=(number,key,ko,en,definition,use,caution,related)=>({id:'LAY-'+number,key,ko,en,group:'페이지 구조',kind:'layout',definition,use,caution,related,aliases:[],sources:['gallery','mdnLayout','carbon'],difficulty:'중급',implementation:'실습 가능',rights:'일반 기법 · 자체 작성'});
  A.layouts.push(
    makeLayout('0009','dashboard','대시보드 레이아웃','Dashboard Layout','주요 지표와 작업 목록의 현재 상태를 한 화면에 배치합니다.','작업자가 빠르게 상황과 다음 할 일을 확인하게 합니다.','지표에 단위와 기준 시점이 있는지 확인하세요.',['LAY-0002','CMP-0052']),
    makeLayout('0010','card-layout','카드 기반 레이아웃','Card-Based Layout','비슷한 역할의 콘텐츠를 재사용 가능한 카드 단위로 배치합니다.','관찰 노트, 결과, 상품 같이 독립된 항목이 여럿일 때 유용합니다.','각 카드의 읽는 순서와 행동 이름을 유지하세요.',['CMP-0040','LAY-0002']),
  );
  A.layouts.at(-1).aliases.push('Card Layout','Card-Based Design','카드 배치');
  A.layouts.at(-2).aliases.push('Dashboard','KPI','현황판');
  A.videoRefs={
    videoA:['LAY-0001','LAY-0002','LAY-0003','LAY-0004','LAY-0005','LAY-0006','LAY-0010','CMP-0035','CMP-0041','CMP-0043','CMP-0047','CMP-0010','CMP-0046','CMP-0051','CMP-0049','CMP-0053','MOT-0039','MOT-0041','MOT-0007','MOT-0001','STY-0002','MOT-0040','MOT-0023','MOT-0042'],
    videoB:['MOT-0001','MOT-0002','MOT-0003','MOT-0038','MOT-0004','MOT-0005','MOT-0018','MOT-0019','MOT-0034','MOT-0020','MOT-0035','MOT-0012','MOT-0030','MOT-0021','MOT-0043','MOT-0028','MOT-0031','MOT-0023','MOT-0032','MOT-0033','MOT-0022','MOT-0026'],
  };
})();
