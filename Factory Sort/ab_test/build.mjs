#!/usr/bin/env node
/**
 * ab_test/build.mjs
 * Đóng gói độc lập CHỈ CHO BẢN A/B TEST (Inverted Layout).
 * Hoàn toàn không đụng tới thư mục delivery/.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, '..');

const JS_FILES = [
  'src/data/ItemCatalog.js',
  'src/core/Box.js',
  'src/core/Tray.js',
  'src/core/Conveyor.js',
  'src/core/GameEngine.js',
  'src/generator/Solver.js',
  'src/generator/SolvableLevelGenerator.js',
  'src/generator/LevelGenerator.js',
  'src/ui/AudioManager.js',
  'src/ui/VFXManager.js',
  'src/ui/BoxRenderer.js',
  'src/ui/TrayRenderer.js',
  'src/ui/ConveyorRenderer.js',
  'src/ui/QueueRenderer.js',
  'src/ui/TutorialManager.js',
  'src/ui/UIManager.js',
];

function stripImports(src, file) {
  const out = [];
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*import[\s{*'"]/.test(lines[i])) { out.push(lines[i]); continue; }
    let j = i;
    while (j < lines.length && !/;\s*$/.test(lines[j])) j++;
    if (j >= lines.length) throw new Error(`${file}: import khong dong bang ';' o dong ${i + 1}`);
    i = j;
  }
  return out.join('\n');
}

function stripExports(src, file) {
  if (/^\s*export\s+default\b/m.test(src)) {
    throw new Error(`${file}: dung 'export default'.`);
  }
  if (/^\s*export\s*\{/m.test(src)) {
    throw new Error(`${file}: dung 'export { ... }'.`);
  }
  return src.replace(/^(\s*)export\s+(?=(const|class|function|let|var|async)\b)/gm, '$1');
}

console.log('🧪 [AB_TEST] Đang đóng gói bản A/B Test Inverted Layout...');

const parts = [];
for (const rel of JS_FILES) {
  const abs = path.join(DIR, rel);
  if (!fs.existsSync(abs)) throw new Error(`[AB_TEST] Thiếu file: ${rel}`);
  let content = fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
  content = stripExports(stripImports(content, rel), rel);
  parts.push(`// --- ${rel} ---\n${content}\n`);
}
const bundle = parts.join('\n');

const leftover = bundle.split('\n').findIndex((l) => /^\s*(import|export)\b/.test(l));
if (leftover !== -1) throw new Error(`[AB_TEST] Bundle con sot dong ${leftover + 1}: ${bundle.split('\n')[leftover]}`);

const DIST_DIR = path.join(DIR, 'dist');
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Lưu bundle riêng vào ab_test/dist/bundle.js
const bundlePath = path.join(DIST_DIR, 'bundle.js');
fs.writeFileSync(bundlePath, bundle);
try {
  execFileSync(process.execPath, ['--check', bundlePath], { stdio: 'pipe' });
} catch (e) {
  throw new Error('[AB_TEST] bundle.js khong parse duoc:\n' + (e.stderr || '').toString());
}

const htmlPath = path.join(DIR, 'index.html');
if (!fs.existsSync(htmlPath)) throw new Error('[AB_TEST] Khong tim thay ab_test/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(path.join(DIR, 'style.css'), 'utf8');

const LINK_REGEX = /<link\s+rel=["']stylesheet["']\s+href=["'][^"']*style\.css["']\s*\/?>/i;
const SCRIPT_REGEX = /<script\s+(?:type=["']module["']\s+)?src=["'][^"']*(?:UIManager\.js|bundle\.js)["']\s*><\/script>/i;

if (!LINK_REGEX.test(html)) throw new Error('[AB_TEST] ab_test/index.html thieu the style.css');
if (!SCRIPT_REGEX.test(html)) throw new Error('[AB_TEST] ab_test/index.html thieu the script');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function inlineAssets(cssText) {
  return cssText.replace(/url\(\s*['"]?(assets\/[^'")]+)['"]?\s*\)/g, (m, rel) => {
    // Tự tìm trong ROOT/rel (do assets nam o root)
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) throw new Error(`[AB_TEST] CSS tro toi file khong ton tai: ${rel}`);
    const ext = path.extname(rel).toLowerCase();
    const mime = MIME[ext];
    if (!mime) throw new Error(`[AB_TEST] Khong biet MIME cho ${rel}`);
    const b64 = fs.readFileSync(abs).toString('base64');
    return `url("data:${mime};base64,${b64}")`;
  });
}

const cssInlined = inlineAssets(css);

const standalone = html
  .replace(LINK_REGEX, `<style>\n${cssInlined}\n</style>`)
  .replace(SCRIPT_REGEX, `<script>\n${bundle}\n</script>`);

const externals = standalone.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+/g);
if (externals) {
  throw new Error('[AB_TEST] Ban standalone con phu thuoc ngoai:\n  ' + externals.join('\n  '));
}
if (/url\(\s*['"]?assets\//.test(standalone)) {
  throw new Error('[AB_TEST] Ban standalone con tro toi assets/ bang duong dan tuong doi.');
}

const outputFile = path.join(DIST_DIR, 'FactorySort_ABTest_Inverted.html');
fs.writeFileSync(outputFile, standalone);

console.log(`====================================================`);
console.log(`✅ [AB_TEST] BUILD HOAN TAT THANH CONG:`);
console.log(`🧪 File Standalone: ab_test/dist/FactorySort_ABTest_Inverted.html`);
console.log(`📜 File Bundle JS:  ab_test/dist/bundle.js`);
console.log(`====================================================`);
