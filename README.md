# 수정회 테니스 월례회 매니저

테니스 월례회 대진·순위를 관리하는 모바일 웹앱입니다. 4가지 경기 방식을 지원하며 SQLite로 데이터를 영구 저장합니다.

## 주요 기능

| 모드 | 설명 |
|------|------|
| **INDIVIDUAL** | 개인 교대 순환전 — 6명 5라운드 로테이션, 5경기+ 시 상위 4경기 득실 |
| **THREE_KINGDOMS** | 삼국지 3팀 단체전 — A/B/C 팀 스네이크 드래프트 |
| **UP_DOWN** | 승급/강등전 — 코트별 승급·강등 (코트당 최대 4명) |
| **FIXED_TEAM** | 고정 파트너 리그전 — 상위+하위 페어링 |

## 로컬 개발

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

## Docker 배포

```bash
docker compose up --build
```

브라우저: http://localhost:8000 (API + 빌드된 프론트엔드 통합 서빙)

데이터는 Docker volume `tennis-data`에 SQLite 파일로 저장됩니다.

## 테스트

```bash
cd backend
pip install -r requirements.txt
pytest test_main.py -v
```

## 프로젝트 구조

```
backend/
  main.py            # FastAPI + MatchEngine
  database.py        # SQLite 영구 저장
  schema_sqlite.sql
  test_main.py

frontend/
  src/App.jsx        # 설정 / 대진표 / 순위 UI

Dockerfile
docker-compose.yml
```

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `TENNIS_DB_PATH` | `backend/data/tennis.db` | SQLite DB 경로 |
| `CORS_ORIGINS` | localhost 개발 URL | CORS 허용 origin (쉼표 구분) |

## 라이선스

MIT
