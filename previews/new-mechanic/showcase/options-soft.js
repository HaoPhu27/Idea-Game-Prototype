/*
  GripperOptionDrawers -- soft candy-shop gripper options for the New Mechanic
  showcase. Two genuinely different-looking heads, both drawn inside the same
  340 x 260 card frame.

    window.GripperOptionDrawers.A(parentGroup, pose)   // "Kẹp kẹo mềm"
    window.GripperOptionDrawers.C(parentGroup, pose)   // "Kẹp kẹo xoắn"

  pose = { x, y, open, contact, theme }
    x        head centre line (card coordinates)
    y        head top edge
    open     0 = closed, pad faces sit exactly on the tray sides; 1 = +20px wider
    contact  0..1 grip strength, drives the little contact sparks
    theme    'candy' (default) or 'fruit' (sage / apricot instead of mint / pink)

  Pure render: no clock, no timers, no internal state. The host owns the group
  and clears it between frames, so each call redraws the whole module from the
  pose alone.

  Tray contract (drawn by the host, never painted here):
    centre x = pose.x, top = pose.y + 14, 64 x 48  ->  x -/+ 32, y+14 .. y+62.
    The closed pad faces land exactly on x -/+ 32 so both fingers grip the whole
    carton from the outside and the candies stay visible in between.
*/
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  // ---- tray / mechanism metrics -------------------------------------------
  var TRAY_HALF = 32;            // closed pad face, measured from the centre line
  var OPEN_TRAVEL = 20;          // extra outward travel at open = 1
  var PAD_TOP_DY = 22;           // pad starts under the head, on the tray side wall
  var PAD_H = 35;                // pad reaches 57, tray bottom is 62
  var FINGER_BOTTOM_DY = 62;     // finger tips stop level with the tray bottom

  var RAIL_X0 = 60, RAIL_X1 = 280, RAIL_Y = 20, RAIL_H = 7;
  var RAIL_MID = RAIL_Y + RAIL_H / 2;
  var CAR_TOP = 15, CAR_BOT = 33;
  var STEM_TOP = 32;             // tucked under the carriage, never floating

  // ---- tiny svg helpers ----------------------------------------------------
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) { for (var k in attrs) { if (attrs[k] != null) { n.setAttribute(k, attrs[k]); } } }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  function R(v) { return Math.round(v * 100) / 100; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function path(parent, d, attrs) {
    var a = { d: d };
    if (attrs) { for (var k in attrs) { a[k] = attrs[k]; } }
    return el('path', a, parent);
  }
  function circle(parent, cx, cy, r, fill, extra) {
    var a = { cx: R(cx), cy: R(cy), r: R(r), fill: fill };
    if (extra) { for (var k in extra) { a[k] = extra[k]; } }
    return el('circle', a, parent);
  }
  function rect(parent, x, y, w, h, fill, extra) {
    var a = { x: R(x), y: R(y), width: R(w), height: R(h), fill: fill };
    if (extra) { for (var k in extra) { a[k] = extra[k]; } }
    return el('rect', a, parent);
  }

  // ---- pose + palette ------------------------------------------------------
  function readPose(pose) {
    pose = pose || {};
    return {
      x: num(pose.x, 170),
      y: num(pose.y, 96),
      open: clamp(num(pose.open, 0), 0, 1),
      contact: clamp(num(pose.contact, 0), 0, 1),
      theme: pose.theme === 'fruit' ? 'fruit' : 'candy'
    };
  }

  function makePalette(theme) {
    var fruit = theme === 'fruit';
    return {
      fruit: fruit,
      cream: '#fbf2e0', creamHi: '#fffaf1', creamD: '#ecdbbb',
      acc: fruit ? '#a3bf94' : '#7ed2bb',     // mint / sage
      accHi: fruit ? '#d6e6c9' : '#c6f3e7',
      accD: fruit ? '#6b8b5f' : '#3d9b85',
      pink: fruit ? '#f3b184' : '#ffa3bb',    // pink / apricot
      pinkHi: fruit ? '#ffd6b0' : '#ffd1de',
      pinkD: fruit ? '#cf8857' : '#df6f93',
      pad: fruit ? '#f1a86e' : '#ffbf9c',     // warm peach grip pads
      padHi: fruit ? '#ffd1a7' : '#ffddcb',
      padD: fruit ? '#cf8146' : '#dd8a63',
      gem: fruit ? '#84c3aa' : '#63b0ea',     // blue / mint jewel
      gemD: fruit ? '#3f7d66' : '#2c6cb0',
      honey: fruit ? '#f4b457' : '#f7c44e',
      honeyD: fruit ? '#d08f33' : '#d69a25',
      ink: '#26385c',                          // shared blue-factory outline
      white: '#ffffff'
    };
  }

  // Unique gradient ids per drawer (A / C) and per theme; the host clears the
  // group between frames so the ids never pile up in the document.
  function makeGrads(parent, tag, P) {
    var pre = 'gp' + tag + (P.fruit ? 'f' : 'c') + '-';
    var defs = el('defs', {}, parent);
    function stops(gEl, list) {
      for (var i = 0; i < list.length; i++) {
        el('stop', {
          offset: list[i][0], 'stop-color': list[i][1],
          'stop-opacity': list[i][2] == null ? 1 : list[i][2]
        }, gEl);
      }
    }
    function lin(id, x1, y1, x2, y2, list) {
      var gEl = el('linearGradient', { id: pre + id, x1: x1, y1: y1, x2: x2, y2: y2 }, defs);
      stops(gEl, list);
      return 'url(#' + pre + id + ')';
    }
    function rad(id, list) {
      var gEl = el('radialGradient', { id: pre + id, cx: '0.5', cy: '0.5', r: '0.5' }, defs);
      stops(gEl, list);
      return 'url(#' + pre + id + ')';
    }
    return {
      body: lin('body', 0, 0, 0, 1, [[0, P.creamHi], [0.45, P.cream], [1, P.creamD]]),
      bodyHi: lin('bodyhi', 0, 0, 0, 1, [[0, P.white], [0.5, P.creamHi], [1, P.cream]]),
      silicone: lin('sil', 0, 0, 0, 1, [[0, '#fffdf5'], [0.55, P.cream], [1, P.accHi]]),
      acc: lin('acc', 0, 0, 0, 1, [[0, P.accHi], [0.5, P.acc], [1, P.accD]]),
      pad: lin('pad', 0, 0, 0, 1, [[0, P.padHi], [0.45, P.pad], [1, P.padD]]),
      arm: lin('arm', 0, 0, 1, 0, [[0, P.pinkD], [0.35, P.pink], [0.72, P.pinkHi], [1, P.pink]]),
      stem: lin('stem', 0, 0, 0, 1, [[0, P.creamHi], [0.6, P.cream], [1, P.creamD]]),
      rail: lin('rail', 0, 0, 0, 1, [[0, P.creamHi], [0.5, P.cream], [1, P.accHi]]),
      collar: lin('col', 0, 0, 0, 1, [[0, P.white], [1, P.creamD]]),
      gem: rad('gem', [[0, P.white], [0.42, P.gem], [1, P.gemD]]),
      honey: rad('hon', [[0, '#fff4c4'], [0.5, P.honey], [1, P.honeyD]]),
      glow: rad('glow', [[0, P.white, 0.85], [0.6, P.honey, 0.35], [1, P.honey, 0]])
    };
  }

  // ---- shared module: fixed mini rail + carriage + stem --------------------
  function drawModule(parent, x, y, P, G, tag) {
    var mod = el('g', { 'class': 'grip-module' }, parent);

    // fixed horizontal mini rail, toy cream + mint instead of grey gantry
    rect(mod, RAIL_X0, RAIL_Y, RAIL_X1 - RAIL_X0, RAIL_H, G.rail,
      { rx: RAIL_H / 2, stroke: P.ink, 'stroke-width': 1.3 });
    rect(mod, RAIL_X0 + 7, RAIL_Y + 1.5, RAIL_X1 - RAIL_X0 - 14, 1.7, P.white,
      { rx: 0.85, opacity: 0.6 });
    var bolts = [0.14, 0.32, 0.68, 0.86];
    for (var b = 0; b < bolts.length; b++) {
      var bx = RAIL_X0 + (RAIL_X1 - RAIL_X0) * bolts[b];
      circle(mod, bx, RAIL_Y + RAIL_H - 1.6, 1.1, P.honeyD, { opacity: 0.55 });
    }
    [RAIL_X0, RAIL_X1].forEach(function (cx) {
      circle(mod, cx, RAIL_MID, 4.2, G.acc, { stroke: P.ink, 'stroke-width': 1.2 });
      circle(mod, cx - 1.1, RAIL_MID - 1.1, 1.3, P.white, { opacity: 0.85 });
    });

    // carriage rides the rail, stem hangs from its bottom edge
    var car = el('g', { 'class': 'grip-carriage' }, mod);
    rect(car, x - 16, CAR_TOP, 32, CAR_BOT - CAR_TOP, G.body,
      { rx: 7, stroke: P.ink, 'stroke-width': 1.5 });
    rect(car, x - 12, CAR_TOP + 2.4, 24, 2.1, P.white, { rx: 1.05, opacity: 0.7 });
    circle(car, x - 8, RAIL_MID, 3.4, tag === 'C' ? G.arm : G.acc, { stroke: P.ink, 'stroke-width': 1 });
    circle(car, x + 8, RAIL_MID, 3.4, tag === 'C' ? G.arm : G.acc, { stroke: P.ink, 'stroke-width': 1 });
    circle(car, x - 8.9, RAIL_MID - 1, 1.1, P.white, { opacity: 0.9 });
    circle(car, x + 7.1, RAIL_MID - 1, 1.1, P.white, { opacity: 0.9 });
    rect(car, x - 16, CAR_BOT - 5, 32, 5, tag === 'C' ? P.pinkD : P.accD, { rx: 2.5, opacity: 0.9 });
    rect(car, x - 16, CAR_BOT - 5, 32, 1.6, P.white, { rx: 0.8, opacity: 0.5 });

    // stem: starts inside the carriage (32) and dies inside the head (y - 3)
    var stemBottom = Math.max(y - 3, STEM_TOP + 8);
    var stemW = tag === 'C' ? 10 : 14;
    var stem = el('g', { 'class': 'grip-stem' }, mod);
    rect(stem, x - stemW / 2, STEM_TOP, stemW, stemBottom - STEM_TOP, G.stem,
      { rx: stemW / 2, stroke: P.ink, 'stroke-width': 1.35 });
    rect(stem, x - stemW / 2 + 2.4, STEM_TOP + 2, 2.6, Math.max(4, stemBottom - STEM_TOP - 6), P.white,
      { rx: 1.3, opacity: 0.55 });
    // wrapped accents so the rod reads as candy hardware, not a steel post
    var wraps = [0.34, 0.62];
    for (var w = 0; w < wraps.length; w++) {
      var wy = STEM_TOP + (stemBottom - STEM_TOP) * wraps[w];
      rect(stem, x - stemW / 2 - 1.2, wy, stemW + 2.4, 3.4,
        tag === 'C' ? P.pinkD : P.accD, { rx: 1.7, opacity: 0.75 });
    }
    circle(stem, x, STEM_TOP + 0.5, stemW / 2 + 1.6, G.acc,
      { stroke: P.ink, 'stroke-width': 1.1 });
    return mod;
  }

  // ---- contact sparks ------------------------------------------------------
  function drawContactFX(parent, x, y, off, contact, P, G) {
    if (!(contact > 0)) { return; }
    var a = clamp(contact, 0, 1);
    var fx = el('g', { 'class': 'grip-contact' }, parent);
    [-1, 1].forEach(function (s) {
      var cx = x + s * off, cy = y + 39;
      circle(fx, cx, cy, 7, G.glow, { opacity: 0.75 * a });
      circle(fx, cx, cy, 2.2, P.honey, { stroke: P.honeyD, 'stroke-width': 0.7, opacity: a });
      circle(fx, cx - 0.6, cy - 0.7, 0.75, P.white, { opacity: 0.95 * a });
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d) {
        el('line', {
          x1: R(cx + d[0] * 3.6), y1: R(cy + d[1] * 3.6),
          x2: R(cx + d[0] * 5.4), y2: R(cy + d[1] * 5.4),
          stroke: P.honey, 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: 0.85 * a
        }, fx);
      });
    });
    return fx;
  }

  /* =======================================================================
     OPTION A -- "Kẹp kẹo mềm"
     Compact vanilla-cream shoulder, mint metallic outlines, two rounded soft
     silicone fingers with warm peach pads, candy-stripe collar and a honey
     indicator lamp.
     ===================================================================== */
  function drawA(parent, pose) {
    if (!parent) { return null; }
    var p = readPose(pose);
    var P = makePalette(p.theme);
    var G = makeGrads(parent, 'A', P);
    var x = p.x, y = p.y;
    var off = TRAY_HALF + OPEN_TRAVEL * p.open;

    drawModule(parent, x, y, P, G, 'A');

    var fingers = el('g', { 'class': 'grip-A-fingers' }, parent);
    drawSoftFinger(fingers, x, y, off, -1, P, G);
    drawSoftFinger(fingers, x, y, off, 1, P, G);

    drawSoftHead(parent, x, y, P, G);
    drawContactFX(parent, x, y, off, p.contact, P, G);
    return parent;
  }

  function softFingerPath(x, y, off, s) {
    var top = y + 3, bottom = y + FINGER_BOTTOM_DY;
    var inner = x + s * off;            // exact pad face
    var outer = x + s * (off + 10);     // 10px soft silicone wall
    var aIn = x + s * 15, aOut = x + s * 27;  // shoulder roots, hidden under the head
    return 'M' + R(aOut) + ' ' + R(top) +
      ' C' + R(x + s * 31) + ' ' + R(y + 11) + ' ' + R(outer + s * 1.5) + ' ' + R(y + 18) + ' ' + R(outer) + ' ' + R(y + 26) +
      ' L' + R(outer) + ' ' + R(bottom - 5) +
      ' Q' + R(outer) + ' ' + R(bottom) + ' ' + R(outer - s * 5) + ' ' + R(bottom) +
      ' Q' + R(inner) + ' ' + R(bottom) + ' ' + R(inner) + ' ' + R(bottom - 5) +
      ' L' + R(inner) + ' ' + R(y + 20) +
      ' C' + R(inner + s * 1.6) + ' ' + R(y + 12) + ' ' + R(aIn + s * 2) + ' ' + R(y + 6) + ' ' + R(aIn) + ' ' + R(top) +
      ' Z';
  }

  function drawSoftFinger(parent, x, y, off, s, P, G) {
    var inner = x + s * off;
    var outer = x + s * (off + 10);

    path(parent, softFingerPath(x, y, off, s), {
      fill: G.silicone, stroke: P.accD, 'stroke-width': 2.4, 'stroke-linejoin': 'round'
    });
    // outer silicone gloss, inset from the outer wall
    path(parent, 'M' + R(outer - s * 4.6) + ' ' + R(y + 30) +
      ' Q' + R(outer - s * 6) + ' ' + R(y + 43) + ' ' + R(outer - s * 4.6) + ' ' + R(y + 55), {
      fill: 'none', stroke: P.white, 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.6
    });
    // shoulder knuckle, peeking out where the silicone leaves the cream head
    circle(parent, x + s * 32, y + 8, 4.2, G.acc, { stroke: P.accD, 'stroke-width': 1.2 });
    circle(parent, x + s * 31.2, y + 7.2, 1.4, P.white, { opacity: 0.85 });

    // warm peach grip pad, tucked into the finger wall so its inner surface is
    // dead on x -/+ off (the carton edge) and never rides over the candies
    var padX = s < 0 ? inner - 5 : inner;
    rect(parent, padX, y + PAD_TOP_DY, 5, PAD_H, G.pad,
      { rx: 2.5, stroke: P.padD, 'stroke-width': 0.9 });
    for (var i = 0; i < 4; i++) {
      el('line', {
        x1: R(padX + 1.1), y1: R(y + 28 + i * 8),
        x2: R(padX + 3.9), y2: R(y + 28 + i * 8),
        stroke: P.padD, 'stroke-width': 0.9, 'stroke-linecap': 'round', opacity: 0.5
      }, parent);
    }
    var padHiX = padX + (s < 0 ? 4.1 : 0.9);
    el('line', {
      x1: R(padHiX), y1: R(y + PAD_TOP_DY + 2),
      x2: R(padHiX), y2: R(y + PAD_TOP_DY + PAD_H - 2),
      stroke: P.white, 'stroke-width': 1, 'stroke-linecap': 'round', opacity: 0.55
    }, parent);
  }

  function drawSoftHead(parent, x, y, P, G) {
    var head = el('g', { 'class': 'grip-A-head' }, parent);

    // candy-stripe collar wrapped on the stem just above the shoulder
    rect(head, x - 11, y - 18, 22, 9, G.collar,
      { rx: 4.5, stroke: P.accD, 'stroke-width': 1.5 });
    for (var i = 0; i < 3; i++) {
      el('path', {
        d: 'M' + R(x - 6 + i * 6) + ' ' + R(y - 17) + ' l3.2 7',
        fill: 'none', stroke: i % 2 ? P.honeyD : P.pinkD,
        'stroke-width': 2.1, 'stroke-linecap': 'round', opacity: 0.9
      }, head);
    }

    // compact vanilla-cream shoulder with a mint metallic outline
    rect(head, x - 30, y - 4, 60, 18, G.body,
      { rx: 9, stroke: P.accD, 'stroke-width': 2.5 });
    rect(head, x - 23, y - 0.8, 46, 5, P.white, { rx: 2.5, opacity: 0.6 });
    rect(head, x - 27, y + 6, 54, 7, P.creamD, { rx: 3.5, opacity: 0.35 });
    rect(head, x - 14, y - 2, 28, 14, G.bodyHi,
      { rx: 6, stroke: P.accD, 'stroke-width': 1.5 });
    // mint socket caps either side, then the silicone shoulders hide their inner half
    circle(head, x - 22, y + 5, 5.6, G.acc, { stroke: P.accD, 'stroke-width': 1.4 });
    circle(head, x + 22, y + 5, 5.6, G.acc, { stroke: P.accD, 'stroke-width': 1.4 });
    circle(head, x - 23, y + 3.8, 1.7, P.white, { opacity: 0.9 });
    circle(head, x + 21, y + 3.8, 1.7, P.white, { opacity: 0.9 });

    // honey indicator lamp
    circle(head, x + 17, y + 5, 6, G.glow, { opacity: 0.75 });
    circle(head, x + 17, y + 5, 3.4, G.honey, { stroke: P.honeyD, 'stroke-width': 0.9 });
    circle(head, x + 15.9, y + 3.9, 1.1, P.white, { opacity: 0.95 });
    return head;
  }

  /* =======================================================================
     OPTION C -- "Kẹp kẹo xoắn"
     Candy-shop tongs: rounded curved jaws in pink/coral, cream central hinge
     with a white candy-stripe ring, and a blue/mint jewel indicator.
     ===================================================================== */
  function drawC(parent, pose) {
    if (!parent) { return null; }
    var p = readPose(pose);
    var P = makePalette(p.theme);
    var G = makeGrads(parent, 'C', P);
    var x = p.x, y = p.y;
    var off = TRAY_HALF + OPEN_TRAVEL * p.open;

    drawModule(parent, x, y, P, G, 'C');

    var arms = el('g', { 'class': 'grip-C-arms' }, parent);
    drawTongArm(arms, x, y, off, -1, P, G);
    drawTongArm(arms, x, y, off, 1, P, G);

    drawTongHinge(parent, x, y, P, G);
    drawContactFX(parent, x, y, off, p.contact, P, G);
    return parent;
  }

  // Candy-shop tong: bulges out over the carton rim, then a tall narrow curved
  // jaw drops down OUTSIDE the carton.  The 12px jaw stroke on a centreline at
  // x + s * (off + 6) puts its inner face exactly on x + s * off.
  function tongArmPath(x, y, off, s) {
    var m = x + s * (off + 6);
    return 'M' + R(x + s * 7) + ' ' + R(y + 9) +
      ' C' + R(x + s * 16) + ' ' + R(y + 11) + ' ' + R(x + s * (off + 13)) + ' ' + R(y + 18) +
      ' ' + R(x + s * (off + 12)) + ' ' + R(y + 24) +
      ' Q' + R(x + s * (off + 9)) + ' ' + R(y + 32) + ' ' + R(m) + ' ' + R(y + 38) +
      ' L' + R(m) + ' ' + R(y + 49) +
      ' Q' + R(m) + ' ' + R(y + 57) + ' ' + R(x + s * (off + 7.5)) + ' ' + R(y + 60);
  }

  function drawTongArm(parent, x, y, off, s, P, G) {
    var d = tongArmPath(x, y, off, s);
    var gArm = el('g', { 'class': 'grip-C-arm' }, parent);

    path(gArm, d, {
      fill: 'none', stroke: P.ink, 'stroke-width': 15,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    path(gArm, d, {
      fill: 'none', stroke: G.arm, 'stroke-width': 12,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    // outer candy gloss, biased away from the carton
    path(gArm, d, {
      fill: 'none', stroke: P.white, 'stroke-width': 2.6, opacity: 0.5,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      transform: 'translate(' + R(s * 4) + ',0)'
    });
    // polka-dot candy studs riding the outer side of the curve
    [[-1, 3], [2, 3], [5, 2]].forEach(function (sp, i) {
      circle(gArm, x + s * (off + 12 + i * 0.4), y + 20 + i * 3.4, 2,
        i % 2 ? P.honey : P.white, { opacity: 0.9 });
    });
    // warm pad on the jaw face: inner face dead on x -/+ off
    var face = x + s * off;
    rect(gArm, s < 0 ? face : face - 3.6, y + 38, 3.6, 20, G.pad,
      { rx: 1.8, stroke: P.padD, 'stroke-width': 0.8 });
    // rounded tip nub, so the jaw visibly cups the carton corner
    circle(gArm, x + s * (off + 7), y + 59.4, 6, P.ink, { opacity: 0.9 });
    circle(gArm, x + s * (off + 7), y + 59.4, 4.8, G.arm);
    circle(gArm, x + s * (off + 8.6), y + 57.8, 1.7, P.white, { opacity: 0.8 });
    return gArm;
  }

  function sector(cx, cy, r0, r1, a0, a1) {
    function pt(r, a) { return R(cx + r * Math.cos(a)) + ' ' + R(cy + r * Math.sin(a)); }
    return 'M' + pt(r1, a0) +
      ' A' + R(r1) + ' ' + R(r1) + ' 0 0 1 ' + pt(r1, a1) +
      ' L' + pt(r0, a1) +
      ' A' + R(r0) + ' ' + R(r0) + ' 0 0 0 ' + pt(r0, a0) + ' Z';
  }

  function drawTongHinge(parent, x, y, P, G) {
    // small puck hinge kept tight under the head: the carton top is y+14 and
    // the bottom of the hinge has to stop above it so the candies stay visible
    var cy = y + 4, R0 = 9;
    var hinge = el('g', { 'class': 'grip-C-hinge' }, parent);
    circle(hinge, x, cy + 1.2, R0, P.ink, { opacity: 0.14 });
    circle(hinge, x, cy, R0, G.body, { stroke: P.ink, 'stroke-width': 1.6 });

    // white candy-stripe ring around the cream hinge
    for (var i = 0; i < 10; i++) {
      var a0 = (i / 10) * Math.PI * 2, a1 = a0 + Math.PI / 10;
      path(hinge, sector(x, cy, 5.4, 8.2, a0, a1), {
        fill: i % 2 ? P.white : P.pink, opacity: i % 2 ? 0.95 : 0.8
      });
    }
    circle(hinge, x, cy, 5.4, G.bodyHi, { stroke: P.accD, 'stroke-width': 1.2 });

    // blue / mint jewel indicator
    circle(hinge, x, cy, 4, G.gem, { stroke: P.gemD, 'stroke-width': 1.1 });
    circle(hinge, x - 1.2, cy - 1.3, 1.3, P.white, { opacity: 0.95 });
    circle(hinge, x + 1, cy + 1.1, 0.7, P.white, { opacity: 0.6 });
    return hinge;
  }

  // ---- register ------------------------------------------------------------
  window.GripperOptionDrawers = window.GripperOptionDrawers || {};
  window.GripperOptionDrawers.A = drawA;
  window.GripperOptionDrawers.C = drawC;
})();
