#!/bin/bash
# -*- coding: utf-8 -*-

echo "🍪 Cookie Extractor 시작 스크립트"
echo "=================================="
echo ""

# 현재 스크립트의 디렉토리로 이동
cd "$(dirname "$0")"

# Node.js가 설치되어 있는지 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "https://nodejs.org 에서 Node.js를 설치해주세요."
    read -p "계속하려면 Enter를 누르세요..."
    exit 1
fi

# 의존성이 설치되어 있는지 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치하는 중..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 의존성 설치에 실패했습니다."
        read -p "계속하려면 Enter를 누르세요..."
        exit 1
    fi
fi

# Playwright 브라우저 설치
echo "🌐 Playwright 브라우저를 설치하는 중..."
npx playwright install chromium
if [ $? -ne 0 ]; then
    echo "❌ Playwright 브라우저 설치에 실패했습니다."
    read -p "계속하려면 Enter를 누르세요..."
    exit 1
fi

# 실행 옵션 선택
echo ""
echo "실행 모드를 선택하세요:"
echo "1) GUI 모드 (Electron 앱)"
echo "2) CLI 모드 (터미널)"
echo ""
read -p "선택 (1 또는 2): " choice

case $choice in
    1)
        echo "🚀 GUI 모드로 Cookie Extractor를 시작합니다..."
        npm start
        ;;
    2)
        echo "🚀 CLI 모드로 Cookie Extractor를 시작합니다..."
        node index.js
        ;;
    *)
        echo "❌ 잘못된 선택입니다. GUI 모드로 시작합니다..."
        npm start
        ;;
esac

echo ""
echo "✅ 작업이 완료되었습니다."
read -p "계속하려면 Enter를 누르세요..."
