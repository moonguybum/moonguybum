@echo off
cd /d "%~dp0"
set PORT=8080
echo ============================================
echo   코딩으로 집 짓기
echo   브라우저에서 열기: http://localhost:%PORT%
echo   종료: Ctrl + C
echo ============================================
python -m http.server %PORT%
