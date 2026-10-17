/* 首屏演示：从“零”开始的完整使用流程
   托盘右键 → 编辑档案 → 时间表 → 科目 → 课表 → 回到主界面走课。
   整个舞台用设计坐标 1200×680 绘制并按宽度缩放；光标目标由元素的实际位置计算，不会错位。
   界面状态集中在 S 里，渲染是 S 的函数；每一幕都能从自己的起始快照开始，所以可以随意跳转、重播。 */
(function () {
  'use strict';
  var stage = document.querySelector('[data-hero]');
  if (!stage || !window.CFBar) return;
  var Q = function (s, r) { return (r || stage).querySelector(s); };
  var QA = function (s, r) { return [].slice.call((r || stage).querySelectorAll(s)); };
  var cam = Q('[data-cam]'), W = 1200, H = 680, DAY = CFBar.DAY, ICON = CFBar.ICON, reduce = CFBar.reduce;
  var el = {
    hbar: Q('.hbar'), ed: Q('[data-ed]'), menu: Q('[data-menu]'), cur: Q('[data-cursor]'), tag: Q('[data-cursor] .tag'),
    clock: Q('[data-clock]'), lapse: Q('[data-lapse]'), tray: Q('[data-tray]'), toast: Q('[data-toast]'),
    tl: Q('[data-tl]'), tlIn: Q('[data-tl-in]'), tlEmpty: Q('[data-tl-empty]'), ttItems: Q('[data-tt-items]'), prop: Q('[data-tt-prop]'),
    subTbl: Q('[data-sub-tbl]'), planMain: Q('[data-plan-main]'), planSide: Q('[data-plan-side]'),
    save: Q('[data-save]'), close: Q('[data-close]'), ttAdd: Q('[data-tt-add]'), subAdd: Q('[data-sub-add]'),
    tabs: QA('[data-tab]'), panes: QA('[data-pane]'), steps: QA('[data-go]', document), replay: Q('[data-replay]', document)
  };
  var bar = CFBar.mount(Q('[data-bar]'));
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  var hms = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60) + ':00'; };
  var hm = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  var mi = function (d) { return '<svg class="mi" viewBox="0 0 20 20" aria-hidden="true">' + d + '</svg>'; };
  var MI = {
    book: mi('<path d="M5 3.500h9v13H5z"/><path d="M8 7h3"/>'),
    clock: mi('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.500 1.500"/>'),
    dots: '<svg class="mi dg" viewBox="0 0 12 20" aria-hidden="true"><circle cx="3" cy="5" r="1.100"/><circle cx="9" cy="5" r="1.100"/><circle cx="3" cy="10" r="1.100"/><circle cx="9" cy="10" r="1.100"/><circle cx="3" cy="15" r="1.100"/><circle cx="9" cy="15" r="1.100"/></svg>',
    check: mi('<path d="M5 10.500l3.200 3.200L15 6.800"/>'),
    gear: mi('<circle cx="10" cy="10" r="2.600"/><path d="M10 2.500v2M10 15.500v2M2.500 10h2M15.500 10h2M4.700 4.700l1.400 1.400M13.900 13.900l1.400 1.400M4.700 15.300l1.400-1.400M13.900 6.100l1.400-1.400"/>'),
    plus: mi('<path d="M10 4v12M4 10h12"/>'),
    refresh: mi('<path d="M15.500 10a5.500 5.500 0 1 1-1.700-4M14 3v3h-3"/>'),
    cal: mi('<rect x="3.500" y="4.500" width="13" height="12" rx="2"/><path d="M3.500 8h13M7 3v3M13 3v3"/>'),
    left: mi('<path d="M16 10H4M9 5l-5 5 5 5"/>'), right: mi('<path d="M4 10h12M11 5l5 5-5 5"/>')
  };
  var COLORS = ['#e8606e', '#5b7be8', '#8265e0', '#3a9fe0', '#26b0a0', '#5ab552', '#c68a3a', '#e0557a', '#8cb04a'];
  var ICONS = ['book', 'sigma', 'aa', 'atom', 'flask', 'leaf', 'globe'];
  var PX = 1.5; // 时间轴：每分钟的像素数

  /* ---- 日期：演示固定落在周一（今天是周一就用今天，否则取下一个周一） ---- */
  var base = new Date(); base.setHours(12, 0, 0, 0); base.setDate(base.getDate() + ((8 - base.getDay()) % 7));
  var dstr = base.getFullYear() + '/' + (base.getMonth() + 1) + '/' + base.getDate();
  var WEEK = ['周一', '周二', '周三', '周四', '周五'];
  var wdate = function (i) { var d = new Date(base.getTime() + i * 864e5); return (d.getMonth() + 1) + '/' + d.getDate(); };
  function setClock(t) { el.clock.innerHTML = Math.floor(t / 60) + ':' + pad(Math.floor(t % 60)) + '<br>' + dstr; }

  /* ---------------------------------------------------------------- 状态 */
  var S;
  function blank() {
    return { menu: false, ed: false, tab: 'plan', ttItem: false, pts: [], sel: -1, focusF: null, fieldText: '', newIdx: -1,
      subs: [], typing: null, pop: null, planOn: false, cells: [], cell: -1, barOn: false, toast: false };
  }
  function fullPts() {
    var out = [];
    DAY.forEach(function (d, i) {
      out.push({ s: d.s, e: d.e, t: 'c' });
      if (DAY[i + 1]) out.push({ s: d.e, e: DAY[i + 1].s, t: 'b' });
    });
    return out;
  }
  function fullSubs() { return DAY.map(function (d, i) { return { k: i, name: d.n, short: d.c, th: true, ic: true }; }); }
  /* 第 n 幕开始时的界面状态 */
  function snap(n) {
    var s = blank();
    if (n >= 1) { s.ed = true; s.tab = 'plan'; }
    if (n >= 2) { s.tab = 'tt'; s.ttItem = true; s.pts = fullPts(); }
    if (n >= 3) { s.tab = 'sub'; s.subs = fullSubs(); }
    if (n >= 4) { s.tab = 'plan'; s.planOn = true; s.cells = DAY.map(function (d, i) { return i; }); s.ed = false; }
    return s;
  }

  /* ---------------------------------------------------------------- 渲染 */
  function icoHtml(k) {
    var n = DAY[k].i, v = ICON[n];
    return v && v.charAt(0) === '<' ? v : '<span class="tx">' + (v || '') + '</span>';
  }
  function renderTT() {
    el.ttItems.innerHTML = S.ttItem ? '<div class="tt-item on">新时间表</div>' : '';
    var h = '', i;
    for (i = 0; i <= 17; i++) h += '<i class="hl" style="top:' + (i * 60 * PX) + 'px"></i><span class="hr" style="top:' + (i * 60 * PX) + 'px">' + pad(i) + ':00</span>';
    S.pts.forEach(function (p, k) {
      var ht = (p.e - p.s) * PX;
      h += '<div class="pt ' + p.t + (k === S.sel ? ' sel' : '') + (k === S.newIdx ? ' new' : '') + '" style="top:' + (p.s * PX) + 'px;height:' + ht + 'px">' +
        '<span class="t1">' + (p.t === 'c' ? MI.book : MI.clock) + hms(p.s) + ' - ' + hms(p.e) + '</span>' +
        (ht >= 44 ? '<span class="t2">' + MI.clock + hms(p.e - p.s) + '</span>' : '') + '</div>';
    });
    el.tlIn.innerHTML = h;
    el.tlEmpty.style.display = S.pts.length ? 'none' : '';
    el.tlEmpty.querySelector('span').textContent = S.ttItem ? '还没有时间点' : '还没有时间表';
    // 右侧属性
    var p = S.pts[S.sel];
    if (!p) { el.prop.innerHTML = '<div class="prop-hint">选择一个时间点，在这里编辑</div>'; return; }
    function fld(k, v) {
      var f = S.focusF === k;
      return '<div class="fd' + (f ? ' f' : '') + '" data-f="' + k + '">' + (f ? S.fieldText + '<u></u>' : v) + '</div>';
    }
    el.prop.innerHTML = '<h4>编辑时间点</h4>' +
      '<label>开始时间</label><div class="fg">' + fld('sh', Math.floor(p.s / 60)) + fld('sm', pad(p.s % 60)) + fld('ss', '00') + '</div>' +
      '<label>结束时间</label><div class="fg">' + fld('eh', Math.floor(p.e / 60)) + fld('em', pad(p.e % 60)) + fld('es', '00') + '</div>' +
      '<label>类型</label><div class="chips"><span class="chip' + (p.t === 'c' ? ' on' : '') + '">' + MI.book + '上课</span><span class="chip' + (p.t === 'b' ? ' on' : '') + '">' + MI.clock + '课间休息</span></div>';
  }
  function renderSub() {
    var h = '<div class="sh"><span></span><span>图标</span><span>主题1</span><span>科目名</span><span>简称</span><span>户外课程?</span><span>科目老师</span><span>地点</span></div>';
    S.subs.forEach(function (r, i) {
      var ty = S.typing && S.typing.i === i ? S.typing.f : '';
      h += '<div class="rw' + (r.fresh ? ' new' : '') + '">' + MI.dots +
        '<span class="c-ic' + (r.ic ? ' set' : '') + '">' + (r.ic ? icoHtml(r.k) : '') + '</span>' +
        '<span class="c-th"><b class="' + (r.th ? 'set' : '') + '" style="' + (r.th ? 'background:' + COLORS[r.k] : '') + '"></b></span>' +
        '<span class="c-nm' + (ty === 'name' ? ' caret' : '') + '">' + r.name + '</span>' +
        '<span class="c-sh' + (ty === 'short' ? ' caret' : '') + '">' + r.short + '</span>' +
        '<span class="c-ck"><em></em></span><span></span><span></span></div>';
      r.fresh = false;
    });
    if (S.pop) {
      if (S.pop === 'color') {
        h += '<div class="pop colors">' + COLORS.slice(0, 8).map(function (c, i) { return '<i data-pc="' + i + '" style="background:' + c + '"></i>'; }).join('') + '</div>';
      } else {
        h += '<div class="pop icons">' + ICONS.map(function (n, i) { var v = ICON[n]; return '<i data-pi="' + i + '">' + (v.charAt(0) === '<' ? v : '<span class="tx">' + v + '</span>') + '</i>'; }).join('') + '</div>';
      }
    }
    el.subTbl.innerHTML = h;
  }
  function renderPlan() {
    var lessons = S.pts.filter(function (p) { return p.t === 'c'; });
    if (!lessons.length) {
      el.planMain.innerHTML = '<div class="none">' + mi('<rect x="3" y="3" width="14" height="14" rx="3" stroke-dasharray="3 2.500"/>') + '<span>啥都没有</span></div>';
      el.planSide.innerHTML = ''; return;
    }
    var h = '<div class="p-top"><button>' + MI.refresh + '刷新</button><i class="vl"></i><span class="pn">' + (S.planOn ? '新课表' : '未选择课表') + '</span></div>' +
      '<div class="p-date"><span class="dbox">' + dstr + MI.cal + '</span><span class="ar">' + MI.left + '</span><span class="ar">' + MI.right + '</span></div>' +
      '<div class="p-grid"><div class="gh tm">时间</div>';
    WEEK.forEach(function (w, i) {
      h += '<div class="gh"><span class="sm"><em>' + w + '</em><em>' + wdate(i) + '</em></span><b>' + w + '</b>' +
        (i === 0 && S.planOn ? '<span class="gear">' + MI.gear + '</span>' : '<button class="newbtn" data-newplan="' + i + '">' + MI.plus + '新课表</button>') + '</div>';
    });
    lessons.forEach(function (p, r) {
      h += '<div class="gc tm">' + hm(p.s) + '-' + hm(p.e) + '</div>';
      for (var c = 0; c < 5; c++) {
        if (c === 0 && S.planOn) {
          var k = S.cells[r];
          h += '<div class="gc' + (S.cell === r ? ' sel' : '') + '" data-cell="' + r + '">' + (k != null ? DAY[k].n : '') + '</div>';
        } else h += '<div class="gc"></div>';
      }
    });
    el.planMain.innerHTML = h + '</div>';
    el.planSide.innerHTML = '<h4>编辑科目</h4><div class="sbtns">' + DAY.map(function (d, i) { return '<span class="sj" data-sj="' + i + '">' + d.c + '</span>'; }).join('') + '</div>' +
      '<div class="autochk"><i>' + MI.check + '</i>选完科目自动移动到下一个课程</div>';
  }
  function render() {
    el.menu.classList.toggle('open', S.menu);
    el.ed.classList.toggle('open', S.ed);
    el.tabs.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === S.tab); });
    el.panes.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-pane') === S.tab); });
    el.hbar.classList.toggle('on', S.barOn);
    el.hbar.classList.toggle('big', S.barOn);
    el.toast.classList.toggle('on', S.toast);
    renderTT(); renderSub(); renderPlan();
    S.newIdx = -1;
  }
  function scrollTo(p) {
    var vh = el.tl.clientHeight || 340;
    var y = Math.max(0, Math.min(p.s * PX - 30, p.e * PX - (vh - 36)));
    el.tlIn.style.transform = 'translateY(' + (-y) + 'px)';
  }

  /* ---------------------------------------------------------------- 镜头与光标 */
  var fx = W / 2, fy = H / 2, cx = 760, cy = 470, visible = true, run = 0, hvNode = null;
  function layout() {
    var sw = stage.clientWidth, sh = stage.clientHeight, z = sw < 720 ? 2 : 1, s = sw / W * z;
    var vw = sw / s, vh = sh / s;
    var x = Math.max(0, Math.min(W - vw, fx - vw / 2)), y = Math.max(0, Math.min(H - vh, fy - vh / 2));
    cam.style.transform = 'translate(' + (-x * s).toFixed(2) + 'px,' + (-y * s).toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
  }
  function focusAt(x, y) { fx = x; fy = y; layout(); }
  function wait(ms) {
    var id = run;
    return new Promise(function (res, rej) {
      var left = ms;
      (function tick() {
        if (id !== run) return rej('abort');
        if (!visible || document.hidden) return setTimeout(tick, 200);
        if (left <= 0) return res();
        var d = Math.min(left, 50); left -= d; setTimeout(tick, d);
      })();
    });
  }
  function pt(node, ax, ay) {
    var r = node.getBoundingClientRect(), c = cam.getBoundingClientRect(), s = c.width / W;
    return { x: (r.left - c.left) / s + r.width * (ax == null ? .5 : ax), y: (r.top - c.top) / s + r.height * (ay == null ? .5 : ay) };
  }
  function curTo(x, y, ms) {
    cx = x; cy = y;
    el.cur.style.transitionDuration = ms + 'ms';
    el.cur.style.transform = 'translate(' + (x - 5) + 'px,' + (y - 3) + 'px)';
    el.cur.style.opacity = 1;
    if (stage.clientWidth < 720) focusAt(x, y);
  }
  function setHv(node) {
    if (hvNode) hvNode.classList.remove('hv');
    hvNode = node; if (node) node.classList.add('hv');
  }
  async function go(node, ms, ax, ay) {
    if (!node) throw 'abort';
    setHv(null);
    var p = pt(node, ax, ay);
    curTo(p.x, p.y, ms);
    await wait(ms);
    setHv(node);
  }
  async function click(node, label) {
    el.cur.classList.add('down');
    if (label) { el.tag.textContent = label; el.cur.classList.add('lab'); }
    var r = document.createElement('i'); r.className = 'rip'; r.style.left = cx + 'px'; r.style.top = cy + 'px';
    cam.appendChild(r); setTimeout(function () { r.remove(); }, 650);
    if (node) node.classList.add('press');
    await wait(label ? 160 : 110);
    el.cur.classList.remove('down'); if (node) node.classList.remove('press');
    if (label) setTimeout(function () { el.cur.classList.remove('lab'); }, 900);
  }
  function park() { setHv(null); el.cur.style.opacity = 0; }
  function chip(html) {
    if (!html) { el.lapse.classList.remove('on'); return; }
    el.lapse.innerHTML = '<span class="dot"></span>' + html; el.lapse.classList.add('on');
  }
  function resetCursor(x, y) {
    el.cur.style.transitionDuration = '0ms'; el.cur.style.opacity = 0;
    cx = x; cy = y; el.cur.style.transform = 'translate(' + (x - 5) + 'px,' + (y - 3) + 'px)';
  }
  var tabBtn = function (k) { return Q('[data-tab="' + k + '"]'); };

  /* 在一个格子里“打字”：逐字出现 */
  async function typeInto(f, text, per, onEach) {
    for (var i = 1; i <= text.length; i++) { onEach(text.slice(0, i)); render(); await wait(per); }
  }
  async function editField(k, val) {
    var f = Q('[data-f="' + k + '"]');
    await go(f, 650); await click(f);
    S.focusF = k; S.fieldText = ''; render(); await wait(380);
    S.fieldText = String(val); render(); await wait(480);
    var p = S.pts[S.sel], v = +val;
    if (k === 'sh') p.s = v * 60 + p.s % 60; else if (k === 'eh') p.e = v * 60 + p.e % 60;
    S.focusF = null; render(); scrollTo(p); await wait(750);
  }
  function addPoint(t) {
    var last = S.pts[S.pts.length - 1], s = last ? last.e : 0;
    S.pts.push({ s: s, e: s + (t === 'c' ? 40 : 10), t: t });
    S.sel = S.pts.length - 1; S.newIdx = S.sel;
    var p = S.pts[S.sel]; render(); scrollTo(p);
  }

  /* ---------------------------------------------------------------- 五幕 */
  var scenes = [
    async function menu() { // 1 托盘右键 → 编辑档案
      S = snap(0); render(); setClock(7 * 60 + 40); chip(null); el.tlIn.style.transform = '';
      focusAt(1000, 560); resetCursor(760, 400);
      await wait(1000);
      await go(el.tray, 1300); await click(el.tray, '右键');
      S.menu = true; render(); await wait(700);
      var row = Q('[data-m="profile"]');
      await go(row, 1000, .3, .5); await wait(450);
      await click(row);
      S.menu = false; S.ed = true; render(); await wait(900);
    },
    async function timetable() { // 2 时间表
      S = snap(1); render(); setClock(7 * 60 + 41); focusAt(600, 340); await wait(500);
      await go(tabBtn('tt'), 900); await click(tabBtn('tt')); S.tab = 'tt'; render(); await wait(450);
      await go(el.ttAdd, 800); await click(el.ttAdd); S.ttItem = true; render(); await wait(600);
      var bc = Q('[data-add="c"]'), bb = Q('[data-add="b"]');
      await go(bc, 800); await click(bc); addPoint('c'); await wait(900);
      await editField('eh', 8);       // 先把结束时间拨到 8 点……
      await editField('sh', 8);       // ……再把开始时间也拨到 8 点：得到 08:00 – 08:40
      await go(bb, 800); await click(bb); addPoint('b'); await wait(600);
      await go(bc, 500); await click(bc); addPoint('c'); await wait(600);
      chip('<b>快进</b> · 其余课程同样添加');
      var ms = 210;
      while (S.pts.length < 17) {
        var t = S.pts[S.pts.length - 1].t === 'c' ? 'b' : 'c', btn = t === 'c' ? bc : bb;
        await go(btn, ms); await click(btn); addPoint(t); await wait(ms * .6);
      }
      chip(null); await wait(1100);
    },
    async function subjects() { // 3 科目
      S = snap(2); render(); setClock(7 * 60 + 43); focusAt(600, 340); await wait(400);
      await go(tabBtn('sub'), 900); await click(tabBtn('sub')); S.tab = 'sub'; render(); await wait(500);
      for (var i = 0; i < DAY.length; i++) {
        var slow = i < 2, d = DAY[i];
        if (i === 2) chip('<b>快进</b> · 其余科目同样添加');
        await go(el.subAdd, slow ? 750 : 260); await click(el.subAdd);
        var r = { k: i, name: '', short: '', th: false, ic: false, fresh: true };
        S.subs.push(r); S.typing = { i: i, f: 'name' }; render(); await wait(slow ? 450 : 150);
        await typeInto('name', d.n, slow ? 230 : 70, function (t) { r.name = t; });
        S.typing = { i: i, f: 'short' }; render(); await wait(slow ? 280 : 90);
        r.short = d.c; render(); await wait(slow ? 400 : 110);
        S.typing = null;
        if (i === 0) {
          var row = Q('.rw', el.subTbl), th = Q('.c-th', row);
          await go(th, 800); await click(th); S.pop = 'color'; render(); await wait(450);
          var pc = Q('[data-pc="0"]'); await go(pc, 600); await click(pc);
          r.th = true; S.pop = null; render(); await wait(450);
          var ic = Q('.c-ic', Q('.rw', el.subTbl)); await go(ic, 600); await click(ic); S.pop = 'icon'; render(); await wait(450);
          var pi = Q('[data-pi="0"]'); await go(pi, 600); await click(pi);
          r.ic = true; S.pop = null; render(); await wait(600);
        } else { r.th = r.ic = true; render(); await wait(slow ? 500 : 100); }
      }
      chip(null); await wait(1100);
    },
    async function plan() { // 4 课表
      S = snap(3); render(); setClock(7 * 60 + 46); focusAt(600, 340); await wait(400);
      await go(tabBtn('plan'), 900); await click(tabBtn('plan')); S.tab = 'plan'; render(); await wait(700);
      var nb = Q('[data-newplan="0"]');
      await go(nb, 900); await click(nb); S.planOn = true; render(); await wait(700);
      var c0 = Q('[data-cell="0"]'); await go(c0, 800); await click(c0); S.cell = 0; render(); await wait(500);
      for (var i = 0; i < DAY.length; i++) {
        var slow = i < 3, sj = Q('[data-sj="' + i + '"]');
        if (i === 3) chip('<b>快进</b> · 选完自动跳到下一节');
        await go(sj, slow ? 700 : 240); await click(sj);
        S.cells[i] = i; S.cell = i < DAY.length - 1 ? i + 1 : -1; render();
        await wait(slow ? 650 : 160);
      }
      chip(null); await wait(900);
      await go(el.save, 1000); await click(el.save); S.toast = true; render(); await wait(1500);
      S.toast = false; render(); await wait(300);
      await go(el.close, 900); await click(el.close); S.ed = false; render(); await wait(300);
      el.cur.style.opacity = 0; await wait(700);
    },
    async function lesson() { // 5 开始上课：主界面按课表走课
      S = snap(4); render(); setClock(7 * 60 + 55); focusAt(600, 70); park();
      await wait(600);
      S.barOn = true; render(); await wait(900);
      chip('时间 <b>7×</b> 加速');
      bar.setTime(476); setClock(476);
      player = CFBar.play(bar, { from: 476, to: 636, speed: 7, fx: true, endAlert: true, preAlert: true, onTick: setClock });
    }
  ];
  var player = null;

  /* ---------------------------------------------------------------- 流程控制 */
  function stopAll() {
    run++; if (player) { player.stop(); player = null; }
    bar.endAlert(); chip(null); setHv(null);
    el.cur.classList.remove('down', 'lab');
    QA('.press').forEach(function (n) { n.classList.remove('press'); });
  }
  function mark(i) {
    el.steps.forEach(function (b, k) {
      b.classList.toggle('on', k === i); b.classList.toggle('done', k < i);
      b.setAttribute('aria-selected', k === i ? 'true' : 'false');
    });
  }
  async function play(from) {
    stopAll();
    try {
      for (var i = from; i < scenes.length; i++) { mark(i); await scenes[i](); }
    } catch (e) { if (e !== 'abort') throw e; }
  }
  /* 减少动态效果：不播放，直接给出每一步的静态画面 */
  function staticView(i) {
    stopAll(); mark(i); chip(null); park(); el.tlIn.style.transform = '';
    if (i === 0) { S = snap(0); S.menu = true; setClock(7 * 60 + 40); }
    else if (i === 1) { S = snap(2); setClock(7 * 60 + 43); }
    else if (i === 2) { S = snap(3); setClock(7 * 60 + 46); }
    else if (i === 3) { S = snap(4); S.ed = true; setClock(7 * 60 + 52); }
    else { S = snap(4); S.barOn = true; bar.setTime(552); setClock(552); }
    render();
    if (i === 1) scrollTo(S.pts[0]);
  }

  el.steps.forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.getAttribute('data-go');
      if (reduce) staticView(i); else play(i);
    });
  });
  el.replay.addEventListener('click', function () { if (reduce) staticView(0); else play(0); });

  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(stage); else window.addEventListener('resize', layout);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.2 }).observe(stage);
  layout();
  requestAnimationFrame(function () { stage.classList.add('ready'); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  if (reduce) staticView(4); else play(0);
})();
