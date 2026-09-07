import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function renderDashboard() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factory Sort - Version Portal</title>
  <style>
    body {
      margin: 0; padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0b1329; color: #f8fafc;
      display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh;
    }
    h1 { font-size: 26px; margin-bottom: 8px; color: #38bdf8; }
    p.subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 30px; }
    .card-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; width: 100%; max-width: 720px;
    }
    .card {
      background: #162038; border: 1.5px solid #233458; border-radius: 14px;
      padding: 24px; display: flex; flex-direction: column; justify-content: space-between;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    .card h2 { margin: 0 0 8px 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
    .card p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; }
    .btn-group { display: flex; gap: 10px; }
    .btn {
      flex: 1; text-align: center; text-decoration: none; padding: 10px 14px;
      border-radius: 8px; font-weight: 600; font-size: 13px; transition: transform 0.1s, filter 0.1s;
    }
    .btn:active { transform: scale(0.97); }
    .btn-primary { background: #38bdf8; color: #0f172a; }
    .btn-secondary { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
    .tag { font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
    .tag-std { background: #10b981; color: #fff; }
    .tag-ab { background: #f59e0b; color: #000; }
  </style>
</head>
<body>
  <h1>📦 Factory Sort - Prototype Portal</h1>
  <p class="subtitle">Hai phiên bản độc lập: Thao tác tách biệt hoàn toàn</p>

  <div class="card-grid">
    <div class="card">
      <div>
        <h2>📦 Bản Tiêu Chuẩn <span class="tag tag-std">Official</span></h2>
        <p>Thùng hàng ở <strong>TRÊN</strong>, Băng chuyền ở <strong>DƯỚI</strong>. Thiết kế trực quan theo đúng tài liệu GDD gốc.</p>
      </div>
      <div class="btn-group">
        <a class="btn btn-primary" href="/delivery/">Chơi Dev</a>
        <a class="btn btn-secondary" href="/delivery/dist/FactorySort_Standard_Delivery.html">Bản Standalone</a>
      </div>
    </div>

    <div class="card">
      <div>
        <h2>🧪 Bản A/B Test <span class="tag tag-ab">Ý tưởng Jun</span></h2>
        <p>Băng chuyền ở <strong>TRÊN</strong>, Thùng hàng ở <strong>DƯỚI</strong>. Tự động đẩy thùng hàng lên sát băng chuyền ở màn không có thùng ẩn.</p>
      </div>
      <div class="btn-group">
        <a class="btn btn-primary" href="/ab_test/" style="background:#f59e0b; color:#000;">Chơi Dev</a>
        <a class="btn btn-secondary" href="/ab_test/dist/FactorySort_ABTest_Inverted.html">Bản Standalone</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);

  if (reqPath === '/' || reqPath === '') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboard());
    return;
  }

  // Routing
  if (reqPath === '/delivery' || reqPath === '/delivery/') {
    reqPath = '/delivery/index.html';
  } else if (reqPath === '/ab_test' || reqPath === '/ab_test/' || reqPath === '/abtest' || reqPath === '/abtest/') {
    reqPath = '/ab_test/index.html';
  } else if (reqPath === '/dev' || reqPath === '/dev/' || reqPath === '/index.html') {
    reqPath = '/delivery/index.html';
  } else if (reqPath === '/index_inverted.html') {
    reqPath = '/ab_test/index.html';
  }
  
  const filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found: ' + reqPath);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k of Object.keys(interfaces)) {
    for (const addr of interfaces[k]) {
      if (addr.family === 'IPv4' && !addr.internal) {
        addresses.push(addr.address);
      }
    }
  }
  return addresses;
}

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log(`====================================================`);
  console.log(`🎮 FACTORY SORT LOCAL SERVER`);
  console.log(`====================================================`);
  console.log(`Local:   http://localhost:${PORT}/`);
  ips.forEach(ip => {
    console.log(`Network: http://${ip}:${PORT}/`);
  });
  console.log(`----------------------------------------------------`);
  console.log(`📦 Bản Chuẩn (Delivery): http://localhost:${PORT}/delivery/`);
  console.log(`🧪 Bản A/B (Inverted):   http://localhost:${PORT}/ab_test/`);
  console.log(`====================================================`);
});
