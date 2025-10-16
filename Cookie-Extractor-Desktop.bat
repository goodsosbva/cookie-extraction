@echo off
title Cookie Extractor - 황제님 전용
color 0A

echo.
echo ========================================
echo    🍪 Cookie Extractor - 황제님 전용
echo ========================================
echo.

REM 현재 스크립트의 디렉토리로 이동
cd /d "%~dp0"

REM 실행 파일이 있는지 확인
if exist "dist\win-unpacked\Cookie Extractor.exe" (
    echo ✅ 실행 파일을 찾았습니다!
    echo 🚀 Cookie Extractor를 시작합니다...
    echo.
    start "" "dist\win-unpacked\Cookie Extractor.exe"
) else (
    echo ❌ 실행 파일을 찾을 수 없습니다.
    echo 📦 먼저 빌드를 실행해주세요: npm run build-win
    echo.
    pause
)
