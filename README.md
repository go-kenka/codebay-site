# CodeBay 官网

CodeBay 的产品主页，纯静态站点（HTML + CSS + 原生 JS，无构建步骤）。

- 入口：`index.html`
- 样式：`style.css`（拉丁字体为自托管子集，位于 `assets/fonts/`）
- 脚本：`main.js`
- 未签名预览安装脚本：`install.sh`（下载、校验、ad-hoc 签名、安装）
- 图片：`assets/shots/hero.webp` 与 `assets/logo.png`

## 本地预览

```bash
python3 -m http.server -d web 8000
# 打开 http://127.0.0.1:8000/
```

## 部署

源文件在本仓库的 `web/` 目录；发布仓库是 [go-kenka/codebay-site](https://github.com/go-kenka/codebay-site)，
通过 GitHub Pages 提供 https://go-kenka.github.io/codebay-site/。

改完 `web/` 后，在仓库根目录运行：

```bash
Scripts/deploy-web.sh
```

脚本会把 `web/` 的内容同步到发布仓库的 `main` 分支（force push），GitHub Pages 随后自动重新构建。
需要本机已安装并登录 `gh`。

> 部署仓库只保存站点产物；这里（`web/`）才是源文件，不要在发布仓库里直接改内容。

## 发布流程

`.github/workflows/release.yml` 从私有源码仓库 `go-kenka/CodeBay` 构建 App，
并把 DMG 发到本仓库的 GitHub Release（资产名固定为 `CodeBay.dmg`）。
详见主仓库的 `docs/release.md`。
