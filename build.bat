@echo off
echo 🔨 실행 파일을 생성하는 중...
echo.

REM Node.js가 설치되어 있는지 확인
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다.
    echo https://nodejs.org 에서 Node.js를 설치해주세요.
    pause
    exit /b 1
)

REM 의존성 설치
echo 📦 의존성을 설치하는 중...
npm install
if %errorlevel% neq 0 (
    echo ❌ 의존성 설치에 실패했습니다.
    pause
    exit /b 1
)

REM 실행 파일 생성
echo 🔨 실행 파일을 생성하는 중...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 실행 파일 생성에 실패했습니다.
    pause
    exit /b 1
)

echo.
echo ✅ cookie-extractor.exe 파일이 생성되었습니다!
echo 이제 cookie-extractor.exe를 실행하시면 됩니다.
pause
