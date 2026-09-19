/**
 * 实习周报 / 工作周报生成器（纯前端）。
 * 作者：wym
 * 原则：保留用户原意，只做分段、编号和轻度通顺化，不编造业绩。
 */
(function () {
  /**
   * 把多行事项拆成干净条目。
   * @param {string} text
   * @returns {string[]}
   */
  function parseLines(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map(function (line) {
        return line
          .replace(/^\s*[-*•·、]+/, "")
          .replace(/^\s*\d+[\.、\)]\s*/, "")
          .trim();
      })
      .filter(Boolean);
  }

  /**
   * 轻度通顺化：去项目符号、补句号；不添加「赋能」「闭环」等空话。
   * @param {string} line
   * @returns {string}
   */
  function polish(line) {
    var t = String(line || "").replace(/[;；]+$/, "").trim();
    if (!t) return "";
    if (!/[。.!！？?]$/.test(t)) t += "。";
    return t;
  }

  /**
   * yyyy-mm-dd 转中文日期。
   * @param {string} iso
   * @returns {string}
   */
  function cnDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    if (p.length !== 3) return iso;
    return Number(p[0]) + "年" + Number(p[1]) + "月" + Number(p[2]) + "日";
  }

  /**
   * 本周一（本地时区）。
   * @returns {string} yyyy-mm-dd
   */
  function mondayIso() {
    var d = new Date();
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    var mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
    return toIso(mon);
  }

  /**
   * 今天。
   * @returns {string}
   */
  function todayIso() {
    return toIso(new Date());
  }

  /**
   * @param {Date} d
   * @returns {string}
   */
  function toIso(d) {
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  /**
   * 按身份选标题。
   * @param {string} role
   * @returns {string}
   */
  function titleOf(role) {
    if (role === "staff") return "工作周报";
    if (role === "project") return "项目周报";
    return "实习周报";
  }

  /**
   * 生成正文。核心：结构固定为完成 / 问题 / 计划，条目来自用户输入。
   * @param {object} form
   * @returns {string}
   */
  function generate(form) {
    var role = form.role || "intern";
    var start = form.start;
    var end = form.end;
    var name = (form.name || "").trim();
    var post = (form.post || "").trim();
    var done = parseLines(form.done).map(polish);
    var doing = parseLines(form.doing).map(polish);
    var issues = parseLines(form.issues).map(polish);
    var next = parseLines(form.next).map(polish);
    var extra = (form.extra || "").trim();
    var tone = form.tone || "plain";

    var lines = [];
    var range = cnDate(start) + " 至 " + cnDate(end);
    lines.push(titleOf(role) + "（" + range + "）");

    // 汇报人信息可选，避免强迫填写单位全称
    if (name || post) {
      lines.push((name ? "汇报人：" + name : "") + (name && post ? "　" : "") + (post ? "岗位/方向：" + post : ""));
    }
    lines.push("");

    if (tone === "formal") {
      lines.push("现将本周工作情况整理如下。");
      lines.push("");
    } else if (tone === "detailed") {
      lines.push("本周周期为" + range + "。下面按「已完成 / 进行中 / 问题 / 下周」排列，便于对照。");
      lines.push("");
    }

    lines.push("一、本周完成");
    if (!done.length) {
      lines.push("（本周暂未填写已完成事项。）");
    } else {
      done.forEach(function (item, i) {
        lines.push((i + 1) + ". " + item);
      });
    }

    if (doing.length) {
      lines.push("");
      lines.push("二、进行中");
      doing.forEach(function (item, i) {
        lines.push((i + 1) + ". " + item);
      });
    }

    lines.push("");
    lines.push(doing.length ? "三、问题与说明" : "二、问题与说明");
    if (!issues.length) {
      lines.push("本周无需要升级的阻塞；若有遗留项，已记在进行中或下周计划。");
    } else {
      issues.forEach(function (item, i) {
        lines.push((i + 1) + ". " + item);
      });
    }

    lines.push("");
    var planHead = doing.length ? "四、下周计划" : "三、下周计划";
    lines.push(planHead);
    if (!next.length) {
      lines.push("下周计划待补充。建议写到可验收的一句话，而不是「继续学习」。");
    } else {
      next.forEach(function (item, i) {
        lines.push((i + 1) + ". " + item);
      });
    }

    if (extra) {
      lines.push("");
      lines.push(doing.length ? "五、补充" : "四、补充");
      lines.push(extra);
    }

    return lines.join("\n").replace(/\n{3,}/g, "\n\n");
  }

  /**
   * 视解锁状态决定是否附加角标。
   * @param {string} body
   * @param {boolean} forceClean
   * @returns {string}
   */
  function withMark(body, forceClean) {
    if (forceClean || window.Zhoubao.isUnlocked()) return body;
    return body + "\n\n" + window.Zhoubao.watermark;
  }

  /**
   * 绑定首页表单。
   */
  function bind() {
    var form = document.getElementById("report-form");
    if (!form) return;

    var startEl = document.getElementById("week-start");
    var endEl = document.getElementById("week-end");
    if (startEl && !startEl.value) startEl.value = mondayIso();
    if (endEl && !endEl.value) endEl.value = todayIso();

    var preview = document.getElementById("preview");
    var meta = document.getElementById("preview-meta");

    /**
     * 从表单读值并刷新预览。
     * @returns {string}
     */
    function currentText() {
      var data = {
        role: document.getElementById("role").value,
        start: startEl.value,
        end: endEl.value,
        name: document.getElementById("reporter").value,
        post: document.getElementById("post").value,
        done: document.getElementById("done").value,
        doing: document.getElementById("doing").value,
        issues: document.getElementById("issues").value,
        next: document.getElementById("next").value,
        extra: document.getElementById("extra").value,
        tone: document.getElementById("tone").value
      };
      return generate(data);
    }

    /**
     * 刷新右侧预览与字数。
     */
    function refresh() {
      var body = currentText();
      var shown = withMark(body, false);
      preview.textContent = shown;
      var n = body.replace(/\s/g, "").length;
      var extra = window.Zhoubao.isUnlocked()
        ? "本机已解锁，复制不含角标。"
        : "免费复制本周还剩 " + Math.max(0, window.Zhoubao.FREE_COPIES_PER_WEEK - window.Zhoubao.copyCount()) + " 次不含角标。";
      meta.textContent = "约 " + n + " 字。" + extra;
      return body;
    }

    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);

    document.getElementById("btn-sample").addEventListener("click", function () {
      document.getElementById("role").value = "intern";
      document.getElementById("reporter").value = "颇黎";
      document.getElementById("post").value = "后端实习";
      document.getElementById("done").value = [
        "完成登录接口联调，补了验证码过期后的重发逻辑",
        "按评审意见改房间列表筛选，已提测",
        "写了两页接口说明，方便前端对照字段"
      ].join("\n");
      document.getElementById("doing").value = "评价列表分页还在改空数据展示";
      document.getElementById("issues").value = "测试环境验证码通道不稳定，联调时用固定演示码";
      document.getElementById("next").value = [
        "做完评价列表分页并补异常提示",
        "整理本周接口变更，发给对接的前端"
      ].join("\n");
      document.getElementById("extra").value = "";
      document.getElementById("tone").value = "plain";
      refresh();
      window.Zhoubao.toast("已填入示例，可直接改成你的事项");
    });

    document.getElementById("btn-generate").addEventListener("click", function () {
      refresh();
      window.Zhoubao.toast("已生成，右侧可复制");
    });

    document.getElementById("btn-copy").addEventListener("click", function () {
      var body = currentText();
      var clean = window.Zhoubao.canCleanCopy();
      var text = withMark(body, clean);
      if (window.Zhoubao.copyText(text)) {
        if (clean && !window.Zhoubao.isUnlocked()) window.Zhoubao.bumpCopy();
        refresh();
        window.Zhoubao.toast(clean ? "已复制" : "已复制（含支持作者角标）");
      } else {
        window.Zhoubao.toast("复制失败，请手动全选右侧文本");
      }
    });

    document.getElementById("btn-clear").addEventListener("click", function () {
      ["reporter", "post", "done", "doing", "issues", "next", "extra"].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      refresh();
    });

    refresh();
  }

  document.addEventListener("DOMContentLoaded", bind);
})();
