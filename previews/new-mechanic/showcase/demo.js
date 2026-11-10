// Execution-only demo: fully independent SVG timeline per [data-mechanic] mount.
(function () {
  'use strict';
  var STEP_MS = 2500, HOLD_MS = 3000, END_HOLD_MS = 2500;
  var BADGE = { lock:'padlock', ice:'ice', clamp:'clamp', scan:'scanner', link:'chain', curtain:'curtain', mystery:'mystery', alarm:'alarm' };
  var NS = 'http://www.w3.org/2000/svg';
  var mounts = [];
  var MOVE_MS = 650;

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function assetImg(parent, name, x, y, w, h) {
    var im = el('image', { href: 'assets/' + name + '.svg', x: x, y: y, width: w, height: h, 'aria-hidden': 'true' }, parent);
    im.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'assets/' + name + '.svg');
    return im;
  }
  function candyImg(parent, x, y) { return assetImg(parent, 'candy', x, y, 22, 22); }
  function cookieImg(parent, x, y) { return assetImg(parent, 'cookie', x, y, 22, 22); }

  function scA(step) {
    if (step <= 0) return { A: 2, B: 1, C: 0 };
    return { A: 3, B: 0, C: 0 };
  }

  var SCENARIOS = {
    locked: {
      captions: [
        'Hộp C đang khóa; A có 2 kẹo, B có 1 kẹo.',
        'Di chuyển kẹo từ B sang A. A đã đóng gói đủ 3.',
        'Đưa A đã đóng gói vào hàng chờ rồi lên băng tải.',
        'Chỉ mở khóa C SAU KHI A đã xuất kho.',
        'C đã mở khóa. Không cần đóng gói thêm.'],
      steps: function (step) {
        var base = scA(step);
        return {
          candies: { A: base.A, B: base.B, C: 0 },
          lockC: step < 3,
          queuedA: step >= 2 && step <= 3,
          shippedA: step >= 3 && step <= 4,
          shipA: step >= 3 && step <= 4,
          highlightC: step >= 4
        };
      }
    },
    frozen: {
      captions: [
        'Nguồn kẹo trong B đang đóng băng.',
        'Tan băng B trong ba giây.',
        'Băng tan; kẹo di chuyển từ B sang A. A đủ 3.',
        'A đã đóng gói vào hàng chờ.',
        'A xuất kho. Hoàn tất nhánh đóng băng.'],
      steps: function (step) {
        var base = scA(step < 2 ? 0 : 1);
        return {
          candies: { A: base.A, B: base.B, C: 0 },
          iceB: step < 2,
          thawing: step === 1,
          queuedA: step === 3 || step === 4,
          shippedA: step >= 4,
          shipA: step >= 4
        };
      }
    },
    stuck: {
      captions: [
        'Hộp C trống và bị kẹp chặt.',
        'Di chuyển kẹo từ B sang A. A đủ 3.',
        'A vào hàng chờ, chuẩn bị xuất kho.',
        'Kẹp nhả C và C được gỡ bỏ.',
        'Mặt bằng thông thoáng. Thành công.'],
      steps: function (step) {
        var base = scA(step);
        return {
          candies: { A: base.A, B: base.B, C: 0 },
          clampC: step < 3,
          removedC: step >= 3,
          queuedA: step === 2 || step === 3,
          shippedA: step >= 3,
          shipA: step >= 3
        };
      }
    },
    defective: {
      captions: [
        'A có 2 kẹo, B có 1 kẹo.',
        'Di chuyển kẹo từ B sang A. A đủ 3.',
        'A vào hàng chờ và máy quét giữ lại 3 giây.',
        'Máy quét phê duyệt màu xanh. Vẫn là A ban đầu.',
        'Chính A đó xuất kho. Không bỏ hộp nào.'],
      steps: function (step) {
        var base = scA(step);
        return {
          candies: { A: base.A, B: base.B, C: 0 },
          scanHold: step === 2,
          scanGreen: step >= 3,
          queuedA: step === 2,
          queuedHoldApproved: step === 3,
          shippedA: step >= 4,
          shipA: step >= 4,
          sameA: true
        };
      }
    },
    connector: {
      captions: [
        'A có 2 kẹo, B có 1 kẹo, C có 3 bánh. A và C liên kết.',
        'Di chuyển B sang A để cả A và C đều đóng gói đủ.',
        'Cặp đôi chờ hai chỗ trong hàng đợi.',
        'Cả hai cùng vào hai chỗ hàng đợi.',
        'A và C cùng xuất kho. Thành công.'],
      steps: function (step) {
        var base = scA(step);
        return {
          candies: { A: base.A, B: base.B, C: 0 },
          cCookies: 3,
          linkAC: step < 3,
          needTwo: step === 2,
          pairQueue: step === 3 || step === 4,
          pairShip: step >= 4,
          shipA: step >= 4
        };
      }
    },
    'hidden-box': {
      captions: [
        'C nằm sau A cùng cột; rèm che khuất C.',
        'Di chuyển kẹo từ B sang A. A đủ 3.',
        'A đã đóng gói xuất kho và được gỡ khỏi cột.',
        'C trượt ra trước, rèm mở, lộ 2 bánh quy.',
        'C dễ tiếp cận. Không đưa C chưa hoàn tất đi.'],
      steps: function (step) {
        var base = scA(step);
        return {
          candies: { A: step >= 2 ? 0 : base.A, B: base.B, C: 0 },
          cCookies: 2,
          curtain: step < 3,
          cFront: step >= 3,
          shipA: step === 2,
          queuedA: step === 2,
          shippedA: step === 2,
          hiddenA: step >= 3,
          highlightC: step >= 4,
          backgroundOrder: step >= 0 ? 'Đơn nền gợi ý C cần 3 bánh quy' : null
        };
      }
    },
    'hidden-items': {
      captions: [
        'Đơn cần 3 kẹo. B giữ vật ẩn; A có 2 kẹo.',
        'Mũi tên và gợi ý đơn cho thấy B là nguồn.',
        'B mở ra lộ kẹo và kẹo di chuyển vào A.',
        'A đã đóng gói vào hàng chờ.',
        'A xuất kho. Đơn hàng hoàn tất.'],
      steps: function (step) {
        var base = scA(step < 2 ? 0 : 1);
        return {
          candies: { A: step >= 2 ? 3 : base.A, B: step >= 2 ? 0 : base.B, C: 0 },
          order: 3,
          mysteryB: step < 2,
          pointerOrder: step === 1,
          queuedA: step === 3 || step === 4,
          shippedA: step >= 4,
          shipA: step >= 4
        };
      }
    },
    urgent: {
      captions: [
        'Chuông báo trên A. Bộ đếm 30 giây bắt đầu khi A còn tiếp cận được.',
        'Di chuyển B sang A. Bộ đếm còn 28 giây.',
        'A vào hàng chờ ở 26 giây. Bộ đếm dừng.',
        'A xuất kho.',
        'Thành công: vào hàng chờ trước hạn. Thời gian mô phỏng.'],
      steps: function (step) {
        var base = scA(step);
        var timer = step === 0 ? '30s' : step === 1 ? '28s' : step === 2 ? '26s' : null;
        return {
          candies: { A: base.A, B: base.B, C: 0 },
          alarmA: step < 2,
          timer: timer,
          timerStopped: step >= 2,
          queuedA: step === 2 || step === 3,
          shippedA: step >= 3,
          shipA: step >= 3,
          success: step >= 4
        };
      }
    }
  };

  var BOX_X = { A: 12, B: 128, C: 244 };
  var Q_SLOT = { one: { x: 220, y: 62 }, two: { x: 280, y: 62 } };
  var SHIP = { one: { x: 250, y: 12 }, two: { x: 310, y: 12 } };
  var BOX_SCALE = 0.4;

  function drawBoard(svg) {
    svg.setAttribute('viewBox', '0 0 360 265');
    svg.setAttribute('width', '100%');
    svg.setAttribute('role', 'img');
    svg.style.display = 'block';
    el('rect', { x: 0, y: 0, width: 360, height: 265, fill: '#e6fff4' }, svg);
    var conv = el('g', {}, svg);
    el('rect', { x: 12, y: 12, width: 336, height: 40, rx: 6, fill: '#c9f7e2', stroke: '#2aa37a', 'stroke-dasharray': '5 4' }, conv);
    el('text', { x: 20, y: 38, 'font-size': 11, fill: '#216e55' }, conv).textContent = 'Băng tải — đơn: 3 kẹo';
    assetImg(conv, 'candy', 300, 20, 22, 22); assetImg(conv, 'candy', 326, 20, 22, 22); assetImg(conv, 'candy', 313, 8, 22, 22);
    var q = el('g', {}, svg);
    el('text', { x: 128, y: 76, 'font-size': 11, fill: '#216e55' }, q).textContent = 'Hàng chờ';
    el('rect', { x: Q_SLOT.one.x, y: Q_SLOT.one.y, width: 44, height: 40, rx: 5, fill: 'none', stroke: '#2aa37a', 'stroke-dasharray': '4 3' }, q);
    el('rect', { x: Q_SLOT.two.x, y: Q_SLOT.two.y, width: 44, height: 40, rx: 5, fill: 'none', stroke: '#2aa37a', 'stroke-dasharray': '4 3' }, q);
    ['A', 'B', 'C'].forEach(function (id) { drawCarton(svg, id); });
  }

  function drawCarton(svg, id) {
    var g = el('g', { 'data-box': id, transform: 'translate(' + BOX_X[id] + ',140)' }, svg);
    el('rect', { x: 0, y: 0, width: 100, height: 85, rx: 6, fill: '#fffaf0', stroke: '#c98a3a', 'stroke-width': 2 }, g);
    assetImg(g, 'carton', 8, 3, 18, 18);
    el('text', { x: 78, y: 16, 'font-size': 12, fill: '#8a5a1e', 'text-anchor': 'middle' }, g).textContent = id;
    [6, 36, 66].forEach(function (sx) { el('rect', { x: sx, y: 30, width: 22, height: 22, rx: 3, fill: '#fdf1d8', stroke: '#e0c08a' }, g); });
    return g;
  }

  function boxTarget(d, id) {
    if (d.hiddenA && id === 'A') return { x: BOX_X.A, y: 140, scale: 1, hidden: true };
    if (d.curtain && id === 'C') return { x: 18, y: 122, scale: 1, hidden: false };
    if (d.curtain && id === 'A') return { x: 12, y: 156, scale: 1, hidden: false };
    if (d.cFrontC && id === 'C') return { x: 18, y: 156, scale: 1, hidden: false };
    if (d.shippedA && id === 'A') return { x: SHIP.one.x, y: SHIP.one.y, scale: BOX_SCALE, hidden: false };
    if (d.pairShip && id === 'A') return { x: SHIP.one.x, y: SHIP.one.y, scale: BOX_SCALE, hidden: false };
    if (d.pairShip && id === 'C') return { x: SHIP.two.x, y: SHIP.two.y, scale: BOX_SCALE, hidden: false };
    if (d.queuedA && id === 'A' && !d.shippedA) return { x: Q_SLOT.one.x, y: Q_SLOT.one.y, scale: BOX_SCALE, hidden: false };
    if (d.queuedHoldApproved && id === 'A') return { x: Q_SLOT.one.x, y: Q_SLOT.one.y, scale: BOX_SCALE, hidden: false };
    if (d.pairQueue && id === 'A' && !d.pairShip) return { x: Q_SLOT.one.x, y: Q_SLOT.one.y, scale: BOX_SCALE, hidden: false };
    if (d.pairQueue && id === 'C' && !d.pairShip) return { x: Q_SLOT.two.x, y: Q_SLOT.two.y, scale: BOX_SCALE, hidden: false };
    if (d.removedC && id === 'C') return { x: BOX_X.C, y: 140, scale: 1, hidden: true };
    if (d.cFront && id === 'C') return { x: 18, y: 156, scale: 1, hidden: false };
    return { x: BOX_X[id], y: 140, scale: 1, hidden: false };
  }

  function renderStage(st, state) {
    var svg = st.svg; if (!svg) return;
    clearTimers(st);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    drawBoard(svg);
    var sc = st.mount.getAttribute('data-mechanic'), scen = SCENARIOS[sc];
    var d = state || scen.steps(st.step);
    var groups = {};
    ['A', 'B', 'C'].forEach(function (id) { groups[id] = svg.querySelector('g[data-box="' + id + '"]'); });
    var candies = d.candies || { A: 0, B: 0, C: 0 };
    var cCookies = d.cCookies || 0;
    function fill(g, id, count, cookies, extraHidden) {
      var xs = [6, 36, 66];
      for (var i = 0; i < Math.min(count, 3); i++) {
        if (extraHidden && i === count - 1) {
          var hide = el('g', { 'data-hidden': '1', style: 'display:none' }, g);
          candyImg(hide, xs[i], 30);
        } else candyImg(g, xs[i], 30);
      }
      for (var j = 0; j < Math.min(cookies || 0, 3); j++) cookieImg(g, xs[j], 30);
    }
    var hideAContent = d.hiddenA && sc === 'hidden-box';
    if (!hideAContent) {
      fill(groups.A, 'A', candies.A);
    }
    if (d.mysteryB) {
      var mbg = el('g', { 'data-mystery': '1' }, groups.B);
      el('rect', { x: 0, y: 26, width: 96, height: 32, rx: 4, fill: '#2b3a67', opacity: '1' }, mbg);
      assetImg(mbg, BADGE.mystery, 6, 28, 26, 26);
    } else {
      fill(groups.B, 'B', candies.B);
    }
    fill(groups.C, 'C', candies.C, cCookies);

    if (d.lockC) assetImg(groups.C, BADGE.lock, 30, 4, 16, 16);
    if (d.iceB) assetImg(groups.B, BADGE.ice, 6, 26, 32, 32);
    if (d.curtain) {
      var curtain = assetImg(groups.C, BADGE.curtain, 0, 0, 100, 85);
      curtain.setAttribute('preserveAspectRatio', 'none');
      curtain.setAttribute('opacity', '0.96');
    }
    if (sc === 'stuck' && d.clampC) assetImg(groups.C, BADGE.clamp, 30, 4, 16, 16);
    if (d.alarmA) assetImg(groups.A, BADGE.alarm, 30, 4, 16, 16);
    if (d.linkAC) assetImg(svg, BADGE.link, 100, 128, 18, 18);
    if (d.needTwo) assetImg(svg, BADGE.link, 152, 128, 18, 18);
    if (d.scanHold || d.scanGreen) assetImg(svg, BADGE.scan, 300, 60, 18, 18);
    if (d.scanGreen) el('text', { x: 250, y: 100, 'font-size': 10, fill: '#1f9d6d' }, svg).textContent = 'Đã duyệt';
    if (d.timer) el('text', { x: 20, y: 130, 'font-size': 10, fill: '#b23' }, svg).textContent = 'Bộ đếm ' + d.timer;

    if (d.highlightC) {
      var hx = (d.cFront || d.cFrontC) ? 15 : (BOX_X.C - 3);
      el('rect', { x: hx, y: 153, width: 106, height: 95, rx: 8, fill: 'none', stroke: '#1f9d6d', 'stroke-width': 3 }, svg);
    }
    if (d.backgroundOrder) el('text', { x: 20, y: 110, 'font-size': 10, fill: '#216e55' }, svg).textContent = d.backgroundOrder;
    if (d.pointerOrder) el('path', { d: 'M 118 128 l 10 10 l -10 10 z', fill: '#c98a3a' }, svg);

    // Reorder C behind A when in back column (curtain/cFront), before applying positions.
    if (sc === 'hidden-box' && (d.curtain || d.cFront)) {
      try { svg.insertBefore(groups.C, groups.A); } catch (e) {}
    }

    ['A', 'B', 'C'].forEach(function (id) { applyBoxTarget(st, groups[id], id, d); });

    if (d.pairShip) drawSuccessBanner(svg, 'A và C cùng xuất kho — thành công');
    else if (d.shipA || d.shippedA || d.success) drawSuccessBanner(svg, 'Giao hàng thành công');
    if (d.cFront && sc === 'hidden-box' && st.step >= 3) drawSuccessBanner(svg, 'Đã lộ hộp C');
    if (sc === 'locked' && st.step >= 4) drawSuccessBanner(svg, 'Đã mở khóa C');

    if (candies.A === 3 && !d.shippedA && !d.hiddenA && !d.pairShip) {
      el('text', { x: 12, y: 132, 'font-size': 10, fill: '#1f9d6d' }, svg).textContent = 'Đã đóng gói đủ 3 kẹo ✓';
    }
  }

  function applyBoxTarget(st, g, id, d) {
    if (!g) return;
    var t = boxTarget(d, id);
    if (t.hidden) { g.style.display = 'none'; return; }
    g.style.display = '';
    var prev = st.pos && st.pos[id] ? st.pos[id] : { x: BOX_X[id], y: 140, scale: 1 };
    var finalAttr = 'translate(' + t.x + ',' + t.y + ') scale(' + t.scale + ')';
    var animates = !st.paused && !st.reduced && st.visible && !document.hidden &&
      (Math.abs(prev.x - t.x) > 0.5 || Math.abs(prev.y - t.y) > 0.5 || Math.abs((prev.scale || 1) - t.scale) > 0.01);
    if (!st.pos) st.pos = {};
    st.pos[id] = { x: t.x, y: t.y, scale: t.scale };
    if (!animates) { g.setAttribute('transform', finalAttr); return; }
    var fromAttr = 'translate(' + prev.x + ',' + prev.y + ') scale(' + (prev.scale || 1) + ')';
    g.setAttribute('transform', finalAttr);
    g.style.transformBox = 'view-box';
    g.style.transformOrigin = '0 0';
    try {
      g.removeAttribute('transform');
      g.style.transform = 'translate(' + prev.x + 'px,' + prev.y + 'px) scale(' + (prev.scale || 1) + ')';
      var anim = g.animate([
        { transform: 'translate(' + prev.x + 'px,' + prev.y + 'px) scale(' + (prev.scale || 1) + ')' },
        { transform: 'translate(' + t.x + 'px,' + t.y + 'px) scale(' + t.scale + ')' }
      ], { duration: MOVE_MS, fill: 'both' });
      st.anims.push(anim);
      var to = setTimeout(function () {
        try { anim.cancel(); } catch (e) {}
        g.style.transform = '';
        g.setAttribute('transform', finalAttr);
      }, MOVE_MS + 10);
      st.timeouts.push(to);
    } catch (e) { g.setAttribute('transform', finalAttr); }
  }

  function drawSuccessBanner(svg, text) {
    var b = el('g', {}, svg);
    el('rect', { x: 20, y: 228, width: 320, height: 30, rx: 6, fill: '#1f9d6d', opacity: '0.95' }, b);
    el('text', { x: 180, y: 248, 'font-size': 13, fill: '#ffffff', 'text-anchor': 'middle', 'font-weight': 600 }, b).textContent = text;
  }

  function candySlots(id, d) {
    if (id === 'A') return d.candies.A;
    if (id === 'B') return d.candies.B;
    return d.candies.C;
  }

  function animateCandyMove(st, fromId, toId, d, cb) {
    var svg = st.svg; if (!svg) { cb && cb(); return; }
    if (st.paused || st.reduced || !st.visible || document.hidden) { cb && cb(); return; }
    var fromG = svg.querySelector('g[data-box="' + fromId + '"]');
    var toG = svg.querySelector('g[data-box="' + toId + '"]');
    if (!fromG || !toG) { cb && cb(); return; }
    var srcCount = d.candies[fromId] + 1;
    var dstCount = (d.candies[toId] || 0) - 1;
    if (srcCount < 1 || dstCount < 0) { cb && cb(); return; }
    var xs = [6, 36, 66];
    var xi = Math.min(xs.length - 1, Math.max(0, srcCount - 1));
    var xj = Math.min(xs.length - 1, Math.max(0, dstCount));
    var start = boxTarget(d, fromId);
    var end = boxTarget(d, toId);
    var sx = start.x + (start.scale || 1) * (xs[xi] || 6);
    var sy = start.y + (start.scale || 1) * 30;
    var ex = end.x + (end.scale || 1) * (xs[xj] || 6);
    var ey = end.y + (end.scale || 1) * 30;
    if (start.scale && start.scale !== 1) { sy = start.y + start.scale * 30; }
    if (end.scale && end.scale !== 1) { ey = end.y + end.scale * 30; }

    // Hide target placeholder during flight.
    var targetPlaceholder = toG.querySelector('g[data-final]');
    var im = candyImg(svg, sx, sy);
    try {
      el('path', { d: 'M ' + (sx + 10) + ' ' + (sy + 10) + ' L ' + (ex + 10) + ' ' + (ey + 10), stroke: '#2b3a67', 'stroke-width': 1.5, fill: 'none', 'stroke-dasharray': '2 2' }, svg);
      var path = svg.lastChild;
    } catch (e) {}
    if (targetPlaceholder) targetPlaceholder.style.display = 'none';
    try {
      var anim = im.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + (ex - sx) + 'px,' + (ey - sy) + 'px)' }], { duration: MOVE_MS, fill: 'forwards' });
      st.anims.push(anim);
      var to = setTimeout(function () {
        try { im.remove(); } catch (e) {}
        if (path && path.parentNode) path.parentNode.removeChild(path);
        if (targetPlaceholder) targetPlaceholder.style.display = '';
        cb && cb();
      }, MOVE_MS + 10);
      st.timeouts.push(to);
    } catch (e) { try { im.remove(); } catch (_) {} cb && cb(); }
  }

  function clearTimers(st) {
    st.timeouts.forEach(clearTimeout); st.timeouts = [];
    st.anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); st.anims = [];
    if (st.timer) { clearTimeout(st.timer); st.timer = null; }
    if (st.endTimer) { clearTimeout(st.endTimer); st.endTimer = null; }
  }

  function setCaption(st, d) {
    var sc = st.mount.getAttribute('data-mechanic'), scen = SCENARIOS[sc];
    if (st.caption) st.caption.textContent = scen.captions[st.step] || '';
    if (st.progress) st.progress.textContent = (st.step + 1) + '/5';
    if (st.svg) {
      st.svg.setAttribute('aria-label', 'Kịch bản ' + sc + ' — bước ' + (st.step + 1));
    }
  }

  function renderStep(st) {
    var sc = st.mount.getAttribute('data-mechanic'), scen = SCENARIOS[sc];
    var d = scen.steps(st.step);
    setCaption(st, d);
    renderStage(st, d);
    var holdMs = (sc === 'frozen' && st.step === 1) || (sc === 'defective' && st.step === 2) ? HOLD_MS : STEP_MS;
    if (st.paused || st.reduced || !st.visible || document.hidden) return;
    if (sc === 'locked' && st.step === 1) animateCandyMove(st, 'B', 'A', d);
    if (sc === 'frozen' && st.step === 2) animateCandyMove(st, 'B', 'A', d);
    if (sc === 'stuck' && st.step === 1) animateCandyMove(st, 'B', 'A', d);
    if (sc === 'defective' && st.step === 1) animateCandyMove(st, 'B', 'A', d);
    if (sc === 'connector' && st.step === 1) animateCandyMove(st, 'B', 'A', d);
    if (sc === 'hidden-box' && st.step === 1) animateCandyMove(st, 'B', 'A', d);
    if (sc === 'hidden-items' && st.step === 2) animateCandyMove(st, 'B', 'A', d);
    if (sc === 'urgent' && st.step === 1) animateCandyMove(st, 'B', 'A', d);

    if (sc === 'frozen' && st.step === 1) {
      var ice = st.svg.querySelector('g[data-box="B"] image[href="assets/ice.svg"]');
      if (ice && !st.paused && !st.reduced) {
        try { var a = ice.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 3000, fill: 'forwards' }); st.anims.push(a); } catch (e) {}
      }
    }

    var thisHold = st.step === 4 ? END_HOLD_MS : holdMs;
    st.timer = setTimeout(function () {
      if (st.paused || document.hidden) return;
      if (st.step < 4) { st.step++; renderStep(st); }
      else { st.step = 0; renderStep(st); }
    }, thisHold);
  }

  function mountOne(mount) {
    var st = { mount: mount, step: 0, paused: false, visible: false, timer: null, endTimer: null, timeouts: [], anims: [], reduced: false, pos: {}, buttons: {} };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    st.reduced = !!(reduce && reduce.matches);
    if (st.reduced) st.paused = true;
    mount.innerHTML = '';
    var svg = el('svg', { viewBox: '0 0 360 265', width: '100%', role: 'img' });
    st.svg = svg; mount.appendChild(svg);
    var cap = document.createElement('p'); cap.className = 'demo-caption'; mount.appendChild(cap); st.caption = cap;
    var prog = document.createElement('p'); prog.className = 'demo-progress'; prog.textContent = '1/5'; mount.appendChild(prog); st.progress = prog;
    var ctr = document.createElement('div'); ctr.className = 'fd-controls';
    var bPause = btn('Tạm dừng'); var bReplay = btn('Xem lại'); var bNext = btn('Từng bước');
    ctr.appendChild(bPause); ctr.appendChild(bReplay); ctr.appendChild(bNext); mount.appendChild(ctr);
    st.buttons.pause = bPause; st.buttons.replay = bReplay; st.buttons.next = bNext;
    function syncPauseLabel() { bPause.textContent = st.paused ? 'Chạy tiếp' : 'Tạm dừng'; }
    syncPauseLabel();
    bPause.onclick = function () {
      if (st.paused) {
        st.paused = false;
        if (st.reduced) st.reduced = false;
        syncPauseLabel();
        if (st.visible && !document.hidden) renderStep(st);
      } else {
        st.paused = true; st.reduced = false;
        syncPauseLabel();
        clearTimers(st);
        renderStage(st, SCENARIOS[mount.getAttribute('data-mechanic')].steps(st.step));
      }
    };
    bReplay.onclick = function () {
      st.step = 0; clearTimers(st);
      if (st.paused) st.reduced = st.reduced;
      renderStep(st);
    };
    bNext.onclick = function () {
      st.paused = true;
      syncPauseLabel();
      clearTimers(st);
      st.step = (st.step + 1) % 5;
      renderStep(st);
      renderStage(st, SCENARIOS[mount.getAttribute('data-mechanic')].steps(st.step));
    };
    drawBoard(svg); renderStep(st);
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          var wasVisible = st.visible;
          st.visible = en.isIntersecting && !document.hidden;
          if (st.visible && !wasVisible && !st.paused) renderStep(st);
          else if (!st.visible) clearTimers(st);
        });
      }, { threshold: 0.1 });
      obs.observe(mount); st.obs = obs;
    } else { st.visible = true; }
    mounts.push(st);
  }
  function btn(t) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
    b.style.minWidth = '44px'; b.style.minHeight = '44px'; b.style.padding = '8px';
    b.style.width = 'auto'; b.style.height = 'auto';
    b.style.whiteSpace = 'nowrap'; b.style.lineHeight = '1.2';
    return b;
  }

  function mountAll() {
    var list = document.querySelectorAll('[data-mechanic]');
    Array.prototype.forEach.call(list, function (m) { if (!m.__fd) { m.__fd = true; mountOne(m); } });
  }
  function pauseAll() {
    mounts.forEach(function (s) {
      s.paused = true; clearTimers(s);
      if (s.buttons.pause) s.buttons.pause.textContent = 'Chạy tiếp';
      if (s.visible) renderStage(s, SCENARIOS[s.mount.getAttribute('data-mechanic')].steps(s.step));
    });
  }
  function resumeAll() {
    mounts.forEach(function (s) {
      s.paused = false;
      if (s.reduced) s.reduced = false;
      if (s.buttons.pause) s.buttons.pause.textContent = 'Tạm dừng';
      if (s.visible && !document.hidden) renderStep(s);
    });
  }
  function keys() { return mounts.map(function (s) { return s.mount.getAttribute('data-mechanic'); }); }
  window.FactoryDemo = { mountAll: mountAll, pauseAll: pauseAll, resumeAll: resumeAll, keys: keys };
  document.addEventListener('visibilitychange', function () {
    mounts.forEach(function (s) {
      if (document.hidden) clearTimers(s);
      else if (s.visible && !s.paused) renderStep(s);
    });
  });
  window.addEventListener('pagehide', function () { mounts.forEach(clearTimers); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll); else mountAll();
})();
