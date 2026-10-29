import os
import json
import re
import zipfile

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
LEVELS_DIR = os.path.join(ROOT_DIR, 'levels')

def build_standalone_html():
    print("Building standalone HTML...")
    os.makedirs(DIST_DIR, exist_ok=True)

    # 1. Read all level files
    levels_data = {}
    for filename in sorted(os.listdir(LEVELS_DIR)):
        if filename.endswith('.json'):
            path = os.path.join(LEVELS_DIR, filename)
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                num_match = re.search(r'level_(\d+)', filename)
                if num_match:
                    num_key = num_match.group(1)
                    levels_data[num_key] = data

    levels_json_str = json.dumps(levels_data, indent=2, ensure_ascii=False)

    # 2. Read style.css
    style_path = os.path.join(ROOT_DIR, 'style.css')
    with open(style_path, 'r', encoding='utf-8') as f:
        style_content = f.read()

    # 3. Read JS files and strip import/export
    js_files = [
        os.path.join(ROOT_DIR, 'engine', 'GameState.js'),
        os.path.join(ROOT_DIR, 'engine', 'GameRules.js'),
        os.path.join(ROOT_DIR, 'engine', 'CommandHistory.js'),
        os.path.join(ROOT_DIR, 'engine', 'AudioManager.js'),
        os.path.join(ROOT_DIR, 'engine', 'LevelLoader.js'),
        os.path.join(ROOT_DIR, 'renderer', 'IsometricRenderer.js'),
        os.path.join(ROOT_DIR, 'ui', 'InputHandler.js'),
        os.path.join(ROOT_DIR, 'ui', 'Tutorial.js'),
        os.path.join(ROOT_DIR, 'ui', 'main.js'),
    ]

    bundled_js = []
    bundled_js.append(f"const EMBEDDED_LEVELS = {levels_json_str};\n")

    for file_path in js_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Remove import statements
            content = re.sub(r'import\s+.*?from\s+[\'"].*?[\'"];?\n?', '', content)
            # Remove export keywords
            content = re.sub(r'export\s+(const|class|let|var|function|default)\s+', r'\1 ', content)
            content = re.sub(r'export\s+default\s+', '', content)
            bundled_js.append(f"// --- {os.path.basename(file_path)} ---\n" + content + "\n")

    full_js_content = "\n".join(bundled_js)

    # 4. Read index.html template and inject CSS & JS
    index_path = os.path.join(ROOT_DIR, 'index.html')
    with open(index_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Replace <link rel="stylesheet" href="style.css"> with inline <style>
    style_tag = f'<style>\n{style_content}\n</style>'
    html_content = re.sub(
        r'<link\s+rel=[\'"]stylesheet[\'"]\s+href=[\'"]style\.css[\'"]\s*\/?>',
        lambda m: style_tag,
        html_content
    )

    # Replace <script type="module" src="ui/main.js"></script> with inline <script>
    script_tag = f'<script>\n(function() {{\n{full_js_content}\n}})();\n</script>'
    html_content = re.sub(
        r'<script\s+type=[\'"]module[\'"]\s+src=[\'"]ui/main\.js[\'"]\s*><\/script>',
        lambda m: script_tag,
        html_content
    )

    # Save to dist/WorldRestaurant.html
    dist_html_path = os.path.join(DIST_DIR, 'WorldRestaurant.html')
    with open(dist_html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"Created: {dist_html_path}")

    # Also save to root as WorldRestaurant_Standalone.html for easy access
    root_standalone_path = os.path.join(ROOT_DIR, 'WorldRestaurant_Standalone.html')
    with open(root_standalone_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"Created: {root_standalone_path}")

    return dist_html_path, root_standalone_path

def create_readme():
    readme_content = """============================================================
              WORLD RESTAURANT PUZZLE GAME (20 LEVELS)
============================================================

CÁCH CHƠI / HƯỚNG DẪN:
------------------------------------------------------------
1. CÁCH MỞ GAME NHANH NHẤT (Không cần cài đặt gì cả):
   - Mở trực tiếp file "WorldRestaurant.html" bằng bất kỳ trình duyệt nào
     (Chrome, Edge, Firefox, Safari, Cốc Cốc trên máy tính hoặc điện thoại).
   - Hoặc click đúp file "Run_Game.bat" nếu bạn dùng Windows.

2. PHÍM ĐIỀU KHIỂN:
   - Máy tính: Phím mũi tên hoặc W A S D. Lên/W = đi chéo lên-phải, Phải/D = chéo xuống-phải, Xuống/S = chéo xuống-trái, Trái/A = chéo lên-trái.
   - Điện thoại: Vuốt chéo theo hướng muốn đi, hoặc bấm D-pad chéo ở góc màn hình.
   - Nút "Undo": Quay lại tối đa 3 nước đi trước đó.
   - Nút "Levels": Mở menu chọn nhanh từ Level 1 đến Level 20.
   - Nút "View Board": Xem lại bàn cờ khi thua/thắng để tìm hiểu nguyên nhân.

3. QUY TẮC TRÒ CHƠI:
   - Mục tiêu: Di chuyển và phân chia tòa nhà nhà hàng sao cho toàn bộ footprint
     phủ kín và khớp chính xác 100% vào các ô mục tiêu vàng (Target / Blueprint).
   - Stage Limit (Giới hạn tầng): Mỗi bước đi, các nhà hàng sẽ lần lượt tăng 1 tầng.
     Khi đạt đến giới hạn Stage Limit, nhà hàng sẽ phân chia làm đôi,
     chia đôi số tầng cho 2 khối mới!
   - Ô đường đi (Road): Vùng đặt món phục vụ phụ thuộc vào vị trí cạnh viền bản đồ
     hoặc nằm cạnh đường đi màu xám.

Chúc các bạn chơi game vui vẻ và vượt qua được cả 20 Level (đặc biệt là các màn Super Hard L14, L17, L20)!
"""
    readme_path = os.path.join(DIST_DIR, 'HUONG_DAN_CHOI.txt')
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    return readme_path

def create_bat_runner():
    bat_content = """@echo off
start "" "WorldRestaurant.html"
"""
    bat_path = os.path.join(DIST_DIR, 'Run_Game.bat')
    with open(bat_path, 'w', encoding='utf-8') as f:
        f.write(bat_content)
    return bat_path

def package_zip():
    print("Creating ZIP release...")
    zip_path = os.path.join(DIST_DIR, 'WorldRestaurant_Game_v1.0.zip')
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add standalone html
        dist_html = os.path.join(DIST_DIR, 'WorldRestaurant.html')
        zipf.write(dist_html, 'WorldRestaurant.html')
        
        # Add readme
        readme = os.path.join(DIST_DIR, 'HUONG_DAN_CHOI.txt')
        zipf.write(readme, 'HUONG_DAN_CHOI.txt')
        
        # Add bat
        bat = os.path.join(DIST_DIR, 'Run_Game.bat')
        zipf.write(bat, 'Run_Game.bat')
        
        # Add full source folder inside zip
        for root, dirs, files in os.walk(ROOT_DIR):
            # Skip dist, tools, git
            if 'dist' in root or '.git' in root or '__pycache__' in root:
                continue
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                zipf.write(full_path, os.path.join('Web_Source', rel_path))

    print(f"Created ZIP: {zip_path}")
    return zip_path

if __name__ == '__main__':
    build_standalone_html()
    create_readme()
    create_bat_runner()
    package_zip()
    print("Build and packaging completed successfully!")
