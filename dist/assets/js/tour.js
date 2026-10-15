/* 带聚焦框的真实截图：用高亮代替“假鼠标”，位置按图片百分比定位，永不错位 */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-tour]').forEach(function (root) {
    var boxes = JSON.parse(root.getAttribute('data-boxes')); // [[x,y,w,h]...] 单位 %
    var ring = root.querySelector('.ring'), dim = root.querySelector('.dim');
    var btns = [].slice.call(root.querySelectorAll('.steps button'));
    var cur = 0, timer = 0, auto = !reduce, visible = false, hover = false;
    var DUR = 4200;

    function hole(b) {
      var x1 = b[0], y1 = b[1], x2 = b[0] + b[2], y2 = b[1] + b[3];
      return 'polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,' + x1 + '% ' + y1 + '%,' + x1 + '% ' + y2 + '%,' + x2 + '% ' + y2 + '%,' + x2 + '% ' + y1 + '%,' + x1 + '% ' + y1 + '%)';
    }
    function show(i) {
      cur = i; var b = boxes[i], pad = 0.6;
      ring.style.left = (b[0] - pad) + '%'; ring.style.top = (b[1] - pad * 1.7) + '%';
      ring.style.width = (b[2] + pad * 2) + '%'; ring.style.height = (b[3] + pad * 3.4) + '%';
      dim.style.clipPath = hole(b); dim.style.webkitClipPath = hole(b);
      btns.forEach(function (bt, k) {
        bt.setAttribute('aria-selected', k === i ? 'true' : 'false');
        bt.classList.remove('run');
      });
      if (auto && visible && !hover) { void btns[i].offsetWidth; btns[i].classList.add('run'); }
      clearTimeout(timer);
      if (auto && visible && !hover) timer = setTimeout(function () { show((cur + 1) % boxes.length); }, DUR);
    }
    btns.forEach(function (bt, i) {
      bt.addEventListener('click', function () { auto = false; show(i); });
    });
    root.addEventListener('pointerenter', function () { hover = true; clearTimeout(timer); btns[cur].classList.remove('run'); });
    root.addEventListener('pointerleave', function () { hover = false; if (auto) show(cur); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; show(cur); }, { threshold: 0.35 }).observe(root);
    } else { visible = true; }
    root.style.setProperty('--dur', DUR + 'ms');
    show(0);
  });
})();
