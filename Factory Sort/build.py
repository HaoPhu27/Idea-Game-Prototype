import os
import re

js_files = [
    'src/data/ItemCatalog.js',
    'src/core/Box.js',
    'src/core/Tray.js',
    'src/core/Conveyor.js',
    'src/core/GameEngine.js',
    'src/generator/Solver.js',
    'src/generator/LevelGenerator.js',
    'src/ui/BoxRenderer.js',
    'src/ui/TrayRenderer.js',
    'src/ui/ConveyorRenderer.js',
    'src/ui/UIManager.js'
]

combined_js = ""

for file_path in js_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Remove import statements
        content = re.sub(r'^import .*;\n?', '', content, flags=re.MULTILINE)
        # Remove export keyword (but keep the class/function/const definition)
        content = re.sub(r'^export\s+(const|class|function|let|var)', r'\1', content, flags=re.MULTILINE)
        combined_js += f"// --- {file_path} ---\n{content}\n\n"

# Write bundle.js
with open('bundle.js', 'w', encoding='utf-8') as f:
    f.write(combined_js)

# Read index.html and style.css
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
    
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace css link with inline style
html = html.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css}\n</style>')

# Replace script tag with inline script
html = html.replace('<script type="module" src="src/ui/UIManager.js"></script>', f'<script>\n{combined_js}\n</script>')

with open('FactorySort_Standalone.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Done building FactorySort_Standalone.html and bundle.js")
