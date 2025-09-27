const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("cookieForm");
  const extractBtn = document.getElementById("extractBtn");
  const loading = document.getElementById("loading");
  const resultContainer = document.getElementById("resultContainer");
  const resultTitle = document.getElementById("resultTitle");
  const resultMessage = document.getElementById("resultMessage");
  const cookieValue = document.getElementById("cookieValue");
  const logContainer = document.getElementById("logContainer");

  // 기본값 설정
  document.getElementById("targetUrl").value =
    "https://dev.admin.okestro.cloud/#/maestro";
  document.getElementById("email").value = "hs.kwan@okestro.com";
  document.getElementById("password").value = "Okestro2018!";
  document.getElementById("cookieKeys").value = "_oauth2_proxy";
  document.getElementById("envFilePath").value =
    "C:\\Users\\admin\\Desktop\\mono_305\\okestro-cmp-app\\apps\\okestro-cmp-app-admin\\.env.local";

  function showLoading() {
    loading.style.display = "block";
    extractBtn.disabled = true;
    extractBtn.textContent = "⏳ 추출 중...";
    resultContainer.style.display = "none";
    logContainer.style.display = "block";
  }

  function hideLoading() {
    loading.style.display = "none";
    extractBtn.disabled = false;
    extractBtn.textContent = "🚀 쿠키 추출 시작";
  }

  function showResult(success, title, message, cookieData = null) {
    resultContainer.style.display = "block";
    resultContainer.className = `result-container ${
      success ? "result-success" : "result-error"
    }`;
    resultTitle.textContent = title;
    resultMessage.textContent = message;

    if (cookieData && success) {
      cookieValue.style.display = "block";
      cookieValue.innerHTML = "<strong>추출된 쿠키 값:</strong><br>";
      for (const [key, value] of Object.entries(cookieData)) {
        cookieValue.innerHTML += `<strong>${key}:</strong> ${value}<br>`;
      }
    } else {
      cookieValue.style.display = "none";
    }
  }

  function addLog(message, type = "info") {
    const logEntry = document.createElement("div");
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  function showOTPNotification() {
    const otpNotification = document.createElement("div");
    otpNotification.id = "otpNotification";
    otpNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 1000;
      max-width: 300px;
      font-weight: 600;
    `;
    otpNotification.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 10px;">🔐 OTP 인증 필요</div>
      <div style="font-size: 14px; opacity: 0.9;">
        브라우저에서 OTP를 입력해주세요.<br>
        입력 완료 시 자동으로 진행됩니다.
      </div>
    `;
    document.body.appendChild(otpNotification);
  }

  function hideOTPNotification() {
    const otpNotification = document.getElementById("otpNotification");
    if (otpNotification) {
      otpNotification.remove();
    }
  }

  function clearLog() {
    logContainer.innerHTML = "";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const targetUrl = document.getElementById("targetUrl").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const cookieKeysInput = document.getElementById("cookieKeys").value;
    const envFilePath = document.getElementById("envFilePath").value;

    // 쿠키 키들을 배열로 변환
    const cookieKeys = cookieKeysInput
      .split(",")
      .map((key) => key.trim())
      .filter((key) => key);

    if (cookieKeys.length === 0) {
      showResult(false, "❌ 오류", "쿠키 이름을 입력해주세요.");
      return;
    }

    showLoading();
    clearLog();
    addLog("🚀 쿠키 추출을 시작합니다...", "info");
    addLog(`🌐 대상 URL: ${targetUrl}`, "info");
    addLog(`📧 이메일: ${email}`, "info");
    addLog(`🍪 쿠키 키들: ${cookieKeys.join(", ")}`, "info");
    addLog(`📁 저장 경로: ${envFilePath}`, "info");

    try {
      const result = await ipcRenderer.invoke("extract-cookies", {
        targetUrl,
        cookieKeys,
        email,
        password,
        envFilePath,
      });

      hideLoading();

      if (result.success) {
        addLog("✅ 쿠키 추출이 완료되었습니다!", "success");
        showResult(true, "✅ 성공!", result.message, result.extractedValues);

        // 추출된 쿠키 값들을 로그에 표시
        for (const [key, value] of Object.entries(result.extractedValues)) {
          addLog(`🍪 ${key}: ${value.substring(0, 50)}...`, "success");
        }
      } else {
        addLog(`❌ 오류: ${result.message}`, "error");
        showResult(false, "❌ 실패", result.message);

        if (result.availableCookies) {
          addLog("사용 가능한 쿠키들:", "warning");
          result.availableCookies.forEach((cookie) => {
            addLog(`  - ${cookie}`, "info");
          });
        }
      }
    } catch (error) {
      hideLoading();
      addLog(`❌ 예상치 못한 오류: ${error.message}`, "error");
      showResult(
        false,
        "❌ 오류",
        `예상치 못한 오류가 발생했습니다: ${error.message}`
      );
    }
  });

  // 폼 입력 시 로그 초기화
  form.addEventListener("input", function () {
    if (resultContainer.style.display === "block") {
      resultContainer.style.display = "none";
    }
  });

  // OTP 상태 수신
  ipcRenderer.on("otp-status", (event, data) => {
    const { message, type } = data;
    addLog(message, type);

    if (type === "warning") {
      showOTPNotification();
    } else if (type === "success") {
      hideOTPNotification();
    }
  });
});
