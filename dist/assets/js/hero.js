/* 首屏舞台：灵动岛自动走课 + 轻微视差 */
(function () {
  'use strict';
  var stage = document.querySelector('.hero-stage');
  if (!stage || !window.CFBar) return;
  var el = stage.querySelector('[data-bar]');
  var bar = CFBar.mount(el);
  if (CFBar.reduce) {
    bar.setTime(552); // 静态：09:12，数学课进行中
    var c0 = stage.querySelector('.taskbar .clock'), d0 = new Date();
    if (c0) c0.innerHTML = '9:12<br>' + d0.getFullYear() + '/' + (d0.getMonth() + 1) + '/' + d0.getDate();
    return;
  }
  var ck = stage.querySelector('.taskbar .clock'), dt = new Date();
  var dstr = dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
  function tick(t) { if (ck) ck.innerHTML = Math.floor(t / 60) + ':' + ('0' + Math.floor(t % 60)).slice(-2) + '<br>' + dstr; }
  tick(552);
  CFBar.play(bar, { from: 524, to: 575, speed: 5.4, fx: true, endAlert: false, onTick: tick });

  // 视差：窗口随指针轻微位移（仅精细指针设备）
  if (!matchMedia('(pointer: fine)').matches) return;
  var layers = [].slice.call(stage.querySelectorAll('[data-depth]')), tx = 0, ty = 0, raf = 0;
  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  stage.addEventListener('pointerleave', function () { tx = ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
  function apply() {
    raf = 0;
    layers.forEach(function (l) {
      var d = parseFloat(l.getAttribute('data-depth'));
      l.style.transform = 'translate3d(' + (tx * d * -1).toFixed(2) + 'px,' + (ty * d * -1).toFixed(2) + 'px,0)';
    });
  }
})();
