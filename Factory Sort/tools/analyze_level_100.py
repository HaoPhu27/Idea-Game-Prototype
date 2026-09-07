import json
import os
from collections import Counter

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'extracted_level_100.json')
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    lvl = json.load(f)

print('=== LEVEL 100 GENERAL INFO ===')
t = lvl.get('timeToPlay', 0)
print(f'TimeToPlay: {t}s ({t // 60}m {t % 60}s)')
print('NumberCellLock:', lvl.get('numberCellLock'))
print('ItemHiden:', lvl.get('itemHiden'))
print('Mechanics count:', len(lvl.get('mechanics', [])))
print('Mechanics data:', lvl.get('mechanics'))
print('Total cells:', len(lvl['cells']))

cell_types = Counter()
move_types = Counter()
layer_counts = Counter()
locked_cells = 0
all_items = []
empty_slots = 0
item_slots = 0
coords = []
speed_counts = Counter()

for idx, cell in enumerate(lvl['cells']):
    cell_types[cell.get('cellType')] += 1
    move_types[cell.get('moveType')] += 1
    speed_counts[cell.get('speed')] += 1
    if cell.get('isLock') != 0:
        locked_cells += 1
    layers = cell.get('itemsLayer', [])
    layer_counts[len(layers)] += 1
    coords.append((cell.get('posX'), cell.get('posY')))
    for l_idx, layer in enumerate(layers):
        items = layer.get('items', [])
        for it in items:
            if it == 0:
                empty_slots += 1
            else:
                item_slots += 1
                all_items.append(it)

print('\n=== CELL TYPE BREAKDOWN ===')
type_map = {0: 'CellNormal', 1: 'CellSingle', 2: 'CellLayerCount', 3: 'CellMove'}
for ct, count in cell_types.items():
    print(f'  Type {ct} ({type_map.get(ct, "Unknown")}): {count}')

print('\n=== MOVE TYPE BREAKDOWN ===')
move_map = {0: 'Idle', 1: 'Drop', 2: 'Right', 3: 'Left', 4: 'Top', 5: 'Bot'}
for mt, count in move_types.items():
    print(f'  Move {mt} ({move_map.get(mt, "Unknown")}): {count}')

print('\n=== SPEED BREAKDOWN ===')
for sp, count in speed_counts.items():
    print(f'  Speed {sp}: {count}')

print('\n=== LAYER COUNT PER CELL ===')
for lc, count in sorted(layer_counts.items()):
    print(f'  {lc} layer(s): {count} cells')

print('\n=== ITEMS STATISTICS ===')
print(f'Total item slots: {item_slots + empty_slots}')
print(f'Empty slots (0): {empty_slots}')
print(f'Filled item slots: {item_slots}')
print(f'Total unique item types: {len(set(all_items))}')
print(f'Is total items divisible by 3?: {len(all_items) % 3 == 0} ({len(all_items)} items = {len(all_items)//3} sets of 3)')

item_counts = Counter(all_items)
print('\n=== ITEM FREQUENCY (Count per Item ID) ===')
non_triples = []
for it_id, c in sorted(item_counts.items()):
    if c % 3 != 0:
        non_triples.append((it_id, c))
    print(f'  Item ID {it_id}: {c} instances ({c // 3} sets of 3)')

if non_triples:
    print('WARNING: Items not divisible by 3:', non_triples)
else:
    print('All items are exact multiples of 3!')

xs = [c[0] for c in coords]
ys = [c[1] for c in coords]
print('\n=== COORDINATES (BOUNDS) ===')
print(f'X range: min={min(xs)}, max={max(xs)}')
print(f'Unique X: {sorted(set(xs))}')
print(f'Y range: min={min(ys)}, max={max(ys)}')
print(f'Unique Y: {sorted(set(ys))}')
print(f'Cells with isLock != 0: {locked_cells}')

print('\n=== CELL GRID POSITIONS (posX, posY, layers) ===')
for c in sorted(lvl['cells'], key=lambda x: (x['posY'], x['posX'])):
    items_preview = [layer['items'] for layer in c.get('itemsLayer', [])]
    print(f"Pos ({c['posX']:3d}, {c['posY']:3d}) | type={c['cellType']} move={c['moveType']} isLock={c['isLock']} layers={len(c['itemsLayer'])} | items={items_preview}")
