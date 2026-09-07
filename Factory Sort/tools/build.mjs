#!/usr/bin/env node
/**
 * tools/build.mjs — Điều phối build cho các phiên bản.
 * Để build riêng từng bản, hãy dùng:
 *   - npm run build:delivery  (Chỉ build thư mục delivery/)
 *   - npm run build:abtest    (Chỉ build thư mục ab_test/)
 */
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

console.log('🚀 Đang chạy đóng gói cho cả hai phiên bản...');
console.log('');

// 1. Build delivery
execFileSync(process.execPath, [path.join(ROOT, 'delivery', 'build.mjs')], { stdio: 'inherit' });
console.log('');

// 2. Build ab_test
execFileSync(process.execPath, [path.join(ROOT, 'ab_test', 'build.mjs')], { stdio: 'inherit' });
console.log('');
console.log('✨ Hoàn tất đóng gói toàn bộ các phiên bản!');
