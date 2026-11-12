/*
  FactoryGripperOptionDrawers - alternative end effectors for the New Mechanic
  showcase. Two drawers, both pure render (no clock, no timers, no state):

    window.GripperOptionDrawers.B(parentGroup, pose)   // "Kep canh qua" - soft petal clamp
    window.GripperOptionDrawers.D(parentGroup, pose)   // "Giac hut kem" - bellows suction cup

  pose = { x, y, open: 0..1, contact: 0..1, theme: 'candy' | 'fruit' }
    x        head centre
    y        head top
    open     0 = closed on the pack, 1 = fully released
    contact  0..1 pad / cup pressure against the pack

  Coordinates are absolute 340 x 260 showcase units and no translation is
  assumed: every call clears and rebuilds the whole assembly inside the given
  group. The host owns the head motion and the tray, so nothing here is
  animated between calls.
*/
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var OUTLINE = '#1b4b4a';

  // Mini rail + compact carriage shared by both options.
  var RAIL_X0 = 60, RAIL_X1 = 280, RAIL_Y = 20, RAIL_H = 7;
  var CAR_TOP = 24, CAR_H = 15, CAR_HALF = 14;
  var STEM_TOP = 32;

  // Pack footprint the host draws: 64 x 48 box whose top edge is y + 14.
  var TRAY_DROP = 14, TRAY_H = 48, TRAY_HALF = 32;
  var PAD_SPREAD = 20;    // extra gap per side when fully open
  var CUP_RETRACT = 2.2;  // how far the cup lifts off the rim when open

  /* ------------------------------- helpers ------------------------------- */
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) { for (var k in attrs) { if (attrs[k] != null) { n.setAttribute(k, attrs[k]); } } }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  function n1(v) { return Math.round(v * 10) / 10; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function path(parent, d, fill, extra) {
    var a = { d: d, fill: fill };
    if (extra) { for (var k in extra) { a[k] = extra[k]; } }
    return el('path', a, parent);
  }
  function rect(parent, x, y, w, h, fill, extra) {
    var a = { x: n1(x), y: n1(y), width: n1(w), height: n1(h), fill: fill };
    if (extra) { for (var k in extra) { a[k] = extra[k]; } }
    return el('rect', a, parent);
  }
  function circle(parent, cx, cy, r, fill, extra) {
    var a = { cx: n1(cx), cy: n1(cy), r: n1(r), fill: fill };
    if (extra) { for (var k in extra) { a[k] = extra[k]; } }
    return el('circle', a, parent);
  }
  function ellipse(parent, cx, cy, rx, ry, fill, extra) {
    var a = { cx: n1(cx), cy: n1(cy), rx: n1(rx), ry: n1(ry), fill: fill };
    if (extra) { for (var k in extra) { a[k] = extra[k]; } }
    return el('ellipse', a, parent);
  }
  function stroke(parent, d, color, w, extra) {
    var a = { d: d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    if (extra) { for (var k in extra) { a[k] = extra[k]; } }
    return el('path', a, parent);
  }
  function stops(defs, id, list, dir) {
    var lg = el('linearGradient', {
      id: id, x1: dir[0], y1: dir[1], x2: dir[2], y2: dir[3]
    }, defs);
    for (var i = 0; i < list.length; i++) {
      el('stop', { offset: list[i][0], 'stop-color': list[i][1], 'stop-opacity': list[i][2] == null ? 1 : list[i][2] }, lg);
    }
    return 'url(#' + id + ')';
  }

  // One cleared container per (parent, variant) so repeated draws never stack.
  function container(parent, variant) {
    var key = '__fgo_' + variant;
    var old = parent[key];
    if (!old || old.parentNode !== parent) {
      old = el('g', { 'data-gripper-option': variant, 'pointer-events': 'none' }, parent);
      parent[key] = old;
    }
    while (old.firstChild) { old.removeChild(old.firstChild); }
    return old;
  }

  // Stable per-parent suffix so two instances in one document never share a
  // gradient id, while a repeated call on the same parent keeps identical ids.
  var uidSeq = 0;
  function idFor(parent) {
    if (!parent.__fgo_uid) { parent.__fgo_uid = 'u' + (++uidSeq); }
    return parent.__fgo_uid;
  }

  function normalize(pose) {
    pose = pose || {};
    return {
      x: num(pose.x, 170),
      y: num(pose.y, 78),
      open: clamp(num(pose.open, 0), 0, 1),
      contact: clamp(num(pose.contact, 0), 0, 1),
      theme: pose.theme === 'fruit' ? 'fruit' : 'candy'
    };
  }

  function pal(theme) {
    var candy = theme !== 'fruit';
    return {
      outline: OUTLINE,
      shadow: '#0e3534',
      rail: candy ? '#dce9e8' : '#e8ecdf',
      railHi: '#ffffff',
      steel: candy ? '#adbebd' : '#b3bfae',
      steelDark: candy ? '#7d9493' : '#83907c',
      accentA: candy ? '#f2637f' : '#e79a4f',
      accentB: candy ? '#5fd3b6' : '#96c08a',
      // soft apricot / coral shell
      bodyHi: candy ? '#ffd7c3' : '#ffe2c0',
      body: candy ? '#f79a74' : '#f3a172',
      bodyLo: candy ? '#e06a58' : '#dd7a52',
      pad: candy ? '#d4594a' : '#c96a45',
      padRib: candy ? '#ffb49c' : '#ffc39a',
      hubHi: candy ? '#a9d69c' : '#bcd8a8',
      hub: candy ? '#84bd83' : '#96c08a',
      hubLo: candy ? '#5c9463' : '#6b9b63',
      petal: candy ? '#c7e0b6' : '#cfe0bb',
      petalLo: candy ? '#9dc092' : '#a9c795',
      // vanilla dome / citrus bellows / mint cup
      domeHi: '#fffaea', dome: '#f2e1bc', domeLo: '#dcc394',
      bellowsHi: '#ffe98f', bellows: '#f8c93f', bellowsLo: '#d9a41d',
      cupHi: '#cdf7e8', cup: '#86dcc1', cupLo: '#57bd9f'
    };
  }

  /* -------------------------------- rig ---------------------------------- */
  function drawRig(g, s, P) {
    var cx = clamp(s.x, RAIL_X0 + 10, RAIL_X1 - 10);
    var rail = el('g', { 'data-part': 'rail' }, g);

    // rail beam
    rect(rail, RAIL_X0, RAIL_Y, RAIL_X1 - RAIL_X0, RAIL_H, P.rail,
      { rx: 3.2, stroke: P.outline, 'stroke-width': 1.2 });
    rect(rail, RAIL_X0 + 2.4, RAIL_Y + 1.5, RAIL_X1 - RAIL_X0 - 4.8, 1.7, '#fff', { opacity: 0.85, rx: 0.85 });
    rect(rail, RAIL_X0 + 2.4, RAIL_Y + RAIL_H - 2.1, RAIL_X1 - RAIL_X0 - 4.8, 1.3, P.steelDark, { opacity: 0.5, rx: 0.65 });
    for (var bx = RAIL_X0 + 12; bx <= RAIL_X1 - 10; bx += 42) {
      circle(rail, bx, RAIL_Y + RAIL_H / 2, 1.5, P.steelDark, { stroke: P.outline, 'stroke-width': 0.6 });
      circle(rail, bx - 0.4, RAIL_Y + RAIL_H / 2 - 0.4, 0.55, '#fff', { opacity: 0.9 });
    }
    [RAIL_X0, RAIL_X1].forEach(function (ex, i) {
      rect(rail, ex - 2.4, RAIL_Y - 2.2, 4.8, RAIL_H + 4.4, P.steelDark,
        { rx: 1.6, stroke: P.outline, 'stroke-width': 1 });
      rect(rail, i === 0 ? ex + 1.2 : ex - 4.2, RAIL_Y - 0.8, 3, RAIL_H + 1.6, P.accentA, { opacity: 0.9, rx: 1 });
    });

    // compact carriage riding under the rail
    var car = el('g', { 'data-part': 'carriage' }, g);
    [-9, 9].forEach(function (dx) {
      circle(car, cx + dx, RAIL_Y + RAIL_H - 0.3, 3, P.steelDark, { stroke: P.outline, 'stroke-width': 1 });
      circle(car, cx + dx - 0.5, RAIL_Y + RAIL_H - 0.9, 1, P.rail, { opacity: 0.95 });
    });
    rect(car, cx - CAR_HALF, CAR_TOP, CAR_HALF * 2, CAR_H, P.rail,
      { rx: 4, stroke: P.outline, 'stroke-width': 1.3 });
    rect(car, cx - CAR_HALF + 2.4, CAR_TOP + 1.7, CAR_HALF * 2 - 4.8, 2.1, '#fff', { opacity: 0.9, rx: 1 });
    rect(car, cx - CAR_HALF + 2.4, CAR_TOP + CAR_H - 3, CAR_HALF * 2 - 4.8, 1.4, P.steelDark, { opacity: 0.45, rx: 0.7 });
    circle(car, cx + 7.6, CAR_TOP + 7.6, 2, s.contact > 0.2 ? P.accentA : P.steelDark,
      { stroke: P.outline, 'stroke-width': 0.7 });
    circle(car, cx - 7.6, CAR_TOP + 7.6, 1.5, P.steelDark, { opacity: 0.8 });
    if (s.contact > 0.2) {
      circle(car, cx + 7.6, CAR_TOP + 7.6, 4.4, 'none',
        { stroke: P.accentA, 'stroke-width': 0.9, opacity: 0.3 });
    }

    // telescopic stem from the carriage down to the head top
    var y0 = STEM_TOP, y1 = Math.max(STEM_TOP + 1, s.y - 3);
    var dx = s.x - cx, dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy);
    var ang = Math.atan2(dx, dy) * 180 / Math.PI;
    if (!(len > 0.5)) { len = 0.5; }
    var stem = el('g', { 'data-part': 'stem', transform: 'translate(' + n1(cx) + ' ' + n1(y0) + ') rotate(' + n1(ang) + ')' }, g);
    var segs = [
      { a: 0, b: len * 0.46, w: 12 },
      { a: len * 0.43, b: len * 0.76, w: 9 },
      { a: len * 0.73, b: len, w: 6.6 }
    ];
    for (var i = 0; i < segs.length; i++) {
      var sg = segs[i], hh = sg.b - sg.a;
      if (hh < 0.8) { continue; }
      rect(stem, -sg.w / 2, sg.a, sg.w, hh, P.steel, { rx: 1.3, stroke: P.outline, 'stroke-width': 1 });
      rect(stem, -sg.w / 2 + 1.6, sg.a + 1, 1.6, Math.max(0.8, hh - 2), '#fff', { opacity: 0.5, rx: 0.8 });
      rect(stem, sg.w / 2 - 2.1, sg.a + 1, 1, Math.max(0.8, hh - 2), P.steelDark, { opacity: 0.35, rx: 0.5 });
    }
    if (len > 8) {
      rect(stem, -5.6, segs[0].b - 2.2, 11.2, 3.4, P.steelDark, { rx: 1.2, stroke: P.outline, 'stroke-width': 0.9 });
      rect(stem, -4.4, segs[1].b - 2, 8.8, 3, P.steel, { rx: 1, stroke: P.outline, 'stroke-width': 0.8 });
    }
  }

  /* ============================ B: petal clamp =========================== */
  // Inner jaw faces sit at exactly +-(32 + 20 * open): flush with the pack
  // sides when closed, 20 units clear per side when released.
  function paddleD(W) {
    // Inner face is the straight edge at x = W (y 14..57), the outer edge
    // bulges to W + 17.6 around y 47..57 so the lower end reads wider.
    // Everything stays inside y 0..62: the pad band is exactly y+14 .. y+62.
    return 'M' + n1(W) + ' 14L' + n1(W) + ' 59' +
      'C' + n1(W) + ' 60.8 ' + n1(W + 2.8) + ' 61.6 ' + n1(W + 7.4) + ' 61.6' +
      'C' + n1(W + 13) + ' 61.6 ' + n1(W + 17.6) + ' 56.6 ' + n1(W + 17.6) + ' 47' +
      'C' + n1(W + 17.6) + ' 33 ' + n1(W + 14) + ' 21.5 ' + n1(W + 9.2) + ' 13.6' +
      'Q' + n1(W * 0.62) + ' 4.8 7.6 4.4' +
      'Q' + n1(W * 0.66) + ' 0.6 ' + n1(W) + ' 14Z';
  }

  function drawPaddle(head, W, dir, P, f, s) {
    var g = el('g', { 'data-part': 'jaw', 'data-side': dir < 0 ? 'L' : 'R' }, head);
    if (dir < 0) { g.setAttribute('transform', 'scale(-1,1)'); }

    // outer shadow so the paddle separates from the pack behind it
    path(g, paddleD(W), P.shadow, { opacity: 0.16, transform: 'translate(1.6 2.4)' });
    // soft silicone shell
    path(g, paddleD(W), f.body, { stroke: P.outline, 'stroke-width': 1.5 });
    // pink blush on the belly - friendly, fruit-packing look
    ellipse(g, W + 9.2, 44, 5.4, 8, P.accentA, { opacity: 0.16 });
    // inner gripping face, flush with the pack side
    path(g, 'M' + n1(W) + ' 15L' + n1(W) + ' 56L' + n1(W - 4) + ' 55.8L' + n1(W - 4) + ' 15.2Z', f.pad, { opacity: 0.96 });
    // grip ribs on the contact face
    for (var i = 0; i < 5; i++) {
      var ry = 20 + i * 8.4;
      stroke(g, 'M' + n1(W - 3.5) + ' ' + n1(ry) + 'L' + n1(W - 0.7) + ' ' + n1(ry + 1.3), P.padRib, 1.2, { opacity: 0.75 });
    }
    // polished glints
    stroke(g, 'M' + n1(W + 9.2) + ' 18Q' + n1(W + 14.4) + ' 30 ' + n1(W + 12.6) + ' 49', '#ffffff', 2.1, { opacity: 0.5 });
    stroke(g, 'M' + n1(W + 4.2) + ' 10.2Q' + n1(W + 6.8) + ' 8.6 ' + n1(W + 9.4) + ' 10', '#ffffff', 1.4, { opacity: 0.55 });
    // shoulder seam toward the hub
    stroke(g, 'M11.4 8.2Q' + n1(W + 2.6) + ' 7.6 ' + n1(W + 8.2) + ' 12.6', P.shadow, 1, { opacity: 0.22 });

    if (s.contact > 0.02) {
      var c = s.contact;
      stroke(g, 'M' + n1(W - 0.3) + ' 17L' + n1(W - 0.3) + ' 54', P.accentB, 1.6, { opacity: 0.45 * c });
      [24, 36, 48].forEach(function (yy) {
        stroke(g, 'M' + n1(W + 3.4) + ' ' + (yy - 2.6) + 'L' + n1(W + 0.6) + ' ' + yy + 'L' + n1(W + 3.4) + ' ' + (yy + 2.6),
          P.accentB, 1.2, { opacity: 0.6 * c });
      });
      circle(g, W + 0.6, 36, 3 + 2.4 * c, P.accentB, { opacity: 0.18 * c });
    }
  }

  function drawRearPetal(head, P, f) {
    // Third petal peeking behind the pack: kept above y + 14 so it never
    // covers whatever the host draws inside the tray.
    var g = el('g', { 'data-part': 'petal-rear' }, head);
    path(g, 'M0 0.2C7.6 1.2 11 5.4 11 8.8C11 12.1 6.2 13.4 0 13.4C-6.2 13.4 -11 12.1 -11 8.8C-11 5.4 -7.6 1.2 0 0.2Z',
      f.petal, { stroke: P.outline, 'stroke-width': 1.3 });
    stroke(g, 'M0 2.4L0 11.6', P.hubLo, 1, { opacity: 0.5 });
    stroke(g, 'M0 6.6L-5 4.2M0 6.6L5 4.2', P.hubLo, 0.9, { opacity: 0.4 });
    ellipse(g, -4.6, 4.4, 2.4, 1.1, '#ffffff', { opacity: 0.4, transform: 'rotate(-18 -4.6 4.4)' });
  }

  function drawHub(head, P, f) {
    var g = el('g', { 'data-part': 'hub' }, head);
    // collar tying the head into the stem
    rect(g, -7, -5.4, 14, 7.6, P.steel, { rx: 2.2, stroke: P.outline, 'stroke-width': 1.1 });
    rect(g, -5, -3.9, 10, 1.7, '#fff', { opacity: 0.6, rx: 0.85 });
    // sage leaf calyx
    path(g, 'M-12.4 4.6C-12.4 1.2 -7.4 -2.6 0 -2.6C7.4 -2.6 12.4 1.2 12.4 4.6C12.4 8.6 6.4 11.4 0 11.4C-6.4 11.4 -12.4 8.6 -12.4 4.6Z',
      f.hub, { stroke: P.outline, 'stroke-width': 1.4 });
    // leaflets poking out of the calyx
    [-1, 1].forEach(function (d) {
      ellipse(g, d * 13.6, 2.2, 3.6, 1.9, f.hubLo,
        { stroke: P.outline, 'stroke-width': 0.9, transform: 'rotate(' + (d * 22) + ' ' + n1(d * 13.6) + ' 2.2)' });
    });
    stroke(g, 'M0 -0.6L0 9.4', P.hubLo, 1.1, { opacity: 0.65 });
    stroke(g, 'M0 4.4L-5.4 2.2M0 4.4L5.4 2.2M0 7L-4 6', P.hubLo, 0.9, { opacity: 0.45 });
    ellipse(g, -4, 1.2, 3.4, 1.7, '#ffffff', { opacity: 0.5, transform: 'rotate(-16 -4 1.2)' });
    circle(g, 6.4, 6.6, 1.5, P.accentA, { opacity: 0.75 });
  }

  function drawB(parent, pose) {
    if (!parent) { return; }
    var s = normalize(pose);
    var g = container(parent, 'B');
    var defs = el('defs', {}, g);
    var P = pal(s.theme);
    var u = idFor(parent), id = 'fgo-B-' + u + '-';
    var f = {
      body: stops(defs, id + 'body', [[0, P.bodyHi], [0.52, P.body], [1, P.bodyLo]], ['8%', '0%', '12%', '100%']),
      pad: stops(defs, id + 'pad', [[0, P.pad, 0.98], [1, P.pad, 0.86]], ['0%', '0%', '0%', '100%']),
      hub: stops(defs, id + 'hub', [[0, P.hubHi], [0.6, P.hub], [1, P.hubLo]], ['20%', '0%', '80%', '100%']),
      petal: stops(defs, id + 'petal', [[0, P.petal], [1, P.petalLo]], ['0%', '0%', '100%', '100%'])
    };
    var W = TRAY_HALF + PAD_SPREAD * s.open;

    drawRig(g, s, P);

    var head = el('g', { 'data-part': 'head', transform: 'translate(' + n1(s.x) + ' ' + n1(s.y) + ')' }, g);
    // contact shading on the pack sides, drawn under the jaws
    if (s.contact > 0.02) {
      ellipse(head, 0, TRAY_DROP + 4, TRAY_HALF + 4, 2.2, P.shadow, { opacity: 0.1 * s.contact });
    }
    drawRearPetal(head, P, f);
    drawPaddle(head, W, 1, P, f, s);
    drawPaddle(head, W, -1, P, f, s);
    drawHub(head, P, f);

    return { innerEdge: W, jawTop: s.y + 14, jawBottom: s.y + 62 };
  }

  /* =========================== D: suction cup =========================== */
  function bellowsD(top, bot, hTop, hBot, folds) {
    var h = Math.max(0.8, bot - top), n = folds * 2;
    var pts = [], i, t, yy, hw, k;
    for (i = 0; i <= n; i++) {
      t = i / n; yy = top + h * t; hw = hTop + (hBot - hTop) * t;
      k = (i % 2 === 0) ? 1 : 0.68;
      pts.push([-hw * k, yy]);
    }
    for (i = n; i >= 0; i--) {
      t = i / n; yy = top + h * t; hw = hTop + (hBot - hTop) * t;
      k = (i % 2 === 0) ? 1 : 0.68;
      pts.push([hw * k, yy]);
    }
    return 'M' + pts.map(function (p) { return n1(p[0]) + ' ' + n1(p[1]); }).join('L') + 'Z';
  }

  function drawDome(head, P, f) {
    var g = el('g', { 'data-part': 'dome' }, head);
    // vanilla rounded housing + collar
    path(g, 'M-18 5.2C-18 0.8 -10.4 -1 0 -1C10.4 -1 18 0.8 18 5.2Q18 6.4 16.8 6.4L-16.8 6.4Q-18 6.4 -18 5.2Z',
      f.dome, { stroke: P.outline, 'stroke-width': 1.5 });
    rect(g, -19.6, 4.9, 39.2, 2.4, P.steel, { rx: 1.2, stroke: P.outline, 'stroke-width': 1 });
    rect(g, -16.4, 5.5, 32.8, 0.9, '#ffffff', { opacity: 0.5, rx: 0.45 });
    // gloss
    ellipse(g, -6.4, -0.4, 6.4, 1.7, '#ffffff', { opacity: 0.62, transform: 'rotate(-7 -6.4 -0.4)' });
    stroke(g, 'M10 -0.2Q14 0.6 15.6 2.6', '#ffffff', 1.2, { opacity: 0.45 });
    // sensor eye
    circle(g, 0, 2.7, 2.9, f.eye, { stroke: P.outline, 'stroke-width': 1.1 });
    circle(g, 0, 2.7, 1.5, P.accentB, { opacity: 0.95 });
    circle(g, -0.8, 2, 0.65, '#ffffff', { opacity: 0.9 });
    // side bolts, still well inside the pack width
    [-15, 15].forEach(function (bx) {
      circle(g, bx, 2.2, 1.5, P.steelDark, { stroke: P.outline, 'stroke-width': 0.7 });
      circle(g, bx - 0.4, 1.8, 0.5, '#ffffff', { opacity: 0.85 });
    });
  }

  function drawD(parent, pose) {
    if (!parent) { return; }
    var s = normalize(pose);
    var g = container(parent, 'D');
    var defs = el('defs', {}, g);
    var P = pal(s.theme);
    var u = idFor(parent), id = 'fgo-D-' + u + '-';
    var f = {
      dome: stops(defs, id + 'dome', [[0, P.domeHi], [0.6, P.dome], [1, P.domeLo]], ['18%', '0%', '82%', '100%']),
      eye: stops(defs, id + 'eye', [[0, '#ffffff'], [1, P.domeLo]], ['0%', '0%', '0%', '100%']),
      bellows: stops(defs, id + 'bellows', [[0, P.bellowsHi], [0.55, P.bellows], [1, P.bellowsLo]], ['0%', '0%', '0%', '100%']),
      cup: stops(defs, id + 'cup', [[0, P.cupHi], [0.55, P.cup], [1, P.cupLo]], ['0%', '0%', '0%', '100%'])
    };
    var shift = -CUP_RETRACT * s.open;
    var cupTop = 10 + shift;      // where the bellows meets the cup
    var cupLip = TRAY_DROP + shift; // contact plane; exactly y + 14 when closed
    var domeBot = 6.4;

    drawRig(g, s, P);

    var head = el('g', { 'data-part': 'head', transform: 'translate(' + n1(s.x) + ' ' + n1(s.y) + ')' }, g);

    // safe telescopic neck: keeps dome and cup visually connected at any lift
    rect(head, -4.2, domeBot - 2, 8.4, Math.max(1.4, cupTop - domeBot + 2), P.steel,
      { rx: 1.4, stroke: P.outline, 'stroke-width': 1 });
    rect(head, -2.6, domeBot - 0.4, 1.6, Math.max(0.6, cupTop - domeBot - 0.6), '#ffffff', { opacity: 0.55, rx: 0.8 });

    // citrus bellows, top end slides up behind the dome when it retracts
    var bTop = 4.6, bBot = Math.max(bTop + 1, cupTop);
    path(head, bellowsD(bTop, bBot, 8.6, 4.6, 3), f.bellows, { stroke: P.outline, 'stroke-width': 1.1 });
    for (var i = 1; i <= 3; i++) {
      var yy = bTop + (bBot - bTop) * (i / 3.5);
      stroke(head, 'M-5.6 ' + n1(yy) + 'L5.6 ' + n1(yy), P.bellowsLo, 0.9, { opacity: 0.65 });
    }
    stroke(head, 'M-5.4 6.6L-5.4 ' + n1(bBot - 0.6), '#ffffff', 1, { opacity: 0.35 });

    // mint suction cup, lip plane at local y = 0
    var cup = el('g', { 'data-part': 'cup', transform: 'translate(0 ' + n1(cupLip) + ')' }, head);
    // soft shadow on the pack rim, only when actually touching
    if (s.contact > 0.02) {
      ellipse(cup, 0, 0.4, 10.5, 1.3, P.shadow, { opacity: 0.14 * s.contact });
    }
    path(cup, 'M-4.2-4.2C-8.8-3.6 -11.9-2.3 -12-0.6C-12.02-0.15 -11.5 0 -11 0C-7-1.15 -3.2-1.9 0-1.9C3.2-1.9 7-1.15 11 0C11.5 0 12.02-0.15 12-0.6C11.9-2.3 8.8-3.6 4.2-4.2Z',
      f.cup, { stroke: P.outline, 'stroke-width': 1.3, 'stroke-linejoin': 'round' });
    // hollow underside shading + polished lip
    path(cup, 'M-9.4-0.6C-6-1.6 -3-2.2 0-2.2C3-2.2 6-1.6 9.4-0.6', 'none',
      { stroke: P.cupLo, 'stroke-width': 1.4, opacity: 0.7 });
    stroke(cup, 'M-10.4-0.3C-6.8-1.35 -3.2-1.95 0-1.95C3.2-1.95 6.8-1.35 10.4-0.3', '#ffffff', 0.9, { opacity: 0.55 });
    stroke(cup, 'M-11 0L-7.6-0.55', P.cupHi, 1.6, { opacity: 0.9 });
    stroke(cup, 'M11 0L7.6-0.55', P.cupHi, 1.6, { opacity: 0.9 });
    ellipse(cup, -5.6, -2.9, 2.6, 1, '#ffffff', { opacity: 0.55, transform: 'rotate(-12 -5.6 -2.9)' });

    drawDome(head, P, f);

    // vacuum feedback on the pack rim
    var fx = el('g', { 'data-part': 'fx' }, head);
    var c = s.contact;
    if (c > 0.02) {
      ellipse(fx, 0, TRAY_DROP, 12 + 4.5 * c, 1.6 + 1.6 * c, 'none',
        { stroke: P.accentB, 'stroke-width': 1.2, opacity: 0.55 * c });
      [1, 2, 3].forEach(function (k) {
        var t = k / 4, rx = 12 - 3 * k;
        stroke(fx, 'M' + n1(-rx) + ' ' + n1(TRAY_DROP - 1.6 - 2.4 * t) + 'Q0 ' + n1(TRAY_DROP - 3.2) + ' ' + n1(rx) + ' ' + n1(TRAY_DROP - 1.6 - 2.4 * t),
          P.accentB, 0.9, { opacity: 0.3 * c });
      });
    }
    if (s.open > 0.04) {
      stroke(fx, 'M-13 ' + n1(TRAY_DROP) + 'Q0 ' + n1(TRAY_DROP + 1.4) + ' 13 ' + n1(TRAY_DROP), P.accentB, 1,
        { opacity: 0.3 * s.open, 'stroke-dasharray': '2.4 2.6' });
    }

    return { cupLip: s.y + cupLip, cupWidth: 24, rimY: s.y + 14 };
  }

  /* ------------------------------- exports ------------------------------- */
  var api = {
    B: drawB,
    D: drawD,
    b: drawB,
    d: drawD,
    draw: function (parent, variant, pose) {
      var key = String(variant == null ? '' : variant).toUpperCase();
      var fn = key === 'B' ? drawB : (key === 'D' ? drawD : null);
      if (fn) { return fn(parent, pose); }
      return null;
    },
    register: function (variant, fn) {
      if (variant && typeof fn === 'function') { api[variant] = fn; }
      return api;
    },
    palette: pal,
    metrics: {
      canvas: { w: 340, h: 260 },
      rail: { x0: RAIL_X0, x1: RAIL_X1, y: RAIL_Y },
      tray: { half: TRAY_HALF, top: TRAY_DROP, height: TRAY_H },
      padSpread: PAD_SPREAD,
      cupRetract: CUP_RETRACT
    },
    version: '1.0.0'
  };
  api.labels = { B: 'Kep canh qua', D: 'Giac hut kem' };
  window.GripperOptionDrawers = Object.assign(window.GripperOptionDrawers || {}, api);
})();
