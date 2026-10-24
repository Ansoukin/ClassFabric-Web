// Fetches the newest ClassFabric release (pre-releases included) from the GitHub API
// and writes it to src/generated/release.json, which the Download page reads at build time.
// If the request fails, the existing file is kept so the build never breaks because of the network.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OWNER = 'Ansoukin'
const REPO = 'ClassFabric'
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/generated/release.json')

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'classfabric-web-build',
  'X-GitHub-Api-Version': '2022-11-28',
}
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

try {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=10`, { headers })
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`)
  const list = (await res.json()).filter((r) => !r.draft)
  if (list.length === 0) throw new Error('no published releases')
  const r = list[0]
  const data = {
    available: true,
    tag: r.tag_name,
    name: r.name || r.tag_name,
    prerelease: Boolean(r.prerelease),
    publishedAt: r.published_at || null,
    url: r.html_url,
    assets: (r.assets || []).map((a) => ({
      name: a.name,
      size: a.size,
      url: a.browser_download_url,
    })),
    generatedAt: new Date().toISOString(),
  }
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, JSON.stringify(data, null, 2) + '\n')
  console.log(`[fetch-release] ${data.tag} (${data.assets.length} assets)`)
} catch (err) {
  let kept = 'no existing file'
  try {
    await readFile(out, 'utf8')
    kept = 'kept existing release.json'
  } catch {
    /* no file yet */
  }
  console.warn(`[fetch-release] skipped: ${err.message}; ${kept}`)
}
