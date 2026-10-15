/* 下载页：识别系统与架构，按通道展示最新版本，并列出全部历史版本的文件 */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var card = $('#dl-card'); if (!card || !window.CFRel) return;
  var ICON_DL = card.getAttribute('data-ico-dl') || '';
  var state = { chan: 'latest', arch: 'x64', list: [] };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ARCH = { x64: 'x64（Intel / AMD，绝大多数电脑）', x86: 'x86（32 位）', arm64: 'ARM64' };

  // 系统检测：只用于友好提示，不阻止下载
  var ua = navigator.userAgent || '', os = 'win';
  if (/Android/i.test(ua)) os = 'android'; else if (/iPhone|iPad|iPod/i.test(ua)) os = 'ios';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'mac'; else if (/Linux|X11|CrOS/i.test(ua)) os = 'linux';
  var OSN = { android: 'Android', ios: 'iOS', mac: 'macOS', linux: 'Linux' };
  var note = $('#os-note');
  if (os !== 'win' && note) {
    note.querySelector('[data-os]').textContent = OSN[os];
    note.classList.add('show');
  }
  // 架构检测
  if (/ARM64|aarch64/i.test(ua)) state.arch = 'arm64';
  else if (/Win64|x64|WOW64/i.test(ua)) state.arch = 'x64';
  else if (/Windows/i.test(ua) && !/Win64|x64/i.test(ua)) state.arch = 'x86';
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness']).then(function (v) {
      if (v.architecture === 'arm') state.arch = 'arm64';
      else if (v.architecture === 'x86') state.arch = v.bitness === '32' ? 'x86' : 'x64';
      draw();
    }).catch(function () {});
  }

  function chosen() { return state.chan === 'stable' ? CFRel.stable(state.list) : CFRel.latest(state.list); }

  function draw() {
    var r = chosen(), list = state.list;
    var hasStable = !!CFRel.stable(list);
    var inst = r && (CFRel.pick(r, 'installer', state.arch) || CFRel.pick(r, 'installer', 'x64'));
    var zip = r && CFRel.pick(r, 'zip-sc', state.arch);
    var href = inst ? inst.a.url : (r ? r.html_url : 'https://github.com/Ansoukin/ClassFabric/releases');
    var label = inst ? '下载 Windows 安装程序' : '前往 GitHub 下载';
    var seg = '<div class="seg" role="group" aria-label="版本通道">' +
      '<button type="button" data-chan="latest" aria-pressed="' + (state.chan === 'latest') + '">最新版</button>' +
      (hasStable ? '<button type="button" data-chan="stable" aria-pressed="' + (state.chan === 'stable') + '">稳定版</button>' : '') + '</div>';
    var h = seg;
    if (!r) { h += '<div class="ver"><span class="skel" style="width:8em;height:1.1em"></span></div>'; card.innerHTML = h; bind(); return; }
    h += '<div class="ver tnum">' + esc(r.tag) + (r.prerelease ? '<small>预览版</small>' : '<small class="st">正式版</small>') + '</div>';
    h += '<div class="sub"><span>' + esc(CFRel.date(r.published_at)) + ' 发布</span>' +
      (inst ? '<span>' + esc(CFRel.size(inst.a.size)) + '</span>' : '') +
      '<span>' + (inst ? '内置 .NET 运行时，无需另装' : '请在 GitHub 页面选择安装包') + '</span></div>';
    h += '<div class="actions"><a class="btn btn-light" href="' + esc(href) + '" rel="noopener">' + ICON_DL + label + '</a>' +
      '<a class="btn btn-ghost" href="' + esc(r.html_url) + '" rel="noopener" style="border-color:rgba(255,255,255,.35);color:#fff">发行说明</a></div>';
    h += '<div class="arch"><span>处理器架构</span>' + ['x64', 'x86', 'arm64'].map(function (a) {
      return '<button type="button" data-arch="' + a + '" aria-pressed="' + (state.arch === a) + '">' + (a === 'arm64' ? 'ARM64' : a) + '</button>';
    }).join('') + '<span style="flex-basis:100%;opacity:.7">已选：' + esc(ARCH[state.arch]) + '。不确定就选 x64。</span></div>';
    if (r.prerelease) h += '<div class="arch" style="margin-top:16px"><span style="opacity:.85">这是预览版：新功能最多，也可能有尚未发现的问题。给教室电脑部署时，建议先在一台机器上试用。</span></div>';
    card.innerHTML = h; bind();
    var hint = $('#dl-zip'); if (hint) hint.href = zip ? zip.a.url : r.html_url;
  }
  function bind() {
    card.querySelectorAll('[data-chan]').forEach(function (b) { b.onclick = function () { state.chan = b.getAttribute('data-chan'); draw(); }; });
    card.querySelectorAll('[data-arch]').forEach(function (b) { b.onclick = function () { state.arch = b.getAttribute('data-arch'); draw(); }; });
  }

  var KIND = { installer: '安装程序（推荐）', 'zip-sc': '压缩包 · 自带运行时', 'zip-full': '压缩包 · 需要 .NET 10 桌面运行时', other: '其他文件' };
  function assetRows(r) {
    var items = (r.assets || []).map(CFRel.classify).filter(Boolean);
    if (!items.length) return '<p class="muted" style="font-size:15px">这个版本的文件列表请在 <a class="tlink" href="' + esc(r.html_url) + '" rel="noopener">GitHub 发行页</a>查看。</p>';
    var out = '';
    ['installer', 'zip-sc', 'zip-full', 'other'].forEach(function (k) {
      var g = items.filter(function (x) { return x.kind === k; });
      if (!g.length) return;
      out += '<div><h4>' + KIND[k] + '</h4>' + g.map(function (x) {
        var a = x.a;
        return '<div class="arow"><div class="nm">' + esc(x.arch ? (x.arch === 'arm64' ? 'ARM64' : x.arch) : a.name) +
          '<small>' + esc(a.name) + '</small></div><div class="sz">' + esc(CFRel.size(a.size)) + '</div>' +
          '<div><a class="go" href="' + esc(a.url) + '" rel="noopener">下载</a>' +
          (a.digest ? '<button type="button" class="cp" data-copy="' + esc(a.digest.replace(/^sha256:/, '')) + '" title="复制 SHA-256 校验值">SHA-256</button>' : '') + '</div></div>';
      }).join('') + '</div>';
    });
    return out;
  }
  function drawList() {
    var box = $('#ver-list'); if (!box) return;
    box.innerHTML = state.list.map(function (r, i) {
      return '<details class="ver-item"' + (i === 0 ? ' open' : '') + '><summary><span class="vn">' + esc(r.tag) +
        (r.prerelease ? '<span class="chip pre">预览版</span>' : '<span class="chip ok">正式版</span>') + '</span>' +
        '<span class="vd">' + esc(CFRel.date(r.published_at)) + (r.name && r.name !== r.tag ? ' · ' + esc(r.name) : '') + '</span>' +
        '<svg class="ico chev" viewBox="0 0 20 20" aria-hidden="true">' + (card.getAttribute('data-ico-chev') || '') + '</svg></summary>' +
        '<div class="assets">' + assetRows(r) + '<p><a class="tlink" href="' + esc(r.html_url) + '" rel="noopener">查看发行说明 →</a></p></div></details>';
    }).join('');
  }
  CFRel.load(function (list) { state.list = list; draw(); drawList(); });
})();
