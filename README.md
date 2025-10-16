# 🍪 Cookie Extractor GUI

브라우저에서 특정 쿠키 값을 가져와서 `.env.local` 파일에 자동으로 저장하는 Electron GUI 도구입니다.

[![GitHub](https://img.shields.io/github/license/goodsosbva/cookie-extraction)](https://github.com/goodsosbva/cookie-extraction)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-28+-blue)](https://electronjs.org/)

## 🎯 주요 기능

- **🎨 사용자 친화적인 GUI 인터페이스** - 직관적이고 아름다운 UI
- **🔐 자동 로그인 기능** - 이메일/비밀번호 자동 입력
- **📱 OTP 인증 지원** - 2FA/MFA 자동 감지 및 대기
- **📊 실시간 로그 표시** - 진행 상황을 실시간으로 확인
- **🌐 브라우저 유지** - 쿠키 추출 후 브라우저 창 유지
- **🍪 다중 쿠키 추출** - 여러 쿠키를 한 번에 추출
- **✅ 실시간 결과 표시** - 추출된 쿠키 값 즉시 확인
- **🔧 완전 커스터마이징** - 모든 설정을 GUI에서 변경 가능

## 🚀 기능

- 지정된 브라우저에서 쿠키 값 자동 추출
- `.env.local` 파일 경로 커스터마이징 가능
- 여러 쿠키 키를 한 번에 처리
- 기존 `.env.local` 파일의 값 업데이트 지원
- 실행 파일(.exe) 생성 가능

## 📦 설치

```bash
# 의존성 설치
npm install

# 또는 yarn 사용
yarn install
```

## ⚙️ 설정

### 1. config.json 파일 수정

```json
{
  "envFilePath": "./.env.local",
  "cookieKeys": ["session_id", "auth_token", "user_id"],
  "targetUrl": "https://your-website.com",
  "browserOptions": {
    "headless": true,
    "args": ["--no-sandbox", "--disable-setuid-sandbox"]
  }
}
```

### 2. 환경 변수 사용 (선택사항)

`.env` 파일을 생성하고 다음 변수들을 설정할 수 있습니다:

```env
ENV_FILE_PATH=./.env.local
COOKIE_KEYS=session_id,auth_token,user_id
TARGET_URL=https://your-website.com
```

## 🎯 사용법

### GUI 애플리케이션 실행

```bash
# 1. 의존성 설치
npm install

# 2. GUI 실행
npm start

# 또는 배치 파일로 실행
run-gui.bat
```

### GUI 사용 방법

1. **접속할 도메인 주소** 입력 (예: `https://dev.admin.okestro.cloud/#/maestro`)
2. **이메일(ID)** 입력 (예: `hs.kwan@okestro.com`)
3. **비밀번호** 입력 (예: `Okestro2018!`)
4. **가져올 쿠키 이름** 입력 (예: `_oauth2_proxy` 또는 `_oauth2_proxy, session_id`)
5. **.env.local 파일 경로** 입력 (예: `C:\Users\admin\Desktop\mono_305\okestro-cmp-app\apps\okestro-cmp-app-admin\.env.local`)
6. **🚀 쿠키 추출 시작** 버튼 클릭

### 결과 확인

- 실시간 로그가 하단에 표시됩니다
- 추출된 쿠키 값이 결과 영역에 표시됩니다
- 브라우저 창은 자동으로 닫히지 않습니다

## 📁 출력 파일

실행 후 지정된 경로에 `.env.local` 파일이 생성되며, 다음과 같은 형태로 쿠키 값이 저장됩니다:

```env
COOKIE_SESSION_ID=abc123def456
COOKIE_AUTH_TOKEN=xyz789uvw012
COOKIE_USER_ID=user123
```

## 🔧 설정 옵션

| 옵션             | 설명                          | 기본값                         |
| ---------------- | ----------------------------- | ------------------------------ |
| `envFilePath`    | .env.local 파일이 저장될 경로 | `./.env.local`                 |
| `cookieKeys`     | 추출할 쿠키 키 배열           | `["session_id", "auth_token"]` |
| `targetUrl`      | 쿠키를 가져올 대상 URL        | `https://example.com`          |
| `browserOptions` | Puppeteer 브라우저 옵션       | `{ headless: true }`           |

## 🛠️ 고급 사용법

### 헤드리스 모드 비활성화

브라우저 창을 보면서 실행하려면 `config.json`에서:

```json
{
  "browserOptions": {
    "headless": false
  }
}
```

### 사용자 데이터 디렉토리 사용

로그인된 상태의 쿠키를 가져오려면:

```json
{
  "browserOptions": {
    "headless": true,
    "userDataDir": "./browser-data"
  }
}
```

## 🚨 주의사항

- 대상 웹사이트의 쿠키 정책을 확인하세요
- 민감한 정보가 포함된 쿠키는 보안에 주의하세요
- 일부 웹사이트는 자동화 도구를 차단할 수 있습니다

## 📝 라이선스

MIT License

## 📸 스크린샷

<img width="2553" height="1385" alt="image" src="https://github.com/user-attachments/assets/5e80c5aa-9c5c-4e3b-bfca-169938756cac" />


## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.


## 🔗 링크

- [GitHub Repository](https://github.com/goodsosbva/cookie-extraction)
- [Issues](https://github.com/goodsosbva/cookie-extraction/issues)
- [Releases](https://github.com/goodsosbva/cookie-extraction/releases)
