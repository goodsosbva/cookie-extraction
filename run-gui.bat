@echo off
echo 🍪 Cookie Extractor GUI 실행 중...
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

REM Playwright 브라우저 설치
echo 🌐 Playwright 브라우저를 설치하는 중...
npx playwright install chromium
if %errorlevel% neq 0 (
    echo ❌ Playwright 브라우저 설치에 실패했습니다.
    pause
    exit /b 1
)

REM Electron 앱 실행
echo 🚀 Cookie Extractor GUI를 시작합니다...
npm start

pause
