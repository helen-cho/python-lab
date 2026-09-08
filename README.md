# 문서자동화 학습 웹사이트

AI 문서자동화 학습을 위한 Express + EJS 웹사이트입니다.

## 기술 스택

- **웹 서버:** Express + EJS
- **디자인:** Tailwind CSS CDN, Lucide Icons CDN
- **색상 테마:** 네이비·블루 계열 (shadcn/ui 스타일 버튼·카드)

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

## 페이지 구성

| 경로 | 메뉴 |
|------|------|
| `/` | 메인 (히어로, 네비, 푸터) |
| `/learning-examples` | 학습예시 |
| `/prompt-templates` | 프롬프트템플릿 |
| `/document-summary` | 문서요약분류 |
| `/document-generation` | 문서자동생성 |
| `/data-cleaning` | 데이터정제 |
| `/data-analysis` | 데이터분석 |

## 로딩 UI

긴 작업 시 전역 스피너를 표시합니다.

```html
<button data-loading-trigger data-loading-message="처리 중...">실행</button>
```

```javascript
AppLoading.show('데이터를 불러오는 중...');
AppLoading.hide();
```
