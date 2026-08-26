# 코딩으로 집 짓기

프로그램을 만드는 과정을 **집을 짓는 과정**에 비유하여, 코딩을 처음 배우는 사람(중학생 포함)이 쉽게 이해할 수 있는 인터랙티브 교육용 웹사이트입니다.

## 프로젝트 소개

웹사이트, 앱, 게임처럼 우리가 사용하는 프로그램도 집을 짓는 것과 비슷합니다. 먼저 어떤 집이 필요한지 정하고, 설계하고, 기초를 닦고, 방을 만들고, 전기와 수도를 연결합니다.

이 사이트에서는 Python, JavaScript, HTML, CSS, JSON, API, 데이터베이스, SQL, Git 등의 용어를 집의 구조와 건축 과정으로 설명합니다.

## 주요 기능

- **10단계 공사 현장**: 기획안→설계도→기초→뼈대→내부→외관→수도·전기→입주까지 SVG로 집이 쌓이는 과정을 시각화하고, 같은 단계의 코딩 과정을 병렬 설명
- **건축 도구함**: 기술을 종류별(언어, 화면 구조, 디자인, 데이터 형식 등)로 분류하여 카드 형태로 탐색
- **기술 카드**: 각 기술의 비유, 역할, 특징, 오해하기 쉬운 점, 코드 예시 제공
- **할 일 추가 시뮬레이션**: HTML → JavaScript → JSON → API → Python → SQL → DB 흐름을 단계별로 체험
- **단계별 퀴즈**: 각 단계 완료 후 객관식 퀴즈로 개념 확인
- **학습 진행 저장**: `localStorage`에 진행 상태를 저장하여 재방문 시 복원
- **반응형 디자인**: PC, 태블릿, 모바일 모두 지원
- **접근성**: 키보드 조작, `aria-expanded`, 스크린 리더 안내, 움직임 감소 설정 지원

## 파일 구조

```text
coding-house/
├─ index.html          # 메인 HTML (구조만, 콘텐츠는 JS로 생성)
├─ css/
│  └─ style.css        # 반응형 스타일, 기술별 색상, 집 일러스트
├─ js/
│  ├─ data.js          # 학습 단계, 기술 카드, 퀴즈, 시뮬레이션 데이터
│  └─ app.js           # 화면 전환, 상호작용, localStorage 관리
├─ assets/
│  ├─ images/          # 이미지 교체용 플레이스홀더 폴더
│  └─ icons/           # 아이콘 교체용 플레이스홀더 폴더
└─ README.md
```

## 실행 방법

빌드 과정이 필요 없습니다. `index.html` 파일을 브라우저에서 직접 열면 실행됩니다.

```bash
# 방법 1: 파일 직접 열기
# coding-house/index.html을 브라우저에서 열기

# 방법 2: 간단한 로컬 서버 (선택)
cd coding-house
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080 접속
```

## 콘텐츠 수정 방법

### 학습 단계 수정

`js/data.js`의 `APP_DATA.steps` 배열을 편집합니다.

```javascript
{
  id: 1,
  title: '단계 제목',
  architectureLead: '건축 비유 설명',
  architectureItems: ['항목1', '항목2'],
  codingConcepts: ['개념1', '개념2'],
  codingExample: '예시 문장 (선택)',
  keyExplanation: '핵심 설명',
  quiz: {
    question: '퀴즈 질문',
    options: ['선택지1', '선택지2', '선택지3'],
    correctIndex: 0,
    explanation: '해설',
    metaphor: '집 짓기 비유'
  }
}
```

### 퀴즈 수정

각 단계 객체의 `quiz` 필드를 수정합니다. `correctIndex`는 0부터 시작하는 정답 선택지 인덱스입니다.

## 새로운 기술 카드 추가 방법

`js/data.js`의 `APP_DATA.technologies` 배열에 객체를 추가합니다.

```javascript
{
  id: '새기술-id',
  name: '기술 이름',
  category: 'language',        // 필터 ID (language, markup, style, dataformat, database, library, framework, devtools, runtime)
  categoryLabel: '프로그래밍 언어',  // 화면 표시용 분류명
  metaphor: '집 짓기 비유',
  role: '실제 역할',
  features: ['특징1', '특징2'],
  useCases: ['사용 상황1', '사용 상황2'],
  related: ['관련 기술1'],
  misconception: '자주 하는 오해',
  example: '코드 또는 데이터 예시',
  color: 'var(--color-python)'  // CSS 변수 또는 색상값
}
```

새 분류가 필요하면 `APP_DATA.techFilters`에도 필터를 추가합니다.

## 이미지와 아이콘 교체 방법

현재는 CSS 도형과 SVG로 화면을 구성합니다. 이미지를 사용하려면:

1. `assets/images/` 또는 `assets/icons/`에 파일을 추가합니다.
2. `index.html` 또는 `app.js`에서 해당 위치의 SVG/CSS를 `<img>` 태그로 교체합니다.

플레이스홀더 위치:
- 홈 화면 집 일러스트: `app.js`의 `createHouseSVG()`, `createEmptyHouseSVG()` 함수
- 기술 카드 아이콘: `app.js`의 `renderTechCards()` 함수 내 `tech-icon` 요소

## 추후 확장 아이디어

- 검색 기능으로 기술 카드 찾기
- 다국어 지원 (한국어/영어)
- 학습 완료 후 PDF 요약 자리
- 실제 코드 에디터와 연동하는 미니 실습
- 단계별 배지/성취 시스템
- 소셜 공유 기능
- 다크 모드 테마
- 음성 안내(TTS) 지원

## 기술 스택

- HTML5
- CSS3
- Vanilla JavaScript (외부 프레임워크 없음)

## 라이선스

교육용으로 자유롭게 사용 및 수정할 수 있습니다.
