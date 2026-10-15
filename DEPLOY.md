# 部署说明（Caddy · 香港 VPS）

站点是纯静态文件：`python3 build.py` 生成 `dist/`，由 Caddy 托管。仓库里已提交一份 `dist/`，不想装 Python 也能直接部署它。

## 一次性准备
1. 域名解析：`ansoukin.top` 与 `www.ansoukin.top` 的 A 记录指向 VPS 公网 IP。
2. 放行 80、443（云厂商安全组 + 系统防火墙）。香港节点无需 ICP 备案。
3. 安装 Caddy（官方 apt 源：https://caddyserver.com/docs/install ）。

## 上线
```bash
sudo mkdir -p /var/www/classfabric/data
sudo cp -r dist/. /var/www/classfabric/          # 或 ./deploy/deploy.sh user@vps
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy
```
首次访问时 Caddy 自动签发并续期证书。

## 让下载页自动跟上新版本
下载页读取同源的 `/data/releases.json`，由服务器定时从 GitHub 同步（页面内置了一份兜底数据，不会因此打不开）：
```bash
sudo cp deploy/update-releases.py /usr/local/bin/
sudo /usr/local/bin/update-releases.py /var/www/classfabric/data/releases.json   # 先手动跑一次
# 每 30 分钟同步一次
echo '*/30 * * * * root /usr/local/bin/update-releases.py /var/www/classfabric/data/releases.json >/dev/null 2>&1' | sudo tee /etc/cron.d/classfabric-releases
```
发布新版本后最多 30 分钟，下载页、首页版本号就会更新。可选设置环境变量 `GITHUB_TOKEN` 提高限额。

## 改内容
- 文案与数据：`src/content.py`（版本记录、更新日志、亮点）、`src/templates/*.html`
- 样式与脚本：`src/static/`
- 发新版时：在 `src/content.py` 的 `RELEASES_BRIEF`、`CHANGELOG`、`SEED_RELEASES` 顶部加一条，重新 `python3 build.py` 并部署。
- 标题字体是子集化的 Noto Serif SC（OFL 协议）。要重新生成，把 `NotoSerifSC-SemiBold.otf` 放到 `tools/` 再构建；没有源文件时沿用已提交的子集。
- 品牌素材（图标、分享图）改动后运行 `python3 tools/render_images.py`（需要 playwright）。

## 上线后
- 在 Google Search Console、Bing Webmaster、百度搜索资源平台提交 `https://ansoukin.top/sitemap.xml`。
- 可选：用 `deploy/github-actions/deploy.yml.example` 配置推送即部署。
