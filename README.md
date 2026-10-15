# ClassFabric-Web

ClassFabric 官网（https://ansoukin.top）。静态站点：Jinja2 模板 + 原生 CSS/JS，构建后由 Caddy 托管。

```
python3 build.py      # src/ → dist/（依赖见 requirements.txt）
```

| 路径 | 内容 |
|---|---|
| `src/templates/` | 页面模板（首页、功能、下载、与 ClassIsland、更新日志、社区、404） |
| `src/content.py` | 版本记录、更新日志、亮点、内置发行版数据——发新版时改这里 |
| `src/static/` | 样式、脚本、真实截图、字体子集 |
| `dist/` | 构建产物（已提交，可直接部署） |
| `deploy/` | Caddyfile、发行版同步脚本、部署脚本、GitHub Actions 示例 |
| `DEPLOY.md` | 完整部署与更新说明 |

字体：标题使用子集化的 Noto Serif SC（SIL OFL 1.1）。
