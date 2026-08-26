#!/usr/bin/env bash
# 코딩으로 집 짓기 — 로컬 실행 스크립트
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "============================================"
echo "  코딩으로 집 짓기"
echo "  브라우저에서 열기: http://localhost:${PORT}"
echo "  종료: Ctrl + C"
echo "============================================"
python3 -m http.server "$PORT"
