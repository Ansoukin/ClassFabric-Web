# classfabric-web

[ClassFabric](https://github.com/Ansoukin/ClassFabric) 官方网站源码。线上地址:<https://cf.ansoukin.top>

**技术栈**:Vue 3 · Vuetify 3 · Vite · TypeScript。设计语言为 Fluent 2 骨架 + 编辑式排版(衬线标题、大留白)。

## 本地开发

```bash
npm install
npm run dev          # 开发服务器
npm run build        # 构建到 dist/(会先从 GitHub 拉取最新发布信息)
npm run typecheck    # vue-tsc 类型检查
```

需要 Node.js 20+。

## 结构

```
src/
  i18n/            简体中文(zh.ts)与英文(en.ts)全部文案;en 必须满足 zh 的类型
  pages/           首页、功能、下载、与 ClassIsland、社区、404
  components/      页头页脚、图标、首页演示 HeroDemo
  composables/     语言(useLocale)与明暗主题(useColorMode)
  generated/       由脚本生成,请勿手改(release.json)
scripts/
  fetch-release.mjs  构建前从 GitHub API 取最新发布(含预览版),写入 release.json
  postbuild.mjs      生成 404.html 与各路由的独立 index.html(SEO 元信息)
.github/workflows/site.yml  构建与部署
```

### 新增语言

在 `src/i18n/` 新建文件并满足 `Content` 类型,然后在 `src/composables/useLocale.ts` 注册并在页头的语言菜单中加一项。

### 首页演示

`HeroDemo.vue` 是用 HTML/CSS 编写的风格化演示,**不是真实截图**。光标目标位置每一步都从真实 DOM 位置实时测量,所以不会错位。拿到真实截图后可以在需要的页面直接替换。

## 部署与 VPS 同步

流程:**推送到 `main` → GitHub Actions 构建 → (可选)rsync 到 VPS**。构建每 6 小时也会自动运行一次,让下载页跟上新的 Release。

1. 在 VPS 上准备一个只用于部署的 SSH 密钥,公钥写入目标用户的 `~/.ssh/authorized_keys`。
2. 在仓库 **Settings → Secrets and variables → Actions** 添加 Secrets:
   `VPS_HOST`、`VPS_USER`、`VPS_PORT`(可选,默认 22)、`VPS_PATH`(站点根目录绝对路径)、`VPS_SSH_KEY`(私钥全文)。
3. 添加仓库 Variable:`DEPLOY_ENABLED = true`。未设置时只构建、不部署,构建产物可在该次运行的 Artifacts 里下载 `site-dist`。

### 1Panel

在 1Panel 中新建 **静态网站**,绑定 `cf.ansoukin.top` 并开启 HTTPS;网站目录(1Panel → 网站 → 该站点 → 站点目录里可看到)就是 `VPS_PATH`。
然后在该站点的 **配置文件** 中确认存在单页应用回退:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

`rsync --delete` 会让目录与构建产物完全一致,所以不要在该目录里放手动上传的文件。

### 固定依赖版本

仓库目前没有 `package-lock.json`。首次 CI 运行会把它作为 Artifact(`package-lock`)上传,下载后提交到仓库即可固定版本,之后可把工作流里的 `npm install` 改成 `npm ci`。

## 内容准则

- 只写项目已有的能力。功能描述依据主仓库 README;未实现的方向要明确写成方向。
- 来自上游 ClassIsland 的成果不当作 ClassFabric 自己的功能介绍。
- 版本、下载文件等信息来自 GitHub Release,不手写。

## 许可

GPL-3.0,见 [LICENSE](LICENSE)。
