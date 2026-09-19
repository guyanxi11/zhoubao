/**
 * Unix 时间戳与日期互转（纯前端，默认按本地时区显示，并附北京时间）。
 * 作者：wym
 */
(function () {
  /**
   * 把 Date 格式化为本地可读字符串。
   * @param {Date} d
   * @returns {string}
   */
  function fmtLocal(d) {
    if (isNaN(d.getTime())) return "无效时间";
    var p = function (n) { return n < 10 ? "0" + n : String(n); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
      " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  /**
   * 北京时间（UTC+8）字符串。
   * @param {Date} d
   * @returns {string}
   */
  function fmtBeijing(d) {
    if (isNaN(d.getTime())) return "无效时间";
    var t = new Date(d.getTime() + 8 * 3600 * 1000);
    var iso = t.toISOString().replace("T", " ").slice(0, 19);
    return iso + " (UTC+8)";
  }

  /**
   * 相对现在的中文描述。
   * @param {Date} d
   * @returns {string}
   */
  function relative(d) {
    var ms = d.getTime() - Date.now();
    var abs = Math.abs(ms);
    var sec = Math.round(abs / 1000);
    var unit, n;
    if (sec < 60) { unit = "秒"; n = sec; }
    else if (sec < 3600) { unit = "分钟"; n = Math.round(sec / 60); }
    else if (sec < 86400) { unit = "小时"; n = Math.round(sec / 3600); }
    else { unit = "天"; n = Math.round(sec / 86400); }
    if (ms > 0) return n + " " + unit + "后";
    if (ms < 0) return n + " " + unit + "前";
    return "现在";
  }

  /**
   * 解析用户输入：纯数字当秒或毫秒；否则 Date.parse。
   * @param {string} raw
   * @returns {Date|null}
   */
  function parseInput(raw) {
    var s = String(raw || "").trim();
    if (!s) return null;
    if (/^-?\d+(\.\d+)?$/.test(s)) {
      var n = Number(s);
      // 13 位当毫秒，10 位当秒；介于中间的按数量级判断
      if (Math.abs(n) < 1e11) n = n * 1000;
      var d = new Date(n);
      return isNaN(d.getTime()) ? null : d;
    }
    var d2 = new Date(s.replace(/年|月/g, "-").replace(/日/g, " "));
    return isNaN(d2.getTime()) ? null : d2;
  }

  /**
   * 渲染一组结果。
   * @param {Date} d
   */
  function render(d) {
    var box = document.getElementById("ts-out");
    if (!d) {
      box.textContent = "无法解析。可粘贴 10 位秒、13 位毫秒，或 2026-09-19 22:00。";
      return;
    }
    var sec = Math.floor(d.getTime() / 1000);
    var lines = [
      "本地时间：  " + fmtLocal(d),
      "北京时间：  " + fmtBeijing(d),
      "ISO 8601：  " + d.toISOString(),
      "秒时间戳：  " + sec,
      "毫秒时间戳：" + d.getTime(),
      "相对现在：  " + relative(d)
    ];
    box.textContent = lines.join("\n");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("ts-input");
    var dt = document.getElementById("ts-dt");

    document.getElementById("btn-ts-now").addEventListener("click", function () {
      var now = new Date();
      input.value = String(Math.floor(now.getTime() / 1000));
      dt.value = fmtLocal(now).replace(" ", "T");
      render(now);
    });

    document.getElementById("btn-ts-convert").addEventListener("click", function () {
      render(parseInput(input.value));
    });

    document.getElementById("btn-ts-from-dt").addEventListener("click", function () {
      if (!dt.value) {
        render(null);
        return;
      }
      var d = new Date(dt.value);
      input.value = String(Math.floor(d.getTime() / 1000));
      render(d);
    });

    document.getElementById("btn-ts-copy").addEventListener("click", function () {
      var text = document.getElementById("ts-out").textContent;
      if (window.Zhoubao.copyText(text)) window.Zhoubao.toast("已复制结果");
      else window.Zhoubao.toast("复制失败，请手动选择");
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") render(parseInput(input.value));
    });
  });
})();
