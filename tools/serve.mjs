// Static server nhỏ gọn cho menu game — Node thuần, không cần npm install.
// Chạy: node tools/serve.mjs  (đổi cổng: PORT=9000 node tools/serve.mjs)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Gốc phục vụ = thư mục cha của tools/ (tức thư mục gốc dự án)
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8090;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
    ...headers,
  });
  res.end(body);
}

// Trả true nếu p nằm trong ROOT (chặn path traversal)
function insideRoot(p) {
  const rel = path.relative(ROOT, p);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': type });
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, '405 Method Not Allowed');
  }

  // Tách pathname khỏi query rồi decode (%20, tiếng Việt...).
  // Cố ý không dùng new URL() để giữ nguyên các đoạn ".." nhằm chặn traversal bên dưới.
  const rawPath = req.url.split('?')[0].split('#')[0];
  let pathname;
  try {
    pathname = decodeURIComponent(rawPath);
  } catch {
    return send(res, 400, '400 Bad Request');
  }

  // Null byte không hợp lệ trong đường dẫn file
  if (pathname.includes('\0')) return send(res, 400, '400 Bad Request');

  // Resolve rồi kiểm tra vẫn nằm trong gốc; nếu không (vd. ../, %2e%2e) -> 403
  const target = path.resolve(ROOT, '.' + pathname);
  if (!insideRoot(target)) return send(res, 403, '403 Forbidden');

  fs.stat(target, (err, stat) => {
    if (err) return send(res, 404, '404 Not Found');

    // Request tới thư mục -> tìm index.html bên trong
    if (stat.isDirectory()) {
      // URL không kết thúc bằng '/' -> 301 sang URL có '/' (giữ nguyên query string).
      // Không redirect thì các đường dẫn tương đối trong index.html của thư mục con
      // (vd. ./style.css) sẽ bị resolve sai thư mục.
      if (!rawPath.endsWith('/')) {
        const cut = req.url.search(/[?#]/);
        const reqPath = cut === -1 ? req.url : req.url.slice(0, cut);
        const suffix = cut === -1 ? '' : req.url.slice(cut);
        return send(res, 301, '301 Moved Permanently', { Location: reqPath + '/' + suffix });
      }

      const indexFile = path.join(target, 'index.html');
      return fs.stat(indexFile, (err2, st2) => {
        if (err2 || !st2.isFile()) return send(res, 404, '404 Not Found — không có index.html');
        serveFile(indexFile, res);
      });
    }

    serveFile(target, res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const lines = [`  Local:   http://localhost:${PORT}/`];
  // Liệt kê mọi IPv4 LAN để mở từ điện thoại cùng Wi-Fi
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) {
        lines.push(`  Network: http://${a.address}:${PORT}/  (${name})`);
      }
    }
  }
  console.log(`\nGame launcher đang chạy — phục vụ: ${ROOT}\n${lines.join('\n')}\n`);
});
