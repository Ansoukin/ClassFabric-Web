/* 通用：主题切换、顶栏、移动端菜单、滚动出现、目录高亮、标签页 */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };

  // 主题
  var tb = $('.theme-btn');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('cf-theme', t); } catch (e) {}
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#13120e' : '#f6f3ec');
    if (tb) tb.setAttribute('aria-label', t === 'dark' ? '切换到浅色模式' : '切换到深色模式');
  }
  if (tb) {
    setTheme(root.getAttribute('data-theme') || 'light');
    tb.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });
  }

  // 顶栏阴影
  var hdr = $('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  // 移动端菜单
  var mb = $('.menu-btn'), sheet = $('.sheet');
  if (mb && sheet) {
    var close = function () { sheet.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; };
    mb.addEventListener('click', function () {
      var o = sheet.classList.toggle('open');
      mb.setAttribute('aria-expanded', o ? 'true' : 'false');
      d.body.style.overflow = o ? 'hidden' : '';
    });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', close); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    matchMedia('(min-width: 881px)').addEventListener('change', close);
  }

  // 滚动出现
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window && rv.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (n) { io.observe(n); });
  } else { rv.forEach(function (n) { n.classList.add('in'); }); }

  // 目录滚动高亮
  var toc = $$('.toc a');
  if (toc.length && 'IntersectionObserver' in window) {
    var map = {};
    toc.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) map[s.id] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { toc.forEach(function (a) { a.classList.remove('on'); }); map[e.target.id].classList.add('on'); }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { so.observe(d.getElementById(id)); });
  }

  // 标签页
  $$('[data-tabs]').forEach(function (g) {
    var tabs = $$('[role="tab"]', g), panels = $$('[data-panel]', g);
    function pick(i, focus) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p) { var on = +p.getAttribute('data-panel') === i; p.classList.toggle('on', on); p.hidden = !on; });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); pick((i + 1) % tabs.length, true); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); pick((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
    pick(0);
  });

  // 复制按钮
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var v = b.getAttribute('data-copy');
    var done = function () { var o = b.textContent; b.textContent = '已复制'; setTimeout(function () { b.textContent = o; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () {});
  });
})();
