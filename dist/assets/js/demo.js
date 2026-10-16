/* 可拖动的时间轴演示：亲手“拨动”一天的课表 */
(function () {
  'use strict';
  var root = document.querySelector('[data-demo]');
  if (!root || !window.CFBar) return;
  var T0 = 450, T1 = 960, SPAN = T1 - T0; // 07:30 – 16:00
  var bar = CFBar.mount(root.querySelector('[data-bar]'));
  var track = root.querySelector('.track'), head = root.querySelector('.head');
  var timeEl = root.querySelector('.time'), nowEl = root.querySelector('.now');
  var playBtn = root.querySelector('.pbtn.play'), stage = root.closest('.stage') || root;
  var ticks = root.querySelector('.ticks');

  // 课程块
  CFBar.CLASSES.forEach(function (c) {
    var b = document.createElement('div');
    b.className = 'blk'; b.dataset.s = c.s; b.dataset.e = c.e; b.textContent = c.c;
    b.style.left = ((c.s - T0) / SPAN * 100) + '%'; b.style.width = ((c.e - c.s) / SPAN * 100) + '%';
    track.insertBefore(b, head);
  });
  var blks = [].slice.call(track.querySelectorAll('.blk'));
  for (var h = 8; h <= 15; h += 1) {
    var s = document.createElement('span'); s.textContent = h + ':00'; s.style.left = ((h * 60 - T0) / SPAN * 100) + '%'; ticks.appendChild(s);
  }

  function label(t) {
    var c = bar.currentLesson(t);
    if (c) return c.n + ' · 第 ' + (CFBar.CLASSES.indexOf(c) + 1) + ' 节';
    return '课间';
  }
  function paint(t) {
    timeEl.textContent = CFBar.fmt(t);
    var l = label(t);
    nowEl.textContent = l;
    head.style.left = ((t - T0) / SPAN * 100) + '%';
    blks.forEach(function (b) { b.classList.toggle('on', t >= +b.dataset.s && t < +b.dataset.e); });
    track.setAttribute('aria-valuenow', Math.round(t));
    track.setAttribute('aria-valuetext', CFBar.fmt(t) + '，' + l);
  }

  var player = CFBar.play(bar, { from: 524, to: T1, speed: 7, fx: false, endAlert: true, preAlert: true, onTick: paint });
  bar.onalert = function (on, fx) { if (fx !== undefined) stage.classList.toggle('fx', on && fx); };
  function syncBtn() {
    var r = player.running;
    playBtn.setAttribute('aria-pressed', r ? 'true' : 'false');
    playBtn.setAttribute('aria-label', r ? '暂停' : '播放');
    playBtn.querySelector('.i-play').style.display = r ? 'none' : '';
    playBtn.querySelector('.i-pause').style.display = r ? '' : 'none';
  }
  if (CFBar.reduce) player.pause();
  syncBtn();
  playBtn.addEventListener('click', function () { player.toggle(); syncBtn(); });

  // 拖动 / 点击 / 键盘
  function timeAt(x) {
    var r = track.getBoundingClientRect();
    return Math.max(T0, Math.min(T1 - 0.01, T0 + (x - r.left) / r.width * SPAN));
  }
  var dragging = false, wasRunning = false;
  track.addEventListener('pointerdown', function (e) {
    dragging = true; wasRunning = player.running; player.pause(); syncBtn(); bar.endAlert();
    track.setPointerCapture(e.pointerId); player.set(timeAt(e.clientX)); e.preventDefault();
  });
  track.addEventListener('pointermove', function (e) { if (dragging) player.set(timeAt(e.clientX)); });
  function up() { if (!dragging) return; dragging = false; if (wasRunning) { player.resume(); syncBtn(); } }
  track.addEventListener('pointerup', up); track.addEventListener('pointercancel', up);
  track.addEventListener('keydown', function (e) {
    var d = 0, t = player.t;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') d = e.shiftKey ? 30 : 5;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') d = e.shiftKey ? -30 : -5;
    else if (e.key === 'Home') { player.set(T0); e.preventDefault(); return; }
    else if (e.key === 'End') { player.set(T1 - 1); e.preventDefault(); return; }
    else return;
    e.preventDefault(); player.pause(); syncBtn(); bar.endAlert();
    player.set(Math.max(T0, Math.min(T1 - 0.01, t + d)));
  });

  // 提醒预览
  root.querySelectorAll('[data-alert]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-alert'), t = player.t, c = bar.currentLesson(t);
      var nx = CFBar.CLASSES.filter(function (x) { return x.s > t; })[0] || CFBar.CLASSES[0];
      var prev = CFBar.CLASSES.filter(function (x) { return x.e <= t; }).pop() || CFBar.CLASSES[0];
      bar.endAlert();
      if (k === 'start') bar.alertStart(c || nx, true);
      else if (k === 'end') bar.alertBreak(c || prev);
      else bar.alertPre(c ? (CFBar.next(c) || c) : nx);
    });
  });
  paint(524);
})();
