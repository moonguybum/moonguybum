/**
 * 코딩으로 집 짓기 — 앱 로직
 * 화면 전환, 학습 진행, 퀴즈, 시뮬레이션, localStorage 관리
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'coding-house-progress';

  // 상태 관리
  const state = {
    currentView: 'home',
    currentStep: 1,
    completedSteps: [],
    quizAnswered: {},
    currentFilter: 'all',
    simStep: 0,
    todos: [],
    returnFromToolbox: 4,
    returnFromSimulation: 9
  };

  // DOM 요소
  const elements = {};

  /** localStorage에서 진행 상태 불러오기 */
  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        state.currentStep = data.currentStep || 1;
        state.completedSteps = data.completedSteps || [];
        state.quizAnswered = data.quizAnswered || {};
      }
    } catch (e) {
      console.warn('진행 상태를 불러오지 못했습니다.');
    }
  }

  /** localStorage에 진행 상태 저장 */
  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        quizAnswered: state.quizAnswered
      }));
    } catch (e) {
      console.warn('진행 상태를 저장하지 못했습니다.');
    }
  }

  /** 접근성 안내 메시지 */
  function announce(message) {
    const announcer = elements.ariaAnnouncer;
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => { announcer.textContent = message; }, 50);
    }
  }

  /** 집 공사 현장 SVG — HouseVisual 모듈 사용 */
  function renderConstructionTheater(stepId) {
    const theater = elements.theaterStage;
    const timelineWrap = elements.constructionTimelineWrap;
    if (!theater) return;

    theater.innerHTML = HouseVisual.createConstructionScene(stepId, stepId);

    if (timelineWrap) {
      timelineWrap.innerHTML = HouseVisual.createTimeline(stepId, state.completedSteps);
    }
  }

  /** 홈 화면 집 비교 일러스트 */
  function updateHomeHouseVisuals() {
    const before = elements.houseBefore;
    const after = elements.houseAfter;
    if (before) before.innerHTML = HouseVisual.createEmptySite();
    if (after) {
      after.innerHTML = HouseVisual.createFinishedSite();
    }
  }

  /** 진행률 계산 */
  function getProgressPercent() {
    return Math.round((state.completedSteps.length / APP_DATA.totalSteps) * 100);
  }

  /** 홈 화면 진행률 업데이트 */
  function updateHomeProgress() {
    const percent = getProgressPercent();
    const fill = elements.homeProgressFill;
    const text = elements.homeProgressText;
    const bar = elements.homeProgressBar;
    const headerText = elements.headerProgressText;

    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${state.completedSteps.length} / ${APP_DATA.totalSteps} 단계 완료`;
    if (bar) bar.setAttribute('aria-valuenow', String(percent));
    if (headerText) headerText.textContent = `${percent}%`;

    // 단계 도트
    const dotsContainer = elements.homeStepDots;
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 1; i <= APP_DATA.totalSteps; i++) {
        const dot = document.createElement('span');
        dot.className = 'step-dot';
        if (state.completedSteps.includes(i)) dot.classList.add('completed');
        if (i === state.currentStep && state.currentView !== 'home') dot.classList.add('current');
        dot.textContent = String(i);
        dot.setAttribute('aria-label', `${i}단계${state.completedSteps.includes(i) ? ' 완료' : ''}`);
        dotsContainer.appendChild(dot);
      }
    }

    // 집 비교 일러스트
    updateHomeHouseVisuals();
  }

  /** 화면 전환 */
  function showView(viewName) {
    const views = ['home', 'step', 'toolbox', 'simulation'];
    views.forEach((v) => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.toggle('hidden', v !== viewName);
    });
    state.currentView = viewName;
  }

  /** 단계 목록 사이드바 렌더 */
  function renderStepList() {
    const list = elements.stepList;
    if (!list) return;
    list.innerHTML = '';

    APP_DATA.steps.forEach((step) => {
      const li = document.createElement('li');
      li.className = 'step-list-item';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'step-list-btn';
      if (step.id === state.currentStep) btn.classList.add('active');
      if (state.completedSteps.includes(step.id)) btn.classList.add('completed');

      const num = document.createElement('span');
      num.className = 'step-num';
      num.textContent = String(step.id);

      const label = document.createElement('span');
      label.textContent = step.title;

      btn.appendChild(num);
      btn.appendChild(label);
      btn.addEventListener('click', () => goToStep(step.id));

      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  /** 단계 콘텐츠 렌더 */
  function renderStepContent(stepId) {
    const step = APP_DATA.steps.find((s) => s.id === stepId);
    if (!step) return;

    state.currentStep = stepId;

    elements.stepIndicator.textContent = `${stepId}단계 / ${APP_DATA.totalSteps}단계`;
    elements.stepTitle.textContent = step.title;

    // 공사 현장 시각화
    renderConstructionTheater(stepId);

    if (elements.theaterPhaseLabel) {
      elements.theaterPhaseLabel.textContent = step.houseStageLabel || '';
    }

    // 병렬 패널 — 집 짓기
    if (elements.houseStageLabel) elements.houseStageLabel.textContent = step.houseStageLabel || '';
    if (elements.houseNowText) elements.houseNowText.textContent = step.houseNow || '';

    elements.architectureList.innerHTML = '';
    step.architectureItems.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      elements.architectureList.appendChild(li);
    });

    // 병렬 패널 — 코딩
    if (elements.codingParallelTitle) elements.codingParallelTitle.textContent = step.codingParallelTitle || '';
    if (elements.codingParallelLead) elements.codingParallelLead.textContent = step.codingParallelLead || '';

    // 코딩 개념 태그
    elements.codingTags.innerHTML = '';
    step.codingConcepts.forEach((concept) => {
      const li = document.createElement('li');
      li.className = 'concept-tag';
      li.textContent = concept;
      elements.codingTags.appendChild(li);
    });

    // 예시
    if (step.codingExample) {
      elements.codingExample.textContent = step.codingExample;
      elements.codingExample.style.display = '';
    } else {
      elements.codingExample.style.display = 'none';
    }

    elements.keyExplanation.textContent = step.keyExplanation;

    // 특별 액션 (도구함, 시뮬레이션)
    elements.stepSpecialActions.innerHTML = '';
    if (step.hasToolbox) {
      const toolboxBtn = document.createElement('button');
      toolboxBtn.type = 'button';
      toolboxBtn.className = 'btn btn-secondary';
      toolboxBtn.textContent = '🧰 건축 도구함 열기';
      toolboxBtn.addEventListener('click', () => {
        state.returnFromToolbox = stepId;
        showView('toolbox');
        renderTechCards();
        announce('건축 도구함을 열었습니다.');
      });
      elements.stepSpecialActions.appendChild(toolboxBtn);
    }
    if (step.hasSimulation) {
      const simBtn = document.createElement('button');
      simBtn.type = 'button';
      simBtn.className = 'btn btn-secondary';
      simBtn.textContent = '⚡ 할 일 추가 시뮬레이션';
      simBtn.addEventListener('click', () => {
        state.returnFromSimulation = stepId;
        showView('simulation');
        resetSimulation();
        announce('할 일 추가 시뮬레이션을 시작합니다.');
      });
      elements.stepSpecialActions.appendChild(simBtn);
    }

    // 집 진행 시각화는 공사 현장(theater)에서 처리

    // 퀴즈
    renderQuiz(step);

    // 네비게이션 버튼
    elements.btnPrevStep.disabled = stepId <= 1;
    elements.btnNextStep.textContent = stepId >= APP_DATA.totalSteps ? '학습 완료' : '다음 단계';

    renderStepList();
    updateHomeProgress();
    saveProgress();
    announce(`${stepId}단계: ${step.title}`);
  }

  /** 퀴즈 렌더 */
  function renderQuiz(step) {
    const quiz = step.quiz;
    elements.quizQuestion.textContent = quiz.question;
    elements.quizOptions.innerHTML = '';
    elements.quizFeedback.classList.add('hidden');

    const answered = state.quizAnswered[step.id];

    quiz.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = option;
      btn.setAttribute('aria-label', `선택지 ${index + 1}: ${option}`);

      if (answered !== undefined) {
        btn.disabled = true;
        if (index === quiz.correctIndex) btn.classList.add('correct');
        if (index === answered && answered !== quiz.correctIndex) btn.classList.add('incorrect');
      } else {
        btn.addEventListener('click', () => handleQuizAnswer(step.id, index));
      }

      elements.quizOptions.appendChild(btn);
    });

    if (answered !== undefined) {
      showQuizFeedback(quiz, answered);
    }
  }

  /** 퀴즈 답변 처리 */
  function handleQuizAnswer(stepId, selectedIndex) {
    const step = APP_DATA.steps.find((s) => s.id === stepId);
    if (!step) return;

    state.quizAnswered[stepId] = selectedIndex;

    if (!state.completedSteps.includes(stepId)) {
      state.completedSteps.push(stepId);
      state.completedSteps.sort((a, b) => a - b);
    }

    saveProgress();
    renderQuiz(step);
    updateHomeProgress();
    renderStepList();

  }

  /** 퀴즈 피드백 표시 */
  function showQuizFeedback(quiz, selectedIndex) {
    const isCorrect = selectedIndex === quiz.correctIndex;
    elements.quizFeedback.classList.remove('hidden');
    elements.feedbackResult.textContent = isCorrect ? '✓ 정답입니다!' : '✗ 아쉽지만 틀렸습니다.';
    elements.feedbackResult.className = 'feedback-result ' + (isCorrect ? 'is-correct' : 'is-incorrect');
    elements.feedbackExplanation.textContent = quiz.explanation;
    elements.feedbackMetaphor.textContent = '🏠 ' + quiz.metaphor;
    announce(isCorrect ? '정답입니다!' : '틀렸습니다. 다시 선택할 수 있습니다.');
  }

  /** 단계 이동 */
  function goToStep(stepId) {
    if (stepId < 1 || stepId > APP_DATA.totalSteps) return;
    showView('step');
    renderStepContent(stepId);
  }

  /** 기술 카드 필터 렌더 */
  function renderTechFilters() {
    const container = elements.techFilters;
    if (!container) return;
    container.innerHTML = '';

    APP_DATA.techFilters.forEach((filter) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      if (filter.id === state.currentFilter) btn.classList.add('active');
      btn.textContent = filter.label;
      btn.setAttribute('aria-pressed', filter.id === state.currentFilter ? 'true' : 'false');
      btn.addEventListener('click', () => {
        state.currentFilter = filter.id;
        renderTechFilters();
        renderTechCards();
        announce(`${filter.label} 필터를 적용했습니다.`);
      });
      container.appendChild(btn);
    });
  }

  /** 기술 카드 렌더 */
  function renderTechCards() {
    const grid = elements.techCardsGrid;
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = state.currentFilter === 'all'
      ? APP_DATA.technologies
      : APP_DATA.technologies.filter((t) => t.category === state.currentFilter);

    filtered.forEach((tech) => {
      const card = document.createElement('article');
      card.className = 'tech-card';
      card.setAttribute('role', 'listitem');
      card.style.setProperty('--tech-color', tech.color);

      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'tech-card-header';
      header.setAttribute('aria-expanded', 'false');
      header.style.setProperty('--tech-color', tech.color);

      const icon = document.createElement('span');
      icon.className = 'tech-icon';
      icon.style.background = tech.color;
      icon.textContent = tech.name.substring(0, 2).toUpperCase();
      icon.setAttribute('aria-hidden', 'true');

      const summary = document.createElement('div');
      summary.className = 'tech-card-summary';
      const nameEl = document.createElement('p');
      nameEl.className = 'tech-name';
      nameEl.textContent = tech.name;
      const catEl = document.createElement('p');
      catEl.className = 'tech-category';
      catEl.textContent = tech.categoryLabel;
      summary.appendChild(nameEl);
      summary.appendChild(catEl);

      const expandIcon = document.createElement('span');
      expandIcon.className = 'tech-expand-icon';
      expandIcon.textContent = '▼';
      expandIcon.setAttribute('aria-hidden', 'true');

      header.appendChild(icon);
      header.appendChild(summary);
      header.appendChild(expandIcon);

      const body = document.createElement('div');
      body.className = 'tech-card-body';
      body.id = `tech-body-${tech.id}`;

      body.innerHTML = `
        <div class="tech-detail-row">
          <div class="tech-detail-label">집 짓기 비유</div>
          <p class="tech-detail-value">${tech.metaphor}</p>
        </div>
        <div class="tech-detail-row">
          <div class="tech-detail-label">실제 역할</div>
          <p class="tech-detail-value">${tech.role}</p>
        </div>
        <div class="tech-detail-row">
          <div class="tech-detail-label">주요 특징</div>
          <p class="tech-detail-value">${tech.features.join(' · ')}</p>
        </div>
        <div class="tech-detail-row">
          <div class="tech-detail-label">주로 사용하는 상황</div>
          <p class="tech-detail-value">${tech.useCases.join(' · ')}</p>
        </div>
        <div class="tech-detail-row">
          <div class="tech-detail-label">관련 기술</div>
          <div class="tech-related">${tech.related.map((r) => `<span class="tech-related-tag">${r}</span>`).join('')}</div>
        </div>
        <div class="tech-misconception">
          <div class="tech-detail-label">⚠️ 자주 하는 오해</div>
          <p class="tech-detail-value">${tech.misconception}</p>
        </div>
        <div class="tech-detail-row">
          <div class="tech-detail-label">예시</div>
          <pre class="tech-example">${tech.example}</pre>
        </div>
      `;

      header.addEventListener('click', () => {
        const expanded = card.classList.toggle('expanded');
        header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        announce(expanded ? `${tech.name} 상세 정보를 펼쳤습니다.` : `${tech.name} 상세 정보를 접었습니다.`);
      });

      card.appendChild(header);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /** 시뮬레이션 파이프라인 렌더 */
  function renderSimulationPipeline() {
    const steps = APP_DATA.simulationSteps;
    const current = state.simStep;

    // 파이프라인 도트
    const dotsContainer = elements.pipelineSteps;
    dotsContainer.innerHTML = '';
    steps.forEach((s, i) => {
      const dot = document.createElement('span');
      dot.className = 'pipeline-step-dot';
      if (i < current) dot.classList.add('done');
      if (i === current) {
        dot.classList.add('active');
        dot.style.setProperty('--step-color', s.techColor);
      }
      dot.textContent = String(s.step);
      dot.setAttribute('aria-label', `단계 ${s.step}: ${s.title}`);
      dotsContainer.appendChild(dot);
    });

    const stepData = steps[current];
    if (stepData) {
      elements.pipelineStepNum.textContent = `단계 ${stepData.step} / ${steps.length}`;
      elements.pipelineTech.textContent = stepData.tech;
      elements.pipelineTech.style.color = stepData.techColor;
      elements.pipelineDesc.textContent = stepData.description;
    }

    elements.btnSimPrev.disabled = current <= 0;
    elements.btnSimNext.disabled = current >= steps.length - 1;
  }

  /** 시뮬레이션 초기화 */
  function resetSimulation() {
    state.simStep = 0;
    renderSimulationPipeline();
  }

  /** 할 일 목록 렌더 */
  function renderTodoList() {
    const list = elements.todoList;
    list.innerHTML = '';
    state.todos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      if (index === state.todos.length - 1) li.classList.add('new-item');
      li.innerHTML = `<span class="todo-check" aria-hidden="true">✓</span> ${todo}`;
      list.appendChild(li);
    });
  }

  /** 할 일 추가 (시뮬레이션) */
  function addTodo() {
    const input = elements.todoInput;
    const text = input.value.trim();
    if (!text) {
      announce('할 일을 입력해 주세요.');
      input.focus();
      return;
    }

    state.todos.push(text);
    input.value = '';
    renderTodoList();

    // 시뮬레이션 자동 진행
    state.simStep = 0;
    const steps = APP_DATA.simulationSteps;
    let stepIndex = 0;

    function advanceStep() {
      if (stepIndex < steps.length) {
        state.simStep = stepIndex;
        renderSimulationPipeline();
        announce(`단계 ${steps[stepIndex].step}: ${steps[stepIndex].tech} — ${steps[stepIndex].title}`);
        stepIndex++;
        if (stepIndex < steps.length) {
          const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1200;
          setTimeout(advanceStep, delay);
        }
      }
    }

    advanceStep();
  }

  /** 전체 초기화 */
  function resetAllProgress() {
    const confirmed = confirm('모든 학습 진행 상태를 초기화합니다. 계속하시겠습니까?');
    if (!confirmed) return;

    state.currentStep = 1;
    state.completedSteps = [];
    state.quizAnswered = {};
    state.todos = [];
    saveProgress();

    showView('home');
    updateHomeProgress();
    announce('학습 진행 상태가 초기화되었습니다.');
  }

  /** DOM 요소 바인딩 */
  function bindElements() {
    elements.ariaAnnouncer = document.getElementById('aria-announcer');
    elements.homeProgressFill = document.getElementById('home-progress-fill');
    elements.homeProgressText = document.getElementById('home-progress-text');
    elements.homeProgressBar = document.getElementById('home-progress-bar');
    elements.headerProgressText = document.getElementById('header-progress-text');
    elements.homeStepDots = document.getElementById('home-step-dots');
    elements.houseBefore = document.getElementById('house-before');
    elements.houseAfter = document.getElementById('house-after');

    elements.theaterStage = document.getElementById('theater-stage');
    elements.theaterPhaseLabel = document.getElementById('theater-phase-label');
    elements.constructionTimelineWrap = document.getElementById('construction-timeline-wrap');
    elements.houseStageLabel = document.getElementById('house-stage-label');
    elements.houseNowText = document.getElementById('house-now-text');
    elements.codingParallelTitle = document.getElementById('coding-parallel-title');
    elements.codingParallelLead = document.getElementById('coding-parallel-lead');

    elements.stepIndicator = document.getElementById('step-indicator');
    elements.stepTitle = document.getElementById('step-title');
    elements.architectureList = document.getElementById('architecture-list');
    elements.codingTags = document.getElementById('coding-tags');
    elements.codingExample = document.getElementById('coding-example');
    elements.keyExplanation = document.getElementById('key-explanation');
    elements.stepSpecialActions = document.getElementById('step-special-actions');
    elements.stepList = document.getElementById('step-list');

    elements.quizQuestion = document.getElementById('quiz-question');
    elements.quizOptions = document.getElementById('quiz-options');
    elements.quizFeedback = document.getElementById('quiz-feedback');
    elements.feedbackResult = document.getElementById('feedback-result');
    elements.feedbackExplanation = document.getElementById('feedback-explanation');
    elements.feedbackMetaphor = document.getElementById('feedback-metaphor');

    elements.btnPrevStep = document.getElementById('btn-prev-step');
    elements.btnNextStep = document.getElementById('btn-next-step');

    elements.techFilters = document.getElementById('tech-filters');
    elements.techCardsGrid = document.getElementById('tech-cards-grid');

    elements.todoInput = document.getElementById('todo-input');
    elements.todoList = document.getElementById('todo-list');
    elements.pipelineSteps = document.getElementById('pipeline-steps');
    elements.pipelineStepNum = document.getElementById('pipeline-step-num');
    elements.pipelineTech = document.getElementById('pipeline-tech');
    elements.pipelineDesc = document.getElementById('pipeline-desc');
    elements.btnSimPrev = document.getElementById('btn-sim-prev');
    elements.btnSimNext = document.getElementById('btn-sim-next');
  }

  /** 이벤트 리스너 등록 */
  function bindEvents() {
    document.getElementById('btn-start').addEventListener('click', () => {
      showView('step');
      renderStepContent(state.currentStep);
    });

    document.getElementById('btn-home').addEventListener('click', () => {
      showView('home');
      updateHomeProgress();
      announce('홈 화면으로 이동했습니다.');
    });

    document.getElementById('btn-progress').addEventListener('click', () => {
      showView('step');
      renderStepContent(state.currentStep);
    });

    elements.btnPrevStep.addEventListener('click', () => goToStep(state.currentStep - 1));
    elements.btnNextStep.addEventListener('click', () => {
      if (state.currentStep >= APP_DATA.totalSteps) {
        showView('home');
        updateHomeProgress();
        announce('모든 학습을 완료했습니다! 축하합니다!');
      } else {
        goToStep(state.currentStep + 1);
      }
    });

    document.getElementById('btn-retry-quiz').addEventListener('click', () => {
      delete state.quizAnswered[state.currentStep];
      const idx = state.completedSteps.indexOf(state.currentStep);
      if (idx !== -1) state.completedSteps.splice(idx, 1);
      saveProgress();
      const step = APP_DATA.steps.find((s) => s.id === state.currentStep);
      if (step) renderQuiz(step);
      updateHomeProgress();
      announce('퀴즈를 다시 선택할 수 있습니다.');
    });

    document.getElementById('btn-back-from-toolbox').addEventListener('click', () => {
      showView('step');
      renderStepContent(state.returnFromToolbox);
    });

    document.getElementById('btn-back-from-simulation').addEventListener('click', () => {
      showView('step');
      renderStepContent(state.returnFromSimulation);
    });

    document.getElementById('btn-add-todo').addEventListener('click', addTodo);
    elements.todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTodo();
    });

    elements.btnSimPrev.addEventListener('click', () => {
      if (state.simStep > 0) {
        state.simStep--;
        renderSimulationPipeline();
      }
    });

    elements.btnSimNext.addEventListener('click', () => {
      if (state.simStep < APP_DATA.simulationSteps.length - 1) {
        state.simStep++;
        renderSimulationPipeline();
      }
    });

    document.getElementById('btn-sim-reset').addEventListener('click', () => {
      resetSimulation();
      announce('시뮬레이션을 처음부터 시작합니다.');
    });

    document.getElementById('btn-reset-all').addEventListener('click', resetAllProgress);
  }

  /** 앱 초기화 */
  function init() {
    bindElements();
    loadProgress();
    bindEvents();
    renderTechFilters();
    updateHomeProgress();
    showView('home');
  }

  // DOM 준비 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
