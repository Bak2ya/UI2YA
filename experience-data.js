'use strict';
(() => {
  const A = window.Atlas;
  const lesson = (key, ko, en, definition, use, example, motion, target, related = [], prepare = '') =>
    ({ key, ko, en, definition, use, example, motion, target, related, prepare });

  A.lessons = [
    lesson('header','헤더','Header / App Bar','앱의 위치와 주요 기능을 담는 상단 영역이야.','현재 화면의 위치를 표시하고 전역 도구를 가까이 두고 싶을 때 써.','지금 UI2YA의 상단바에 화면 이름, 스타일, 검색이 모여 있어.','선택 배경 이동과 검색 폭 확장','.topbar',['CMP-0006','MOT-0044']),
    lesson('sticky','스티키 헤더','Sticky Header','스크롤하다 지정된 위치에 닿으면 컨테이너 안에서 붙는 헤더야.','긴 목록에서 분류나 검색을 계속 사용할 때 써.','페이지 흐름 안에 있는 UI2YA 상단바를 붙여 두었어.','CSS position: sticky · 선택 표시 전환','.topbar',['LAY-0005','MOT-0023'],'sticky'),
    lesson('fixed','고정 헤더','Fixed Header','스크롤 위치와 관계없이 뷰포트의 같은 자리에 계속 있는 헤더야.','항상 화면 기준 위치에 있어야 하는 도구에 써.','이 시연 동안 상단바를 Fixed 상태로 보여 줘. 일반 흐름 자리는 별도로 확보해.','CSS position: fixed','.topbar',['LAY-0005','MOT-0002'],'fixed'),
    lesson('floating','플로팅 도구막대','Floating Toolbar / Floating App Bar','가장자리에서 떨어져 떠 있는 도구 영역이야.','콘텐츠와 도구를 구별하거나 표면에 깊이를 줄 때 써.','왼쪽과 위에 간격을 둔 실제 상단바를 보여 줘. 고정과 스티키는 별도의 위치 동작이야.','모서리와 간격 전환','.topbar',['VFX-0002','LAY-0005'],'floating'),
    lesson('capsule','캡슐형 도구막대','Floating Capsule Toolbar','외곽이 캡슐 형태인 플로팅 도구막대야.','컨트롤을 하나의 독립된 표면에 모을 때 써.','둥근 모서리가 적용된 상단바 형태를 시연 중이야.','모서리 전환 · Surface Transition','.topbar',['LAY-1103','VFX-0001'],'capsule'),
    lesson('sidebar','사이드바','Sidebar','화면 옆에서 주요 탐색이나 작업 맥락을 상시 표시하는 영역이야.','서로 다른 섹션을 자주 왕복하는 앱에 어울려.','UI2YA의 왼쪽 탐색. 화면이 좁으면 위쪽 링크로 재배치돼.','선택 배경 전환','.rail',['LAY-0004','CMP-0047']),
    lesson('rail','내비게이션 레일','Navigation Rail','아이콘 중심으로 주요 목적지를 모은 좁은 측면 탐색이야.','넓은 작업 화면에 탐색을 상시 두고 싶을 때 써.','데스크톱에서 UI2YA 사이드바를 축소해 살펴볼 수 있어. 모바일에선 가로 탐색으로 바뀌어.','너비 전환','#primary-nav',['CMP-0036','LAY-0004'],'rail'),
    lesson('workspace','본문 작업공간','Main Content / Workspace','현재 선택한 화면의 콘텐츠와 조작을 담는 주 영역이야.','작업 대상과 계속 보이는 탐색 도구를 분리할 때 쓰는 구조야.','지금 페이지의 레이아웃 실험실이 본문이야.','경로 전환','#main',['LAY-0006','LAY-0007']),
    lesson('card','카드·패널','Card / Panel','카드는 하나의 정보를 묶고, 패널은 관련된 작업이나 도구를 영역으로 제공해.','독립된 예제와 그 레이블을 함께 비교하거나 보조 작업 영역을 구성해.','레이아웃 미리보기 카드의 경계를 강조해. 다른 화면에서는 이 안에 실습을 담아.','테두리와 배경 전환','.layout-map',['CMP-0040','VFX-1101']),
    lesson('drawer','드로어·측면 시트','Drawer / Side Sheet','가장자리에서 나타났다 닫을 수 있는 보조 패널이야.','작업 맥락을 유지하면서 용어의 상세 정보나 보조 도구를 열 때 써.','UI2YA의 오른쪽 스타일 설명이 실제 드로어야. 시연 중에는 Spotlight가 나머지 부분을 가려.','Slide In · Ease-out','#motion-drawer',['CMP-0047','MOT-0002'],'drawer'),
    lesson('dock','하단 도크','Bottom Dock','화면 하단에 주요 항목이나 작업 도구를 모아 둔 영역이야.','화면을 옮겨도 이어지는 작업 상태나 빠른 동작을 제공해.','UI2YA의 AI 프롬프트 조합을 하단 도크에서 열 수 있어.','펼치기·접기','#prompt-dock',['MOT-0013']),
    lesson('toolbar','도구막대','Toolbar','현재 문맥의 여러 조작을 한 그룹에 배치한 영역이야.','설정, 검색, 보기 전환을 빠르게 실행할 때 써.','상단바 안에 검색과 색상, 보기 모드가 놓여 있어.','Sliding Indicator · Press Feedback','.top-actions',['MOT-0015','MOT-0003']),
    lesson('popover','팝오버','Popover','트리거 가까이에서 추가 정보나 작은 조작을 제공하는 보조 표면이야.','색상 설정처럼 본문과 관련 있는 짧은 작업을 제공할 때 적합해.','상단 설정 버튼에서 열리는 색상·재질 팝오버를 강조해.','Fade · Translate','#design-popover',['CMP-0045','MOT-0016'],'popover'),
    lesson('modal','모달 대화상자','Modal Dialog','닫기 전까지 배경 조작을 제한하는 대화상자야.','현재 작업에 대한 확인이나 진행을 위해 집중이 필요할 때 써.','UI2YA 내부의 기본 모달 예시를 실제로 열었어.','Fade · Scale','#tour-modal-example',['CMP-0043','MOT-0001','MOT-0003'],'modal'),
    lesson('scrim','배경 가림막','Scrim / Backdrop','전경과 배경을 구별하도록 뒤쪽을 덮는 층이야.','다이얼로그나 투어를 열 때 뒤쪽 정보를 시각적으로 낮춰.','현재 페이지를 둘러싼 어두운 층과 열린 영역을 함께 봐.','Opacity / Fade','.layout-map',['MOT-0001','LAY-1115']),
    lesson('spotlight','스포트라이트','Spotlight Overlay','주변을 어둡게 하고 지정 영역만 남기는 안내 방식이야.','복잡한 화면에서 지금 설명하는 대상을 정확히 가리킬 때 써.','이 밝은 구역과 경계가 실제 UI 요소를 따라가.','Scrim · Highlight','.layout-map',['LAY-1114','LAY-1116','LAY-1118']),
    lesson('coach','코치 마크','Coach Mark','대상 가까이에서 사용법이나 기능 이름을 설명하는 짧은 안내야.','처음 보는 도구를 문맥 안에서 설명할 때 써.','지금 읽고 있는 제목과 설명이 코치 마크야.','Fade · Scale','.layout-map',['LAY-1115','LAY-1118','PAT-1101']),
    lesson('focus','포커스 링','Focus Ring','현재 키보드 입력을 받는 요소를 나타내는 외곽 표시야.','탭 키로 탐색할 때 위치를 즉시 인지하도록 써.','실제 키보드 포커스를 받은 코치 마크의 닫기 버튼을 봐. 큰 경계는 별도의 Spotlight 표시야.',':focus-visible · Focus Transition','.layout-map',['MOT-0045','CMP-0015']),
    lesson('tour','가이드 투어','Guided Tour / Product Tour','관련 영역을 순서대로 안내하는 학습 흐름이야.','처음 보는 작업공간에서 역할이 나뉜 화면을 단계별로 소개해.','사이드바에서 상단바, 본문, 드로어, 도크 순으로 이동해.','Spotlight Overlay · Coach Mark','.rail',['LAY-1115','LAY-1116']),
    lesson('mode','표시 모드 세그먼트','Segmented Control','서로 배타적인 옵션을 하나의 연결된 컨트롤에서 선택해.','시스템·라이트·다크의 표시 모드처럼 한 값만 사용해.','상단의 세 모드와 이동하는 선택 배경을 봐.','Sliding Indicator','.topbar .u-mode',['CMP-0006','MOT-0015']),
    lesson('color','강조색 견본','Color Swatch','색상 하나를 표시하거나 선택하는 작은 컨트롤이야.','현재 강조색을 확인하고 기본 색상 선택기를 열 때 써.','상단 원형 견본은 OS·브라우저의 네이티브 입력에 연결돼.','색상과 포커스 상태 전환','.topbar .u-color-inline',['CMP-0022','VFX-1102']),
    lesson('search','확장형 검색','Expandable Search / Expanding Search Field','작은 트리거에서 검색 입력란을 펼치는 인터랙션 패턴이야.','상단 도구의 공간을 확보하면서 검색을 제공해.','UI2YA의 검색을 펼쳤어. 폭 전환과 입력으로 이동한 포커스를 관찰해.','Width Expansion · Focus Transition · Ease-out','#global-search',['MOT-0044','MOT-0045','CMP-0017'],'search'),
    lesson('tooltip','툴팁','Tooltip','포인터나 키보드 초점에 반응해 짧은 이름을 표시해.','아이콘의 의미나 축약된 레이블을 설명할 때 써.','검색 버튼은 포커스와 호버에 이름을 보여 줘. 실제 색상 선택은 옆의 견본과 연결돼.','짧은 Fade','#search-expand',['CMP-0046','MOT-0001']),
    lesson('inspector','스티키 인스펙터','Sticky Inspector','선택 항목을 조절하는 패널을 작업 영역 안에서 붙여 두는 배치야.','긴 목록을 보면서 같은 조절 대상을 유지할 때 써.','모션 실험실의 오른쪽 조절 영역에서 볼 수 있어.','CSS position: sticky','#motion-detail',['LAY-0005','MOT-0004']),
    lesson('floating-panel','플로팅 패널','Floating Panel','컨트롤이나 정보를 본문 위에 떠 있는 별도의 패널로 묶어.','현재 작업을 유지하며 도구나 옵션을 가까이 표시할 때 적합해.','상단에서 열린 디자인 설정 패널은 트리거 근처에 떠 있는 예야.','Fade · Translate','#design-popover',['CMP-0045','LAY-1112'],'popover'),
  ];

  const storedLessons = A.lessons.filter(item=>!['sticky','tooltip','mode','color'].includes(item.key));
  storedLessons.forEach((item,index)=>{
    item.id=item.key==='floating-panel'?'LAY-1124':'LAY-'+(1101+index);
    A.layouts.push({
      ...item, kind:'layout', group:index>=13&&index<=17?'화면 안내':'앱 구조',
      aliases:[item.en,item.ko], caution:'실제 화면에서 포커스·위치·동작을 함께 확인해 봐.',
      difficulty:'입문', implementation:'실습 가능', sources:['mdnLayout','position','apg'], lessonKey:item.key
    });
  });
  A.lessons.find(item=>item.key==='sticky').id='LAY-0005';
  Object.assign(A.layouts.find(item=>item.id==='LAY-0005'),{lessonKey:'sticky'});
  const responsive=A.layouts.find(item=>item.key==='responsive');
  responsive.aliases.push('responsive grid','반응형 격자');
  A.layouts.push(
    ...[
      ['LAY-1121','split-demo','분할 보기·크기 조절 패널','Split View / Resizable Panel','두 영역을 같은 화면에서 보고 닫힘이나 크기를 각각 관리해.','한쪽 열 너비를 직접 조절해 두 작업 공간의 배분을 비교해 봐.',['split view','resizable panel','splitter','사이즈 조절']],
      ['LAY-1122','master-detail','목록과 상세','Master–Detail Layout','목록 선택에 따라 옆의 상세 영역이 바뀌는 배치야.','선택 항목을 전환해 목록과 상세가 유지되는 방식을 봐.',['list-detail','목록 상세','선택 상세']],
      ['LAY-1123','collapse-demo','접을 수 있는 사이드바','Collapsible Sidebar','주요 목적지를 좁은 아이콘 레일로 줄이거나 넓은 목록으로 되돌려.','실제 UI2YA 사이드바의 폭을 전환해 봐.',['collapse sidebar','좁은 사이드바']],
    ].map(([id,key,ko,en,definition,use,aliases])=>({
      id,key,ko,en,definition,use,aliases,kind:'layout',group:'작업공간 배치',
      caution:'좁은 화면과 키보드 접근성을 함께 확인해.',difficulty:'중급',implementation:'실습 가능',sources:['mdnLayout'],
    })),
  );
  const extendedTerms = [
    ['VFX-1101','effect','glass-panel','글래스 패널','Glass Panel / Frosted Glass Effect','하나의 패널에 반투명 표면과 배경 흐림을 적용해 뒤쪽 레이어가 비치게 만드는 표현이야.','글래스모피즘은 화면 전반의 디자인 스타일이야. 단일 글래스 패널은 모던 등 다른 스타일에도 적용할 수 있어.','배경과 글자 대비를 확인해. 강한 투명도는 글을 읽기 어렵게 해.',['유리','반투명','glassmorphism','frosted glass']],
    ['VFX-1102','effect','surface-opacity','표면 불투명도','Surface Opacity','표면 색이 뒤의 콘텐츠를 얼마나 덮는지 나타내는 값이야.','글자는 선명하게 두고 표면의 알파만 바꿔 봐.','전체 요소의 opacity를 낮추면 글자 역시 투명해질 수 있어.',['alpha','transparency','불투명도','투명']],
    ['PAT-1101','pattern','contextual-help','문맥 도움말','Contextual Help','지금 보고 있는 기능 가까이에서 도움을 제공하는 패턴이야.','입력 예시, 오류 복구, 처음 쓰는 도구에서 필요한 순간에 안내해.','키보드와 터치로도 읽을 수 있어야 해.',['coach mark','tooltips','문맥 설명']],
  ];
  for(const [id,kind,key,ko,en,definition,use,caution,aliases] of extendedTerms){
    const collection=kind==='effect'?A.effects:A.patterns;
    collection.push({id,kind,key,ko,en,definition,use,caution,aliases,group:kind==='effect'?'재질':'화면 안내',difficulty:'입문',implementation:'실습 가능',sources:kind==='effect'?['mdnBlur','wcag']:['apg']});
  }

  A.componentLessons = {
    segmented:'mode', color:'color', drawer:'drawer', tooltip:'tooltip', modal:'modal',
    sidebar:'sidebar', search:'search', card:'card', popover:'popover',
  };
  A.componentMotions = {
    checkbox:[['MOT-0017','Check Draw'],['MOT-0010','Scale Pop']],
    switch:[['MOT-0015','Thumb Slide'],['MOT-0004','Soft Spring'],['MOT-0046','Color Transition']],
    radio:[['MOT-0010','Dot Scale'],['MOT-0001','Fade']],
    segmented:[['MOT-0015','Sliding Indicator'],['MOT-0029','Crossfade']],
    buttons:[['MOT-0003','Press Scale'],['MOT-0027','Ripple'],['MOT-0047','Hover Lift']],
    text:[['MOT-0045','Focus Ring Transition']],
    search:[['MOT-0044','Width Expansion'],['MOT-0045','Focus Transition']],
    accordion:[['MOT-0013','Expand / Collapse'],['MOT-0008','Chevron Rotate']],
    drawer:[['MOT-0002','Slide In · Ease-out'],['MOT-0004','Spring']],
    modal:[['MOT-0048','Fade + Scale']],
    tooltip:[['MOT-0016','Fade + Translate']], popover:[['MOT-0016','Fade + Translate']],
    progress:[['MOT-0014','Progress Fill']],
    badge:[['MOT-0010','Pop'],['MOT-0020','Count-up']],
    tabs:[['MOT-0015','Sliding Underline'],['MOT-0029','Content Crossfade']],
    card:[['MOT-0013','Card Expansion'],['MOT-0022','3D Tilt']],
  };
})();
