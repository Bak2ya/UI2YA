# UI2YA · 출처 및 권리 관리

## 자료의 역할

UI2YA의 컴포넌트·모션 정의는 일반적인 인터페이스 기술의 명칭과 작동 원리를 설명하는 자체 작성 요약입니다. 실습 코드는 프로젝트에서 별도로 작성한 HTML/CSS/JavaScript 데모입니다.

공식 웹 표준과 디자인 시스템은 정의·용어 및 키보드 동작의 참고 자료입니다. 비교 화면에 포함한 오픈소스 아이콘의 출처와 배포 고지는 아래에서 확인할 수 있습니다.

## 주요 출처

- 비교표에서 열에 아이콘의 역할, 행에 라이브러리 이름을 연결하는 `scope` 사용을 참고했습니다. [W3C WAI · Tables with Two Headers](https://www.w3.org/WAI/tutorials/tables/two-headers/)
- 좁은 화면에서 문서 본문을 다시 배치하고 비교표의 가로 스크롤을 표 안에 두는 기준을 참고했습니다. [W3C · Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- 한글 문구를 어절 단위로 배치하는 `word-break` 속성을 확인했습니다. [W3C · CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#word-break-property)
- W3C WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/patterns/ — 컴포넌트 의미, 키보드 상호작용
- MDN Web Docs: https://developer.mozilla.org/ — CSS transition / Web Animations API / Scroll-driven Animations 등
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/ — 플랫폼 동작·재질
- Microsoft Fluent 2: https://fluent2.microsoft.design/ — 컴포넌트/플랫폼 디자인
- Google Material 3: https://m3.material.io/ — 플랫폼 디자인 시스템
- IBM Carbon: https://carbondesignsystem.com/ — 일반 컴포넌트·기업 인터페이스
- USWDS: https://designsystem.digital.gov/ — 웹 표준 컴포넌트·접근성
- Living UI Design Gallery: https://mdsagormunshi.github.io/UIDesignGallery/ — 스타일 명칭과 분류의 참고, 코드·에셋 직접 전용하지 않음
- 사용자가 제공한 UI 용어 영상 두 개: https://www.youtube.com/watch?v=mlhKEy-2bgI , https://www.youtube.com/watch?v=r7iS0Gw3Jq4 — UI 및 모션 용어 후보 확인 용도(영상·자막 직접 포함하지 않음)

상세 출처 URL, 해당 문서의 이용 범위, 코드 재사용 여부는 `research.js`와 `expansion.js`의 소스 메타데이터에도 관리합니다.

## v0.6 아이콘 자산

SVG 예제 90개와 UI2YA 도구에 쓰는 Lucide 아이콘은 표의 공식 커밋에서 가져왔습니다. 패스 및 선 속성은 유지하면서 앱 표시 크기와 SVG 접근성 속성을 통일했습니다. 아이콘 이용 조건의 전문은 `third-party/`와 앱의 아이콘 라이브러리에 포함됩니다.

| 라이브러리 | 이용 조건 | 원본 커밋과 고지 |
|---|---|---|
| Lucide | ISC 및 일부 Feather MIT | [c1a02a0](https://github.com/lucide-icons/lucide/blob/c1a02a04d4f3f7049d44567d62b8b06cff0b9103/LICENSE) · `third-party/lucide.txt` |
| Tabler Icons | MIT | [85e870d](https://github.com/tabler/tabler-icons/blob/85e870dbe8680c2d6deefd062122d30ef1544a41/LICENSE) · `third-party/tabler.txt` |
| Phosphor | MIT | [2b75f3a](https://github.com/phosphor-icons/core/blob/2b75f3ad12b420c9504ef05df8d2564a28f8500e/LICENSE) · `third-party/phosphor.txt` |
| Heroicons | MIT | [616b7a4](https://github.com/tailwindlabs/heroicons/blob/616b7a4dbbf3d011760af8066262cd5c6b3868f3/LICENSE) · `third-party/hero.txt` |
| Google Material Symbols | Apache 2.0 | [10ecc14](https://github.com/google/material-design-icons/blob/10ecc14790612ca8fd164e3f4ffe9c16fc50d5b7/LICENSE) · `third-party/material.txt` |
| Bootstrap Icons | MIT | [829d2bc](https://github.com/twbs/icons/blob/829d2bc2b87543c7d781c815ca4f0feee8cf9e45/LICENSE) · `third-party/bootstrap.txt` |

## v0.6 인터랙션 검토 자료

- CSS의 sticky와 fixed의 기준 영역을 확인했습니다. [MDN position](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position)
- 포커스 순환, Esc, 포커스 되돌리기와 탭의 방향키 상호작용을 대조했습니다. [W3C APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · [W3C APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- 색상 영역, 견본, 색상환과 입력 필드의 역할을 확인했습니다. [Adobe React Aria ColorArea](https://react-aria.adobe.com/ColorArea)
- 재질 계층과 스타일의 역사·사례를 정리했습니다. [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials) · [Google Android 12와 Material You](https://blog.google/products-and-platforms/platforms/android/android-12/) · [Neubrutalism 사례를 소개한 Michal Malewicz의 글](https://uxdesign.cc/neubrutalism-is-taking-over-the-web-e9d09e0fe441)

## 글래스 예시 배경

`assets/acrylic-ribbon.jpg`는 UI2YA의 표면 비교용으로 기본 ImageGen 도구에서 생성했습니다. 비교 패널과 조작 요소는 HTML 및 CSS로 구현했습니다.

> Create a landscape premium 3D abstract wallpaper for a small interactive material swatch in a professional interface design atlas. Macro photograph of one folded, translucent indigo-to-cobalt acrylic ribbon with a polished ice-cyan edge layered over a soft lavender and blue backdrop; the ribbon curves diagonally from the lower left to the upper right. Strong dark violet and cyan transitions at the center, some lighter icy blue negative area at the upper left, fine realistic refraction and edge highlights, soft studio light, refined and minimal. Rich but restrained color. The wallpaper must have distinct edges visible through a real UI panel that will be layered on it later. Full-bleed landscape composition. No text, lettering, logos, icons, UI, windows, borders, or overlay panels.

## 제외 대상

이 공개 프로젝트에는 Instagram 계정 게시물 전수조사 결과, 유료 프롬프트, 유료 코드 구매 링크, SNS 동영상 및 이미지 사본을 포함하지 않습니다. 원래 제공받은 조사표는 프로젝트에 포함되지 않는 개인 자료로 남겨둡니다.

## 라이선스

프로젝트 자체에 대한 오픈소스 라이선스는 아직 별도로 선택하지 않았습니다. 공용 저장소에 올리더라도 오픈소스 라이선스 표기는 프로젝트 소유자의 결정이 필요합니다. 각 외부 참고 웹사이트의 문서·코드·미디어 이용 조건도 독립적으로 확인해야 합니다.
