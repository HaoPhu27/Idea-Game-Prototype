import os
import re
import base64
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

JS_FILES = [
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
  'src/ui/QueueRenderer.js',
  'src/ui/UIManager.js',
]

def strip_imports(src, file_name):
    out = []
    lines = src.split('\n')
    i = 0
    while i < len(lines):
        if not re.match(r'^\s*import[\s{*\’"\']', lines[i]):
            out.append(lines[i])
            i += 1
            continue
        
        j = i
        while j < len(lines) and not re.search(r';\s*$', lines[j]):
            j += 1
        if j >= len(lines):
            raise Exception(f"{file_name}: import missing ';' on line {i + 1}")
        i = j + 1
    return '\n'.join(out)

def strip_exports(src, file_name):
    if re.search(r'^\s*export\s+default\b', src, re.MULTILINE):
        raise Exception(f"{file_name}: export default not allowed.")
    if re.search(r'^\s*export\s*\{', src, re.MULTILINE):
        raise Exception(f"{file_name}: export {{ ... }} not allowed.")
    
    return re.sub(r'^(\s*)export\s+(?=(const|class|function|let|var|async)\b)', r'\1', src, flags=re.MULTILINE)

parts = []
for rel in JS_FILES:
    abs_path = os.path.join(ROOT, rel.replace('/', os.sep))
    if not os.path.exists(abs_path):
        raise Exception(f"Missing file: {rel}")
    with open(abs_path, 'r', encoding='utf-8') as f:
        content = f.read().replace('\r\n', '\n')
    content = strip_imports(content, rel)
    content = strip_exports(content, rel)
    parts.append(f"// --- {rel} ---\n{content}\n")

bundle = '\n'.join(parts)

for i, line in enumerate(bundle.split('\n')):
    if re.match(r'^\s*(import|export)\b', line):
        raise Exception(f"Bundle leftover line {i + 1}: {line}")

with open(os.path.join(ROOT, 'bundle.js'), 'w', encoding='utf-8') as f:
    f.write(bundle)

with open(os.path.join(ROOT, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()
with open(os.path.join(ROOT, 'style.css'), 'r', encoding='utf-8') as f:
    css = f.read()

LINK = '<link rel="stylesheet" href="style.css">'
SCRIPT = '<script type="module" src="src/ui/UIManager.js"></script>'

if LINK not in html: raise Exception(f"index.html missing: {LINK}")
if SCRIPT not in html: raise Exception(f"index.html missing: {SCRIPT}")

MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

def replace_url(match):
    rel = match.group(1)
    abs_path = os.path.join(ROOT, rel.replace('/', os.sep))
    if not os.path.exists(abs_path):
        raise Exception(f"CSS points to non-existent file: {rel}")
    ext = os.path.splitext(rel)[1].lower()
    mime = MIME.get(ext)
    if not mime:
        raise Exception(f"Unknown MIME for {rel}")
    with open(abs_path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('utf-8')
    return f'url("data:{mime};base64,{b64}")'

css_inlined = re.sub(r'url\(\s*[\'"]?(assets\/[^\'")]+)[\'"]?\s*\)', replace_url, css)

standalone = html.replace(LINK, f"<style>\n{css_inlined}\n</style>")
standalone = standalone.replace(SCRIPT, f"<script>\n{bundle}\n</script>")

if re.search(r'(?:src|href)\s*=\s*["\']https?:\/\/[^"\']+', standalone):
    raise Exception('Standalone has external dependencies')
if re.search(r'url\(\s*[\'"]?assets\/', standalone):
    raise Exception('Standalone still points to assets/ directory')

with open(os.path.join(ROOT, 'FactorySort_Standalone.html'), 'w', encoding='utf-8') as f:
    f.write(standalone)

# --- Trang kiem tra logic, tu chua ---
# tools/verify.html giu <script src="../bundle.js"> de sua cho de; ban CHAY THAT la
# tools/verify_build.html voi bundle nhung thang vao trong. Ly do: mo file bang
# file:// thi mot so trinh duyet chan tai script tu duong dan tuong doi, ma trang
# nay lai phai mo duoc bang cach nhay dup chuot.
VERIFY_SRC = os.path.join(ROOT, 'tools', 'verify.html')
if os.path.exists(VERIFY_SRC):
    with open(VERIFY_SRC, 'r', encoding='utf-8') as f:
        verify = f.read()
    VERIFY_SCRIPT = '<script src="../bundle.js"></script>'
    if VERIFY_SCRIPT not in verify:
        raise Exception(f"tools/verify.html missing: {VERIFY_SCRIPT}")
    verify = verify.replace(VERIFY_SCRIPT, "<script>" + chr(10) + bundle + chr(10) + "</script>")
    with open(os.path.join(ROOT, 'tools', 'verify_build.html'), 'w', encoding='utf-8') as f:
        f.write(verify)
    print("Built tools/verify_build.html")

print(f"Built standalone version!")
