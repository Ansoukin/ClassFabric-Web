/* 发行版数据：优先读本站 /data/releases.json（由服务器定时从 GitHub 同步），失败则使用页面内置数据。
   不在浏览器里直连 GitHub API：校园网共享出口很容易触发匿名限流，部分地区也访问不稳定。 */
window.CFRel = (function () {
  'use strict';
  var seedEl = document.getElementById('rel-seed');
  var seed = []; try { seed = seedEl ? JSON.parse(seedEl.textContent) : []; } catch (e) {}

  function archOf(n) { var m = /(x64|x86|arm64)/i.exec(n); return m ? m[1].toLowerCase() : ''; }
  function classify(a) {
    var n = a.name;
    if (/^source/i.test(n) || /\.(tar\.gz)$/i.test(n) || /^\d+(\.\d+)+\.zip$/.test(n)) return null;
    if (!/windows/i.test(n)) return { kind: 'other', arch: archOf(n), a: a };
    var kind = /installer/i.test(n) ? 'installer' : (/selfContained/i.test(n) ? 'zip-sc' : (/full/i.test(n) ? 'zip-full' : 'other'));
    return { kind: kind, arch: archOf(n), a: a };
  }
  function pickAsset(rel, kind, arch) {
    var list = (rel.assets || []).map(classify).filter(Boolean);
    return list.filter(function (x) { return x.kind === kind && x.arch === arch; })[0] || null;
  }
  function size(b) { return b ? (b >= 1048576 ? (b / 1048576).toFixed(b >= 104857600 ? 0 : 1) + ' MB' : Math.round(b / 1024) + ' KB') : ''; }
  function date(s) { if (!s) return ''; var d = new Date(s); return isNaN(d) ? '' : d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function latest(list) { return list[0]; }
  function stable(list) { return list.filter(function (r) { return !r.prerelease; })[0]; }
  function load(cb) {
    cb(seed, false);
    if (!window.fetch) return;
    fetch('/data/releases.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) { if (Array.isArray(j) && j.length) cb(j, true); }).catch(function () {});
  }
  return { load: load, classify: classify, pick: pickAsset, size: size, date: date, latest: latest, stable: stable, seed: seed };
})();

/* 首页等页面里的版本标签 */
(function () {
  var els = document.querySelectorAll('[data-ver]');
  if (!els.length) return;
  CFRel.load(function (list) {
    var r = CFRel.latest(list); if (!r) return;
    els.forEach(function (e) { e.textContent = r.tag + (r.prerelease ? ' 预览版' : ' 正式版'); });
  });
})();
