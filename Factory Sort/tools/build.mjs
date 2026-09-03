#!/usr/bin/env node
/**
 * build.mjs — gop cac module ES thanh mot file phang cho ban standalone.
 *
 * Vi sao viet lai bang Node thay vi giu build.py:
 *   1. Repo khong con phu thuoc Python (test/demo/selftest deu chay bang Node).
 *   2. build.py cat import bang regex `^import .*;` — CHI khop import mot dong.
 *      Import nhieu dong (`import {\n  a,\n  b,\n} from '...'`) se sot lai trong
 *      bundle => SyntaxError ngay khi trinh duyet doc file standalone.
 *   3. build.py khong bao loi khi con sot `import`/`export`: no ghi ra mot bundle
 *      hong roi in "Done". Ban o day KIEM TRA lai ket qua truoc khi ghi.
 *
 * Gioi han (co y): day khong phai bundler that. No dua vao viec toan bo source
 * chia se mot pham vi toan cuc phang va khong co ten trung nhau giua cac file.
 * Neu them file moi, phai them vao JS_FILES theo DUNG thu tu phu thuoc.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Thu tu = thu tu phu thuoc. File sau duoc phep dung ten cua file truoc.
const JS_FILES = [
  'src/data/ItemCatalog.js',
  'src/core/Box.js',
  'src/core/Tray.js',
  'src/core/Conveyor.js',
  'src/core/GameEngine.js',
  'src/generator/Solver.js',
  'src/generator/SolvableLevelGenerator.js',
  'src/generator/LevelGenerator.js',
  'src/ui/BoxRenderer.js',
  'src/ui/TrayRenderer.js',
  'src/ui/ConveyorRenderer.js',
  'src/ui/UIManager.js',
];

/** Bo cac cau lenh import, ke ca import trai dai nhieu dong. */
function stripImports(src, file) {
  const out = [];
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*import[\s{*'"]/.test(lines[i])) { out.push(lines[i]); continue; }
    // Nuot cho toi dong ket thuc bang ';' (hoac het khoi import 1 dong).
    let j = i;
    while (j < lines.length && !/;\s*$/.test(lines[j])) j++;
    if (j >= lines.length) throw new Error(`${file}: import khong dong bang ';' o dong ${i + 1}`);
    i = j;
  }
  return out.join('\n');
}

/** Bo tu khoa `export` truoc khai bao; bao loi voi cac dang bundler nay khong ho tro. */
function stripExports(src, file) {
  if (/^\s*export\s+default\b/m.test(src)) {
    throw new Error(
      `${file}: dung 'export default'. Bundler phang khong dich duoc no thanh ten toan cuc — ` +
      `hay doi sang 'export const <Ten> = {...}'.`
    );
  }
  if (/^\s*export\s*\{/m.test(src)) {
    throw new Error(`${file}: dung 'export { ... }'. Hay dat 'export' trước tung khai bao.`);
  }
  return src.replace(/^(\s*)export\s+(?=(const|class|function|let|var|async)\b)/gm, '$1');
}

const parts = [];
for (const rel of JS_FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error(`Thieu file trong JS_FILES: ${rel}`);
  let content = fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
  content = stripExports(stripImports(content, rel), rel);
  parts.push(`// --- ${rel} ---\n${content}\n`);
}
const bundle = parts.join('\n');

// Kiem tra: khong duoc sot import/export nao, va bundle phai parse duoc.
const leftover = bundle.split('\n').findIndex((l) => /^\s*(import|export)\b/.test(l));
if (leftover !== -1) throw new Error(`Bundle con sot dong ${leftover + 1}: ${bundle.split('\n')[leftover]}`);

fs.writeFileSync(path.join(ROOT, 'bundle.js'), bundle);
try {
  execFileSync(process.execPath, ['--check', path.join(ROOT, 'bundle.js')], { stdio: 'pipe' });
} catch (e) {
  throw new Error('bundle.js khong parse duoc:\n' + (e.stderr || '').toString());
}

// Noi CSS + JS vao index.html -> ban standalone mot file.
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const LINK = '<link rel="stylesheet" href="style.css">';
const SCRIPT = '<script type="module" src="src/ui/UIManager.js"></script>';
if (!html.includes(LINK)) throw new Error(`index.html khong con the: ${LINK}`);
if (!html.includes(SCRIPT)) throw new Error(`index.html khong con the: ${SCRIPT}`);

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function inlineAssets(cssText) {
  return cssText.replace(/url\(\s*['"]?(assets\/[^'")]+)['"]?\s*\)/g, (m, rel) => {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) throw new Error(`CSS tro toi file khong ton tai: ${rel}`);
    const ext = path.extname(rel).toLowerCase();
    const mime = MIME[ext];
    if (!mime) throw new Error(`Khong biet MIME cho ${rel}`);
    const b64 = fs.readFileSync(abs).toString('base64');
    return `url("data:${mime};base64,${b64}")`;
  });
}

const cssInlined = inlineAssets(css);

const standalone = html
  .replace(LINK, `<style>\n${cssInlined}\n</style>`)
  .replace(SCRIPT, `<script>\n${bundle}\n</script>`);

// Ban standalone khong duoc phu thuoc mang.
const externals = standalone.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+/g);
if (externals) {
  throw new Error('Ban standalone con phu thuoc ngoai:\n  ' + externals.join('\n  '));
}
if (/url\(\s*['"]?assets\//.test(standalone)) {
  throw new Error('Ban standalone con tro toi assets/ bang duong dan tuong doi.');
}

fs.writeFileSync(path.join(ROOT, 'FactorySort_Standalone.html'), standalone);

const VERIFY_SRC = path.join(ROOT, 'tools', 'verify.html');
if (fs.existsSync(VERIFY_SRC)) {
  const verify = fs.readFileSync(VERIFY_SRC, 'utf8');
  const VERIFY_SCRIPT = '<script src="../bundle.js"></script>';
  if (verify.includes(VERIFY_SCRIPT)) {
    const builtVerify = verify.replace(VERIFY_SCRIPT, `<script>\n${bundle}\n</script>`);
    fs.writeFileSync(path.join(ROOT, 'tools', 'verify_build.html'), builtVerify);
  }
}

console.log(`Da build: bundle.js (${bundle.split('\n').length} dong) + FactorySort_Standalone.html + verify_build.html`);
