#!/bin/bash
# -*- coding: utf-8 -*-

echo "🍪 Cookie Extractor GUI 실행 중..."
echo ""

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

# Electron 앱 실행
echo "🚀 Cookie Extractor GUI를 시작합니다..."
npm start

read -p "계속하려면 Enter를 누르세요..."
