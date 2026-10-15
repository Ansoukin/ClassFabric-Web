#!/usr/bin/env python3
"""把 GitHub Releases 同步成本站的 /data/releases.json（仅用标准库）。
下载页只读这个同源文件，浏览器不直连 GitHub API，避免校园网共享出口触发匿名限流。

    python3 update-releases.py /var/www/classfabric/data/releases.json

可选环境变量 GITHUB_TOKEN：提高 API 限额（无需任何权限，公开仓库只读即可）。
建议用 cron 或 systemd timer 每 30 分钟运行一次，见 DEPLOY.md。失败时保留旧文件。"""
import json
import os
import sys
import tempfile
import urllib.request

REPO = os.environ.get("CF_REPO", "Ansoukin/ClassFabric")


def main(out):
    req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases?per_page=30",
                                 headers={"Accept": "application/vnd.github+json", "User-Agent": "classfabric-web-sync"})
    if os.environ.get("GITHUB_TOKEN"):
        req.add_header("Authorization", "Bearer " + os.environ["GITHUB_TOKEN"])
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    rels = []
    for x in data:
        if x.get("draft"):
            continue
        rels.append({
            "tag": x["tag_name"], "name": x.get("name") or "", "prerelease": bool(x.get("prerelease")),
            "published_at": x.get("published_at") or "", "html_url": x["html_url"],
            "assets": [{"name": a["name"], "size": a["size"], "url": a["browser_download_url"], "digest": a.get("digest") or ""}
                       for a in x.get("assets", [])],
        })
    rels.sort(key=lambda r: r["published_at"], reverse=True)
    if not rels:
        raise SystemExit("没有拿到任何发行版，保留旧文件")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(out), suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(rels, f, ensure_ascii=False, indent=1)
    os.chmod(tmp, 0o644)
    os.replace(tmp, out)
    print(f"已写入 {len(rels)} 个版本 → {out}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/var/www/classfabric/data/releases.json")
