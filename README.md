# UI2YA · Interface & Motion Atlas

**v0.7.0 · Build 3**  
UI의 이름과 실제 동작을 발견하고, 원하는 설정을 개발 지시문에 담는 한국어 인터랙티브 백과사전.

## 바로 열기

[UI2YA.html](UI2YA.html)을 브라우저에서 열어요. 스타일, 스크립트, 비교용 이미지와 아이콘이 내장된 단일 파일이에요. 시스템 색상 입력과 스포이트는 브라우저·운영체제의 지원에 따라 외형과 이용 가능 여부가 달라져요.

## 사용하는 순서

1. **레이아웃 실험실**의 구조 지도나 가이드 투어에서 실제 UI2YA의 Sidebar, Header, Drawer를 찾아봐요. 헤더와 사이드바 카드에서 화면 구성을 바꾸고, 반응형 실습에서 너비에 따라 본문 배치가 변하는 모습을 확인해요.
2. **컴포넌트** 탭에서 적용할 모션을 고르고 카드에 보이는 예제를 직접 조작해요. 색상 선택기의 열 가지 방식은 값을 공유해요.
3. **모션 실험실** 왼쪽 목록에서 미리 본 뒤 오른쪽에서 프리셋, 이징, 타임라인을 다뤄요. 사용할 모션의 현재 설정을 복사하거나 조합기에 담아요.
4. **아이콘 라이브러리**에서 공식 사이트와 이용 조건을 먼저 확인하고, 라이브러리별 예시를 비교해요. 표에서 아이콘을 누르면 이름 복사와 원본 링크가 열려요.

## 분리 소스 및 배포

- 로컬 정적 서버로 이 폴더를 열면 `index.html`이 실행돼요.
- 단일 파일을 다시 만들려면 이 폴더에서 `node build.mjs UI2YA.html`을 실행해요. 런타임 패키지 설치는 필요 없어요.
- GitHub Pages에는 소스 ZIP의 내용과 숨김 파일 `.nojekyll`까지 같은 위치에 올려요. 저장소의 Pages 설정에서 브랜치와 해당 폴더를 선택하면 `index.html`을 서비스할 수 있어요.
- `third-party/`의 아이콘 라이선스 고지는 소스에 함께 보관해요. 앱의 아이콘 라이브러리와 [출처 기록](SOURCES.md)에도 출처를 정리했어요.

## 검사와 파일 구조

Playwright와 Chromium을 설치한 환경에서 `node tests/smoke.mjs`를 실행해요. 테스트가 생성하는 서버는 해당 컴퓨터의 루프백에만 연결돼요. 기존 Chrome을 쓰려면 `UI2YA_CHROMIUM`에 실행 파일 경로를 지정해요. `UI2YA_SCREENSHOTS`에 폴더를 지정하면 주요 화면을 캡처해요. [검증 보고서](VERIFICATION.md)

| 파일 | 역할 |
|---|---|
| `index.html`, `v06.css`, `v03.js` | 앱 셸, 테마 도구, 스타일 설명과 디자인 설정 |
| `layout-lab.js`, `experience-data.js` | 레이아웃 데모와 Spotlight·Coach Mark |
| `components.js`, `component-motion.js`, `colors.js` | 컴포넌트 실습, 조작 모션, 색상 비교 |
| `motion.js`, `motion-workspace.js`, `presets.js` | 모션 계산, 목록·조절 화면, 프리셋 |
| `icon-library.js`, `icon-assets.js`, `third-party/` | 공식 아이콘 비교 데이터와 고지 |
| `catalog.js`, `research.js`, `expansion.js`, `app.js` | 용어, 출처, 탐색, 저장, 검색, 프롬프트 |

스타일·즐겨찾기·프롬프트와 모션 조절값은 브라우저의 로컬 저장소에 기록돼요. [변경 이력](CHANGELOG.md)
