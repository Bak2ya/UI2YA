# UI2YA · Interface & Motion Atlas

UI2YA는 레이아웃, 컴포넌트, 모션의 이름과 동작을 직접 확인하는 한국어 인터랙티브 도감입니다. 예제를 조작해 차이를 비교하고, 마음에 드는 스타일과 모션 설정을 개발 지시문으로 복사할 수 있습니다.

**현재 버전 · v0.7.0 Build 3**

## 주요 기능

| 화면 | 할 수 있는 일 |
| --- | --- |
| 레이아웃 실험실 | 실제 화면에서 헤더·사이드바·드로어의 위치를 찾아보고, 너비에 따라 배치가 달라지는 모습을 확인합니다. |
| 컴포넌트 | 탭, 스위치, 모달, 색상 선택기 등을 직접 조작하고 적용할 모션을 비교합니다. |
| 모션 실험실 | 이징과 지속 시간을 조절하고 타임라인에서 미리 봅니다. 설정은 단독으로 복사하거나 조합할 수 있습니다. |
| UX 패턴 | 여러 화면에서 반복되는 인터랙션의 용도와 사용 예시를 살펴봅니다. |
| 아이콘 라이브러리 | 6개 공식 라이브러리의 90개 아이콘을 역할별로 비교하고, 이용 조건과 정확한 이름을 확인합니다. |

글래스, 모던, 머티리얼, 네오브루탈 스타일을 전환할 수 있습니다. 스타일 설정과 즐겨찾기는 브라우저에 저장됩니다.

## 실행

빠르게 살펴보려면 [UI2YA.html](UI2YA.html)을 다운로드해 브라우저에서 여세요. 스타일, 스크립트, 데모 이미지가 들어 있는 단일 파일입니다.

소스에서 실행하려면 `index.html`이 있는 폴더에서 로컬 서버를 실행한 뒤 브라우저로 접속하세요.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

[로컬 미리보기](http://127.0.0.1:8000/)

소스 수정 후 단일 HTML을 다시 만들려면 Node.js에서 `node build.mjs UI2YA.html`을 실행하세요. 별도의 빌드 패키지 설치는 필요 없습니다.

## GitHub Pages 배포

1. 소스 ZIP을 풀고 `index.html`, `.nojekyll`, `assets/`, `third-party/`를 포함한 파일과 폴더를 기존 구조대로 배포 폴더에 올립니다.
2. 저장소의 **Settings → Pages**에서 **Deploy from a branch**를 선택합니다. 저장소 최상위에 올렸다면 `main`과 `/(root)`를, `docs` 폴더에 올렸다면 해당 브랜치와 `/docs`를 선택합니다.
3. 배포가 끝나면 **Settings → Pages → Visit site**에서 확인합니다. [GitHub Pages 공식 안내](https://docs.github.com/ko/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 출처와 검증

아이콘별 출처와 이용 조건은 [SOURCES.md](SOURCES.md)에서, 라이선스 전문은 [third-party/](third-party/)에서 확인할 수 있습니다. 배포할 때 해당 라이선스 고지를 함께 포함하세요.

[변경 이력](CHANGELOG.md) · [브라우저 검증 기록](VERIFICATION.md)
