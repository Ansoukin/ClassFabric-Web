// After `vite build`:
//  1. 404.html = index.html, so hosts that serve 404.html for unknown paths still boot the SPA.
//  2. Per-route index.html with route-specific <title>/description/canonical, so crawlers and link
//     previews see the right metadata without running JS. Keep these in sync with src/i18n/zh.ts `meta`.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ORIGIN = 'https://cf.ansoukin.top'
const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist')

const routes = {
  features: {
    title: '功能 — ClassFabric',
    desc: '课表显示与提醒、课表编辑与导入导出、组件与插件、自动化、天气、应用保护。ClassFabric 的完整功能一览。',
  },
  download: {
    title: '下载 — ClassFabric',
    desc: '从 GitHub Releases 下载 ClassFabric。支持 Windows 10 及更高版本,2.2 目前为开发者预览版。',
  },
  classisland: {
    title: '与 ClassIsland 的关系 — ClassFabric',
    desc: 'ClassFabric 是 ClassIsland 的社区衍生项目。我们继承了什么,想改变什么,又如何对待上游。',
  },
  community: {
    title: '社区 — ClassFabric',
    desc: '提交 Issue、参与讨论、贡献代码、开发插件。参与 ClassFabric 的方式。',
  },
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const html = await readFile(resolve(dist, 'index.html'), 'utf8')

await copyFile(resolve(dist, 'index.html'), resolve(dist, '404.html'))

for (const [route, m] of Object.entries(routes)) {
  const url = `${ORIGIN}/${route}`
  const out = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(m.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, (_, a, b) => a + esc(m.desc) + b)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, (_, a, b) => a + esc(m.title) + b)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, (_, a, b) => a + esc(m.desc) + b)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, (_, a, b) => a + url + b)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => a + url + b)
  await mkdir(resolve(dist, route), { recursive: true })
  await writeFile(resolve(dist, route, 'index.html'), out)
}
console.log('[postbuild] 404.html and', Object.keys(routes).length, 'route pages written')
