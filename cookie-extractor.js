const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

class CookieExtractor {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launchBrowser(headless = true) {
    this.browser = await chromium.launch({
      headless: headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--ignore-ssl-errors",
        "--ignore-certificate-errors-spki-list",
        "--disable-web-security",
      ],
    });
    this.page = await this.browser.newPage();
  }

  async autoLogin(email, password) {
    try {
      console.log("🔐 로그인 상태를 확인하는 중...");

      // 로그인 페이지인지 확인
      const currentUrl = this.page.url();
      console.log(`현재 URL: ${currentUrl}`);

      // 로그인이 필요한 경우 (로그인 페이지로 리다이렉트된 경우)
      if (
        currentUrl.includes("login") ||
        currentUrl.includes("auth") ||
        currentUrl.includes("signin")
      ) {
        console.log("🔑 로그인이 필요합니다. 자동 로그인을 시도합니다...");

        // 이메일 입력 필드 찾기
        const emailSelectors = [
          'input[type="email"]',
          'input[name="email"]',
          'input[name="username"]',
          'input[id="username"]',
          'input[placeholder*="이메일"]',
          'input[placeholder*="email"]',
        ];

        let emailInput = null;
        for (const selector of emailSelectors) {
          try {
            emailInput = await this.page.waitForSelector(selector, {
              timeout: 5000,
            });
            if (emailInput) break;
          } catch (e) {
            // 다음 셀렉터 시도
          }
        }

        if (emailInput) {
          console.log("📧 이메일 입력 필드를 찾았습니다.");
          await emailInput.fill(email);
          console.log("✅ 이메일을 입력했습니다.");
        } else {
          throw new Error("이메일 입력 필드를 찾을 수 없습니다.");
        }

        // 비밀번호 입력 필드 찾기
        const passwordSelectors = [
          'input[type="password"]',
          'input[name="password"]',
          'input[id="password"]',
          'input[placeholder*="비밀번호"]',
          'input[placeholder*="password"]',
        ];

        let passwordInput = null;
        for (const selector of passwordSelectors) {
          try {
            passwordInput = await this.page.waitForSelector(selector, {
              timeout: 5000,
            });
            if (passwordInput) break;
          } catch (e) {
            // 다음 셀렉터 시도
          }
        }

        if (passwordInput) {
          console.log("🔒 비밀번호 입력 필드를 찾았습니다.");
          await passwordInput.fill(password);
          console.log("✅ 비밀번호를 입력했습니다.");
        } else {
          throw new Error("비밀번호 입력 필드를 찾을 수 없습니다.");
        }

        // 로그인 버튼 찾기 및 클릭
        const loginButtonSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button:has-text("로그인")',
          'button:has-text("Login")',
          'button:has-text("Sign in")',
          'button:has-text("Sign In")',
          ".login-button",
          "#login-button",
        ];

        let loginButton = null;
        for (const selector of loginButtonSelectors) {
          try {
            loginButton = await this.page.waitForSelector(selector, {
              timeout: 5000,
            });
            if (loginButton) break;
          } catch (e) {
            // 다음 셀렉터 시도
          }
        }

        if (loginButton) {
          console.log("🚀 로그인 버튼을 찾았습니다. 로그인을 시도합니다...");
          await loginButton.click();

          // 로그인 완료까지 대기
          console.log("⏳ 로그인 완료를 기다리는 중...");
          await this.page.waitForLoadState("networkidle", { timeout: 30000 });

          // OTP 페이지인지 확인하고 처리
          await this.handleOTPIfNeeded();

          console.log("✅ 로그인이 완료되었습니다!");
        } else {
          throw new Error("로그인 버튼을 찾을 수 없습니다.");
        }
      } else {
        console.log("✅ 이미 로그인된 상태입니다.");
      }
    } catch (error) {
      console.log("⚠️ 로그인 과정에서 오류가 발생했습니다:", error.message);
      throw error;
    }
  }

  async handleOTPIfNeeded() {
    try {
      const currentUrl = this.page.url();
      console.log(`로그인 후 현재 URL: ${currentUrl}`);

      // 페이지 내용을 가져와서 OTP 페이지인지 정확히 확인
      const pageContent = await this.page.content();
      const pageText = await this.page.textContent("body");

      console.log("🔍 페이지 내용을 분석하는 중...");
      console.log(`페이지 텍스트 길이: ${pageText.length}자`);

      // OTP 페이지를 나타내는 더 구체적인 패턴들
      const otpPatterns = [
        // 한국어 패턴
        /인증.*코드|코드.*입력|인증.*번호|번호.*입력/i,
        /2단계.*인증|2차.*인증|이중.*인증/i,
        /OTP|MFA|2FA|TOTP|HOTP/i,
        /인증.*앱|앱.*인증|구글.*인증|구글.*앱/i,
        /SMS.*인증|문자.*인증|휴대폰.*인증/i,
        /인증.*토큰|토큰.*입력|보안.*코드/i,
        /추가.*인증|보안.*인증|강화.*인증/i,
        /이메일로.*전송|전송된.*6자리|6자리.*OTP/i,
        /입력.*유효.*시간|유효.*시간/i,
        /취소.*버튼|취소/i,

        // 영어 패턴
        /verification.*code|enter.*code|authentication.*code/i,
        /two.*factor|2.*factor|multi.*factor/i,
        /authenticator.*app|google.*authenticator/i,
        /security.*code|verification.*token/i,
        /additional.*verification|enhanced.*security/i,
        /enter.*verification|verify.*identity/i,
        /sent.*to.*email|email.*sent/i,
        /6.*digit.*code|6.*digit.*otp/i,
        /valid.*time|expires.*in/i,
        /cancel.*button|cancel/i,

        // 입력 필드 패턴
        /input.*code|code.*field|verification.*input/i,
        /6.*digit|6자리|4.*digit|4자리/i,
        /numeric.*code|숫자.*코드/i,
      ];

      // OTP 입력 필드가 있는지 확인
      const otpInputSelectors = [
        'input[type="text"][maxlength="6"]',
        'input[type="text"][maxlength="4"]',
        'input[type="text"][maxlength="8"]',
        'input[type="text"][maxlength="1"]', // 개별 숫자 입력 필드
        'input[type="text"][maxlength="2"]',
        'input[placeholder*="코드"]',
        'input[placeholder*="code"]',
        'input[placeholder*="인증"]',
        'input[placeholder*="verification"]',
        'input[placeholder*="OTP"]',
        'input[placeholder*="otp"]',
        'input[name*="code"]',
        'input[name*="otp"]',
        'input[name*="verification"]',
        'input[id*="code"]',
        'input[id*="otp"]',
        'input[id*="verification"]',
        'input[class*="otp"]',
        'input[class*="code"]',
        'input[class*="verification"]',
        // 6개의 개별 입력 필드 패턴
        'input[type="text"]:nth-of-type(1)',
        'input[type="text"]:nth-of-type(2)',
        'input[type="text"]:nth-of-type(3)',
        'input[type="text"]:nth-of-type(4)',
        'input[type="text"]:nth-of-type(5)',
        'input[type="text"]:nth-of-type(6)',
      ];

      // OTP 입력 필드 찾기
      let hasOTPInput = false;
      for (const selector of otpInputSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            console.log(`🔍 OTP 입력 필드 발견: ${selector}`);
            hasOTPInput = true;
            break;
          }
        } catch (e) {
          // 다음 셀렉터 시도
        }
      }

      // 텍스트 패턴 확인
      const hasOTPText = otpPatterns.some((pattern) => pattern.test(pageText));

      // 매칭된 패턴 찾기
      const matchedPatterns = otpPatterns.filter((pattern) =>
        pattern.test(pageText)
      );
      console.log(`🔍 매칭된 텍스트 패턴: ${matchedPatterns.length}개`);
      if (matchedPatterns.length > 0) {
        console.log(
          `🔍 매칭된 패턴들: ${matchedPatterns.map((p) => p.source).join(", ")}`
        );
      }

      // OTP 페이지인지 최종 판단
      const isOTPPage = hasOTPInput || hasOTPText;

      console.log(`🔍 OTP 입력 필드: ${hasOTPInput}`);
      console.log(`🔍 OTP 텍스트 패턴: ${hasOTPText}`);
      console.log(`🔍 OTP 페이지 여부: ${isOTPPage}`);

      // 페이지 텍스트 일부 출력 (디버깅용)
      console.log(`🔍 페이지 텍스트 샘플: ${pageText.substring(0, 200)}...`);

      if (isOTPPage) {
        console.log("🔐 OTP 인증이 필요합니다!");
        console.log("📱 브라우저에서 OTP를 입력해주세요...");
        console.log("⏳ OTP 입력 완료를 기다리는 중... (최대 5분)");

        // GUI에 OTP 상태 알림
        if (this.onOTPRequired) {
          this.onOTPRequired();
        }

        // OTP 입력 완료를 기다림 (최대 5분)
        const startTime = Date.now();
        const maxWaitTime = 5 * 60 * 1000; // 5분

        while (Date.now() - startTime < maxWaitTime) {
          await this.page.waitForTimeout(2000); // 2초마다 확인

          const newUrl = this.page.url();
          const newPageContent = await this.page.content();
          const newPageText = await this.page.textContent("body");

          // OTP 페이지에서 벗어났는지 확인 (더 정확한 방법)
          const stillHasOTPInput = await this.checkOTPInputExists();
          const stillHasOTPText = otpPatterns.some((pattern) =>
            pattern.test(newPageText)
          );

          const isOTPCompleted = !stillHasOTPInput && !stillHasOTPText;

          if (isOTPCompleted) {
            console.log("✅ OTP 인증이 완료되었습니다!");

            // GUI에 OTP 완료 알림
            if (this.onOTPCompleted) {
              this.onOTPCompleted();
            }

            await this.page.waitForLoadState("networkidle", { timeout: 10000 });
            return;
          }

          // 진행 상황 표시
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          if (elapsed % 30 === 0) {
            // 30초마다 메시지 표시
            console.log(`⏳ OTP 입력 대기 중... (${elapsed}초 경과)`);
          }
        }

        throw new Error("OTP 입력 시간이 초과되었습니다. 다시 시도해주세요.");
      } else {
        console.log(
          "✅ OTP 인증이 필요하지 않습니다. 메인 페이지로 진행합니다."
        );
      }
    } catch (error) {
      console.log("⚠️ OTP 처리 중 오류가 발생했습니다:", error.message);
      throw error;
    }
  }

  async checkOTPInputExists() {
    const otpInputSelectors = [
      'input[type="text"][maxlength="6"]',
      'input[type="text"][maxlength="4"]',
      'input[type="text"][maxlength="8"]',
      'input[placeholder*="코드"]',
      'input[placeholder*="code"]',
      'input[placeholder*="인증"]',
      'input[placeholder*="verification"]',
      'input[name*="code"]',
      'input[name*="otp"]',
      'input[name*="verification"]',
      'input[id*="code"]',
      'input[id*="otp"]',
      'input[id*="verification"]',
    ];

    for (const selector of otpInputSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          return true;
        }
      } catch (e) {
        // 다음 셀렉터 시도
      }
    }
    return false;
  }

  async extractCookies(targetUrl, cookieKeys, email, password, envFilePath) {
    try {
      console.log("🚀 브라우저를 시작합니다...");
      await this.launchBrowser(false); // GUI 모드로 실행

      console.log(`🌐 ${targetUrl}에 접속합니다...`);
      await this.page.goto(targetUrl, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // 로그인이 필요한지 확인하고 자동 로그인
      await this.autoLogin(email, password);

      console.log("🍪 쿠키를 가져오는 중...");

      // 모든 도메인의 쿠키를 가져오기
      const cookies = await this.page.context().cookies();
      console.log(`총 ${cookies.length}개의 쿠키를 발견했습니다.`);

      const extractedValues = {};
      const foundKeys = [];

      // 설정된 키들에 대해 쿠키 값 추출 (대소문자 구분 없이)
      for (const key of cookieKeys) {
        const cookie = cookies.find(
          (c) => c.name.toLowerCase() === key.toLowerCase()
        );
        if (cookie) {
          extractedValues[key] = cookie.value;
          foundKeys.push(key);
          console.log(`✅ ${key}: ${cookie.value.substring(0, 20)}...`);
        } else {
          // 부분 일치도 확인
          const partialMatch = cookies.find(
            (c) => c.name.includes(key) || key.includes(c.name)
          );
          if (partialMatch) {
            console.log(
              `🔍 비슷한 쿠키 발견: ${partialMatch.name} (원하는 키: ${key})`
            );
            extractedValues[key] = partialMatch.value;
            foundKeys.push(key);
            console.log(`✅ ${key}: ${partialMatch.value.substring(0, 20)}...`);
          } else {
            console.log(`❌ ${key}: 쿠키를 찾을 수 없습니다.`);
          }
        }
      }

      if (foundKeys.length === 0) {
        console.log("⚠️  설정된 키에 해당하는 쿠키가 없습니다.");
        console.log("사용 가능한 쿠키들:");
        cookies.forEach((cookie) => {
          console.log(
            `  - ${cookie.name} (도메인: ${cookie.domain}, 경로: ${cookie.path})`
          );
        });
        return {
          success: false,
          message: "쿠키를 찾을 수 없습니다.",
          availableCookies: cookies.map((c) => c.name),
        };
      }

      await this.updateEnvFile(extractedValues, envFilePath);
      console.log("✅ .env.local 파일이 성공적으로 업데이트되었습니다!");

      return {
        success: true,
        message: "쿠키 추출이 완료되었습니다!",
        extractedValues,
        envFilePath,
      };
    } catch (error) {
      console.error("❌ 오류가 발생했습니다:", error.message);
      return { success: false, message: error.message };
    }
  }

  async updateEnvFile(cookieValues, envFilePath) {
    const envPath = path.resolve(envFilePath);
    const envDir = path.dirname(envPath);

    // 디렉토리가 없으면 생성
    if (!fs.existsSync(envDir)) {
      fs.mkdirSync(envDir, { recursive: true });
    }

    let envContent = "";

    // 기존 .env.local 파일이 있으면 읽기
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // 각 쿠키 값을 .env.local에 추가/업데이트
    for (const [key, value] of Object.entries(cookieValues)) {
      const envKey = `COOKIE_${key.toUpperCase()}`;
      const regex = new RegExp(`^${envKey}=.*$`, "m");

      if (regex.test(envContent)) {
        // 기존 값 업데이트
        envContent = envContent.replace(regex, `${envKey}=${value}`);
        console.log(`🔄 ${envKey} 값이 업데이트되었습니다.`);
      } else {
        // 새 값 추가
        envContent += `\n${envKey}=${value}`;
        console.log(`➕ ${envKey} 값이 추가되었습니다.`);
      }
    }

    // 파일 저장
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(`📁 파일이 저장되었습니다: ${envPath}`);
  }

  async closeBrowser() {
    if (this.browser) {
      // 브라우저를 닫지 않고 유지
      console.log("🌐 브라우저를 유지합니다. 수동으로 닫아주세요.");
    }
  }
}

module.exports = CookieExtractor;
