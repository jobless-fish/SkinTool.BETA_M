# Skin Tool — 모바일 버전 (PWA)

좀보이드 차량 스킨 뷰어. 설치 없이 브라우저에서 열리고,
홈 화면에 추가하면 앱처럼 전체 화면으로 동작합니다.

## 올리는 법

1. GitHub에 새 저장소를 만듭니다 (예: `skin-tool`) — 빈 저장소로
2. 이 폴더의 **내용물**을 저장소 루트에 넣습니다
3. 푸시합니다

```bash
git init
git add -A
git commit -m "Skin Tool PWA"
git branch -M main
git remote add origin https://github.com/<계정>/skin-tool.git
git push -u origin main
```

4. Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)`
5. `https://<계정>.github.io/skin-tool/` 에서 열립니다

기존 포트폴리오 저장소는 건드리지 않습니다. 프로젝트 사이트는 개수 제한이 없습니다.

## 홈 화면에 추가

- **아이폰**: 사파리로 접속 → 공유 버튼 → "홈 화면에 추가"
- **안드로이드**: 크롬으로 접속 → 메뉴 → "앱 설치"

추가하면 주소창 없이 전체 화면으로 뜹니다.

## 용량

| | |
|---|---|
| 첫 화면 | 1.6 MB |
| 차량 1대당 | 0.4 ~ 5.3 MB (평균 1.6) |
| 전부 둘러본 뒤 | 37 MB |

차량은 고를 때 하나씩 받고 캐시에 남습니다. 한 번 본 차량은
그 뒤로 네트워크 없이 열립니다.

## 고친 뒤 다시 올릴 때

`sw.js` 맨 위의 `CACHE` 값을 바꿔주세요.

```js
const CACHE = 'skin-tool-v2';   // v1 -> v2
```

이 값이 그대로면 사용자 기기에 남은 옛 파일이 계속 쓰입니다.
바꾸면 다음 접속 때 옛 캐시를 버리고 새로 받습니다.

## 파일

```
index.html          뷰어 본체
manifest.json       앱 이름·아이콘·전체화면 설정
sw.js               서비스 워커 (캐시)
icons/              홈 화면 아이콘
vendor/             three.js 번들
vehicles/           차량 데이터
.nojekyll           GitHub Pages의 Jekyll 처리 끄기
```

## 참고

- HTTPS에서만 동작합니다. GitHub Pages는 기본으로 붙습니다.
- 로컬에서 볼 때는 `python -m http.server` 로 여세요.
  파일을 더블클릭하면 서비스 워커가 등록되지 않습니다.
