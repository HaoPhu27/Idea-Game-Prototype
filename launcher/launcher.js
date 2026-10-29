// Trang launcher: render danh sách game và nhúng game đang chơi vào iframe.
// Chạy được cả khi mở bằng file:// lẫn qua http server.
(function () {
  'use strict';

  var DEFAULT_TITLE = 'Game Prototypes';

  // --- Tham chiếu DOM ---
  var grid = document.getElementById('game-grid');
  var menu = document.getElementById('menu');
  var player = document.getElementById('player');
  var frame = document.getElementById('game-frame');
  var playerTitle = document.getElementById('player-title');
  var btnBack = document.getElementById('btn-back');
  var btnNewTab = document.getElementById('btn-newtab');

  // id game đang chơi (null = đang ở menu)
  var currentId = null;
  // Nút "Chơi" của game vừa mở, để trả focus về khi đóng
  var lastPlayBtn = null;

  /**
   * Encode từng đoạn đường dẫn rồi nối lại bằng '/'.
   * Giữ nguyên '/' nên đường dẫn có dấu cách vẫn chạy đúng ở cả file:// lẫn http.
   */
  function encodePath(p) {
    return String(p)
      .split('/')
      .map(function (segment) {
        return encodeURIComponent(segment);
      })
      .join('/');
  }

  // Bản dev cần server (đường dẫn tương đối không mở đúng qua file://),
  // nên chỉ hiện link khi trang đang chạy qua http(s).
  function isHttp() {
    return location.protocol === 'http:' || location.protocol === 'https:';
  }

  /** "2026-09-08" -> "08/09/2026" */
  function formatDate(iso) {
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function findGame(id) {
    var games = window.GAMES;
    if (!Array.isArray(games)) return null;
    for (var i = 0; i < games.length; i++) {
      if (games[i] && games[i].id === id) return games[i];
    }
    return null;
  }

  // --- Render danh sách game ---
  function makeButton(className, text) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = text;
    return btn;
  }

  function makeBadge(status) {
    var badge = document.createElement('span');
    badge.className = 'lc-badge ' + (status === 'A/B test' ? 'lc-badge--ab' : 'lc-badge--prototype');
    badge.textContent = status || 'Prototype';
    return badge;
  }

  function makeCard(game) {
    var card = document.createElement('article');
    card.className = 'lc-card';
    card.setAttribute('data-id', game.id);

    // Ảnh thumb bấm được -> mở game
    var thumbBtn = makeButton('lc-thumb-btn', '');
    thumbBtn.setAttribute('aria-label', 'Chơi ' + (game.title || ''));
    var img = document.createElement('img');
    img.className = 'lc-thumb';
    img.alt = '';
    img.loading = 'lazy';
    if (game.thumb) img.src = encodePath(game.thumb);
    img.addEventListener('error', function () {
      // Ảnh thiếu/hỏng -> để CSS vẽ placeholder
      img.classList.add('lc-thumb--missing');
      img.removeAttribute('src');
    });
    thumbBtn.appendChild(img);

    var body = document.createElement('div');
    body.className = 'lc-card-body';

    var meta = document.createElement('div');
    meta.className = 'lc-meta';
    meta.appendChild(makeBadge(game.status));
    var genre = document.createElement('span');
    genre.className = 'lc-genre';
    genre.textContent = game.genre || '';
    meta.appendChild(genre);

    var title = document.createElement('h2');
    title.className = 'lc-card-title';
    title.textContent = game.title || '';

    var desc = document.createElement('p');
    desc.className = 'lc-desc';
    desc.textContent = game.description || '';

    var actions = document.createElement('div');
    actions.className = 'lc-actions';

    var playBtn = makeButton('lc-btn lc-btn-play', '▶ Chơi');
    playBtn.addEventListener('click', function () {
      openGame(game.id);
    });
    actions.appendChild(playBtn);

    if (isHttp() && game.dev) {
      var devLink = document.createElement('a');
      devLink.className = 'lc-btn lc-btn-ghost lc-btn-dev';
      devLink.href = encodePath(game.dev);
      devLink.target = '_blank';
      devLink.rel = 'noopener';
      devLink.textContent = 'Bản dev';
      actions.appendChild(devLink);
    }

    var updated = document.createElement('time');
    updated.className = 'lc-updated';
    updated.setAttribute('datetime', game.updated || '');
    updated.textContent = 'Cập nhật ' + formatDate(game.updated || '');

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(actions);
    body.appendChild(updated);

    card.appendChild(thumbBtn);
    card.appendChild(body);

    thumbBtn.addEventListener('click', function () {
      openGame(game.id);
    });

    return card;
  }

  function renderEmpty() {
    var msg = document.createElement('p');
    msg.className = 'lc-empty';
    msg.textContent = 'Chưa có game nào trong danh sách.';
    grid.appendChild(msg);
  }

  function render() {
    var games = Array.isArray(window.GAMES) ? window.GAMES : [];
    grid.textContent = '';
    if (!games.length) {
      renderEmpty();
      return;
    }
    var frag = document.createDocumentFragment();
    for (var i = 0; i < games.length; i++) {
      var game = games[i];
      if (game && game.id) frag.appendChild(makeCard(game));
    }
    if (!frag.childNodes.length) {
      renderEmpty();
      return;
    }
    grid.appendChild(frag);
  }

  // --- Mở / đóng game ---
  function openGame(id) {
    var game = findGame(id);
    if (!game) return; // hash sai id -> bỏ qua

    var url = encodePath(game.play || '');
    currentId = game.id;

    frame.src = url;
    playerTitle.textContent = game.title || '';
    btnNewTab.href = url;

    document.body.classList.add('lc-playing');
    menu.hidden = true;
    player.hidden = false;

    if (location.hash !== '#' + game.id) {
      location.hash = '#' + game.id;
    }
    document.title = (game.title || '') + ' · ' + DEFAULT_TITLE;

    // Ghi nhớ nút Chơi để trả focus khi đóng
    var card = grid.querySelector('.lc-card[data-id="' + CSS.escape(game.id) + '"]');
    lastPlayBtn = card ? card.querySelector('.lc-btn-play') : null;

    frame.focus();
  }

  function closeGame() {
    if (currentId === null) return;

    // about:blank để dừng âm thanh / vòng lặp của game
    frame.src = 'about:blank';
    frame.removeAttribute('src');
    currentId = null;

    document.body.classList.remove('lc-playing');
    player.hidden = true;
    menu.hidden = false;
    document.title = DEFAULT_TITLE;

    // Xóa hash nhưng giữ nguyên đường dẫn (tránh nhảy trang khi chạy file://)
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }

    if (lastPlayBtn && document.contains(lastPlayBtn)) {
      lastPlayBtn.focus();
    }
    lastPlayBtn = null;
  }

  // --- Sự kiện ---
  btnBack.addEventListener('click', closeGame);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && currentId !== null) closeGame();
  });

  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    if (!id) {
      if (currentId !== null) closeGame();
      return;
    }
    if (findGame(id)) {
      if (currentId !== id) openGame(id);
    }
    // Hash sai id: bỏ qua, giữ nguyên trạng thái hiện tại (ở menu)
  });

  // --- Khởi động ---
  render();

  var initialId = location.hash.slice(1);
  if (initialId && findGame(initialId)) {
    openGame(initialId);
  }
})();
