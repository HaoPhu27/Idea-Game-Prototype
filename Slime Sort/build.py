import os
import re

# List of JS files in dependency order (least dependent to most dependent)
js_files = [
    "src/data/levels.js",
    "src/core/Tube.js",
    "src/core/Conveyor.js",
    "src/core/Tray.js",
    "src/core/GameEngine.js",
    "src/ui/TubeRenderer.js",
    "src/ui/ConveyorRenderer.js",
    "src/ui/TrayRenderer.js",
    "src/ui/UIManager.js"
]

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def clean_js(content):
    # Remove import statements
    content = re.sub(r'^\s*import\s+.*?;?\s*$', '', content, flags=re.MULTILINE)
    # Remove export keywords
    content = re.sub(r'^\s*export\s+(class|const|let|var|function|default)', r'\1', content, flags=re.MULTILINE)
    return content

print("Bundling JS...")
bundled_js = ""
for file in js_files:
    content = read_file(file)
    bundled_js += f"// --- {file} ---\n"
    bundled_js += clean_js(content) + "\n\n"

print("Reading CSS...")
css_content = read_file("style.css")

print("Reading HTML...")
html_content = read_file("index.html")

# Inject CSS
style_tag = f"<style>\n{css_content}\n</style>"
html_content = re.sub(r'<link\s+rel="stylesheet"\s+href="style\.css.*?>', style_tag, html_content)

# Inject JS
# Extract entry point logic from index.html
entry_point_match = re.search(r'<script type="module">(.*?)</script>', html_content, re.DOTALL)
if entry_point_match:
    entry_logic = clean_js(entry_point_match.group(1))
    full_js = bundled_js + "\n// --- Entry Point ---\n" + entry_logic
    
    script_tag = f"<script>\n{full_js}\n</script>"
    html_content = html_content[:entry_point_match.start()] + script_tag + html_content[entry_point_match.end():]

print("Writing standalone HTML...")
with open("SlimeSort_Standalone.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Done! SlimeSort_Standalone.html created.")
