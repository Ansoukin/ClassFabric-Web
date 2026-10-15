/* 课表条（灵动岛）示意组件 —— 首屏与演示区共用 */
window.CFBar = (function () {
  'use strict';
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var fmt = function (m) { m = Math.floor(m); return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  var DAY = [
    { c: '语', n: '语文', s: 480, e: 520 }, { c: '数', n: '数学', s: 530, e: 570 },
    { c: '英', n: '英语', s: 580, e: 620 }, { c: '物', n: '物理', s: 630, e: 670 },
    { c: '化', n: '化学', s: 680, e: 720 }, null,
    { c: '生', n: '生物', s: 840, e: 880 }, { c: '地', n: '地理', s: 890, e: 930 },
    { c: '体', n: '体育', s: 940, e: 980 }, { c: '自', n: '自习', s: 990, e: 1030 }
  ];
  var CLASSES = DAY.filter(Boolean);
  var WD = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function mount(el) {
    var now = new Date();
    var dateText = WD[now.getDay()] + ' ' + pad(now.getMonth() + 1) + '/' + pad(now.getDate());
    var h = '<div class="shell"><div class="main">' +
      '<span class="cmp opt">' + dateText + '</span><i class="sep opt"></i><div class="les">';
    DAY.forEach(function (d) {
      if (!d) { h += '<i class="sep"></i>'; return; }
      h += '<span class="it"><span class="ch">' + d.c + '</span><span class="ex"><span class="nm">' + d.n +
        '</span><span class="tm">' + fmt(d.s) + '–' + fmt(d.e) + '</span></span><i class="pg"></i></span>';
    });
    h += '</div><i class="sep opt"></i><span class="cmp opt">多云 24°</span><i class="sep opt"></i><span class="cmp opt">距期中 12 天</span>' +
      '<i class="sep"></i><span class="cmp clk">--:--</span></div>' +
      '<div class="alert"><div class="ai"><i class="dot"></i><span class="at"></span><span class="sub"></span></div></div></div>';
    el.classList.add('cfbar');
    el.innerHTML = h;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', '课表条示意：显示当天课表、当前课程与上下课提醒');

    var shell = el.querySelector('.shell'), main = el.querySelector('.main'), ai = el.querySelector('.ai');
    var clk = el.querySelector('.clk'), at = el.querySelector('.at'), sub = el.querySelector('.sub');
    var els = [].slice.call(el.querySelectorAll('.it')), items = [], k = 0, timer = null, morphT = null;
    DAY.forEach(function (d) { if (d) items.push({ d: d, el: els[k++], pg: null }); });
    items.forEach(function (it) { it.pg = it.el.querySelector('.pg'); });

    function fit(animate) {
      var w = main.offsetWidth;
      if (el.classList.contains('alerting')) w = ai.offsetWidth;
      if (animate) { el.classList.add('morph'); clearTimeout(morphT); morphT = setTimeout(function () { el.classList.remove('morph'); }, 720); }
      shell.style.width = w + 'px';
    }
    if ('ResizeObserver' in window) new ResizeObserver(function () { fit(false); }).observe(main);
    fit(false);

    var api = {
      el: el, alerting: false, time: 0,
      setTime: function (t) {
        api.time = t;
        var cur = -1;
        items.forEach(function (it, i) {
          var inside = t >= it.d.s && t < it.d.e;
          it.el.classList.toggle('cur', inside);
          it.el.classList.toggle('past', t >= it.d.e);
          var p = inside ? (t - it.d.s) / (it.d.e - it.d.s) : 0;
          it.pg.style.width = inside ? 'calc((100% - 1.1em) * ' + p.toFixed(3) + ')' : '0';
          if (inside) cur = i;
        });
        clk.textContent = fmt(t);
        return cur;
      },
      currentLesson: function (t) {
        for (var i = 0; i < CLASSES.length; i++) if (t >= CLASSES[i].s && t < CLASSES[i].e) return CLASSES[i];
        return null;
      },
      alert: function (text, subText, fx, ms) {
        if (api.alerting) return;
        api.alerting = true;
        at.textContent = text; sub.textContent = subText || '';
        el.classList.remove('fx'); el.classList.add('alerting'); if (fx) el.classList.add('fx');
        fit(true);
        if (api.onalert) api.onalert(true, !!fx);
        clearTimeout(timer);
        timer = setTimeout(api.endAlert, ms || 3200);
      },
      endAlert: function () {
        clearTimeout(timer);
        if (!api.alerting) return;
        api.alerting = false;
        el.classList.remove('alerting', 'fx');
        fit(true);
        if (api.onalert) api.onalert(false, false);
      }
    };
    return api;
  }

  /* 虚拟时间播放：从 from 走到 to，跨过上课点弹出提醒；到头后 onend 或循环 */
  function play(bar, o) {
    var t = o.from, visible = true, running = !reduce, last = performance.now(), raf = 0, dead = false;
    bar.setTime(t);
    if (o.onTick) o.onTick(t);
    function step(ts) {
      if (dead) return;
      raf = requestAnimationFrame(step);
      var dt = Math.min(0.1, (ts - last) / 1000); last = ts;
      if (!running || !visible || document.hidden) return;
      if (bar.alerting && o.pauseOnAlert !== false) return;
      var prev = t; t += dt * o.speed;
      if (t >= o.to) { t = o.from; prev = t - 0.001; bar.setTime(t); if (o.onTick) o.onTick(t); return; }
      CLASSES.forEach(function (c) {
        if (prev < c.s && t >= c.s && o.startAlert !== false) bar.alert('上课了 · ' + c.n, fmt(c.s) + '–' + fmt(c.e), o.fx);
        if (prev < c.e && t >= c.e && o.endAlert) bar.alert('下课了 · 休息一下', '', false);
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

  return { mount: mount, play: play, DAY: DAY, CLASSES: CLASSES, fmt: fmt, reduce: reduce };
})();
