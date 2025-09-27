const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class CookieExtractor {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, "config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        // Windows 경로 정규화
        if (config.envFilePath) {
          config.envFilePath = path.normalize(config.envFilePath);
        }
        return config;
      }
    } catch (error) {
      console.log("설정 파일을 찾을 수 없습니다. 기본 설정을 사용합니다.");
      console.log("오류:", error.message);
    }

    // 기본 설정
    return {
      envFilePath: process.env.ENV_FILE_PATH || "./.env.local",
      cookieKeys: process.env.COOKIE_KEYS
        ? process.env.COOKIE_KEYS.split(",")
        : ["session_id", "auth_token"],
      targetUrl: process.env.TARGET_URL || "https://example.com",
      browserOptions: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--ignore-certificate-errors",
          "--ignore-ssl-errors",
          "--ignore-certificate-errors-spki-list",
          "--disable-web-security",
        ],
      },
    };
  }

  async autoLogin(page) {
    try {
      console.log("🔐 로그인 상태를 확인하는 중...");

      // 로그인 페이지인지 확인
      const currentUrl = page.url();
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
            emailInput = await page.waitForSelector(selector, {
              timeout: 5000,
            });
            if (emailInput) break;
          } catch (e) {
            // 다음 셀렉터 시도
          }
        }

        if (emailInput) {
          console.log("📧 이메일 입력 필드를 찾았습니다.");
          await emailInput.fill("hs.kwan@okestro.com");
          console.log("✅ 이메일을 입력했습니다.");
        } else {
          console.log("❌ 이메일 입력 필드를 찾을 수 없습니다.");
          return;
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
            passwordInput = await page.waitForSelector(selector, {
              timeout: 5000,
            });
            if (passwordInput) break;
          } catch (e) {
            // 다음 셀렉터 시도
          }
        }

        if (passwordInput) {
          console.log("🔒 비밀번호 입력 필드를 찾았습니다.");
          await passwordInput.fill("Okestro2018!");
          console.log("✅ 비밀번호를 입력했습니다.");
        } else {
          console.log("❌ 비밀번호 입력 필드를 찾을 수 없습니다.");
          return;
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
            loginButton = await page.waitForSelector(selector, {
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
          await page.waitForLoadState("networkidle", { timeout: 30000 });

          console.log("✅ 로그인이 완료되었습니다!");
        } else {
          console.log("❌ 로그인 버튼을 찾을 수 없습니다.");
          return;
        }
      } else {
        console.log("✅ 이미 로그인된 상태입니다.");
      }
    } catch (error) {
      console.log("⚠️ 로그인 과정에서 오류가 발생했습니다:", error.message);
      // 로그인 실패해도 계속 진행
    }
  }

  async extractCookies() {
    let browser;
    try {
      console.log("🚀 브라우저를 시작합니다...");
      browser = await chromium.launch(this.config.browserOptions);
      const page = await browser.newPage();

      console.log(`🌐 ${this.config.targetUrl}에 접속합니다...`);
      await page.goto(this.config.targetUrl, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // 로그인이 필요한지 확인하고 자동 로그인
      await this.autoLogin(page);

      console.log("🍪 쿠키를 가져오는 중...");

      // 모든 도메인의 쿠키를 가져오기
      const cookies = await page.context().cookies();
      console.log(`총 ${cookies.length}개의 쿠키를 발견했습니다.`);

      const extractedValues = {};
      const foundKeys = [];

      // 설정된 키들에 대해 쿠키 값 추출 (대소문자 구분 없이)
      for (const key of this.config.cookieKeys) {
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
        return;
      }

      await this.updateEnvFile(extractedValues);
      console.log("✅ .env.local 파일이 성공적으로 업데이트되었습니다!");
    } catch (error) {
      console.error("❌ 오류가 발생했습니다:", error.message);
      process.exit(1);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async updateEnvFile(cookieValues) {
    const envPath = path.resolve(this.config.envFilePath);
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

  async run() {
    console.log("🍪 쿠키 추출기 시작");
    console.log("=".repeat(50));
    console.log(`📁 .env.local 경로: ${this.config.envFilePath}`);
    console.log(`🔑 추출할 쿠키 키들: ${this.config.cookieKeys.join(", ")}`);
    console.log(`🌐 대상 URL: ${this.config.targetUrl}`);
    console.log("=".repeat(50));

    await this.extractCookies();
  }
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  const extractor = new CookieExtractor();
  extractor.run().catch(console.error);
}

module.exports = CookieExtractor;
