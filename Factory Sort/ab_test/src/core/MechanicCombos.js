import { validateBlockerLevel } from './BlockerRules.js';

const COMBO_TYPES = new Set(['combo-key', 'combo-sticky-oneway', 'combo-hidden-urgent',
    'combo-connector-queue', 'combo-frozen-colors', 'combo-stuck-priority']);
const EMPTY_VIEW = () => ({ badges: [], concealed: false, hiddenSlots: [], frozenSlots: [], blocked: false, queueHeld: false });

/** Installed after BlockerRules: every captured ordinary method retains blocker semantics. */
export function installMechanicCombos(engine) {
    if (engine._mechanicCombosInstalled) return;
    engine._mechanicCombosInstalled = true;
    const names = ['startLevel', 'startClock', 'advanceClock', 'moveItem', 'selectSource',
        'getValidTargets', 'moveBoxToQueue', 'findQueueMatch', 'deliverQueueBox', 'completeTrayExit',
        'startDragWrappedBox', 'dropOnTray', 'checkConditions', 'shuffleItems', 'removeTray',
        'addExtraTray', 'getBox', 'isAccessible', 'canMoveBlockerItem', 'canDispatchBlockerBox',
        'canQueueBlockerBox', 'getBlockerView'];
    const original = {};
    for (const name of names) original[name] = engine[name];
    const inactive = () => ({ enabled: false, type: null, viewSignature: '' });
    let prioritySuspension = 0, pairing = false;
    engine.mechanicComboState = inactive();
    engine.lastComboError = '';
    engine.onComboUpdated = null;
    const state = () => engine.mechanicComboState;
    const active = () => !!state()?.enabled;
    const box = id => original.getBox.call(engine, id);
    const boardBox = id => { const b = box(id); return b && engine.boxes.includes(b) ? b : null; };
    const accessible = id => original.isAccessible.call(engine, id);
    const baseView = id => original.getBlockerView ? original.getBlockerView.call(engine, id) : EMPTY_VIEW();
    const deny = message => {
        engine.lastComboError = message;
        engine.lastBlockerError = message;
        return false;
    };
    const boosterDeny = message => {
        deny(message);
        return engine._boosterFail(message);
    };
    const seconds = value => Math.ceil(Math.max(0, (value || 0) - 1e-9));

    function validate(level) {
        const spec = level?.mechanicCombo;
        if (spec == null) return null;
        const fail = message => { throw new Error(`Invalid mechanic combo: ${message}`); };
        if (!level || !Array.isArray(level.boxes) || !Array.isArray(level.trays) ||
            !COMBO_TYPES.has(spec.type) || !level.layout || !Array.isArray(level.layout.columns)) {
            fail('supported type, boxes, trays, and columns are required.');
        }
        if (level.blockers !== undefined && !Array.isArray(level.blockers)) fail('blockers must be an array.');
        const blockers = level.blockers || [];
        if (blockers.length) validateBlockerLevel(level);
        const count = level.boxes.length;
        const real = id => Number.isInteger(id) && id >= 0 && id < count;
        const record = (type, id) => blockers.find(r => r.type === type &&
            (r.boxId === id || (Array.isArray(r.boxIds) && r.boxIds.includes(id))));
        const occupied = ref => ref && real(ref.boxId) && Number.isInteger(ref.slot) && ref.slot >= 0 &&
            ref.slot < level.boxes[ref.boxId].items.length;
        for (let id = 0; id < count; id++) {
            const items = level.boxes[id]?.items;
            if (!Array.isArray(items) || items.length > 3 || items.some(item => typeof item !== 'string' || !item)) {
                fail(`box ${id} has invalid items.`);
            }
            if (!items.length && !record('stuck', id)) fail('only a stuck box may initially be empty.');
            if (items.length === 3 && items.every(item => item === items[0])) fail('boxes must not initially be wrapped.');
        }
        const flat = level.layout.columns.flat();
        if (level.layout.columns.some(column => !Array.isArray(column)) || flat.length !== count ||
            new Set(flat).size !== count || flat.some(id => !real(id)) ||
            Array.from({ length: count }, (_, id) => id).some(id => !flat.includes(id))) {
            fail('columns must uniquely contain every numeric box ID.');
        }
        const expected = new Map();
        for (const tray of level.trays) {
            if (!tray || typeof tray.targetItemId !== 'string') fail('every order needs a target item.');
            expected.set(tray.targetItemId, (expected.get(tray.targetItemId) || 0) + 3);
        }
        const inventory = new Map();
        for (const data of level.boxes) for (const item of data.items) inventory.set(item, (inventory.get(item) || 0) + 1);
        if (expected.size !== inventory.size || [...expected].some(([item, total]) => inventory.get(item) !== total)) {
            fail('each item type must total exactly three per matching order.');
        }
        for (const b of blockers) if (Object.prototype.hasOwnProperty.call(b, 'duration') &&
            (!Number.isFinite(b.duration) || b.duration <= 0)) fail('timers must be finite and positive.');
        if (level.rules?.timeToPlay !== undefined && (!Number.isFinite(level.rules.timeToPlay) || level.rules.timeToPlay <= 0)) {
            fail('the level timer must be finite and positive.');
        }
        const visibleRows = level.layout?.visibleRows;
        if (!Number.isInteger(visibleRows) || visibleRows <= 0) fail('layout.visibleRows must be a positive integer.');
        const traysSeen = new Set();
        for (const tray of level.trays) {
            if (!tray || !(typeof tray.id === 'string' || (typeof tray.id === 'number' && Number.isFinite(tray.id))) ||
                traysSeen.has(String(tray.id))) fail('every tray needs a unique valid string or number ID.');
            traysSeen.add(String(tray.id));
        }
        const next = { enabled: true, type: spec.type, label: spec.label || spec.type, viewSignature: '' };
        if (spec.type === 'combo-key') {
            const lock = record('locked', spec.lockedBoxId);
            if (!real(spec.keyBoxId) || !real(spec.lockedBoxId) || spec.keyBoxId === spec.lockedBoxId ||
                !lock || lock.boxId !== spec.lockedBoxId || lock.dependsOnBoxId !== spec.keyBoxId) {
                fail('the key and locked box must match their numeric blocker dependency.');
            }
            Object.assign(next, { keyBoxId: spec.keyBoxId, lockedBoxId: spec.lockedBoxId, keyUsed: false });
        } else if (spec.type === 'combo-sticky-oneway') {
            const sticky = spec.sticky;
            if (!sticky || !real(sticky.boxId) || !Array.isArray(sticky.slots) || sticky.slots.length !== 2 ||
                sticky.slots[0] === sticky.slots[1] || !occupied({ boxId: sticky.boxId, slot: sticky.slots[0] }) ||
                !occupied({ boxId: sticky.boxId, slot: sticky.slots[1] }) || !real(spec.oneWayBoxId) ||
                spec.oneWayBoxId === sticky.boxId) fail('sticky needs two occupied slots and a distinct one-way box.');
            const items = level.boxes[sticky.boxId].items;
            if (items[sticky.slots[0]] !== items[sticky.slots[1]]) fail('paired items must have the same type.');
            Object.assign(next, { oneWayBoxId: spec.oneWayBoxId,
                pair: { boxId: sticky.boxId, slots: sticky.slots.slice(), itemId: items[sticky.slots[0]], active: true, status: 'linked' } });
        } else if (spec.type === 'combo-hidden-urgent') {
            if (!real(spec.urgentBoxId) || !Number.isFinite(spec.duration) || spec.duration <= 0 ||
                record('hidden-box', spec.urgentBoxId)?.boxId !== spec.urgentBoxId) {
                fail('urgency needs its real hidden box and a finite positive duration.');
            }
            next.urgent = { boxId: spec.urgentBoxId, duration: spec.duration, remaining: spec.duration,
                activated: false, completed: false, status: 'waiting' };
        } else if (spec.type === 'combo-connector-queue') {
            const ids = spec.boxIds, linked = record('connector', ids?.[0]);
            if (!Number.isInteger(spec.queueCapacity) || spec.queueCapacity < 2 || !Array.isArray(ids) || ids.length !== 2 ||
                !ids.every(real) || ids[0] === ids[1] || !linked || !Array.isArray(linked.boxIds) ||
                linked.boxIds.length !== 2 || !linked.boxIds.every(real) ||
                linked.boxIds.slice().sort((a, b) => a - b).join(',') !== ids.slice().sort((a, b) => a - b).join(',')) {
                fail('connector capacity and two distinct numeric blocker IDs are required.');
            }
            Object.assign(next, { queueCapacity: spec.queueCapacity, connectorBoxIds: ids.slice() });
        } else if (spec.type === 'combo-frozen-colors') {
            if (!Number.isFinite(spec.swapAt) || spec.swapAt <= 0 || !occupied(spec.first) || !occupied(spec.second) ||
                (spec.first.boxId === spec.second.boxId && spec.first.slot === spec.second.slot)) {
                fail('color swap needs two occupied physical tokens and a finite positive time.');
            }
            const a = level.boxes[spec.first.boxId].items[spec.first.slot];
            const b = level.boxes[spec.second.boxId].items[spec.second.slot];
            if (a === b) fail('the initial swap must exchange different item types.');
            next.swap = { at: spec.swapAt, remaining: spec.swapAt, started: false, status: 'pending',
                tooltip: spec.tooltip || 'đổi loại sau 4 giây', tokens: [
                    { id: 'first', boxId: spec.first.boxId, slot: spec.first.slot, itemId: a },
                    { id: 'second', boxId: spec.second.boxId, slot: spec.second.slot, itemId: b }
                ] };
        } else {
            const tray = level.trays.find(t => String(t.id) === String(spec.priorityTrayId));
            if (!real(spec.stuckBoxId) || record('stuck', spec.stuckBoxId)?.boxId !== spec.stuckBoxId ||
                !tray || tray.targetItemId !== spec.priorityItemId) fail('priority needs its actual stuck box and matching tray.');
            next.priority = { stuckBoxId: spec.stuckBoxId, trayId: spec.priorityTrayId,
                itemId: spec.priorityItemId, gateOpen: false, fulfilled: false };
        }
        return next;
    }

    function syncPriority() {
        if (state().type !== 'combo-stuck-priority') return;
        const p = state().priority, r = engine.blockerState?.records?.get(p.stuckBoxId);
        if (r?.released && !box(p.stuckBoxId)) p.gateOpen = true;
    }
    engine.getMechanicComboView = function() {
        if (!active()) return { enabled: false, type: null };
        const s = state(), view = { enabled: true, type: s.type, label: s.label };
        if (s.type === 'combo-key') Object.assign(view, { keyBoxId: s.keyBoxId, lockedBoxId: s.lockedBoxId, keyUsed: s.keyUsed });
        if (s.pair) view.sticky = { ...s.pair, slots: s.pair.slots.slice() };
        if (s.type === 'combo-sticky-oneway') view.oneWayBoxId = s.oneWayBoxId;
        if (s.urgent) view.urgent = { ...s.urgent, remaining: seconds(s.urgent.remaining) };
        if (s.type === 'combo-connector-queue') view.queueCapacity = engine.maxQueueSize;
        if (s.swap) view.swap = { at: s.swap.at, remaining: seconds(s.swap.remaining), started: s.swap.started,
            status: s.swap.status, tooltip: s.swap.status === 'pending' ? s.swap.tooltip :
                s.swap.status === 'completed' ? 'đã đổi loại' : 'đã hủy đổi loại',
            tokens: s.swap.tokens.map(token => ({ ...token })) };
        if (s.priority) view.priority = { ...s.priority };
        return view;
    };
    engine.getComboView = engine.getMechanicComboView;
    function notify(force = false) {
        if (!active()) return;
        const s = state(), signature = JSON.stringify({ type: s.type, keyUsed: s.keyUsed, pair: s.pair,
            urgent: s.urgent && [s.urgent.status, s.urgent.activated, s.urgent.completed, seconds(s.urgent.remaining)],
            capacity: s.type === 'combo-connector-queue' ? engine.maxQueueSize : null,
            swap: s.swap && [s.swap.status, s.swap.started, seconds(s.swap.remaining), s.swap.tokens],
            priority: s.priority, queue: engine.queue.map(b => b.id), columns: engine.columns });
        if (!force && signature === s.viewSignature) return;
        s.viewSignature = signature;
        if (engine.onComboUpdated) engine.onComboUpdated(engine.getMechanicComboView());
        else if (engine.onBlockerUpdated) engine.onBlockerUpdated(engine.blockerState);
    }
    function playStarted() {
        return engine.clockStarted || engine.moveCount > 0 || !!engine.selectedSource;
    }
    function refresh() {
        if (!active()) return;
        const s = state();
        if (s.type === 'combo-key') {
            const r = engine.blockerState?.records?.get(s.lockedBoxId);
            if (r?.unlocked || engine.blockerState?.shipped?.has(s.keyBoxId)) s.keyUsed = true;
        }
        if (s.priority) syncPriority();
        if (engine.gameState === 'PLAYING' && playStarted()) {
            if (s.urgent && !s.urgent.completed && !s.urgent.activated && accessible(s.urgent.boxId)) {
                Object.assign(s.urgent, { activated: true, status: 'ticking', remaining: s.urgent.duration });
            }
            if (s.swap?.status === 'pending') s.swap.started = true;
        }
        notify();
    }

    engine.startLevel = function(levelConfig) {
        const beforeState = state();
        const prepared = validate(levelConfig); // Deliberately before every engine mutation.
        if (!engine._mechanicComboDefaults) {
            engine._mechanicComboDefaults = { maxQueueSize: engine.maxQueueSize, onQueueUpdated: engine.onQueueUpdated };
        }
        if (!prepared) {
            engine.mechanicComboState = inactive();
            engine.lastComboError = '';
            prioritySuspension = 0; pairing = false;
            try {
                return original.startLevel.call(engine, levelConfig);
            } catch (error) {
                engine.mechanicComboState = beforeState;
                throw error;
            }
        }
        const beforeQueueSize = engine.maxQueueSize, queueCallback = engine.onQueueUpdated;
        if (prepared.type === 'combo-connector-queue') {
            engine.onQueueUpdated = function(queue) {
                engine.maxQueueSize = prepared.queueCapacity;
                if (queueCallback) queueCallback.call(engine, queue);
            };
        }
        engine.mechanicComboState = prepared;
        engine.lastComboError = '';
        prioritySuspension = 0; pairing = false;
        try {
            const result = original.startLevel.call(engine, levelConfig);
            refresh(); notify(true);
            return result;
        } catch (error) {
            engine.mechanicComboState = beforeState;
            engine.onQueueUpdated = queueCallback;
            if (beforeState?.enabled && beforeState.type === 'combo-connector-queue') engine.maxQueueSize = beforeQueueSize;
            else engine.maxQueueSize = engine._mechanicComboDefaults.maxQueueSize;
            throw error;
        } finally {
            engine.onQueueUpdated = queueCallback;
            if (state()?.enabled && state().type === 'combo-connector-queue') {
                engine.maxQueueSize = state().queueCapacity;
                if (queueCallback) queueCallback.call(engine, engine.queue);
            }
        }
    };
    engine.startClock = function() {
        const result = original.startClock.call(engine);
        if (active()) refresh();
        return result;
    };
    function sourceLegal(sourceId, slot) {
        const source = boardBox(sourceId), view = source ? baseView(source.id) : EMPTY_VIEW();
        return engine.gameState === 'PLAYING' && source && !source.isWrapped && !source.isEmpty() && accessible(source.id) &&
            Number.isInteger(slot) && slot >= 0 && slot < source.slots.length && source.slots[slot] != null &&
            !view.blocked && !(view.frozenSlots || []).map(Number).includes(slot) &&
            !(state().type === 'combo-sticky-oneway' && source.id === state().oneWayBoxId);
    }
    function ordinaryMoveAllowed(sourceId, slot, targetId, targetSlot = null) {
        if (!sourceLegal(sourceId, slot)) return false;
        const target = boardBox(targetId);
        if (!target || target.id === Number(sourceId) || target.isWrapped || !accessible(target.id) ||
            !target.canAccept(targetSlot) || baseView(target.id).blocked) return false;
        return !engine.blockerState?.enabled || !!original.canMoveBlockerItem.call(engine, sourceId, slot, targetId, targetSlot);
    }
    function pairSource(id, slot) {
        const p = state().pair;
        return state().type === 'combo-sticky-oneway' && p?.active && p.boxId === Number(id) && p.slots.includes(slot);
    }
    engine.canMoveBlockerItem = function(sourceId, slot, targetId, targetSlot = null) {
        if (!active()) return original.canMoveBlockerItem.call(engine, sourceId, slot, targetId, targetSlot);
        if (arguments.length < 3 || targetId === undefined) return sourceLegal(Number(sourceId), slot);
        if (!ordinaryMoveAllowed(Number(sourceId), slot, Number(targetId), targetSlot)) return false;
        if (pairSource(sourceId, slot)) {
            const target = boardBox(targetId), free = target.slots.map((v, i) => v == null ? i : -1).filter(i => i >= 0);
            return free.length >= 2 && (targetSlot === null || free.includes(targetSlot));
        }
        return true;
    };
    engine.selectSource = function(id, slot) {
        if (!active()) return original.selectSource.call(engine, id, slot);
        if (state().type === 'combo-sticky-oneway' && Number(id) === state().oneWayBoxId) {
            return deny('Hộp một chiều chỉ nhận vật, không thể lấy vật ra.');
        }
        const result = original.selectSource.call(engine, id, slot);
        if (result) { engine.lastComboError = ''; engine.lastBlockerError = ''; }
        refresh(); return result;
    };
    engine.getValidTargets = function(id) {
        if (!active() || state().type !== 'combo-sticky-oneway') return original.getValidTargets.call(engine, id);
        const source = boardBox(id);
        if (!source || source.id === state().oneWayBoxId || source.isWrapped || source.isEmpty()) return [];
        const selected = engine.selectedSource?.boxId === source.id ? engine.selectedSource.itemIndex : null;
        const slots = selected === null ? source.slots.map((v, i) => v != null ? i : -1).filter(i => i >= 0) : [selected];
        return engine.boxes.filter(target => target !== source && slots.some(slot => {
            if (!ordinaryMoveAllowed(source.id, slot, target.id, null)) return false;
            return !pairSource(source.id, slot) || target.slots.filter(v => v == null).length >= 2;
        })).map(target => target.id);
    };
    function movePair(sourceId, sourceSlot, targetId, targetSlot) {
        if (pairing) return deny('Thao tác cặp dính đang được xử lý.');
        const p = state().pair, source = boardBox(sourceId), target = boardBox(targetId);
        if (!source || !target || !ordinaryMoveAllowed(sourceId, sourceSlot, targetId, null)) {
            return deny('Cặp dính phải di chuyển nguyên cặp giữa hai hộp hợp lệ.');
        }
        const free = target.slots.map((v, i) => v == null ? i : -1).filter(i => i >= 0);
        if (free.length < 2 || (targetSlot !== null && (!Number.isInteger(targetSlot) || !free.includes(targetSlot)))) {
            return deny('Cặp dính cần đúng hai ô trống ở hộp đích.');
        }
        const landings = targetSlot === null ? free.slice(0, 2) : [targetSlot, free.find(i => i !== targetSlot)];
        const pairSlots = [sourceSlot, p.slots.find(i => i !== sourceSlot)];
        const participants = [...new Set([...engine.boxes, ...engine.queue])];
        const snap = { boxes: engine.boxes.slice(), queue: engine.queue.slice(), columns: engine.columns.map(c => c.slice()),
            slots: participants.map(b => ({ b, slots: b.slots.slice(), wrapped: b.isWrapped })),
            selected: engine.selectedSource ? { ...engine.selectedSource } : null, moves: engine.moveCount,
            gameState: engine.gameState, loseReason: engine.loseReason, clock: engine.clockStarted, dragged: engine.draggedBoxId };
        const cb = { box: engine.onBoxUpdated, wrapped: engine.onBoxWrapped, moves: engine.onMoveCountUpdated };
        const savedCheck = engine.checkConditions, events = [], wrapped = [];
        let success = false; pairing = true;
        engine.onBoxUpdated = (...args) => events.push(args);
        engine.onBoxWrapped = b => { if (!wrapped.includes(b)) wrapped.push(b); }; // Also suppresses headless auto-delivery.
        engine.onMoveCountUpdated = () => {};
        engine.checkConditions = () => {};
        try {
            success = !!original.moveItem.call(engine, source.id, pairSlots[0], target.id, landings[0]) &&
                !!original.moveItem.call(engine, source.id, pairSlots[1], target.id, landings[1]);
        } finally {
            engine.onBoxUpdated = cb.box; engine.onBoxWrapped = cb.wrapped;
            engine.onMoveCountUpdated = cb.moves; engine.checkConditions = savedCheck;
            if (!success) {
                engine.boxes = snap.boxes; engine.queue = snap.queue; engine.columns = snap.columns;
                engine.selectedSource = snap.selected; engine.gameState = snap.gameState;
                engine.loseReason = snap.loseReason; engine.clockStarted = snap.clock; engine.draggedBoxId = snap.dragged;
                for (const old of snap.slots) { old.b.slots = old.slots.slice(); old.b.isWrapped = old.wrapped; }
            }
            engine.moveCount = success ? snap.moves + 1 : snap.moves;
            pairing = false;
        }
        if (!success) return deny('Không thể di chuyển nguyên cặp; toàn bộ thao tác đã được hoàn tác.');
        const destinations = target.slots.map((v, i) => v != null && snap.slots.find(x => x.b === target)?.slots[i] == null ? i : -1).filter(i => i >= 0);
        p.boxId = target.id; p.slots = (destinations.length === 2 ? destinations : landings).sort((a, b) => a - b);
        p.active = !target.isWrapped; p.status = target.isWrapped ? 'packed' : 'linked';
        engine.lastComboError = ''; engine.lastBlockerError = '';
        if (cb.moves) cb.moves.call(engine, engine.moveCount);
        for (const args of events) if (cb.box) cb.box.apply(engine, args);
        for (const b of wrapped) {
            if (cb.wrapped) cb.wrapped.call(engine, b);
            else if (engine.boxes.includes(b) && b.isWrapped) engine.moveBoxToQueue(b);
        }
        if (!cb.wrapped && !engine.onTrayDelivered) while (engine.tryAutoFillTray()) {}
        refresh(); if (engine.gameState === 'PLAYING') engine.checkConditions();
        return true;
    }
    engine.moveItem = function(sourceId, slot, targetId, targetSlot = null) {
        if (!active()) return original.moveItem.call(engine, sourceId, slot, targetId, targetSlot);
        sourceId = Number(sourceId); targetId = Number(targetId);
        if (state().type === 'combo-sticky-oneway' && sourceId === state().oneWayBoxId) {
            return deny('Hộp một chiều chỉ nhận vật, không thể lấy vật ra.');
        }
        if (pairSource(sourceId, slot)) return movePair(sourceId, slot, targetId, targetSlot);
        const token = state().swap?.tokens.find(t => t.boxId === sourceId && t.slot === slot);
        const target = boardBox(targetId), before = target?.slots.slice();
        const fallback = targetSlot === null ? target?.slots.findIndex(v => v == null) : targetSlot;
        const priority = state().type === 'combo-stuck-priority';
        if (priority) prioritySuspension++;
        let result;
        try { result = original.moveItem.call(engine, sourceId, slot, targetId, targetSlot); }
        finally { if (priority) prioritySuspension--; }
        if (result && token && target) {
            const changed = target.slots.findIndex((v, i) => before[i] == null && v != null);
            token.boxId = target.id; token.slot = changed >= 0 ? changed : fallback;
        }
        if (result) { engine.lastComboError = ''; engine.lastBlockerError = ''; }
        refresh(); if (priority && result) engine.checkConditions();
        return result;
    };
    function priorityBox(b) {
        const p = state().priority;
        return !!b && b.items.length > 0 && b.items.every(item => item === p.itemId);
    }
    function priorityAllows(b, tray) {
        syncPriority(); const p = state().priority;
        const isBox = priorityBox(b), isTray = tray && String(tray.id) === String(p.trayId);
        if (!p.gateOpen) return !(isBox && (isTray || tray?.targetItemId === p.itemId));
        return p.fulfilled || (isBox && isTray && tray.targetItemId === p.itemId);
    }
    function priorityDelivered(b, tray) {
        const p = state().priority;
        if (p.gateOpen && !p.fulfilled && priorityBox(b) && String(tray.id) === String(p.trayId)) p.fulfilled = true;
    }
    engine.moveBoxToQueue = function(boxOrId) {
        if (!active()) return original.moveBoxToQueue.call(engine, boxOrId);
        if (boxOrId && typeof boxOrId === 'object' && box(boxOrId.id) !== boxOrId) return deny('Hộp không còn thuộc bàn chơi hiện tại.');
        const id = boxOrId && typeof boxOrId === 'object' ? boxOrId.id : boxOrId;
        const priority = state().type === 'combo-stuck-priority';
        const delivered = engine.onTrayDelivered;
        if (priority) prioritySuspension++;
        let result;
        try {
            // Force queue entry in headless mode too; auto-fill below is gated, unlike core's direct delivery shortcut.
            if (priority && !delivered) engine.onTrayDelivered = () => {};
            result = original.moveBoxToQueue.call(engine, boxOrId);
        } finally {
            engine.onTrayDelivered = delivered;
            if (priority) prioritySuspension--;
        }
        if (result && state().urgent && Number(id) === state().urgent.boxId && !state().urgent.completed &&
            engine.queue.some(b => b.id === Number(id))) {
            Object.assign(state().urgent, { completed: true, status: 'completed', remaining: 0 });
        }
        if (result && priority && !delivered) while (engine.tryAutoFillTray()) {}
        if (result) { engine.lastComboError = ''; engine.lastBlockerError = ''; }
        refresh(); if (priority && result) engine.checkConditions();
        return result;
    };
    engine.canDispatchBlockerBox = function(id) {
        if (!active()) return original.canDispatchBlockerBox.call(engine, id);
        if (!original.canDispatchBlockerBox.call(engine, id)) return false;
        if (state().type !== 'combo-stuck-priority') return true;
        syncPriority(); const p = state().priority, b = box(id);
        return p.gateOpen ? (p.fulfilled || priorityBox(b)) : !priorityBox(b);
    };
    engine.findQueueMatch = function() {
        if (!active() || state().type !== 'combo-stuck-priority') return original.findQueueMatch.call(engine);
        const trays = engine.conveyor.getAllActiveTrays();
        for (const b of engine.queue) {
            if (!original.canDispatchBlockerBox.call(engine, b.id)) continue;
            for (const tray of trays) if (tray.canAccept(b) && priorityAllows(b, tray)) return { box: b, tray };
        }
        return null;
    };
    engine.deliverQueueBox = function(boxId, trayId) {
        if (!active()) return original.deliverQueueBox.call(engine, boxId, trayId);
        const b = box(boxId), tray = engine.conveyor.getAllActiveTrays().find(t => String(t.id) === String(trayId));
        const priority = state().type === 'combo-stuck-priority';
        if (priority && (!b || !tray || !original.canDispatchBlockerBox.call(engine, boxId))) return deny('Hộp chờ không hợp lệ để giao.');
        if (priority && !priorityAllows(b, tray)) return deny('Đơn ưu tiên chưa mở hoặc các đơn khác phải tiếp tục chờ.');
        if (priority) prioritySuspension++;
        let result;
        try { result = original.deliverQueueBox.call(engine, boxId, trayId); }
        finally { if (priority) prioritySuspension--; }
        if (result && priority) priorityDelivered(b, tray);
        refresh(); if (priority && result) engine.checkConditions();
        return result;
    };
    engine.startDragWrappedBox = function(id) {
        if (active() && state().urgent && Number(id) === state().urgent.boxId) return deny('Hộp khẩn cấp phải đi vào hàng chờ.');
        return original.startDragWrappedBox.call(engine, id);
    };
    engine.dropOnTray = function(trayId) {
        if (!active()) return original.dropOnTray.call(engine, trayId);
        const b = engine.draggedBoxId === null ? null : box(engine.draggedBoxId);
        if (state().urgent && b?.id === state().urgent.boxId) return deny('Hộp khẩn cấp phải đi vào hàng chờ.');
        const tray = engine.conveyor.getAllActiveTrays().find(t => String(t.id) === String(trayId));
        const priority = state().type === 'combo-stuck-priority';
        if (priority && (!b || !tray || !priorityAllows(b, tray))) return deny('Khay ưu tiên đang khóa hoặc đơn khác phải chờ.');
        if (priority) prioritySuspension++;
        let result;
        try { result = original.dropOnTray.call(engine, trayId); }
        finally { if (priority) prioritySuspension--; }
        if (result && priority) priorityDelivered(b, tray);
        refresh(); if (priority && result) engine.checkConditions();
        return result;
    };
    engine.completeTrayExit = function(trayId) {
        if (!active()) return original.completeTrayExit.call(engine, trayId);
        const priority = state().type === 'combo-stuck-priority';
        if (priority) prioritySuspension++;
        try { return original.completeTrayExit.call(engine, trayId); }
        finally {
            if (priority) prioritySuspension--;
            refresh(); if (priority) engine.checkConditions();
        }
    };
    function colorSwap() {
        const swap = state().swap;
        if (!swap || swap.status !== 'pending') return;
        const found = swap.tokens.map(token => {
            const b = boardBox(token.boxId);
            return b && !b.isWrapped && b.slots[token.slot] === token.itemId ? { token, b } : null;
        });
        if (found.some(x => !x) || (found[0].b === found[1].b && found[0].token.slot === found[1].token.slot)) {
            swap.status = 'cancelled'; swap.remaining = 0; return;
        }
        const a = found[0], b = found[1];
        const av = a.b.slots[a.token.slot], bv = b.b.slots[b.token.slot];
        a.b.slots[a.token.slot] = bv; b.b.slots[b.token.slot] = av;
        a.token.itemId = bv; b.token.itemId = av;
        swap.status = 'completed'; swap.remaining = 0;
        const wrapped = [];
        for (const affected of [...new Set(found.map(x => x.b))]) {
            const didWrap = affected.checkWrapped();
            if (engine.onBoxUpdated) engine.onBoxUpdated(affected);
            if (didWrap) wrapped.push(affected);
        }
        for (const b of wrapped) {
            if (engine.onBoxWrapped) engine.onBoxWrapped(b);
            else if (engine.boxes.includes(b)) engine.moveBoxToQueue(b);
        }
        if (!engine.onBoxWrapped && !engine.onTrayDelivered) while (engine.tryAutoFillTray()) {}
    }
    function expiry() {
        let value = Infinity;
        if (state().urgent?.activated && !state().urgent.completed && state().urgent.status === 'ticking') value = state().urgent.remaining;
        if (state().swap?.started && state().swap.status === 'pending') value = Math.min(value, state().swap.remaining);
        return value;
    }
    function tick(delta) {
        const urgent = state().urgent;
        if (urgent?.activated && !urgent.completed && urgent.status === 'ticking') {
            urgent.remaining = Math.max(0, urgent.remaining - delta);
            if (urgent.remaining <= 1e-9 && engine.gameState === 'PLAYING') {
                urgent.remaining = 0; urgent.status = 'expired';
                engine.loseReason = 'Hết giờ khẩn cấp! Hộp ẩn chưa được đưa vào hàng chờ.';
                engine.setGameState('LOST');
            }
        }
        const swap = state().swap;
        if (engine.gameState === 'PLAYING' && swap?.started && swap.status === 'pending') {
            swap.remaining = Math.max(0, swap.remaining - delta);
            if (swap.remaining <= 1e-9) colorSwap();
        }
    }
    engine.advanceClock = function(delta) {
        if (!active()) return original.advanceClock.call(engine, delta);
        if (engine.gameState !== 'PLAYING' || !engine.clockStarted || !Number.isFinite(delta) || delta <= 0) return;
        refresh();
        for (let i = 0; i < 512 && delta > 1e-9 && engine.gameState === 'PLAYING'; i++) {
            let next = expiry();
            if (next <= 1e-9) { tick(0); refresh(); next = expiry(); if (next <= 1e-9 || engine.gameState !== 'PLAYING') break; }
            const step = Math.min(delta, next);
            if (!(step > 1e-9)) break;
            original.advanceClock.call(engine, step); // Core already gates on global pause; blocker-local timers must still advance.
            if (engine.gameState === 'PLAYING') tick(step);
            delta -= step; refresh();
        }
        refresh(); if (engine.gameState === 'PLAYING') engine.checkConditions();
    };
    function priorityConditions() {
        if (engine.gameState !== 'PLAYING' || prioritySuspension > 0) return;
        refresh(); if (engine.hasPendingTrayExits()) return;
        const p = state().priority, r = engine.blockerState?.records?.get(p.stuckBoxId);
        if (engine.boxes.every(b => b.isEmpty()) && !engine.queue.length && r?.released && !engine.conveyor.hasRemainingTrays()) {
            engine.setGameState('WON'); return;
        }
        if (engine.queue.length > engine.maxQueueSize) { engine.loseReason = 'Hàng chờ vượt sức chứa.'; engine.setGameState('LOST'); return; }
        if (engine.findQueueMatch()) return;
        const trays = engine.conveyor.getAllActiveTrays();
        for (const b of engine.boxes) if (b.isWrapped) {
            if (original.canQueueBlockerBox.call(engine, b.id)) return;
            if (accessible(b.id) && !baseView(b.id).blocked && trays.some(t => t.canAccept(b) && priorityAllows(b, t))) return;
        }
        for (const source of engine.boxes) for (let slot = 0; slot < source.slots.length; slot++) {
            if (source.slots[slot] == null) continue;
            for (const target of engine.boxes) if (source !== target && ordinaryMoveAllowed(source.id, slot, target.id, null)) return;
        }
        engine.loseReason = 'Không còn thao tác hợp lệ trong khi đơn ưu tiên còn bị chặn.';
        engine.setGameState('LOST');
    }
    engine.checkConditions = function() {
        if (!active()) return original.checkConditions.call(engine);
        if (state().type === 'combo-stuck-priority') return priorityConditions();
        return original.checkConditions.call(engine);
    };
    engine.addExtraTray = function() {
        if (!active()) return original.addExtraTray.call(engine);
        if (state().type !== 'combo-connector-queue') { const result = original.addExtraTray.call(engine); refresh(); return result; }
        const old = engine.maxQueueSize, saved = engine.onQueueUpdated;
        engine.onQueueUpdated = function(...args) {
            engine.maxQueueSize = old + 1;
            if (saved) saved.apply(engine, args);
        };
        let result;
        try { result = original.addExtraTray.call(engine); }
        finally { engine.onQueueUpdated = saved; }
        engine.maxQueueSize = result ? old + 1 : old;
        refresh(); return result;
    };
    engine.shuffleItems = function() {
        if (active()) return boosterDeny('Không thể xáo bài ở màn cơ chế kết hợp: bộ giải cũ không hiểu luật mới.');
        return original.shuffleItems.apply(engine, arguments);
    };
    engine.removeTray = function() {
        if (active()) return boosterDeny('Không thể xóa khay ở màn cơ chế kết hợp: bộ giải cũ không hiểu luật mới.');
        return original.removeTray.apply(engine, arguments);
    };
    engine.canQueueBlockerBox = function(id) { return original.canQueueBlockerBox ? original.canQueueBlockerBox.call(engine, id) : false; };
    engine.getBlockerView = function(id) {
        const base = baseView(id) || EMPTY_VIEW();
        if (!active()) return base;
        const s = state(), numeric = Number(id), badges = [...(base.badges || [])];
        const add = text => { if (!badges.includes(text)) badges.push(text); };
        if (s.type === 'combo-key' && numeric === s.keyBoxId) add(s.keyUsed ? 'chìa khóa đã dùng' : `chìa khóa hộp ${s.lockedBoxId}`);
        if (s.pair?.boxId === numeric) add(s.pair.status === 'packed' ? 'cặp dính đã đóng gói' : 'cặp dính: di chuyển cùng nhau');
        if (s.type === 'combo-sticky-oneway' && numeric === s.oneWayBoxId) add('một chiều: chỉ nhận');
        if (s.urgent && numeric === s.urgent.boxId) add(s.urgent.completed ? 'khẩn cấp đã vào hàng chờ' : `khẩn ẩn ${seconds(s.urgent.remaining)}s`);
        if (s.type === 'combo-connector-queue' && s.connectorBoxIds.includes(numeric)) add(`hàng chờ tối đa ${engine.maxQueueSize}`);
        if (s.swap?.tokens.some(t => t.boxId === numeric)) add(s.swap.status === 'pending' ? s.swap.tooltip : s.swap.status === 'completed' ? 'đã đổi loại' : 'đã hủy đổi loại');
        if (s.priority && numeric === s.priority.stuckBoxId) add('nhả hộp để mở khay ưu tiên');
        return { ...base, badges, hiddenSlots: (base.hiddenSlots || []).map(x => typeof x === 'number' ? x : { ...x }),
            frozenSlots: (base.frozenSlots || []).map(Number), blocked: !!base.blocked,
            queueHeld: !!base.queueHeld || !!(s.priority && box(id) && engine.queue.includes(box(id)) && box(id).items.every(x => x === s.priority.itemId) && !s.priority.fulfilled),
            comboType: s.type, stickySlots: s.pair?.active && s.pair.boxId === numeric ? s.pair.slots.slice() : [],
            oneWay: s.type === 'combo-sticky-oneway' && numeric === s.oneWayBoxId,
            keyForBoxId: s.type === 'combo-key' && numeric === s.keyBoxId ? s.lockedBoxId : null };
    };
}

