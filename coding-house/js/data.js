/**
 * 코딩으로 집 짓기 — 학습 콘텐츠 데이터
 * 단계, 기술 카드, 퀴즈, 시뮬레이션 정보를 관리합니다.
 */
const APP_DATA = {
  totalSteps: 10,

  // 기술 분류 필터 (화면 표시용)
  techFilters: [
    { id: 'all', label: '전체' },
    { id: 'language', label: '언어' },
    { id: 'markup', label: '화면 구조' },
    { id: 'style', label: '디자인' },
    { id: 'dataformat', label: '데이터 형식' },
    { id: 'database', label: '데이터베이스' },
    { id: 'library', label: '라이브러리' },
    { id: 'framework', label: '프레임워크' },
    { id: 'devtools', label: '개발 도구' },
    { id: 'runtime', label: '실행 환경' }
  ],

  steps: [
    {
      id: 1,
      title: '어떤 집을 지을까?',
      architectureLead: '집을 짓기 전에, 어떤 집이 필요한지 먼저 정합니다. 누가 이 집을 사용할지, 어떤 문제를 해결할지 생각하는 단계입니다.',
      architectureItems: [
        '만들고 싶은 집의 목적을 정한다.',
        '누가 이 집을 사용할지 생각한다.',
        '처음에는 작지만 실제로 살 수 있는 집부터 계획한다.'
      ],
      codingConcepts: ['아이디어', '사용자', '문제 정의', '요구사항', '기능', 'MVP'],
      codingExample: '',
      keyExplanation: 'MVP는 처음부터 대저택을 짓는 것이 아니라, 실제로 사용할 수 있는 작은 집부터 만드는 것입니다. 예를 들어 할 일 앱을 만들 때, 처음에는 "할 일 추가"와 "목록 보기"만 있는 간단한 버전부터 시작합니다.',
      quiz: {
        question: 'MVP(최소 기능 제품)는 무엇을 의미할까요?',
        options: [
          '처음부터 모든 기능을 넣은 완성형 프로그램',
          '실제로 사용할 수 있는 가장 작은 기능만 있는 첫 버전',
          '아이디어만 적은 메모장 파일'
        ],
        correctIndex: 1,
        explanation: 'MVP는 "Minimum Viable Product"의 줄임말로, 사용자가 실제로 쓸 수 있는 최소한의 기능만 갖춘 첫 버전을 말합니다.',
        metaphor: '작은 원룸부터 짓고, 필요할 때 방을 더 늘리는 것과 같습니다.'
      }
    },
    {
      id: 2,
      title: '땅 조사하기',
      architectureLead: '집이 세워질 장소와 주변 환경을 조사합니다. 누가 살지, 주변에 어떤 집이 있는지 알아보는 단계입니다.',
      architectureItems: [
        '집이 세워질 장소와 주변 환경을 조사한다.',
        '이웃과 비슷한 집이 있는지 살펴본다.',
        '실제로 살 사람의 필요를 구체적으로 적어본다.'
      ],
      codingConcepts: ['사용자 조사', '페르소나', '사용자 요구', '유저 스토리', '경쟁 서비스 조사'],
      codingExample: '직장인 민수는 중요한 일을 잊지 않도록 휴대폰에서 할 일을 빠르게 등록하고 싶다.',
      keyExplanation: '사용자 조사는 "나는 이렇게 만들고 싶다"가 아니라 "사용자는 무엇이 필요한가"를 찾는 과정입니다. 페르소나는 대표 사용자를 가상의 사람으로 만들어 구체적으로 생각하는 방법입니다.',
      quiz: {
        question: '유저 스토리는 어떤 형식으로 작성할까요?',
        options: [
          '프로그래밍 코드를 작성하는 것',
          '사용자가 원하는 것을 짧은 문장으로 표현하는 것',
          '서버 설정 파일을 만드는 것'
        ],
        correctIndex: 1,
        explanation: '유저 스토리는 "~로서, ~하기를 원한다. 왜냐하면 ~이다" 형식으로 사용자의 필요를 짧게 적는 방법입니다.',
        metaphor: '집을 짓기 전에 "이 집에 살 사람은 이런 방이 필요해요"라고 적는 것과 같습니다.'
      }
    },
    {
      id: 3,
      title: '설계도 그리기',
      architectureLead: '방, 문, 창문의 위치를 설계도에 그립니다. 사람들이 집 안을 어떻게 이동할지도 함께 계획합니다.',
      architectureItems: [
        '방, 문, 창문의 위치를 설계한다.',
        '사람들이 집 안을 어떻게 이동할지 그린다.',
        '간단한 모형으로 먼저 확인한다.'
      ],
      codingConcepts: ['와이어프레임', 'UI', 'UX', '프로토타입', '사용자 흐름', '아키텍처'],
      codingExample: '할 일 앱의 와이어프레임: 상단에 제목, 가운데 입력창과 추가 버튼, 아래에 할 일 목록.',
      keyExplanation: 'UI는 화면에 보이는 버튼, 글자, 색상 같은 겉모습이고, UX는 사용자가 프로그램을 쓸 때 느끼는 전체 경험입니다. 설계도를 그리는 단계에서는 아직 실제 코드를 쓰지 않습니다.',
      quiz: {
        question: '와이어프레임은 무엇일까요?',
        options: [
          '완성된 프로그램의 스크린샷',
          '화면 구조를 간단하게 그린 설계 스케치',
          '데이터베이스 저장 파일'
        ],
        correctIndex: 1,
        explanation: '와이어프레임은 색상과 디자인 없이 화면에 어떤 요소가 어디에 있는지만 보여주는 간단한 설계 그림입니다.',
        metaphor: '집의 방 배치만 그린 흑백 설계도와 같습니다.'
      }
    },
    {
      id: 4,
      title: '도구와 재료 선택하기',
      architectureLead: '어떤 공법과 도구, 자재를 사용할지 정합니다. 목재 집인지, 벽돌 집인지, 어떤 공구를 쓸지 선택하는 단계입니다.',
      architectureItems: [
        '어떤 공법과 도구, 자재를 사용할지 정한다.',
        '미리 만들어진 부품을 쓸지, 처음부터 만들지 결정한다.',
        '작업할 공사 현장과 기본 도구를 준비한다.'
      ],
      codingConcepts: ['프로그래밍 언어', '마크업 언어', '스타일 언어', '데이터 형식', '라이브러리', '프레임워크', '개발 도구', '실행 환경'],
      codingExample: '웹 할 일 앱: HTML(구조) + CSS(디자인) + JavaScript(동작) + JSON(데이터 전달).',
      keyExplanation: '프로그래밍 언어, 마크업 언어, 데이터 형식은 서로 다른 종류입니다. HTML은 "언어"라고 부르지만 일반적인 프로그래밍 언어와는 역할이 다르고, JSON은 프로그래밍 언어가 아니라 데이터를 표현하는 형식입니다.',
      hasToolbox: true,
      quiz: {
        question: 'HTML의 주된 역할은 무엇일까요?',
        options: [
          '화면의 색상과 크기를 꾸민다',
          '웹페이지의 구조(제목, 버튼, 입력창 등)를 만든다',
          '서버에서 데이터를 저장한다'
        ],
        correctIndex: 1,
        explanation: 'HTML은 웹페이지의 뼈대를 만드는 마크업 언어입니다. "여기에 제목이 있고, 여기에 버튼이 있다"를 표현합니다.',
        metaphor: '집의 골조와 방, 문, 창문의 위치를 정하는 설계도와 골조와 같습니다.'
      }
    },
    {
      id: 5,
      title: '기초공사',
      architectureLead: '집을 지탱할 기초와 공사 현장을 준비합니다. 폴더와 파일을 정리하고, 변경 기록을 남길 방법을 세팅합니다.',
      architectureItems: [
        '집을 지탱할 기초와 공사 현장을 준비한다.',
        '필요한 자재 목록을 정리한다.',
        '공사 과정을 기록할 일지를 준비한다.'
      ],
      codingConcepts: ['프로젝트 생성', '폴더 구조', '파일', '환경 설정', '의존성', '버전', 'Git 저장소'],
      codingExample: 'coding-house/ 폴더 안에 index.html, css/, js/ 폴더를 나누어 파일을 정리합니다.',
      keyExplanation: '프로젝트 폴더 구조는 집의 기초와 현장 정리와 같습니다. Git 저장소는 공사 일지를 기록하는 공간으로, 언제 무엇을 바꿨는지 추적할 수 있습니다.',
      quiz: {
        question: 'Git 저장소는 어떤 역할을 할까요?',
        options: [
          '웹페이지의 색상을 바꾼다',
          '프로젝트의 변경 기록을 저장하고 관리한다',
          '데이터베이스에 사용자 정보를 저장한다'
        ],
        correctIndex: 1,
        explanation: 'Git은 코드의 변경 이력을 기록하고, 이전 상태로 되돌리거나 다른 사람과 공유할 수 있게 해주는 도구입니다.',
        metaphor: '공사 과정을 사진과 메모로 기록하는 공사 일지와 같습니다.'
      }
    },
    {
      id: 6,
      title: '골조와 방 만들기',
      architectureLead: '벽과 방을 만들고 필요한 시설을 설치합니다. 프로그램에서는 데이터를 저장하는 변수와 동작을 만드는 함수를 작성합니다.',
      architectureItems: [
        '벽과 방을 만들고 필요한 시설을 설치한다.',
        '같은 방을 여러 곳에서 재사용할 수 있게 만든다.',
        '조건에 따라 다른 동작을 하게 설계한다.'
      ],
      codingConcepts: ['변수', '함수', '조건문', '반복문', '컴포넌트', '모듈', '로직'],
      codingExample: 'function addTodo(text) { todos.push(text); showList(); } — 함수로 "할 일 추가" 동작을 묶습니다.',
      keyExplanation: '변수는 정보를 담는 상자, 함수는 특정 작업을 수행하는 도구입니다. 조건문과 반복문으로 "만약 ~하면" "계속 ~한다" 같은 로직을 만들 수 있습니다.',
      quiz: {
        question: '함수(function)는 무엇일까요?',
        options: [
          '화면에 보이는 버튼의 색상',
          '특정 작업을 묶어서 이름을 붙인 코드 조각',
          '인터넷에서 데이터를 가져오는 배관'
        ],
        correctIndex: 1,
        explanation: '함수는 반복해서 쓰는 코드를 하나로 묶고 이름을 붙여, 필요할 때마다 호출해서 사용하는 방법입니다.',
        metaphor: '전기 스위치 하나로 불을 켜는 것처럼, 함수 하나로 같은 동작을 반복할 수 있습니다.'
      }
    },
    {
      id: 7,
      title: '수도와 전기 연결하기',
      architectureLead: '보이지 않는 배관과 전기 시설을 연결합니다. 화면(프런트엔드)과 서버(백엔드), 데이터 저장소를 연결하는 단계입니다.',
      architectureItems: [
        '보이지 않는 배관과 전기 시설을 연결한다.',
        '집 밖의 창고와 연결 통로를 만든다.',
        '들어오는 사람을 확인하는 보안 장치를 설치한다.'
      ],
      codingConcepts: ['프런트엔드', '백엔드', '서버', 'API', '요청', '응답', 'JSON', '데이터베이스', '인증'],
      codingExample: '사용자가 "우유 사기"를 입력 → JSON으로 변환 → API로 전송 → 서버가 처리 → 데이터베이스에 저장.',
      keyExplanation: '프런트엔드는 사용자가 보는 화면, 백엔드는 뒤에서 데이터를 처리하는 서버입니다. API는 화면과 서버를 연결하는 접수 창구이고, JSON은 그 사이에서 데이터를 담아 운반하는 상자입니다.',
      hasSimulation: true,
      quiz: {
        question: 'JSON은 어떤 역할을 할까요?',
        options: [
          '프로그램의 화면을 디자인한다',
          '데이터를 정해진 형식으로 표현하고 전달한다',
          '코드를 이전 버전으로 되돌린다'
        ],
        correctIndex: 1,
        explanation: 'JSON은 데이터를 { "task": "우유 사기" } 같은 형식으로 표현해서 화면과 서버 사이에서 전달하는 데이터 형식입니다.',
        metaphor: '정보를 담아 운반하는 규격화된 자재 상자와 같습니다.'
      }
    },
    {
      id: 8,
      title: '하자 검사',
      architectureLead: '문, 수도, 전기가 올바르게 작동하는지 검사합니다. 프로그램에서도 버그를 찾고 고치는 단계입니다.',
      architectureItems: [
        '문, 수도, 전기가 올바르게 작동하는지 검사한다.',
        '문제가 있는 부분을 찾아 수리한다.',
        '더 깔끔하게 정리할 수 있는지 확인한다.'
      ],
      codingConcepts: ['테스트', '버그', '디버깅', '오류 메시지', '예외 처리', '리팩터링'],
      codingExample: '추가 버튼을 눌렀을 때 빈 내용이 저장되지 않는지 테스트합니다.',
      keyExplanation: '버그는 프로그램의 오류입니다. 디버깅은 오류를 찾아 고치는 과정이고, 테스트는 의도한 대로 동작하는지 확인하는 검사입니다. 오류 메시지는 문제 위치를 알려주는 신호입니다.',
      quiz: {
        question: '디버깅은 무엇을 하는 과정일까요?',
        options: [
          '프로그램을 인터넷에 공개한다',
          '버그(오류)를 찾아서 고친다',
          '새로운 기능을 추가한다'
        ],
        correctIndex: 1,
        explanation: '디버깅은 프로그램이 예상과 다르게 동작할 때, 원인을 찾아 수정하는 작업입니다.',
        metaphor: '수도관에서 물이 새는 곳을 찾아 수리하는 것과 같습니다.'
      }
    },
    {
      id: 9,
      title: '입주하기',
      architectureLead: '완성된 집을 공개하고 사람들이 사용하게 합니다. 프로그램을 실제 사용자에게 배포하는 단계입니다.',
      architectureItems: [
        '완성된 집을 공개하고 사람들이 사용하게 한다.',
        '집의 주소(도메인)를 정한다.',
        '실제 살 사람들이 들어올 수 있게 준비한다.'
      ],
      codingConcepts: ['빌드', '배포', '호스팅', '도메인', '개발 환경', '운영 환경'],
      codingExample: '개발 환경에서 테스트한 후, 호스팅 서비스에 올려서 https://mytodo.com 같은 주소로 접속할 수 있게 합니다.',
      keyExplanation: '개발 환경은 공사 중인 현장, 운영 환경은 실제 사람들이 쓰는 완성된 집입니다. 배포는 프로그램을 사용자에게 공개하는 과정이고, 호스팅은 프로그램이 살아 있는 서버 공간을 빌리는 것입니다.',
      quiz: {
        question: '배포(deploy)는 무엇일까요?',
        options: [
          '코드를 작성하는 과정',
          '완성된 프로그램을 사용자가 쓸 수 있게 공개하는 것',
          '데이터베이스를 삭제하는 것'
        ],
        correctIndex: 1,
        explanation: '배포는 개발이 끝난 프로그램을 서버에 올려서 실제 사용자가 접속할 수 있게 만드는 과정입니다.',
        metaphor: '완성된 집에 사람들이 입주할 수 있게 문을 열어주는 것과 같습니다.'
      }
    },
    {
      id: 10,
      title: '유지보수와 증축',
      architectureLead: '고장 난 곳을 수리하고 새로운 방을 추가합니다. 프로그램도 계속 업데이트하고 확장합니다.',
      architectureItems: [
        '고장 난 곳을 수리한다.',
        '새로운 방이나 기능을 추가한다.',
        '집 상태를 꾸준히 확인하고 기록을 보관한다.'
      ],
      codingConcepts: ['업데이트', '패치', '모니터링', '로그', '백업', '확장'],
      codingExample: '사용자가 늘어나면 서버를 더 추가하고, 매일 데이터를 백업하여 안전하게 보관합니다.',
      keyExplanation: '프로그램은 한 번 만들고 끝이 아닙니다. 사용자 피드백으로 기능을 추가하고, 오류를 수정하고, 데이터를 백업합니다. 모니터링과 로그는 프로그램이 건강하게 동작하는지 확인하는 일지입니다.',
      quiz: {
        question: '백업은 왜 필요할까요?',
        options: [
          '화면 색상을 바꾸기 위해',
          '데이터가 손실될 때 복구할 수 있도록 복사본을 보관하기 위해',
          '프로그램 실행 속도를 높이기 위해'
        ],
        correctIndex: 1,
        explanation: '백업은 중요한 데이터의 복사본을 따로 보관해서, 문제가 생겼을 때 원래 상태로 되돌릴 수 있게 하는 것입니다.',
        metaphor: '집에 화재가 나면 대비하는 소화기와 보험, 그리고 중요한 물건의 복사본을 같습니다.'
      }
    }
  ],

  technologies: [
  // 프로그래밍 언어
    {
      id: 'python',
      name: 'Python',
      category: 'language',
      categoryLabel: '프로그래밍 언어',
      metaphor: '서버 관리실의 다목적 기술자',
      role: '서버 로직, 데이터 처리, 자동화 등 다양한 작업을 수행합니다.',
      features: ['읽기 쉬운 문법', '다양한 분야에서 활용', '풍부한 라이브러리 생태계'],
      useCases: ['웹 서버 개발', '데이터 분석', '인공지능', '스크립트 자동화'],
      related: ['Django', 'FastAPI', 'Pandas', 'NumPy'],
      misconception: 'Python은 웹 화면을 만드는 언어가 아닙니다. 화면은 HTML/CSS/JavaScript가 담당하고, Python은 주로 서버 쪽에서 동작합니다.',
      example: 'def save_task(task):\n    database.insert(task)',
      color: 'var(--color-python)'
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      category: 'language',
      categoryLabel: '프로그래밍 언어',
      metaphor: '전기와 자동화 장치',
      role: '웹페이지에서 버튼 클릭, 입력 처리, 화면 변경 등 동적인 동작을 만듭니다.',
      features: ['브라우저에서 바로 실행', '비동기 처리', '풍부한 웹 생태계'],
      useCases: ['웹 인터랙션', '폼 검증', 'API 호출', 'SPA 개발'],
      related: ['HTML', 'CSS', 'Node.js', 'React'],
      misconception: 'JavaScript와 Java는 이름이 비슷하지만 완전히 다른 언어입니다.',
      example: 'button.addEventListener("click", () => {\n  addTodo(input.value);\n});',
      color: 'var(--color-js)'
    },
    {
      id: 'java',
      name: 'Java',
      category: 'language',
      categoryLabel: '프로그래밍 언어',
      metaphor: '대형 건물용 견고한 철골 구조',
      role: '안정적인 대규모 시스템, 기업용 애플리케이션을 개발합니다.',
      features: ['객체지향', '높은 안정성', '크로스 플랫폼'],
      useCases: ['기업 백엔드', '안드로이드 앱', '대규모 서비스'],
      related: ['Spring', 'Kotlin'],
      misconception: 'Java는 웹 브라우저에서 직접 실행되지 않습니다. 서버나 앱에서 실행됩니다.',
      example: 'public class Task {\n  private String title;\n}',
      color: 'var(--color-java)'
    },
    {
      id: 'csharp',
      name: 'C#',
      category: 'language',
      categoryLabel: '프로그래밍 언어',
      metaphor: '정밀 설계된 건축 시스템',
      role: 'Windows 앱, 게임, 웹 서비스 등 Microsoft 생태계에서 많이 사용됩니다.',
      features: ['강력한 타입 시스템', 'Unity 게임 개발', '.NET 플랫폼'],
      useCases: ['게임 개발(Unity)', 'Windows 앱', '웹 API'],
      related: ['.NET', 'Unity'],
      misconception: 'C#은 C와 비슷해 보이지만 다른 언어이며, 주로 Microsoft 생태계와 연결됩니다.',
      example: 'public void SaveTask(string task) {\n  _db.Tasks.Add(task);\n}',
      color: 'var(--color-csharp)'
    },
    {
      id: 'sql',
      name: 'SQL',
      category: 'language',
      categoryLabel: '프로그래밍 언어',
      metaphor: '창고 관리자에게 전달하는 요청서',
      role: '데이터베이스에 데이터를 저장, 조회, 수정, 삭제하라고 명령합니다.',
      features: ['데이터 조회에 특화', '표 형태 데이터 처리', '다양한 DB에서 사용'],
      useCases: ['데이터 조회', '저장', '통계 계산', '데이터 수정'],
      related: ['MySQL', 'PostgreSQL', 'SQLite'],
      misconception: 'SQL은 일반적인 앱 로직을 만드는 언어가 아니라, 데이터베이스에 명령을 전달하는 전용 언어입니다.',
      example: 'INSERT INTO tasks (title) VALUES ("우유 사기");',
      color: 'var(--color-sql)'
    },
    // 마크업 언어
    {
      id: 'html',
      name: 'HTML',
      category: 'markup',
      categoryLabel: '마크업 언어',
      metaphor: '설계도와 집의 골조',
      role: '웹페이지의 구조(제목, 문단, 버튼, 입력창 등)를 정의합니다.',
      features: ['구조 표현', '접근성 태그', '웹의 기본'],
      useCases: ['웹페이지 구조', '폼 만들기', '콘텐츠 마크업'],
      related: ['CSS', 'JavaScript'],
      misconception: 'HTML은 일반적인 프로그래밍 언어가 아니라, 웹페이지의 구조를 표현하는 마크업 언어입니다. "if", "for" 같은 로직을 실행하지 않습니다.',
      example: '<input type="text" id="todo">\n<button>추가</button>',
      color: 'var(--color-html)'
    },
    {
      id: 'xml',
      name: 'XML',
      category: 'markup',
      categoryLabel: '마크업 언어',
      metaphor: '항목이 태그로 정리된 서류 상자',
      role: '데이터와 문서를 태그로 구조화하여 표현합니다.',
      features: ['자기 설명적 태그', '다양한 시스템 간 호환', '엄격한 구조'],
      useCases: ['설정 파일', '문서 교환', '레거시 시스템 연동'],
      related: ['HTML', 'JSON'],
      misconception: 'XML과 HTML은 비슷해 보이지만, XML은 주로 데이터를 구조화하는 용도이고 HTML은 웹 화면 구조용입니다.',
      example: '<task id="1">\n  <title>우유 사기</title>\n</task>',
      color: 'var(--color-xml)'
    },
    // 스타일 언어
    {
      id: 'css',
      name: 'CSS',
      category: 'style',
      categoryLabel: '스타일 언어',
      metaphor: '페인트와 인테리어 도구',
      role: '화면의 색상, 크기, 위치, 간격, 애니메이션 등 시각적 스타일을 정합니다.',
      features: ['선택자로 요소 지정', '반응형 디자인', '애니메이션'],
      useCases: ['레이아웃', '색상/폰트', '모바일 대응', '호버 효과'],
      related: ['HTML'],
      misconception: 'CSS는 프로그램의 동작을 바꾸지 않습니다. 보이는 모양만 바꿉니다.',
      example: 'button {\n  background: #4a90d9;\n  padding: 12px 24px;\n}',
      color: 'var(--color-css)'
    },
    // 데이터 형식
    {
      id: 'json',
      name: 'JSON',
      category: 'dataformat',
      categoryLabel: '데이터 형식',
      metaphor: '정보를 담아 운반하는 규격화된 자재 상자',
      role: '화면과 서버 사이에서 데이터를 정해진 형식으로 표현하고 전달합니다.',
      features: ['읽기 쉬운 텍스트 형식', '웹 API에서 널리 사용', '키-값 구조'],
      useCases: ['API 응답', '설정 파일', '데이터 교환'],
      related: ['API', 'JavaScript', 'Python'],
      misconception: 'JSON은 명령을 실행하는 프로그래밍 언어가 아닙니다. 데이터를 표현하는 형식입니다.',
      example: '{ "task": "우유 사기", "done": false }',
      color: 'var(--color-json)'
    },
    {
      id: 'csv',
      name: 'CSV',
      category: 'dataformat',
      categoryLabel: '데이터 형식',
      metaphor: '표 형태로 정리된 자재 목록표',
      role: '스프레드시트처럼 행과 열로 데이터를 저장하고 교환합니다.',
      features: ['간단한 구조', '엑셀 호환', '대량 데이터 처리'],
      useCases: ['데이터보내기', '통계 자료', '간단한 DB 교환'],
      related: ['Pandas', 'Excel'],
      misconception: 'CSV는 프로그래밍 언어나 데이터베이스가 아니라, 데이터를 저장하는 파일 형식입니다.',
      example: 'title,done\n우유 사기,false\n이메일 확인,true',
      color: 'var(--color-csv)'
    },
    {
      id: 'yaml',
      name: 'YAML',
      category: 'dataformat',
      categoryLabel: '데이터 형식',
      metaphor: '사람이 읽기 쉬운 설정 메모',
      role: '설정 파일이나 데이터를 사람이 읽기 쉬운 형태로 표현합니다.',
      features: ['가독성 높음', '계층 구조 표현', '설정 파일에 적합'],
      useCases: ['앱 설정', 'CI/CD 설정', 'Docker 설정'],
      related: ['JSON', 'Docker'],
      misconception: 'YAML은 실행되는 코드가 아니라, 설정 값을 적는 형식입니다.',
      example: 'app:\n  name: TodoApp\n  port: 3000',
      color: 'var(--color-yaml)'
    },
    // 데이터베이스
    {
      id: 'sqlite',
      name: 'SQLite',
      category: 'database',
      categoryLabel: '데이터베이스',
      metaphor: '집 안의 작은 정리 창고',
      role: '파일 하나로 동작하는 가벼운 데이터베이스입니다. 작은 앱에 적합합니다.',
      features: ['설치 간단', '파일 기반', '가벼움'],
      useCases: ['모바일 앱', '작은 웹앱', '로컬 개발', '프로토타입'],
      related: ['SQL', 'Python'],
      misconception: 'SQLite는 서버가 필요 없는 파일형 DB입니다. MySQL처럼 별도 서버를 띄우지 않습니다.',
      example: 'CREATE TABLE tasks (id INTEGER, title TEXT);',
      color: 'var(--color-db)'
    },
    {
      id: 'mysql',
      name: 'MySQL',
      category: 'database',
      categoryLabel: '데이터베이스',
      metaphor: '대형 분류 창고 시스템',
      role: '웹 서비스에서 널리 쓰이는 관계형 데이터베이스입니다.',
      features: ['높은 성능', '널리 사용', '관계형 데이터'],
      useCases: ['웹 서비스', '쇼핑몰', '블로그', '회원 관리'],
      related: ['SQL', 'PHP', 'Python'],
      misconception: 'MySQL은 데이터를 저장하는 창고이지, 화면을 만드는 도구가 아닙니다.',
      example: 'SELECT * FROM tasks WHERE done = 0;',
      color: 'var(--color-db)'
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      categoryLabel: '데이터베이스',
      metaphor: '정밀 분류가 가능한 대형 창고',
      role: '복잡한 데이터와 높은 신뢰성이 필요한 서비스에 사용되는 관계형 DB입니다.',
      features: ['강력한 SQL 지원', '데이터 무결성', '확장 기능'],
      useCases: ['대규모 서비스', '지리 데이터', '금융 시스템'],
      related: ['SQL', 'Python', 'Django'],
      misconception: 'PostgreSQL과 MySQL은 둘 다 관계형 DB이지만, 기능과 특성이 조금 다릅니다.',
      example: 'SELECT title FROM tasks ORDER BY created_at DESC;',
      color: 'var(--color-db)'
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      category: 'database',
      categoryLabel: '데이터베이스',
      metaphor: '유연한 칸막이 없는 대형 창고',
      role: 'JSON과 비슷한 형태로 데이터를 저장하는 NoSQL 데이터베이스입니다.',
      features: ['유연한 스키마', 'JSON 형태 저장', '확장 용이'],
      useCases: ['콘텐츠 관리', '실시간 데이터', '빠른 프로토타입'],
      related: ['JSON', 'Node.js'],
      misconception: 'MongoDB는 표 형태가 아닌 문서 형태로 데이터를 저장합니다. SQL이 필수는 아닙니다.',
      example: '{ "_id": "1", "title": "우유 사기", "done": false }',
      color: 'var(--color-db)'
    },
    // 라이브러리
    {
      id: 'pandas',
      name: 'Pandas',
      category: 'library',
      categoryLabel: '라이브러리',
      metaphor: '데이터를 표로 정리하는 정리 도구 세트',
      role: 'Python에서 표 형태 데이터를 읽고, 정리하고, 분석합니다.',
      features: ['DataFrame 구조', '데이터 필터링', 'CSV/Excel 연동'],
      useCases: ['데이터 분석', '통계', '데이터 정리'],
      related: ['Python', 'NumPy'],
      misconception: 'Pandas는 Python 라이브러리이지, 독립적인 프로그래밍 언어가 아닙니다.',
      example: 'df = pd.read_csv("tasks.csv")\ndf.head()',
      color: 'var(--color-lib)'
    },
    {
      id: 'numpy',
      name: 'NumPy',
      category: 'library',
      categoryLabel: '라이브러리',
      metaphor: '숫자 계산용 고속 공구 세트',
      role: 'Python에서 대량의 숫자 데이터를 빠르게 계산합니다.',
      features: ['배열 연산', '수학 함수', '고속 계산'],
      useCases: ['과학 계산', '머신러닝 기초', '행렬 연산'],
      related: ['Python', 'Pandas'],
      misconception: 'NumPy는 Python 안에서 쓰는 도구이지, Python을 대체하지 않습니다.',
      example: 'import numpy as np\narr = np.array([1, 2, 3])',
      color: 'var(--color-lib)'
    },
    {
      id: 'axios',
      name: 'Axios',
      category: 'library',
      categoryLabel: '라이브러리',
      metaphor: 'API 접수 창구에 요청을 전달하는 전문 배달원',
      role: 'JavaScript에서 서버 API에 HTTP 요청을 쉽게 보냅니다.',
      features: ['Promise 기반', '요청/응답 변환', '에러 처리'],
      useCases: ['API 호출', '데이터 가져오기', '폼 전송'],
      related: ['JavaScript', 'API', 'JSON'],
      misconception: 'Axios는 서버를 만드는 도구가 아니라, 서버에 요청을 보내는 클라이언트 도구입니다.',
      example: 'axios.post("/api/tasks", { task: "우유 사기" });',
      color: 'var(--color-lib)'
    },
    {
      id: 'chartjs',
      name: 'Chart.js',
      category: 'library',
      categoryLabel: '라이브러리',
      metaphor: '데이터를 그래프로 그리는 설계 도구',
      role: 'JavaScript로 차트와 그래프를 화면에 그립니다.',
      features: ['다양한 차트 유형', '애니메이션', '반응형'],
      useCases: ['통계 대시보드', '데이터 시각화', '보고서'],
      related: ['JavaScript', 'JSON'],
      misconception: 'Chart.js는 데이터를 저장하지 않습니다. 이미 있는 데이터를 그래프로 보여줍니다.',
      example: 'new Chart(ctx, {\n  type: "bar",\n  data: chartData\n});',
      color: 'var(--color-lib)'
    },
    // 프레임워크
    {
      id: 'react',
      name: 'React',
      category: 'framework',
      categoryLabel: '프레임워크',
      metaphor: '조립식 방 부품 시스템',
      role: '화면을 컴포넌트 단위로 나누어 조립하는 UI 라이브러리입니다.',
      features: ['컴포넌트 기반', '가상 DOM', '큰 생태계'],
      useCases: ['웹 앱 UI', 'SPA', '대화형 화면'],
      related: ['JavaScript', 'Next.js'],
      misconception: 'React는 공식적으로 라이브러리로 분류되지만, 실제 프로젝트에서는 화면 개발의 중심 구조로 활용되는 경우가 많습니다.',
      example: 'function TodoItem({ task }) {\n  return <li>{task}</li>;\n}',
      color: 'var(--color-framework)'
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'framework',
      categoryLabel: '프레임워크',
      metaphor: 'React 집을 더 빨리 짓는 건축 시스템',
      role: 'React 기반으로 페이지 구조, 서버 기능, 배포를 한꺼번에 제공합니다.',
      features: ['SSR/SSG', '파일 기반 routing', 'API Routes'],
      useCases: ['풀스택 웹앱', '블로그', '상용 웹 서비스'],
      related: ['React', 'JavaScript', 'Node.js'],
      misconception: 'Next.js는 React를 대체하지 않습니다. React 위에서 동작하는 프레임워크입니다.',
      example: 'export default function Page() {\n  return <h1>할 일 앱</h1>;\n}',
      color: 'var(--color-framework)'
    },
    {
      id: 'django',
      name: 'Django',
      category: 'framework',
      categoryLabel: '프레임워크',
      metaphor: 'Python으로 집 전체를 설계하는 건축 시스템',
      role: 'Python으로 웹 서버, DB 연동, 관리 페이지를 빠르게 만듭니다.',
      features: ['ORM', '관리자 페이지', '보안 기능'],
      useCases: ['웹 서비스 백엔드', 'CMS', 'API 서버'],
      related: ['Python', 'PostgreSQL'],
      misconception: 'Django는 화면 디자인 도구가 아니라, 서버 쪽 기능을 만드는 프레임워크입니다.',
      example: 'class Task(models.Model):\n    title = models.CharField(max_length=200)',
      color: 'var(--color-framework)'
    },
    {
      id: 'fastapi',
      name: 'FastAPI',
      category: 'framework',
      categoryLabel: '프레임워크',
      metaphor: '빠른 API 접수 창구 시스템',
      role: 'Python으로 빠르고 현대적인 API 서버를 만듭니다.',
      features: ['높은 성능', '자동 문서 생성', '타입 힌트'],
      useCases: ['REST API', 'ML 모델 서빙', '마이크로서비스'],
      related: ['Python', 'JSON'],
      misconception: 'FastAPI는 프런트엔드 화면을 만들지 않습니다. API 서버를 만드는 도구입니다.',
      example: '@app.post("/tasks")\ndef create_task(task: TaskModel):\n    return save(task)',
      color: 'var(--color-framework)'
    },
    {
      id: 'spring',
      name: 'Spring',
      category: 'framework',
      categoryLabel: '프레임워크',
      metaphor: '대형 건물용 Java 건축 프레임',
      role: 'Java/Kotlin으로 엔터프라이즈급 백엔드 시스템을 구축합니다.',
      features: ['모듈 구조', '보안', '대규모 지원'],
      useCases: ['기업 백엔드', '은행 시스템', '대규모 API'],
      related: ['Java', 'Kotlin'],
      misconception: 'Spring은 Java 전용입니다. Python이나 JavaScript 프로젝트에는 사용하지 않습니다.',
      example: '@RestController\npublic class TaskController {\n  // API endpoints\n}',
      color: 'var(--color-framework)'
    },
    // 개발 도구
    {
      id: 'vscode',
      name: 'VS Code',
      category: 'devtools',
      categoryLabel: '개발 도구',
      metaphor: '모든 공구가 있는 작업실',
      role: '코드를 작성, 편집, 실행하고 디버깅하는 통합 편집기입니다.',
      features: ['확장 프로그램', '터미널 내장', 'Git 연동'],
      useCases: ['코드 작성', '디버깅', '프로젝트 관리'],
      related: ['Git', '터미널'],
      misconception: 'VS Code는 프로그래밍 언어가 아니라, 코드를 작성하는 편집 도구입니다.',
      example: '// VS Code에서 파일을 열고\n// 코드를 작성하고 저장합니다',
      color: 'var(--color-devtools)'
    },
    {
      id: 'git',
      name: 'Git',
      category: 'devtools',
      categoryLabel: '개발 도구',
      metaphor: '공사 과정을 기록하는 공사 일지',
      role: '코드의 변경 이력을 기록하고, 이전 상태로 되돌리거나 병합합니다.',
      features: ['버전 관리', '브랜치', '협업 지원'],
      useCases: ['변경 기록', '협업', '백업', '배포 준비'],
      related: ['GitHub', 'VS Code'],
      misconception: 'Git과 GitHub는 같은 것이 아닙니다. Git은 로컬에서 동작하는 도구이고, GitHub는 Git 저장소를 온라인에 보관하는 서비스입니다.',
      example: 'git add .\ngit commit -m "할 일 추가 기능"\ngit push',
      color: 'var(--color-git)'
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'devtools',
      categoryLabel: '개발 도구',
      metaphor: '설계도와 기록을 공유하는 공동 보관소',
      role: 'Git 저장소를 온라인에 올려 팀과 공유하고 협업합니다.',
      features: ['원격 저장소', 'Pull Request', '이슈 관리'],
      useCases: ['코드 공유', '오픈소스', '팀 협업', 'CI/CD'],
      related: ['Git'],
      misconception: 'GitHub 없이도 Git은 사용할 수 있습니다. GitHub는 Git을 더 편하게 공유하는 웹 서비스입니다.',
      example: 'https://github.com/user/todo-app',
      color: 'var(--color-git)'
    },
    {
      id: 'terminal',
      name: '터미널',
      category: 'devtools',
      categoryLabel: '개발 도구',
      metaphor: '텍스트로 명령하는 현장 지휘 장치',
      role: '키보드로 명령을 입력하여 파일, 프로그램, 서버를 조작합니다.',
      features: ['명령어 실행', '스크립트 자동화', '서버 관리'],
      useCases: ['파일 관리', 'Git 명령', '서버 실행', '패키지 설치'],
      related: ['Git', 'Node.js', 'Python'],
      misconception: '터미널은 프로그래밍 언어가 아니라, 컴퓨터에 명령을 내리는 인터페이스입니다.',
      example: '$ npm install\n$ python main.py\n$ git status',
      color: 'var(--color-devtools)'
    },
    // 실행 환경
    {
      id: 'browser',
      name: '웹 브라우저',
      category: 'runtime',
      categoryLabel: '실행 환경',
      metaphor: '웹 집을 보여주는 창문과 무대',
      role: 'HTML, CSS, JavaScript를 실행하여 웹페이지를 화면에 보여줍니다.',
      features: ['HTML/CSS/JS 실행', '개발자 도구', '쿠키/캐시'],
      useCases: ['웹사이트 접속', '웹앱 실행', '프런트엔드 테스트'],
      related: ['HTML', 'CSS', 'JavaScript'],
      misconception: '브라우저는 웹페이지를 "만드는" 도구가 아니라, 만들어진 페이지를 "실행하고 보여주는" 환경입니다.',
      example: 'Chrome, Firefox, Safari에서\nindex.html을 열면 실행됩니다.',
      color: 'var(--color-runtime)'
    },
    {
      id: 'python-runtime',
      name: 'Python 실행 환경',
      category: 'runtime',
      categoryLabel: '실행 환경',
      metaphor: 'Python 기술자가 일하는 관리실',
      role: 'Python 코드를 실제로 실행하는 환경입니다.',
      features: ['인터프리터', '가상환경', '패키지 관리'],
      useCases: ['서버 실행', '스크립트', '데이터 분석'],
      related: ['Python', 'pip'],
      misconception: 'Python 코드는 브라우저에서 실행되지 않습니다. Python 실행 환경이 필요합니다.',
      example: '$ python server.py\n# Python 코드가 서버에서 실행됩니다',
      color: 'var(--color-runtime)'
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'runtime',
      categoryLabel: '실행 환경',
      metaphor: 'JavaScript가 브라우저 밖에서 일하는 작업장',
      role: 'JavaScript를 브라우저 밖(서버, 터미널)에서 실행할 수 있게 합니다.',
      features: ['서버 사이드 JS', 'npm 생태계', '비동기 I/O'],
      useCases: ['API 서버', '빌드 도구', 'CLI 도구'],
      related: ['JavaScript', 'npm', 'Express'],
      misconception: 'JavaScript는 언어이고, Node.js는 JavaScript를 브라우저 밖에서 실행하는 환경입니다. 둘은 다릅니다.',
      example: '$ node server.js\n// JavaScript가 서버에서 실행됩니다',
      color: 'var(--color-runtime)'
    }
  ],

  simulationSteps: [
    {
      step: 1,
      tech: 'HTML',
      techColor: 'var(--color-html)',
      title: '사용자 입력',
      description: '사용자가 HTML 입력창에 "우유 사기"를 입력합니다. HTML은 화면에 입력창과 버튼의 구조를 만듭니다.',
      highlight: 'input'
    },
    {
      step: 2,
      tech: 'JavaScript',
      techColor: 'var(--color-js)',
      title: '클릭 감지',
      description: 'JavaScript가 "추가" 버튼 클릭을 감지합니다. 입력창의 내용을 읽어옵니다.',
      highlight: 'button'
    },
    {
      step: 3,
      tech: 'JSON',
      techColor: 'var(--color-json)',
      title: '데이터 포장',
      description: '입력 내용을 JSON 상자에 담습니다. { "task": "우유 사기" } 형태로 정리합니다.',
      highlight: 'json'
    },
    {
      step: 4,
      tech: 'API',
      techColor: 'var(--color-api)',
      title: 'API 전달',
      description: 'JSON 상자를 API 접수 창구로 전달합니다. 화면과 서버를 연결하는 통로입니다.',
      highlight: 'api'
    },
    {
      step: 5,
      tech: 'Python',
      techColor: 'var(--color-python)',
      title: '서버 처리',
      description: 'Python 서버가 요청 내용을 확인하고, 데이터가 올바른지 검사한 뒤 처리합니다.',
      highlight: 'server'
    },
    {
      step: 6,
      tech: 'SQL',
      techColor: 'var(--color-sql)',
      title: '저장 요청',
      description: 'SQL이 데이터베이스 창고 관리자에게 "이 할 일을 저장해 주세요"라고 요청합니다.',
      highlight: 'sql'
    },
    {
      step: 7,
      tech: '데이터베이스',
      techColor: 'var(--color-db)',
      title: '데이터 저장',
      description: '데이터베이스 창고에 "우유 사기" 할 일이 안전하게 저장됩니다.',
      highlight: 'database'
    },
    {
      step: 8,
      tech: 'API',
      techColor: 'var(--color-api)',
      title: '결과 반환',
      description: '저장 완료 결과가 API를 통해 다시 화면 쪽으로 돌아옵니다.',
      highlight: 'api'
    },
    {
      step: 9,
      tech: 'JavaScript',
      techColor: 'var(--color-js)',
      title: '화면 업데이트',
      description: 'JavaScript가 받은 결과로 화면의 할 일 목록을 새로 그립니다.',
      highlight: 'list'
    }
  ]
};

// Node/모듈 환경이 아닌 브라우저에서 전역으로 사용
if (typeof window !== 'undefined') {
  window.APP_DATA = APP_DATA;
}
