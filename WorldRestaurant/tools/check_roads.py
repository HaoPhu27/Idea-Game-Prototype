import json
import os
import re

LEVELS_DIR = r"d:\Linh tinh\WorldRestaurant\levels"

for filename in sorted(os.listdir(LEVELS_DIR)):
    if filename.endswith('.json'):
        path = os.path.join(LEVELS_DIR, filename)
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        grid = data['grid']
        h = len(grid)
        w = len(grid[0])
        
        # Find all R cells
        roads = []
        for y in range(h):
            for x in range(w):
                if grid[y][x] == 'R':
                    roads.append((x, y))
        
        if not roads:
            continue
            
        # Find connected components of R cells
        # Check if every R cell is connected to at least one edge/border of the map (x == 0 or x == w-1 or y == 0 or y == h-1)
        visited = set()
        for rx, ry in roads:
            if (rx, ry) in visited:
                continue
            # BFS component
            comp = []
            queue = [(rx, ry)]
            visited.add((rx, ry))
            touches_edge = False
            while queue:
                cx, cy = queue.pop(0)
                comp.append((cx, cy))
                if cx == 0 or cx == w - 1 or cy == 0 or cy == h - 1:
                    touches_edge = True
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and grid[ny][nx] == 'R' and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
            
            if not touches_edge:
                print(f"[{filename}] Component with {len(comp)} roads DOES NOT touch map edge! Roads: {comp}")
            else:
                print(f"[{filename}] OK ({len(comp)} roads connected to edge)")
