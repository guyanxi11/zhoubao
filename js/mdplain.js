/**
 * Markdown 转适合粘进周报的纯文本。
 * 作者：wym
 * 只做本地字符串处理，不去请求任何接口。
 */
(function () {
  /**
   * 去掉常见 Markdown 标记，保留层级信息的纯文本。
   * @param {string} md
   * @returns {string}
   */
  function toPlain(md) {
    var text = String(md || "").replace(/\r\n/g, "\n");
    // 代码块：保留内容，去掉围栏
    text = text.replace(/```[\w-]*\n?([\s\S]*?)```/g, function (_, code) {
      return code.replace(/\s+$/, "") + "\n";
    });
    // 标题
    text = text.replace(/^#{1,6}\s+/gm, "");
    // 图片、链接
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // 粗斜体、行内代码
    text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
    text = text.replace(/(\*|_)(.*?)\1/g, "$2");
    text = text.replace(/`([^`]+)`/g, "$1");
    // 引用
    text = text.replace(/^>\s?/gm, "");
    // 无序/有序改成「1. 」风格之前先收成条目
    var lines = text.split("\n");
    var out = [];
    var n = 1;
    var inList = false;
    lines.forEach(function (line) {
      var m = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/);
      if (m) {
        if (!inList) n = 1;
        inList = true;
        out.push(n + ". " + m[1]);
        n += 1;
        return;
      }
      inList = false;
      n = 1;
      out.push(line.replace(/^\s*\|\s*/, "").replace(/\s*\|\s*/g, "　"));
    });
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var src = document.getElementById("md-in");
    var out = document.getElementById("md-out");

    document.getElementById("btn-md-convert").addEventListener("click", function () {
      out.textContent = toPlain(src.value) || "（没有可转换的内容）";
    });

    document.getElementById("btn-md-copy").addEventListener("click", function () {
      if (window.Zhoubao.copyText(out.textContent)) window.Zhoubao.toast("已复制纯文本");
      else window.Zhoubao.toast("复制失败，请手动选择");
    });

    document.getElementById("btn-md-sample").addEventListener("click", function () {
      src.value = [
        "## 本周完成",
        "- 完成 **登录联调**",
        "- 修复验证码过期问题",
        "",
        "## 下周",
        "1. 评价列表分页",
        "2. 补接口说明",
        "",
        "详见 [内部文档](https://example.com)。"
      ].join("\n");
    });
  });
})();
