'use strict';
(() => {
  const A=window.Atlas;
  // Curated, independent starting values. Not copied from any commercial animation pack.
  A.presets=[
    {id:'PST-001',name:'Subtle Fade',ko:'은은한 등장',motion:'MOT-0001',duration:260,easing:'out',trigger:'onEnter',description:'본문과 보조 요소가 자연스럽게 나타나는 기본 효과'},
    {id:'PST-002',name:'Quick Slide',ko:'빠른 슬라이드',motion:'MOT-0002',duration:230,easing:'out',trigger:'onOpen',description:'드로어와 작은 메뉴의 명확한 진입'},
    {id:'PST-003',name:'Soft Spring',ko:'부드러운 스프링',motion:'MOT-0004',duration:680,stiffness:160,damping:20,mass:1,velocity:0,trigger:'onChange',description:'강한 반동 없이 부드럽게 수렴하는 전환'},
    {id:'PST-004',name:'Snappy Spring',ko:'경쾌한 스프링',motion:'MOT-0004',duration:510,stiffness:270,damping:24,mass:1,velocity:0,trigger:'onSelect',description:'탭 선택과 짧은 위치 이동'},
    {id:'PST-005',name:'Gentle Bounce',ko:'가벼운 바운스',motion:'MOT-0005',duration:550,easing:'out',trigger:'onSuccess',description:'작업 완료를 짧게 강조'},
    {id:'PST-006',name:'Press Feedback',ko:'누름 피드백',motion:'MOT-0003',duration:150,easing:'out',trigger:'onPress',description:'버튼이 가볍게 눌리는 시각적 감각'},
    {id:'PST-007',name:'Smooth Reflow',ko:'자연스러운 재배치',motion:'MOT-0025',duration:320,easing:'out',trigger:'onReorder',description:'목록 항목의 위치가 자연스럽게 이동'},
    {id:'PST-008',name:'Stagger Reveal',ko:'순차 등장',motion:'MOT-0007',duration:460,easing:'out',trigger:'onEnter',description:'여러 항목이 일정 간격으로 차례로 등장'},
    {id:'PST-009',name:'Shared Element',ko:'연결 전환',motion:'MOT-0028',duration:360,easing:'inout',trigger:'onNavigate',description:'상세 화면으로 이동할 때 연결감 부여'},
    {id:'PST-010',name:'Check Draw',ko:'체크 그리기',motion:'MOT-0017',duration:320,easing:'out',trigger:'onChecked',description:'체크와 완료 상태를 짧게 표현'},
    {id:'PST-011',name:'Soft Morph',ko:'부드러운 형태 변경',motion:'MOT-0012',duration:390,easing:'inout',trigger:'onChange',description:'버튼과 아이콘의 형태 변화'},
    {id:'PST-012',name:'Gentle Shimmer',ko:'은은한 쉬머',motion:'MOT-0024',duration:1100,easing:'linear',trigger:'whileLoading',description:'로딩 영역의 은은한 광택 이동'},
    {id:'PST-013',name:'Quick Fade',ko:'빠른 페이드',motion:'MOT-0001',duration:150,easing:'out',opacity:0,trigger:'onEnter',description:'작은 메뉴나 도움말의 짧은 등장'},
    {id:'PST-014',name:'Slow Fade',ko:'느린 페이드',motion:'MOT-0001',duration:630,easing:'inout',opacity:0,trigger:'onEnter',description:'큰 표면이 천천히 드러남'},
    {id:'PST-015',name:'Gentle Spring',ko:'차분한 스프링',motion:'MOT-0004',duration:820,stiffness:95,damping:22,mass:1,velocity:0,trigger:'onChange',description:'반동을 작게 유지하는 위치 전환'},
    {id:'PST-016',name:'Search Expand',ko:'검색 펼치기',motion:'MOT-0044',duration:220,easing:'out',width:240,trigger:'onOpen',description:'검색 입력란을 상단 도구막대에서 펼침'},
  ];
  // Reject invalid references without silently aliasing to a different technique.
  A.presets=A.presets.filter(p=>A.motions.some(m=>m.id===p.motion));
})();
