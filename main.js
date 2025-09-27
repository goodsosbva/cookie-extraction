const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const CookieExtractor = require("./cookie-extractor");

let mainWindow;
let cookieExtractor;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "icon.ico"),
    title: "Cookie Extractor - 황제님 전용",
  });

  mainWindow.loadFile("index.html");

  // 개발 모드에서는 DevTools 열기
  if (process.argv.includes("--dev")) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 쿠키 추출 요청 처리
ipcMain.handle("extract-cookies", async (event, data) => {
  try {
    const { targetUrl, cookieKeys, email, password, envFilePath } = data;

    cookieExtractor = new CookieExtractor();

    // OTP 상태를 GUI로 전달하는 함수
    const sendOTPStatus = (message, type = "info") => {
      mainWindow.webContents.send("otp-status", { message, type });
    };

    // 쿠키 추출기에서 OTP 상태 전달을 위한 콜백 설정
    cookieExtractor.onOTPRequired = () => {
      sendOTPStatus(
        "🔐 OTP 인증이 필요합니다! 브라우저에서 OTP를 입력해주세요...",
        "warning"
      );
    };

    cookieExtractor.onOTPCompleted = () => {
      sendOTPStatus("✅ OTP 인증이 완료되었습니다!", "success");
    };

    const result = await cookieExtractor.extractCookies(
      targetUrl,
      cookieKeys,
      email,
      password,
      envFilePath
    );

    return result;
  } catch (error) {
    return {
      success: false,
      message: `오류 발생: ${error.message}`,
    };
  }
});

// 브라우저 닫기 요청 처리
ipcMain.handle("close-browser", async () => {
  try {
    if (cookieExtractor) {
      await cookieExtractor.closeBrowser();
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
