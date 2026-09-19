/**
 * 周报匣公共脚本：复制、toast、赞赏解锁状态。
 * 作者：wym
 * 无后端、无支付回调；解锁只写本机 localStorage。
 */
(function () {
  var UNLOCK_KEY = "zhoubao_supporter_v1";
  var COPY_KEY = "zhoubao_copy_meta_v1";
  var FREE_COPIES_PER_WEEK = 6;

  /**
   * 读取本机是否已按君子协议标记「我已支持」。
   * @returns {boolean}
   */
  function isUnlocked() {
    try {
      return localStorage.getItem(UNLOCK_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  /**
   * 写入解锁标记。个人收款码没有回调，全靠用户自愿点击。
   */
  function unlock() {
    try {
      localStorage.setItem(UNLOCK_KEY, "1");
    } catch (e) {}
  }

  /**
   * 取消解锁（调试/误点用）。
   */
  function lock() {
    try {
      localStorage.removeItem(UNLOCK_KEY);
    } catch (e) {}
  }

  /**
   * 当前自然周的编号（周一为一周开始，仅用于免费复制次数）。
   * @returns {string}
   */
  function weekStamp() {
    var d = new Date();
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    var mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
    return mon.getFullYear() + "-" + (mon.getMonth() + 1) + "-" + mon.getDate();
  }

  /**
   * 读取本周已一键复制次数。
   * @returns {number}
   */
  function copyCount() {
    try {
      var raw = localStorage.getItem(COPY_KEY);
      if (!raw) return 0;
      var obj = JSON.parse(raw);
      if (!obj || obj.week !== weekStamp()) return 0;
      return Number(obj.n) || 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * 累加一次复制计数。
   */
  function bumpCopy() {
    try {
      localStorage.setItem(COPY_KEY, JSON.stringify({ week: weekStamp(), n: copyCount() + 1 }));
    } catch (e) {}
  }

  /**
   * 免费额度是否还够一次「干净复制」。
   * @returns {boolean}
   */
  function canCleanCopy() {
    return isUnlocked() || copyCount() < FREE_COPIES_PER_WEEK;
  }

  /**
   * 右上角状态条。
   */
  function renderChip() {
    var el = document.getElementById("unlock-chip");
    if (!el) return;
    if (isUnlocked()) {
      el.textContent = "本机已去水印";
    } else {
      el.textContent = "免费 · 可自愿支持";
    }
  }

  /**
   * 轻提示。file:// 下也可用，不依赖第三方。
   * @param {string} msg
   */
  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  /**
   * 复制文本。file:// 下 clipboard API 常被禁，回退到 textarea + execCommand。
   * @param {string} text
   * @returns {boolean}
   */
  function copyText(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  document.addEventListener("DOMContentLoaded", renderChip);

  window.Zhoubao = {
    isUnlocked: isUnlocked,
    unlock: unlock,
    lock: lock,
    copyCount: copyCount,
    bumpCopy: bumpCopy,
    canCleanCopy: canCleanCopy,
    FREE_COPIES_PER_WEEK: FREE_COPIES_PER_WEEK,
    copyText: copyText,
    toast: toast,
    watermark: "（由周报匣生成 · 支持作者后可关闭此行）"
  };
})();
