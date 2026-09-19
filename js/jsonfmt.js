/**
 * JSON 格式化 / 压缩 / 校验。数据不出浏览器。
 * 作者：wym
 */
(function () {
  /**
   * 尝试解析。失败返回 {ok:false, error}。
   * @param {string} raw
   * @returns {{ok:boolean, value?:*, error?:string}}
   */
  function tryParse(raw) {
    var s = String(raw || "").trim();
    if (!s) return { ok: false, error: "还没有内容。" };
    try {
      return { ok: true, value: JSON.parse(s) };
    } catch (e) {
      return { ok: false, error: e.message || String(e) };
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var src = document.getElementById("json-in");
    var out = document.getElementById("json-out");
    var err = document.getElementById("json-err");

    /**
     * @param {string} text
     * @param {string} errorText
     */
    function show(text, errorText) {
      out.textContent = text || "";
      err.textContent = errorText || "";
    }

    document.getElementById("btn-json-pretty").addEventListener("click", function () {
      var r = tryParse(src.value);
      if (!r.ok) return show("", r.error);
      show(JSON.stringify(r.value, null, 2), "");
    });

    document.getElementById("btn-json-mini").addEventListener("click", function () {
      var r = tryParse(src.value);
      if (!r.ok) return show("", r.error);
      show(JSON.stringify(r.value), "");
    });

    document.getElementById("btn-json-check").addEventListener("click", function () {
      var r = tryParse(src.value);
      if (!r.ok) return show("", r.error);
      var keys = r.value && typeof r.value === "object" ? Object.keys(r.value).length : 0;
      show("校验通过。根类型：" + (Array.isArray(r.value) ? "array" : typeof r.value) +
        (typeof r.value === "object" && r.value ? "，键/元素数约 " + (Array.isArray(r.value) ? r.value.length : keys) : ""), "");
    });

    document.getElementById("btn-json-copy").addEventListener("click", function () {
      if (window.Zhoubao.copyText(out.textContent)) window.Zhoubao.toast("已复制输出");
      else window.Zhoubao.toast("复制失败，请手动选择");
    });

    document.getElementById("btn-json-sample").addEventListener("click", function () {
      src.value = '{"week":"2026-09-15","items":["联调登录","改筛选"],"ok":true}';
    });
  });
})();
