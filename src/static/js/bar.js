/* 课表条（灵动岛）示意组件 —— 首屏与演示区共用
   对照真实截图：宽度由内容决定；非当前课程只显示单字，当前课程展开（图标 + 课名 + 时段 / 倒计时）；
   提醒覆盖在条上、与条同宽：蓝色卡片（上课 / 即将上课 / 课间休息）与深色文字提醒（带底部进度条）。 */
window.CFBar = (function () {
  'use strict';
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var fmt = function (m) { m = Math.floor(m); return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  var SV = function (d) { return '<svg viewBox="0 0 20 20" aria-hidden="true">' + d + '</svg>'; };
  var ICON = {
    book: SV('<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H16v12H5.5A1.5 1.5 0 0 0 4 16.5zM4 16.5A1.5 1.5 0 0 0 5.5 18H16"/><path d="M8 7h5"/>'),
    sigma: 'Σ', aa: 'Aa',
    atom: SV('<ellipse cx="10" cy="10" rx="8" ry="3.2"/><ellipse cx="10" cy="10" rx="8" ry="3.2" transform="rotate(60 10 10)"/><ellipse cx="10" cy="10" rx="8" ry="3.2" transform="rotate(120 10 10)"/>'),
    flask: SV('<path d="M7.5 3h5M8.5 3v5.2L4 16a1.4 1.4 0 0 0 1.2 2h9.6A1.4 1.4 0 0 0 16 16l-4.5-7.8V3"/><path d="M6.2 13h7.6"/>'),
    leaf: SV('<path d="M16.5 3.5C8 3.5 4 7 4 11.500c0 2.500 1.800 4.500 4.500 4.500 4.500 0 8-3.500 8-12.500z"/><path d="M4 17c1.500-4 4-6.500 8-8.500"/>'),
    globe: SV('<circle cx="10" cy="10" r="7.500"/><path d="M2.500 10h15M10 2.500c2.500 2.500 2.500 12.500 0 15M10 2.500c-2.500 2.500-2.500 12.500 0 15"/>'),
    clock: SV('<circle cx="10" cy="10" r="7.500"/><path d="M10 5.500V10l3 2"/>'),
    info: SV('<circle cx="10" cy="10" r="7.500"/><path d="M10 9v5M10 6.200v.1"/>')
  };
  var DAY = [
    { c: '语', n: '语文', s: 480, e: 520, i: 'book' }, { c: '数', n: '数学', s: 530, e: 570, i: 'sigma' },
    { c: '英', n: '英语', s: 580, e: 620, i: 'aa' }, { c: '物', n: '物理', s: 630, e: 670, i: 'atom' },
    { c: '化', n: '化学', s: 680, e: 720, i: 'flask' }, { c: '生', n: '生物', s: 730, e: 770, i: 'leaf' },
    { c: '历', n: '历史', s: 780, e: 820, i: 'book' }, { c: '政', n: '政治', s: 830, e: 870, i: 'book' },
    { c: '地', n: '地理', s: 880, e: 920, i: 'globe' }
  ];
  var CLASSES = DAY;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var next = function (c) { var i = CLASSES.indexOf(c); return CLASSES[i + 1] || null; };
  var nextLine = function (n) { return '下节课是：<b>' + n.n + '</b><small>' + fmt(n.s) + '-' + fmt(n.e) + '</small>'; };

  /* 提醒序列（对应真实应用里的三种形态） */
  function seqStart(c) { return [{ type: 'card', text: '上课', icon: c.i, ms: 2200 }]; }
  function seqPre(c) {
    return [{ type: 'card', text: '即将上课', icon: c.i, ms: 1800 },
      { type: 'text', text: '准备上课，请回到座位并保持安静，做好上课准备。', ms: 3200 }];
  }
  function seqBreak(c) {
    var n = next(c);
    var q = [{ type: 'card', text: '课间休息', icon: 'clock', ms: 1800 }];
    if (n) q.push({ type: 'split', left: '本节课间休息长 <b>' + (n.s - c.e) + '</b> 分钟', right: nextLine(n), ms: 3400 });
    return q;
  }

  function mount(el) {
    var h = '<div class="shell"><div class="main"><div class="les">', items = [];
    DAY.forEach(function (d, i) {
      var ic = d.i ? '<span class="ic">' + ICON[d.i] + '</span>' : '';
      h += '<span class="it"><span class="ch">' + d.c + '</span><span class="ex">' + ic + '<span class="nm">' + d.n +
        '</span><span class="tm">' + fmt(d.s) + '-' + fmt(d.e) + '</span><span class="cd"></span></span><span class="pgw"><i class="pg"></i></span></span>';
      var n = DAY[i + 1];
      if (n) h += '<span class="it brk"><span class="ex"><span class="ic">' + ICON.clock + '</span><span class="nm">课间休息</span><span class="tm">' +
        fmt(d.e) + '-' + fmt(n.s) + '</span><span class="cd"></span></span><span class="pgw"><i class="pg"></i></span></span>';
    });
    h += '</div></div><div class="alert">' +
      '<div class="a-card"><span class="inf">' + ICON.info + '</span><b class="at"></b><span class="ci"></span></div>' +
      '<div class="a-split"><div class="l"></div><div class="r"></div></div>' +
      '<div class="a-text"><span class="t"></span></div><i class="ap"></i></div></div>';
    el.classList.add('cfbar');
    el.innerHTML = h;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', '课表条示意：显示当天课表、当前课程与上下课提醒');

    var shell = el.querySelector('.shell'), main = el.querySelector('.main'), ap = el.querySelector('.ap');
    var els = [].slice.call(el.querySelectorAll('.it')), k = 0, timers = [], queue = [];
    DAY.forEach(function (d, i) {
      items.push({ d: d, el: els[k++] });
      if (DAY[i + 1]) items.push({ d: { s: d.e, e: DAY[i + 1].s }, el: els[k++] });
    });
    items.forEach(function (it) { it.pg = it.el.querySelector('.pg'); it.cd = it.el.querySelector('.cd'); });

    function em() { return parseFloat(getComputedStyle(el).fontSize) || 16; }
    function fit() { if (!api || !api.alerting) shell.style.width = main.offsetWidth + 'px'; }
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(main);
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    function clear() { timers.forEach(clearTimeout); timers = []; }
    function render(a) {
      el.classList.remove('t-card', 't-split', 't-text');
      el.classList.add('t-' + a.type);
      if (a.type === 'card') {
        el.querySelector('.a-card .at').textContent = a.text;
        el.querySelector('.a-card .ci').innerHTML = ICON[a.icon] || '';
        el.querySelector('.a-card .ci').className = 'ci' + (ICON[a.icon] && ICON[a.icon].charAt(0) !== '<' ? ' tx' : '');
      } else if (a.type === 'split') {
        el.querySelector('.a-split .l').innerHTML = a.left; el.querySelector('.a-split .r').innerHTML = a.right;
      } else el.querySelector('.a-text .t').textContent = a.text;
      // 文字 / 分栏提醒比课表条宽时，条随内容撑开（卡片提醒始终与条同宽）
      var want = main.offsetWidth;
      if (a.type === 'text') want = Math.max(want, el.querySelector('.a-text .t').offsetWidth + em() * 3);
      else if (a.type === 'split') {
        var side = function (n) { n.style.flex = 'none'; var w = n.offsetWidth; n.style.flex = ''; return w; };
        want = Math.max(want, Math.max(side(el.querySelector('.a-split .l')), side(el.querySelector('.a-split .r'))) * 2 + em() * 2);
      }
      shell.style.width = want + 'px';
      ap.style.setProperty('--ms', a.ms + 'ms');
      ap.style.animation = 'none'; void ap.offsetWidth; ap.style.animation = '';
    }

    var api = {
      el: el, alerting: false, time: 0,
      setTime: function (t) {
        api.time = t;
        items.forEach(function (it) {
          var inside = t >= it.d.s && t < it.d.e;
          it.el.classList.toggle('cur', inside);
          it.el.classList.toggle('past', t >= it.d.e);
          it.pg.style.width = inside ? (((t - it.d.s) / (it.d.e - it.d.s)) * 100).toFixed(2) + '%' : '0';
          var left = inside ? (it.d.e - t) * 60 : 0, last = inside && left <= 60;
          it.el.classList.toggle('last', last);
          if (last) it.cd.textContent = '-' + Math.max(0, Math.floor(left)) + 's';
        });
      },
      currentLesson: function (t) {
        for (var i = 0; i < CLASSES.length; i++) if (t >= CLASSES[i].s && t < CLASSES[i].e) return CLASSES[i];
        return null;
      },
      /* 依次播放一组提醒；fx 为真时给“上课”卡片加光环 */
      sequence: function (list, fx) {
        if (api.alerting) return;
        api.alerting = true; queue = list.slice();
        el.classList.toggle('fx', !!fx);
        if (api.onalert) api.onalert(true, !!fx);
        (function nextOne() {
          var a = queue.shift();
          if (!a) return api.endAlert();
          render(a); el.classList.add('alerting');
          timers.push(setTimeout(nextOne, a.ms));
        })();
      },
      alertStart: function (c, fx) { api.sequence(seqStart(c), fx); },
      alertPre: function (c) { api.sequence(seqPre(c)); },
      alertBreak: function (c) { api.sequence(seqBreak(c)); },
      endAlert: function () {
        clear(); queue = [];
        if (!api.alerting) return;
        api.alerting = false;
        el.classList.remove('alerting', 'fx'); el.classList.add('settle');
        setTimeout(function () { el.classList.remove('settle'); }, 520);
        shell.style.width = main.offsetWidth + 'px';
        if (api.onalert) api.onalert(false, false);
      }
    };
    return api;
  }

  /* 虚拟时间播放：从 from 走到 to，跨过节点弹出提醒；到头后循环 */
  function play(bar, o) {
    var t = o.from, visible = true, running = !reduce, last = performance.now(), raf = 0, dead = false;
    bar.setTime(t);
    if (o.onTick) o.onTick(t);
    function step(ts) {
      if (dead) return;
      raf = requestAnimationFrame(step);
      var dt = Math.min(0.1, (ts - last) / 1000); last = ts;
      if (!running || !visible || document.hidden) return;
      if (bar.alerting) return;
      var prev = t; t += dt * o.speed;
      if (t >= o.to) { t = o.from; bar.endAlert(); bar.setTime(t); if (o.onTick) o.onTick(t); return; }
      CLASSES.forEach(function (c) {
        if (o.preAlert && prev < c.s - 1 && t >= c.s - 1) bar.alertPre(c);
        else if (prev < c.s && t >= c.s) bar.alertStart(c, o.fx);
        else if (o.endAlert && prev < c.e && t >= c.e && next(c)) bar.alertBreak(c);
      });
      bar.setTime(t);
      if (o.onTick) o.onTick(t);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.15 }).observe(bar.el);
    raf = requestAnimationFrame(step);
    return {
      get running() { return running; },
      get t() { return t; },
      set: function (v) { t = v; bar.setTime(t); if (o.onTick) o.onTick(t); },
      pause: function () { running = false; },
      resume: function () { running = true; last = performance.now(); },
      toggle: function () { running = !running; last = performance.now(); return running; },
      stop: function () { dead = true; cancelAnimationFrame(raf); }
    };
  }

  return { mount: mount, play: play, ICON: ICON, DAY: DAY, CLASSES: CLASSES, fmt: fmt, next: next, reduce: reduce };
})();
