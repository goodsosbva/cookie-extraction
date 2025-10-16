#!/bin/bash
# -*- coding: utf-8 -*-

# 터미널 제목 설정
echo -e "\033]0;Cookie Extractor - 황제님 전용\007"

echo ""
echo "========================================"
echo "   🍪 Cookie Extractor - 황제님 전용"
echo "========================================"
echo ""

# 현재 스크립트의 디렉토리로 이동
cd "$(dirname "$0")"

# 실행 파일이 있는지 확인
if [ -f "dist/mac/Cookie Extractor.app/Contents/MacOS/Cookie Extractor" ]; then
    echo "✅ 실행 파일을 찾았습니다!"
    echo "🚀 Cookie Extractor를 시작합니다..."
    echo ""
    open "dist/mac/Cookie Extractor.app"
elif [ -f "dist/mac-unpacked/Cookie Extractor.app/Contents/MacOS/Cookie Extractor" ]; then
    echo "✅ 실행 파일을 찾았습니다!"
    echo "🚀 Cookie Extractor를 시작합니다..."
    echo ""
    open "dist/mac-unpacked/Cookie Extractor.app"
else
    echo "❌ 실행 파일을 찾을 수 없습니다."
    echo "📦 먼저 빌드를 실행해주세요: npm run build-mac"
    echo ""
    read -p "계속하려면 Enter를 누르세요..."
fi
