# 수정회 테니스 월례회 매니저

테니스 월례회 대진·순위를 관리하는 모바일 웹앱입니다. 4가지 경기 방식을 지원합니다.

## 주요 기능

| 모드 | 설명 |
|------|------|
| **INDIVIDUAL** | 개인 교대 순환전 — 1+4 vs 2+3 밸런스, 상위 4경기 득실 |
| **THREE_KINGDOMS** | 삼국지 3팀 단체전 — A/B/C 팀 균등 분할 |
| **UP_DOWN** | 승급/강등전 — 코트별 승급·강등 |
| **FIXED_TEAM** | 고정 파트너 리그전 — 상위+하위 페어링 |

## 실행 방법

### 백엔드 (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 프론트엔드 (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

브라우저: http://localhost:5173

## 프로젝트 구조

```
backend/
  main.py          # FastAPI + MatchEngine (4모드)
  schema.sql       # DB 스키마 참조
  requirements.txt

frontend/
  src/App.jsx      # 설정 / 대진표 / 순위 UI
  src/main.jsx
  vite.config.js   # /api → localhost:8000 프록시
```

## 기술 스택

- Backend: FastAPI, in-memory 저장소
- Frontend: React, Vite, Tailwind CSS
- API: REST (`/api/players`, `/api/matches`, `/api/rankings` 등)

## 라이선스

MIT
