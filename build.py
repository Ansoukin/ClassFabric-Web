#!/usr/bin/env python3
"""ClassFabric 官网构建脚本。

    python3 build.py            # 渲染 src/ → dist/

依赖：Jinja2、fonttools（仅构建时需要）。字体源文件（NotoSerifSC-SemiBold.otf，OFL 协议）放在 tools/ 下时会
自动按页面中实际用到的标题字符重新子集化；没有源文件时沿用 src/static/fonts/ 里已提交的子集。
"""
import gzip
import hashlib
import json
import os
import re
import shutil
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
sys.path.insert(0, str(SRC))
import content as C  # noqa: E402

TODAY = date.today().isoformat()

# ---------------------------------------------------------------- 图标
ICONS = json.loads((SRC / "data" / "icons.json").read_text(encoding="utf-8"))
CUSTOM = {
    "github": '<path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.700-.3-5.500-1.300-5.500-5.900 0-1.300.5-2.400 1.200-3.200-.1-.4-.5-1.600.1-3.200 0 0 1-.3 3.300 1.200a11.500 11.500 0 0 1 6 0c2.300-1.500 3.300-1.200 3.300-1.200.7 1.600.2 2.800.1 3.200.8.800 1.200 1.900 1.200 3.200 0 4.600-2.800 5.600-5.500 5.900.4.400.8 1.100.8 2.200v3.300c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/>',
    "sun": '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3M4.8 4.8l2.1 2.1M17.1 17.1l2.1 2.1M4.8 19.2l2.1-2.1M17.1 6.9l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
    "moon": '<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/>',
    "menu": '<path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>',
}


def ico_inner(name, size=24, style="r"):
    if name in CUSTOM:
        return CUSTOM[name]
    for sz, st in ((size, style), (size, "r" if style == "f" else "f"), (24, style), (20, style), (24, "r"), (20, "r")):
        key = f"{name}.{sz}.{st}"
        if key in ICONS:
            return ICONS[key]
    raise KeyError(f"图标不存在：{name}")


def ico(name, size=24, style="r", cls=""):
    vb = 24 if name in CUSTOM else size
    c = ("ico " + cls).strip()
    return Markup(f'<svg class="{c}" viewBox="0 0 {vb} {vb}" aria-hidden="true" focusable="false">{ico_inner(name, size, style)}</svg>')


# ---------------------------------------------------------------- Logo
def build_logo():
    s = (SRC / "static" / "img" / "logo-source.svg").read_text(encoding="utf-8")
    inner = re.search(r'<g class="a"[^>]*>(.*)</g>', s, re.S).group(1)
    fills = {"c": "#e2e2e2", "d": "#999", "e": "#959595", "f": "#f6f6f6", "g": "#ccc", "h": "#00bfff", "i": "url(#cfg)"}
    inner = re.sub(r'class="([a-z])"', lambda m: f'fill="{fills[m.group(1)]}"', inner)
    inner = re.sub(r"\s+", " ", inner)
    grad = ('<defs><linearGradient id="cfg" x1="90" y1="126" x2="154.97" y2="190.97" gradientUnits="userSpaceOnUse">'
            '<stop offset=".32" stop-opacity=".15"/><stop offset=".62" stop-opacity=".02"/><stop offset="1" stop-opacity="0"/></linearGradient></defs>')
    return grad + inner


LOGO = build_logo()


# ---------------------------------------------------------------- 资源：复制、哈希
ASSET_HASH = {}


def collect_assets():
    out = DIST / "assets"
    for p in sorted((SRC / "static").rglob("*")):
        if p.is_dir() or p.name == "logo-source.svg":
            continue
        rel = p.relative_to(SRC / "static")
        dst = out / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        data = p.read_bytes()
        if p.suffix == ".css":
            data = minify_css(data.decode("utf-8")).encode("utf-8")
        ASSET_HASH[str(rel).replace("\\", "/")] = hashlib.sha256(data).hexdigest()[:8]
        dst.write_bytes(data)


def minify_css(s):
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s*([{};,>])\s*", r"\1", s)
    s = re.sub(r":\s+", ":", s)
    s = s.replace(";}", "}")
    return s.strip()


def asset(path):
    return f"/assets/{path}?v={ASSET_HASH[path]}"


# ---------------------------------------------------------------- 字体子集
class SerifChars(HTMLParser):
    """收集“用衬线体显示”的元素里的字符：h1/h2 以及带 serif 类名的元素。"""
    SERIF_TAGS = {"h1", "h2"}
    SERIF_CLS = {"statement", "display", "v", "code", "ver", "serif", "h3"}
    VOID = {"br", "img", "meta", "link", "input", "hr", "source", "use", "path", "circle", "stop", "rect"}

    def __init__(self):
        super().__init__()
        self.stack, self.chars = [], set()

    def handle_starttag(self, tag, attrs):
        if tag in self.VOID:
            return
        cls = set((dict(attrs).get("class") or "").split())
        parent = self.stack[-1] if self.stack else False
        self.stack.append(parent or tag in self.SERIF_TAGS or bool(cls & self.SERIF_CLS))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag not in self.VOID and self.stack:
            self.stack.pop()

    def handle_data(self, data):
        if self.stack and self.stack[-1]:
            self.chars.update(data)


def build_font(pages_html):
    out = DIST / "assets" / "fonts"
    out.mkdir(parents=True, exist_ok=True)
    committed = SRC / "static" / "fonts" / "serif-600.woff"
    otf = ROOT / "tools" / "NotoSerifSC-SemiBold.otf"
    if otf.exists():
        from fontTools import subset
        p = SerifChars()
        for h in pages_html:
            p.feed(h)
        chars = {c for c in p.chars if not c.isspace()}
        chars.update(chr(i) for i in range(0x20, 0x7F))
        chars.update("，。、：；！？“”‘’（）—…·《》「」–→←↑↓×")
        opts = subset.Options()
        opts.flavor = "woff"
        opts.layout_features = ["kern"]
        opts.notdef_outline = True
        f = subset.load_font(str(otf), opts)
        s = subset.Subsetter(opts)
        s.populate(text="".join(sorted(chars)))
        s.subset(f)
        committed.parent.mkdir(parents=True, exist_ok=True)
        subset.save_font(f, str(committed), opts)
        print(f"字体子集：{len(chars)} 个字符 → {committed.stat().st_size // 1024} KB")
    elif not committed.exists():
        print("警告：没有字体源文件，也没有已提交的子集，标题将回退到系统衬线体", file=sys.stderr)
        return None
    shutil.copy(committed, out / "serif-600.woff")
    h = hashlib.sha256(committed.read_bytes()).hexdigest()[:8]
    return f"/assets/fonts/serif-600.woff?v={h}"


# ---------------------------------------------------------------- 页面
PAGES = [
    dict(path="/", out="index.html", tpl="index.html", key="home", prio="1.0", changefreq="weekly",
         title="ClassFabric · 班级大屏课表工具，ClassIsland 社区增强版",
         og_title="ClassFabric · 班级大屏，该有一份好课表",
         desc="ClassFabric 是 ClassIsland 的社区增强版，面向班级多媒体屏幕的课表信息显示工具。三语界面、科目图标与主题色、多源天气，免费开源，支持 Windows 10 及以上。"),
    dict(path="/features/", out="features/index.html", tpl="features.html", key="features", prio="0.8", changefreq="monthly",
         title="功能 · ClassFabric", desc="课表显示与提醒、课表编辑与管理、组件与插件、自动化、天气——ClassFabric 的全部功能一览，并标出了社区新增的部分。"),
    dict(path="/download/", out="download/index.html", tpl="download.html", key="download", prio="0.9", changefreq="weekly",
         title="下载 ClassFabric · Windows 版", desc="下载 ClassFabric for Windows（x64 / x86 / ARM64）。提供安装程序与压缩包，稳定版与预览版，内置 .NET 运行时。"),
    dict(path="/classisland/", out="classisland/index.html", tpl="classisland.html", key="classisland", prio="0.7", changefreq="monthly",
         title="与 ClassIsland 的关系 · ClassFabric", desc="ClassFabric 是 ClassIsland 的社区衍生版本：继承了什么、新增了什么、有意不做什么，以及该选哪一个。"),
    dict(path="/changelog/", out="changelog/index.html", tpl="changelog.html", key="changelog", prio="0.6", changefreq="weekly",
         title="更新日志 · ClassFabric", desc="ClassFabric 各版本的更新内容：2.1.0.1 至 2.1.1.3。"),
    dict(path="/community/", out="community/index.html", tpl="community.html", key="community", prio="0.5", changefreq="monthly",
         title="社区与贡献 · ClassFabric", desc="反馈问题、参与讨论、贡献代码与翻译。ClassFabric 的交流都在 GitHub 上进行。"),
    dict(path="/404.html", out="404.html", tpl="404.html", key="", prio=None, changefreq=None, robots="noindex",
         title="页面不存在 · ClassFabric", desc="你要找的页面不存在。"),
]


def jsonld(p):
    base = C.SITE["url"]
    g = []
    if p["key"] == "home":
        g.append({"@type": "WebSite", "@id": base + "/#site", "url": base + "/", "name": "ClassFabric", "inLanguage": "zh-CN"})
        g.append({"@type": "Organization", "@id": base + "/#org", "name": "ClassFabric", "url": base + "/",
                  "logo": base + "/assets/img/logo-512.png", "sameAs": [C.SITE["repo"]]})
    if p["key"] in ("home", "download"):
        g.append({"@type": "SoftwareApplication", "name": "ClassFabric", "applicationCategory": "EducationalApplication",
                  "operatingSystem": "Windows 10+", "softwareVersion": C.RELEASES_BRIEF[0]["tag"],
                  "downloadUrl": base + "/download/", "license": "https://www.gnu.org/licenses/gpl-3.0.html",
                  "isAccessibleForFree": True, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "CNY"},
                  "description": "面向班级多媒体屏幕的课表信息显示工具，ClassIsland 的社区增强版。", "inLanguage": "zh-CN"})
    if p["key"] not in ("home", ""):
        g.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "首页", "item": base + "/"},
            {"@type": "ListItem", "position": 2, "name": p["title"].split(" · ")[0], "item": base + p["path"]}]})
    return json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False, separators=(",", ":"))


def minify_html(h):
    parts = re.split(r"(<script\b.*?</script>|<style\b.*?</style>|<pre\b.*?</pre>)", h, flags=re.S)
    out = []
    for i, s in enumerate(parts):
        if i % 2:
            out.append(s)
            continue
        s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
        s = re.sub(r">\s+<", "> <", s)
        s = re.sub(r"\s*\n\s*", "\n", s)
        s = re.sub(r"\n(?=<)|(?<=>)\n", "", s)
        s = re.sub(r"[ \t]{2,}", " ", s)
        out.append(s)
    return "".join(out).strip()


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    collect_assets()

    env = Environment(loader=FileSystemLoader(SRC / "templates"), autoescape=select_autoescape(["html"]), trim_blocks=True, lstrip_blocks=True)
    env.globals.update(ico=ico, ico_inner=lambda *a, **k: Markup(ico_inner(*a, **k)), asset=asset)

    seed_json = json.dumps(C.SEED_RELEASES, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    latest = C.RELEASES_BRIEF[0]
    ctx_common = dict(site=C.SITE, nav=C.NAV, logo_inner=LOGO, seed_json=seed_json,
                      latest_label=latest["tag"] + (" 正式版" if latest["stable"] else " 预览版"),
                      releases_brief=C.RELEASES_BRIEF, highlights=C.HIGHLIGHTS, changelog=C.CHANGELOG)

    # 第一遍：先渲染（字体 URL 暂用占位），收集标题字符再做字体子集
    rendered = {}
    for p in PAGES:
        t = env.get_template(p["tpl"])
        rendered[p["out"]] = t.render(**ctx_common, title=p["title"], desc=p["desc"], path=p["path"], page_key=p["key"],
                                      og_title=p.get("og_title", p["title"]), robots=p.get("robots", "index,follow,max-image-preview:large"),
                                      jsonld=jsonld(p), font_url="@@FONT@@")
    font_url = build_font(list(rendered.values())) or ""
    for out, html in rendered.items():
        html = minify_html(html.replace("@@FONT@@", font_url))
        f = DIST / out
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(html, encoding="utf-8")

    # CSS 里的字体地址带上哈希
    css = next((DIST / "assets" / "css").glob("site.css"))
    css.write_text(css.read_text(encoding="utf-8").replace("/assets/fonts/serif-600.woff", font_url or "/assets/fonts/serif-600.woff"), encoding="utf-8")

    # 根目录文件
    for name in ("favicon.svg", "favicon.ico", "favicon-32.png", "apple-touch-icon.png", "site.webmanifest"):
        sp = SRC / "root" / name
        if sp.exists():
            shutil.copy(sp, DIST / name)
    (DIST / "data").mkdir(exist_ok=True)
    (DIST / "data" / "releases.json").write_text(json.dumps(C.SEED_RELEASES, ensure_ascii=False, indent=1), encoding="utf-8")

    urls = [p for p in PAGES if p["prio"]]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for p in urls:
        sm.append(f'<url><loc>{C.SITE["url"]}{p["path"]}</loc><lastmod>{TODAY}</lastmod><changefreq>{p["changefreq"]}</changefreq><priority>{p["prio"]}</priority></url>')
    sm.append("</urlset>")
    (DIST / "sitemap.xml").write_text("\n".join(sm), encoding="utf-8")
    (DIST / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /data/\n\nSitemap: {C.SITE['url']}/sitemap.xml\n", encoding="utf-8")

    # 预压缩 gzip（Caddy precompressed）
    n = 0
    for p in DIST.rglob("*"):
        if p.is_file() and p.suffix in (".html", ".css", ".js", ".svg", ".xml", ".json", ".txt", ".webmanifest"):
            (p.with_name(p.name + ".gz")).write_bytes(gzip.compress(p.read_bytes(), 9, mtime=0))
            n += 1
    total = sum(f.stat().st_size for f in DIST.rglob("*") if f.is_file() and f.suffix != ".gz")
    print(f"完成：{len(PAGES)} 个页面，{n} 个预压缩文件，dist 共 {total / 1024:.0f} KB")


if __name__ == "__main__":
    main()
