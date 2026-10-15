#!/usr/bin/env python3
"""生成图标与社交分享图（仅在改动品牌素材时运行，产物已提交到 src/）。
需要 playwright + chromium；先运行一次 build.py 以得到 dist/ 里的字体。"""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import build  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

LOGO = build.LOGO
SVG = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">{LOGO}</svg>'
(ROOT / "src" / "root").mkdir(parents=True, exist_ok=True)
(ROOT / "src" / "root" / "favicon.svg").write_text(SVG, encoding="utf-8")
(ROOT / "src" / "root" / "site.webmanifest").write_text(
    '{"name":"ClassFabric","short_name":"ClassFabric","start_url":"/","display":"browser","background_color":"#f6f3ec","theme_color":"#f6f3ec",'
    '"icons":[{"src":"/assets/img/logo-192.png","sizes":"192x192","type":"image/png"},{"src":"/assets/img/logo-512.png","sizes":"512x512","type":"image/png"}]}',
    encoding="utf-8")

font = ROOT / "dist" / "assets" / "fonts" / "serif-600.woff"
OG = f"""<html><head><style>
@font-face{{font-family:S;src:url(file://{font}) format('woff');font-weight:600}}
body{{margin:0;width:1200px;height:630px;position:relative;overflow:hidden;font-family:S,serif;color:#fff;
background:radial-gradient(58% 80% at 84% 26%,rgba(86,112,255,.6),transparent 62%),radial-gradient(54% 70% at 10% 104%,rgba(0,191,255,.45),transparent 62%),radial-gradient(44% 56% at 48% -12%,rgba(150,96,255,.38),transparent 72%),linear-gradient(162deg,#0b1233,#0a1c4e 46%,#07122e)}}
.logo{{position:absolute;left:80px;top:72px;width:84px;height:84px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.4))}}
.name{{position:absolute;left:182px;top:92px;font:700 40px system-ui,'Noto Sans CJK SC',sans-serif;letter-spacing:-.01em}}
h1{{position:absolute;left:80px;top:230px;margin:0;font-size:104px;line-height:1.12;font-weight:600;letter-spacing:-.02em}}
p{{position:absolute;left:84px;bottom:64px;margin:0;font:400 28px system-ui,'Noto Sans CJK SC',sans-serif;color:rgba(255,255,255,.75)}}
.pill{{position:absolute;right:80px;top:84px;height:64px;padding:0 30px;border-radius:32px;background:rgba(22,25,38,.66);border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;gap:22px;font:500 26px system-ui,'Noto Sans CJK SC',sans-serif;box-shadow:0 14px 40px rgba(0,4,24,.5)}}
.pill i{{width:1px;height:26px;background:rgba(255,255,255,.3)}} .pill b{{color:#00bfff}}
</style></head><body>
<svg class="logo" viewBox="0 0 192 192">{LOGO}</svg><div class="name">ClassFabric</div>
<div class="pill"><span>语</span><span>数</span><b>英语 09:40</b><span>物</span><span>化</span><i></i><span>12:08</span></div>
<h1>班级大屏，<br>该有一份好课表。</h1>
<p>ClassIsland 社区增强版 · 免费开源 · Windows</p></body></html>"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1200, "height": 630})
        await pg.set_content(OG)
        await pg.wait_for_timeout(600)
        img = ROOT / "src" / "static" / "img"
        img.mkdir(parents=True, exist_ok=True)
        await pg.screenshot(path=str(img / "og.jpg"), type="jpeg", quality=88)
        for size, name, bg, pad in ((512, "src/static/img/logo-512.png", None, 0.0), (192, "src/static/img/logo-192.png", None, 0.0),
                                    (32, "src/root/favicon-32.png", None, 0.0), (180, "src/root/apple-touch-icon.png", "#f6f3ec", 0.14)):
            pg2 = await b.new_page(viewport={"width": size, "height": size}, device_scale_factor=1)
            inner = int(size * (1 - 2 * pad))
            await pg2.set_content(f'<body style="margin:0;background:{bg or "transparent"};display:grid;place-items:center;width:{size}px;height:{size}px">'
                                  f'<svg viewBox="0 0 192 192" width="{inner}" height="{inner}">{LOGO}</svg></body>')
            await pg2.screenshot(path=str(ROOT / name), omit_background=bg is None)
            await pg2.close()
        await b.close()

asyncio.run(main())
