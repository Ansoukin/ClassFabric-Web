# 站点内容数据：版本记录、亮点、更新日志、内置的发行版种子数据
# 内容来源：Ansoukin/ClassFabric 的 GitHub 发行说明（2.1.0.1 – 2.1.1.3）。更新版本时改这里。

SITE = {
    "url": "https://ansoukin.top",
    "name": "ClassFabric",
    "repo": "https://github.com/Ansoukin/ClassFabric",
    "web_repo": "https://github.com/Ansoukin/ClassFabric-Web",
}

NAV = [
    {"key": "features", "href": "/features/", "label": "功能"},
    {"key": "download", "href": "/download/", "label": "下载"},
    {"key": "classisland", "href": "/classisland/", "label": "与 ClassIsland"},
    {"key": "changelog", "href": "/changelog/", "label": "更新日志"},
    {"key": "community", "href": "/community/", "label": "社区"},
]

# 首页“版本记录”表（新→旧）
RELEASES_BRIEF = [
    {"date": "2026-10-02", "tag": "2.1.1.3", "stable": False, "text": "三语界面、科目主题色与图标、多天气源自动回退"},
    {"date": "2026-09-13", "tag": "2.1.1.2", "stable": False, "text": "以 GitHub Releases 作为更新源，稳定 / 预览通道，插件加载诊断"},
    {"date": "2026-09-10", "tag": "2.1.1.1", "stable": False, "text": "项目更名为 ClassFabric，加入 ClassIsland 插件兼容层"},
    {"date": "2026-09-08", "tag": "2.1.0.1", "stable": True, "text": "首个公开版：竖直课表条、竖条提醒、插件与主题市场回归"},
]

HIGHLIGHTS = [
    {"icon": "window", "title": "竖直课表条", "beta": True, "text": "贴靠屏幕左右边缘，等高格显示全天课程，已结束的课程自动变暗，并带有全天进度细轨。", "ver": "2.1.0.1 起"},
    {"icon": "globe", "title": "三语界面", "text": "简体中文、繁體中文、English，在设置中切换，重启后生效；教程也提供三语版本。", "ver": "2.1.1.3 起"},
    {"icon": "paint_brush", "title": "科目的颜色与图标", "text": "为每个科目设置主题色、图标与上课地点，课表编辑器里一目了然，已有数据自动迁移。", "ver": "2.1.1.3 起"},
    {"icon": "weather_partly_cloudy_day", "title": "天气不怕断", "text": "支持多个天气源，某个源请求失败时自动回退到其他源，课表条上的天气不再轻易“消失”。", "ver": "2.1.1.3 起"},
    {"icon": "arrow_sync", "title": "从 GitHub 更新", "text": "以 GitHub Releases 作为更新源，可选择稳定版或预览版通道。", "ver": "2.1.1.2 起"},
    {"icon": "puzzle_piece", "title": "插件兼容与诊断", "text": "保留 ClassIsland v2 插件兼容层；插件加载失败时给出可读的诊断信息，并支持一键复制。", "ver": "2.1.1.1 / 2.1.1.2 起"},
]

CHANGELOG = [
    {
        "tag": "2.1.1.3", "date": "2026-10-02", "stable": False, "code": "2.2 · MikHail 开发者预览 3",
        "note": "测试版本，可能不稳定或功能不完整。",
        "groups": [
            {"title": "新增与改进", "lines": [
                "新增界面语言设置：简体中文、繁體中文、English，重启后生效",
                "菜单、托盘菜单与启动文本完成多语言；入门教程提供三语版本",
                "科目新增主题色、图标与地点字段，已有科目数据自动迁移",
                "日程课表编辑器适配窄屏幕",
                "天气支持多个来源，请求失败时自动回退",
                "更新流程：位于临时目录时给出红色“仍然运行”按钮",
                "实验性的新主界面（隐藏在调试菜单中）",
            ]},
            {"title": "修复", "lines": [
                "界面语言偶尔回退为系统语言",
                "更新通道下拉为空、更新检查反馈不准确，以及停止下载时的清理顺序",
                "日程课表编辑器在触屏上不可用",
                "ProfileRecoveryWindow 的 XAML 命名空间错误",
                "若干流泄漏",
            ]},
            {"title": "其他", "lines": ["补齐 20 个插件兼容类型转发声明", "CI 固定 .NET SDK 版本"]},
        ],
    },
    {
        "tag": "2.1.1.2", "date": "2026-09-13", "stable": False, "code": "",
        "note": "临时版本，主要用于验证更新链路。",
        "groups": [
            {"title": "新增与改进", "lines": [
                "新增以 GitHub Releases 作为更新源，提供稳定与预览通道",
                "插件加载失败时给出可读的诊断信息，并支持复制诊断",
                "移除内置贴纸资源",
            ]},
            {"title": "修复", "lines": ["教程因资源路径大小写不一致而崩溃"]},
            {"title": "其他", "lines": ["发布流程不再推送 PDCC 与 NuGet 产物"]},
        ],
    },
    {
        "tag": "2.1.1.1", "date": "2026-09-10", "stable": False, "code": "",
        "note": "",
        "groups": [
            {"title": "新增与改进", "lines": [
                "项目更名为 ClassFabric",
                "加入 ClassIsland 插件兼容层",
                "新增日程查询 API、日程编辑器、图标选择器与提醒动作的自定义图标",
            ]},
            {"title": "修复", "lines": ["档案编辑器中删除课表按钮无响应"]},
        ],
    },
    {
        "tag": "2.1.0.1", "date": "2026-09-08", "stable": True, "code": "KapoKali",
        "note": "ClassFabric 的首个公开版本。ClassFabric 是 ClassIsland 的衍生项目，建议先阅读 ClassIsland 的基础使用说明。",
        "groups": [
            {"title": "新增与改进", "lines": [
                "竖直课表条（Beta）：贴靠屏幕左右边缘，等高格显示当日课程，已结束的课程变暗",
                "竖直课表条选项：停靠方向、垂直偏移、宽度、界面缩放、圆角、课程切换高亮、自定义前景色",
                "全天进度细轨，随课表推进",
                "竖条提醒（Beta）：下课提醒轮播，上课前 60 秒切换为下一节课的预览",
                "设置中新增竖直课表分组",
                "恢复插件市场：在线安装与更新、镜像源管理、自定义插件源",
                "恢复主题市场：在线安装与更新",
                "调试模式移入“实验性功能”菜单；引入版本代号",
            ]},
            {"title": "修复", "lines": [
                "调整界面缩放时竖条闪烁、抖动",
                "Windows 10 上亚克力效果溢出圆角",
                "进度轨与实际课程错位",
                "提醒文字中冒号错位",
            ]},
        ],
    },
]

_BASE = "https://github.com/Ansoukin/ClassFabric/releases/download/"
_MB = 1048576


def _a(tag, name, mb):
    return {"name": name, "size": int(mb * _MB), "url": _BASE + tag + "/" + name, "digest": ""}


# 内置种子：服务器上的 /data/releases.json 不可用时使用（文件名与大小来自 2.1.1.3 的发行页，大小为约数）
SEED_RELEASES = [
    {
        "tag": "2.1.1.3", "name": "2.2 MikHail Developer Preview 3", "prerelease": True,
        "published_at": "2026-10-02T13:40:00Z", "html_url": SITE["repo"] + "/releases/tag/2.1.1.3",
        "assets": [
            _a("2.1.1.3", "ClassFabric_windows_x64_selfContained_installer.exe", 114),
            _a("2.1.1.3", "ClassFabric_windows_x86_selfContained_installer.exe", 109),
            _a("2.1.1.3", "ClassFabric_windows_arm64_selfContained_installer.exe", 106),
            _a("2.1.1.3", "ClassFabric_app_windows_x64_selfContained_folder.zip", 156),
            _a("2.1.1.3", "ClassFabric_app_windows_x86_selfContained_folder.zip", 150),
            _a("2.1.1.3", "ClassFabric_app_windows_arm64_selfContained_folder.zip", 149),
            _a("2.1.1.3", "ClassFabric_app_windows_x64_full_folder.zip", 89.3),
            _a("2.1.1.3", "ClassFabric_app_windows_x86_full_folder.zip", 88.8),
            _a("2.1.1.3", "ClassFabric_app_windows_arm64_full_folder.zip", 87.8),
        ],
    },
    {"tag": "2.1.1.2", "name": "", "prerelease": True, "published_at": "2026-09-13T00:00:00Z", "html_url": SITE["repo"] + "/releases/tag/2.1.1.2", "assets": []},
    {"tag": "2.1.1.1", "name": "", "prerelease": True, "published_at": "2026-09-10T00:00:00Z", "html_url": SITE["repo"] + "/releases/tag/2.1.1.1", "assets": []},
    {"tag": "2.1.0.1", "name": "KapoKali", "prerelease": False, "published_at": "2026-09-08T15:15:00Z", "html_url": SITE["repo"] + "/releases/tag/2.1.0.1", "assets": []},
]
