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

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);

  // Serve the main prototype directly, with assets relative to ab_test/.
  if (['/', '/dev', '/dev/', '/index.html', '/index_inverted.html', '/ab_test', '/abtest', '/abtest/'].includes(reqPath)) {
    res.writeHead(302, { Location: '/ab_test/' });
    res.end();
    return;
  }
  if (reqPath === '/ab_test/') reqPath = '/ab_test/index.html';

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
  console.log(`🎮 Prototype chính:   http://localhost:${PORT}/ab_test/`);
  console.log(`====================================================`);
});
