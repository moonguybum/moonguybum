#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> 명함핑 웹 앱 노트북 설치"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js가 필요합니다: https://nodejs.org"
  exit 1
fi

echo "==> 의존성 설치"
npm install

echo "==> 앱 빌드"
npm run build

echo
echo "설치 완료!"
echo
echo "아래 명령으로 앱을 실행하세요:"
echo "  npm run preview -- --host 0.0.0.0 --port 4173"
echo
echo "브라우저에서 열기:"
echo "  http://localhost:4173"
echo
echo "Chrome/Edge에서 주소창 오른쪽 '앱 설치' 버튼을 누르면"
echo "노트북에 바로가기처럼 설치됩니다 (PWA)."
