document.addEventListener("DOMContentLoaded", function () {
  // 1. 優先從 localStorage 讀取舊資料；如果沒有資料，participants 就是空陣列
  let participants = JSON.parse(localStorage.getItem("participants")) || [];
  
  // 2. 之後就不要再 let participants = [...]。
  //    所有操作都用這個 participants 陣列

  // 檢查是否為連續排列（全數字或全字母，至少 4 字元才檢查）
  function isSequential(str) {
    if (str.length < 4) return false;
    let ascending = true,
        descending = true;
    for (let i = 1; i < str.length; i++) {
      if (str.charCodeAt(i) !== str.charCodeAt(i - 1) + 1) {
        ascending = false;
      }
      if (str.charCodeAt(i) !== str.charCodeAt(i - 1) - 1) {
        descending = false;
      }
    }
    return ascending || descending;
  }

  // 驗證 Discord ID：若全為數字或全為英文字，且為連續排列則不合格
  function validateDiscordId(id) {
    if (/^[0-9]+$/.test(id)) {
      return !isSequential(id);
    } else if (/^[a-zA-Z]+$/.test(id)) {
      return !isSequential(id.toLowerCase());
    }
    return true;
  }

  // 自訂 Email 正規表達式：要求 @ 後面至少有一個點
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

  // 取得各個 DOM 元素
  const discordErrorMessage = document.getElementById("discordErrorMessage");
  const discordForm = document.getElementById("discordForm");
  const discordInput = document.getElementById("discordInput");
  const serverSelect = document.getElementById("serverSelect");
  const discordSubmit = document.getElementById("discordSubmit");
  const lotteryBtn = document.getElementById("lotteryBtn");
  const prizeDisplay = document.getElementById("prizeDisplay");
  const emailForm = document.getElementById("emailForm");
  const emailInput = document.getElementById("emailInput");
  const emailSubmit = document.getElementById("emailSubmit");
  const emailErrorMessage = document.getElementById("emailErrorMessage");
  const verificationInput = document.getElementById("verificationInput");
  const generateCodeBtn = document.getElementById("generateCodeBtn");

  let currentParticipant = null;
  let currentVerificationCode = "";

  // 把整個 participants 儲存到 localStorage
  function saveParticipantsToLocalStorage() {
    localStorage.setItem("participants", JSON.stringify(participants, null, 2));
  }

  // Discord 表單送出
  discordSubmit.addEventListener("click", function (e) {
    e.preventDefault();
    discordErrorMessage.textContent = "";
    const discordId = discordInput.value.trim();
    if (!discordId) {
      discordErrorMessage.textContent = "請輸入有效的 Discord ID！";
      return;
    }
    if (!validateDiscordId(discordId)) {
      discordErrorMessage.textContent =
        "請勿使用全連續數字或英文字作為 Discord ID！";
      return;
    }
    // 判斷是否重複
    if (participants.some((p) => p.discordId === discordId)) {
      discordErrorMessage.textContent = "你已經抽過獎了！";
      return;
    }
    currentParticipant = {
      discordId: discordId,
      server: serverSelect.value,
    };
    // 新增到陣列
    participants.push(currentParticipant);

    // 顯示抽獎按鈕
    prizeDisplay.textContent = "";
    lotteryBtn.disabled = false;
    lotteryBtn.style.display = "block";

    // 隱藏 Discord 表單
    discordForm.style.display = "none";
  });

  // 獎品清單（僅贏獎項目）
  const winningPrizes = [
    "Nitro－一月（贈禮）",
    "Robux 快儲－400R",
    "Robux 快儲－800R",
    "Robux 快儲－450R+一個月會員",
    "Blox Fruits－【永久果】龍龍",
    "Rivals－Legendary鑰匙包",
    "Jujutsu－500次先天旋轉",
    "特務幣（菲服）－3250",
    "特務幣（全區）－9000",
    "原神UID儲值－6480創世結晶",
    "YouTube Premium－一年（邀請版）",
  ];

  // 抽獎按鈕：抽獎動畫
  lotteryBtn.addEventListener("click", function () {
    lotteryBtn.disabled = true;
    const animationDuration = 3000;
    const intervalTime = 100;
    let elapsed = 0;
    const interval = setInterval(() => {
      const tempPrize =
        winningPrizes[Math.floor(Math.random() * winningPrizes.length)];
      prizeDisplay.textContent = tempPrize;
      elapsed += intervalTime;
      if (elapsed >= animationDuration) {
        clearInterval(interval);
        // 原本這邊是 `Math.random() < 0` (相當於都不會中獎XD)
        // 如果只是想測試，先改 < 0.3 之類的
        const finalPrize =
          Math.random() < 0
            ? winningPrizes[Math.floor(Math.random() * winningPrizes.length)]
            : "未中獎，別擔心填入電子郵件即可抽150元社群幣";
        prizeDisplay.textContent = finalPrize;
        // 更新當前參與者資料，加入抽獎結果
        currentParticipant.lotteryResult = finalPrize;
        // 隱藏抽獎按鈕，顯示電子郵件表單
        lotteryBtn.style.display = "none";
        emailForm.style.display = "block";
      }
    }, intervalTime);
  });

  generateCodeBtn.addEventListener("click", function () {
    // 生成隨機 5 位數驗證碼
    currentVerificationCode = String(Math.floor(10000 + Math.random() * 90000));

    // 建立全螢幕影片覆蓋層
    const overlay = document.createElement("div");
    overlay.classList.add("video-container");
    overlay.innerHTML = `
      <video height="780" autoplay playsinline webkit-playsinline>
        <source src="scare.mp4" type="video/mp4">
        您的瀏覽器不支援播放影片。
      </video>
      <div class="black-overlay-top"></div>
      <div class="black-overlay-bottom"></div>
      <div class="message-overlay">驗證碼在影片裡，請仔細觀看</div>
    `;
    document.body.appendChild(overlay);

    const messageOverlay = overlay.querySelector(".message-overlay");
    const videoDuration = 20000; // 20秒

    // 影片前4秒顯示提示文字
    setTimeout(() => {
      if (messageOverlay) {
        messageOverlay.style.display = "none";
      }
    }, 4000);

    // 影片結束前5秒（15秒後）顯示驗證碼
    setTimeout(() => {
      if (messageOverlay) {
        messageOverlay.style.display = "block";
        messageOverlay.textContent = currentVerificationCode;
      }
    }, 15000);

    // 20秒後關閉覆蓋層，啟用驗證碼輸入
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      verificationInput.disabled = false;
    }, videoDuration);
  });

  emailSubmit.addEventListener("click", function (e) {
    e.preventDefault();
    emailErrorMessage.textContent = "";
    const email = emailInput.value.trim();
    const verification = verificationInput.value.trim();
    if (!email || !emailRegex.test(email)) {
      emailErrorMessage.textContent = "請輸入有效的電子郵件！";
      return;
    }
    if (!verification) {
      emailErrorMessage.textContent = "請輸入驗證碼！";
      return;
    }
    if (verification !== currentVerificationCode) {
      emailErrorMessage.textContent = "驗證碼錯誤！";
      return;
    }

    // 驗證成功，隱藏 email 表單
    emailForm.style.display = "none";

    // 更新當前參與者資料
    currentParticipant.email = email;

    // *** 關鍵：寫回 localStorage 前，participants 早已包含全部人，新人也加了 email
    saveParticipantsToLocalStorage();

    // 播放影片
    const emailVideoOverlay = document.createElement("div");
    emailVideoOverlay.classList.add("video-container");
    emailVideoOverlay.innerHTML = `
      <video id="emailVideo" height="1080" autoplay playsinline webkit-playsinline>
        <source src="rickroll.mp4" type="video/mp4">
        您的瀏覽器不支援播放影片。
      </video>
    `;
    document.body.appendChild(emailVideoOverlay);

    const emailVideo = document.getElementById("emailVideo");
    emailVideo.onended = function () {
      emailVideoOverlay.innerHTML = `
        <div class="already-participated">
          <h2>恭喜您已參加抽獎！</h2>
          <p>感謝您的參與，請持續關注<a href="https://dc.newnight.tw/rc">狸貓社群官方discord</a>。</p>
          <p>這是真的抽獎ww</p>
        </div>
      `;
    };
  });

  // 背景互動效果
  document.addEventListener("mousemove", function (e) {
    const x = e.clientX,
          y = e.clientY;
    document.querySelector(".background").style.background = 
      `radial-gradient(circle at ${x}px ${y}px, #1a1a1a, #000000)`;
  });
});
