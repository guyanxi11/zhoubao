# 周报匣

纯前端静态站：实习周报 / 工作周报生成器，外加时间戳互转、JSON 格式化、Markdown 转纯文本。
不收集内容、无账号、无支付回调。收款码是微信支付个人码，仅用于自愿赞赏。

作者署名：颇黎。

## 本地打开

双击 `index.html`，或在本目录执行 `preview.cmd`，或：

```bat
npx --yes --package=serve serve .
```

浏览器打开终端里给出的地址即可。

## 部署到 GitHub Pages（一条命令）

需已安装 Git 与 GitHub CLI，并且 `gh auth login` 成功：

```bat
cd /d "%~dp0"
git init -b main
git add -A
git commit -m "Publish zhoubao static site"
gh repo create zhoubao --public --source=. --remote=origin --push
gh pages deploy --repo zhoubao --branch main --path .
```

若 `gh pages deploy` 不可用，到仓库 Settings → Pages，Source 选 `main` 根目录。

预期地址类似：`https://<用户名>.github.io/zhoubao/`

当前已发布：https://guyanxi11.github.io/zhoubao/

## 说明

- 赞赏后去水印：打开 `support.html`，扫码后点「我已支持」。只写本机 localStorage。
- 建议金额 ¥6.6 / ¥15.9，可任意或不给。
- 无流量则收入接近 0；这是长期搜索沉淀，不是暴利项目。
