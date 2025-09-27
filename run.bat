@echo off
echo 🍪 쿠키 추출기 실행 중...
echo.

REM Node.js가 설치되어 있는지 확인
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다.
    echo https://nodejs.org 에서 Node.js를 설치해주세요.
    pause
    exit /b 1
)

REM 의존성이 설치되어 있는지 확인
if not exist "node_modules" (
    echo 📦 의존성을 설치하는 중...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 의존성 설치에 실패했습니다.
        pause
        exit /b 1
    )
)

REM 스크립트 실행
echo 🚀 쿠키 추출을 시작합니다...
node index.js

echo.
echo ✅ 작업이 완료되었습니다.
pause
