const BLOCKER_TYPES = new Set([
    'locked', 'frozen', 'stuck', 'defective', 'connector',
    'hidden-box', 'hidden-item', 'urgent'
]);
const blockerHas = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const blockerCloneValue = value => {
    if (Array.isArray(value)) return value.map(blockerCloneValue);
    if (value && typeof value === 'object') {
        const copy = {};
        for (const [key, nested] of Object.entries(value)) copy[key] = blockerCloneValue(nested);
        return copy;
    }
    return value;
};

/** Clone a level and convert its public nested blocker records to typed runtime records. */
export function normalizeBlockerLevel(level) {
    const copy = blockerCloneValue(level);
    if (!copy || typeof copy !== 'object' || !Array.isArray(copy.blockers)) return copy;
    const fail = message => { throw new Error(`Invalid blocker level: ${message}`); };
    const mechanicKeys = ['locked', 'frozen', 'stuck', 'defective', 'connector', 'hiddenBox', 'hiddenItems', 'urgent'];
    const normalized = [];
    const connectorGroups = new Map();
    const optionsObject = (value, mechanic) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${mechanic} needs an options object.`);
        return value;
    };
    const convert = (record, key, type, details = {}) => {
        const next = { ...record, type, ...details };
        delete next[key];
        return next;
    };
    const dependencyDetails = (value, mechanic) => {
        const options = optionsObject(value, mechanic);
        const details = {};
        if (blockerHas(options, 'shipCount')) details.shipCount = options.shipCount;
        if (blockerHas(options, 'boxId')) details.dependsOnBoxId = options.boxId;
        return details;
    };

    for (const record of copy.blockers) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
            normalized.push(record);
            continue;
        }
        const nestedKeys = mechanicKeys.filter(key => blockerHas(record, key));
        if (blockerHas(record, 'type')) {
            if (nestedKeys.length) fail('a blocker record cannot mix typed and nested mechanics.');
            normalized.push(record);
            continue;
        }
        if (nestedKeys.length > 1) fail('a nested blocker record cannot combine mechanics.');
        if (nestedKeys.length === 0) {
            normalized.push(record);
            continue;
        }
        const key = nestedKeys[0];
        if (key === 'locked' || key === 'stuck') {
            normalized.push(convert(record, key, key, dependencyDetails(record[key], key)));
        } else if (key === 'frozen') {
            if (!Array.isArray(record.frozen) || record.frozen.length !== 1) {
                fail('frozen must contain exactly one slot record in V1; multiple slots are not silently discarded.');
            }
            const frozen = optionsObject(record.frozen[0], 'frozen');
            normalized.push(convert(record, key, 'frozen', { slot: frozen.slot, duration: frozen.seconds }));
        } else if (key === 'defective') {
            const defective = optionsObject(record.defective, 'defective');
            normalized.push(convert(record, key, 'defective', { holdSeconds: defective.seconds }));
        } else if (key === 'connector') {
            const connector = optionsObject(record.connector, 'connector');
            const hasGroup = blockerHas(connector, 'group');
            const hasGroupId = blockerHas(connector, 'groupId');
            if (hasGroup === hasGroupId) fail('connector needs exactly one group ID.');
            const groupId = hasGroup ? connector.group : connector.groupId;
            if ((typeof groupId !== 'string' || groupId.length === 0) &&
                (typeof groupId !== 'number' || !Number.isFinite(groupId))) {
                fail('connector group ID must be a nonempty string or finite number.');
            }
            if (!connectorGroups.has(groupId)) connectorGroups.set(groupId, []);
            connectorGroups.get(groupId).push(record);
        } else if (key === 'hiddenBox') {
            if (record.hiddenBox !== true) fail('hiddenBox must be true when present.');
            normalized.push(convert(record, key, 'hidden-box'));
        } else if (key === 'hiddenItems') {
            if (!Array.isArray(record.hiddenItems) || record.hiddenItems.length !== 1) {
                fail('hiddenItems must contain exactly one slot in V1; multiple slots are not silently discarded.');
            }
            normalized.push(convert(record, key, 'hidden-item', { slot: record.hiddenItems[0] }));
        } else if (key === 'urgent') {
            const urgent = optionsObject(record.urgent, 'urgent');
            normalized.push(convert(record, key, 'urgent', { duration: urgent.seconds }));
        }
    }

    for (const [groupId, records] of connectorGroups) {
        if (records.length !== 2) fail(`connector group ${String(groupId)} must contain exactly two box records.`);
        normalized.push({ type: 'connector', boxIds: records.map(record => record.boxId), groupId });
    }
    copy.blockers = normalized;
    return copy;
}

/** Validate an already-normalized typed contract without modifying it. */
function validateRawBlockerLevel(levelConfig) {
    const fail = message => { throw new Error(`Invalid blocker level: ${message}`); };
    if (!levelConfig || !Array.isArray(levelConfig.boxes) || !Array.isArray(levelConfig.trays)) {
        fail('boxes and trays are required.');
    }
    if (!Array.isArray(levelConfig.blockers) || levelConfig.blockers.length === 0) {
        fail('at least one blocker record is required.');
    }

    const boxes = levelConfig.boxes;
    const realId = id => Number.isInteger(id) && id >= 0 && id < boxes.length;
    boxes.forEach((box, index) => {
        if (!box || !Array.isArray(box.items) || box.items.length > 3) fail(`box ${index} has invalid items.`);
        if (blockerHas(box, 'id') && box.id !== index) fail(`box ${index} cannot override its numeric engine ID.`);
        if (box.items.some(item => item === null || item === undefined)) fail(`box ${index} has an empty item entry.`);
    });

    const inventory = new Map();
    for (const box of boxes) for (const item of box.items) inventory.set(item, (inventory.get(item) || 0) + 1);
    const demand = new Map();
    for (const tray of levelConfig.trays) {
        if (!tray || tray.targetItemId === null || tray.targetItemId === undefined) fail('every order needs a target item.');
        demand.set(tray.targetItemId, (demand.get(tray.targetItemId) || 0) + 1);
    }
    if (inventory.size !== demand.size) fail('item types and order types differ.');
    for (const [item, count] of inventory) {
        if (!demand.has(item) || count !== demand.get(item) * 3) fail(`item ${item} does not have exactly three items per order.`);
    }

    if (levelConfig.layout !== undefined) {
        const layout = levelConfig.layout;
        if (!layout || !Array.isArray(layout.columns) || !Number.isInteger(layout.visibleRows) || layout.visibleRows <= 0) {
            fail('layout visibleRows must be a positive integer.');
        }
        const locations = layout.columns.flat();
        if (locations.length !== boxes.length || new Set(locations).size !== boxes.length || locations.some(id => !realId(id))) {
            fail('layout must contain every existing box ID exactly once.');
        }
    }

    const claims = new Map();
    const seenObjects = new Set();
    const seenRecordIds = new Set();
    const claim = (boxId, record) => {
        if (!realId(boxId)) fail(`nonexistent box ID ${boxId}.`);
        if (claims.has(boxId)) fail(`box ${boxId} combines blocker mechanics, which V1 forbids.`);
        claims.set(boxId, record);
    };

    for (const record of levelConfig.blockers) {
        if (!record || !BLOCKER_TYPES.has(record.type) || seenObjects.has(record)) fail('unknown or duplicate blocker record.');
        seenObjects.add(record);
        if (record.id !== undefined) {
            if (seenRecordIds.has(record.id)) fail(`duplicate blocker record ID ${record.id}.`);
            seenRecordIds.add(record.id);
        }
        if (record.type === 'connector') {
            if (!Array.isArray(record.boxIds) || record.boxIds.length !== 2 ||
                !realId(record.boxIds[0]) || !realId(record.boxIds[1]) || record.boxIds[0] === record.boxIds[1]) {
                fail('connector requires exactly two distinct real boxes.');
            }
            claim(record.boxIds[0], record);
            claim(record.boxIds[1], record);
            continue;
        }
        claim(record.boxId, record);
        if (record.type === 'frozen' || record.type === 'urgent') {
            if (!Number.isFinite(record.duration) || record.duration <= 0) fail(`${record.type} needs a finite positive duration.`);
        }
        if (record.type === 'defective' && (!Number.isFinite(record.holdSeconds) || record.holdSeconds <= 0)) {
            fail('defective needs a finite positive holdSeconds.');
        }
        if (record.type === 'frozen' || record.type === 'hidden-item') {
            const slot = record.slot;
            if (!Number.isInteger(slot) || slot < 0 || slot > 2 || slot >= boxes[record.boxId].items.length) {
                fail(`${record.type} requires an occupied integer slot in 0..2.`);
            }
        }
    }

    const hiddenItems = new Map();
    for (const record of levelConfig.blockers) {
        if (record.type !== 'hidden-item') continue;
        const item = boxes[record.boxId].items[record.slot];
        hiddenItems.set(item, (hiddenItems.get(item) || 0) + 1);
        if (hiddenItems.get(item) > 1) fail(`more than one hidden token exists for item ${item}.`);
    }

    const dependencyOwners = new Set();
    const dependencyTarget = new Map();
    for (const record of levelConfig.blockers) {
        if (record.type !== 'locked' && record.type !== 'stuck') continue;
        dependencyOwners.add(record);
        const aliases = ['dependsOnBoxId', 'unlockAfterBoxId'].filter(key => blockerHas(record, key));
        if (aliases.length > 1 || (blockerHas(record, 'shipCount') === (aliases.length === 1))) {
            fail(`${record.type} must specify exactly one shipCount or named box dependency.`);
        }
        if (aliases.length === 1) {
            const target = record[aliases[0]];
            if (!realId(target) || target === record.boxId || claims.get(target)?.type === 'stuck') {
                fail(`${record.type} has a missing, self, or stuck named dependency.`);
            }
            dependencyTarget.set(record, target);
        } else if (!Number.isInteger(record.shipCount) || record.shipCount < 1 || record.shipCount > levelConfig.trays.length) {
            fail(`${record.type} shipCount must be an integer from 1 through the order count.`);
        }
    }
    const visiting = new Set(), visited = new Set();
    const visit = record => {
        if (visiting.has(record)) fail('named blocker dependencies contain a cycle.');
        if (visited.has(record)) return;
        visiting.add(record);
        const target = claims.get(dependencyTarget.get(record));
        if (dependencyOwners.has(target)) visit(target);
        visiting.delete(record);
        visited.add(record);
    };
    for (const record of dependencyOwners) visit(record);

    boxes.forEach((box, index) => {
        const items = box.items;
        const wrapped = items.length === 3 && items.every(item => item === items[0]);
        if (wrapped) fail(`box ${index} starts wrapped.`);
        const record = claims.get(index);
        if (items.length === 0 && record?.type !== 'stuck') fail(`box ${index} starts empty without being its sole stuck blocker.`);
        if (record?.type === 'stuck' && items.length !== 0) fail(`stuck box ${index} must be empty.`);
    });
    return true;
}

/** Public validation accepts both nested public records and existing typed records. */
export function validateBlockerLevel(levelConfig) {
    return validateRawBlockerLevel(normalizeBlockerLevel(levelConfig));
}

export function installBlockerRules(engine) {
    if (engine._blockerRulesInstalled) return;
    engine._blockerRulesInstalled = true;
    const methodNames = [
        'startLevel', 'startClock', 'advanceClock', 'moveItem', 'selectSource',
        'getValidTargets', 'moveBoxToQueue', 'findQueueMatch', 'deliverQueueBox',
        'completeTrayExit', 'startDragWrappedBox', 'dropOnTray', 'checkConditions',
        'shuffleItems', 'removeTray', 'addExtraTray', 'getBox', 'isAccessible'
    ];
    const base = {};
    for (const name of methodNames) base[name] = engine[name];
    const disabledState = () => ({ records: new Map(), shipped: new Set(), localTime: 0, hiddenTokens: [], enabled: false });
    let mutationDepth = 0;
    let settling = false;
    let admitting = false;

    engine.blockerState = disabledState();
    engine.lastBlockerError = '';
    engine.onBlockerUpdated = null;

    const active = () => !!engine.blockerState?.enabled;
    const state = () => engine.blockerState;
    const actual = id => base.getBox.call(engine, id);
    const onBoard = box => !!box && engine.boxes.includes(box);
    const inQueue = box => !!box && engine.queue.includes(box);
    const recordOf = box => box ? state().records.get(box.id) : null;
    const allRecords = () => [...new Set(state().records.values())];
    const deny = message => { engine.lastBlockerError = message; return false; };
    const atomic = callback => {
        mutationDepth++;
        try { return callback(); } finally { mutationDepth--; }
    };

    function runtimeState(config) {
        validateRawBlockerLevel(config);
        const next = { records: new Map(), shipped: new Set(), localTime: 0, hiddenTokens: [], enabled: true, viewSignature: '' };
        for (const source of config.blockers) {
            const record = { ...source };
            if (source.boxIds) record.boxIds = source.boxIds.slice();
            if (record.type === 'locked') record.unlocked = false;
            if (record.type === 'stuck') record.released = false;
            if (record.type === 'frozen') Object.assign(record, { activated: false, thawed: false, remaining: null });
            if (record.type === 'urgent') Object.assign(record, { activated: false, completed: false, queued: false, remaining: null });
            if (record.type === 'defective') Object.assign(record, { queued: false, holdRemaining: null });
            if (record.type === 'connector') Object.assign(record, { admitted: false, admissionRequested: false });
            if (record.type === 'hidden-box') record.revealed = false;
            if (record.type === 'hidden-item') {
                next.hiddenTokens.push({
                    itemId: config.boxes[record.boxId].items[record.slot],
                    boxId: record.boxId,
                    slot: record.slot,
                    revealed: false
                });
            }
            const ids = record.type === 'connector' ? record.boxIds : [record.boxId];
            for (const id of ids) next.records.set(id, record);
        }
        return next;
    }

    function columnIndex(boxId) {
        for (const column of engine.columns || []) {
            const index = column.indexOf(boxId);
            if (index !== -1) return index;
        }
        return -1;
    }

    function guard(box) {
        if (!box) return 'That box no longer exists.';
        if (onBoard(box) && !base.isAccessible.call(engine, box.id)) return 'That box is concealed.';
        const record = recordOf(box);
        if (record?.type === 'locked' && !record.unlocked) return 'That box is still locked.';
        if (record?.type === 'stuck' && !record.released) return 'That box is stuck.';
        if (record?.type === 'hidden-box' && !record.revealed) return 'That box contents are concealed.';
        return '';
    }

    function visibleBoardBox(box) {
        return onBoard(box) && base.isAccessible.call(engine, box.id);
    }

    function notify() {
        if (!active()) return;
        const seconds = value => value === null || value === undefined ? null : Math.ceil(Math.max(0, value) - 1e-9);
        const signature = JSON.stringify({
            records: allRecords().map(record => [
                record.type, record.boxId, record.boxIds, record.unlocked, record.released,
                record.revealed, record.activated, record.thawed, record.completed,
                record.admitted, record.admissionRequested, record.queued, seconds(record.remaining), seconds(record.holdRemaining)
            ]),
            shipped: [...state().shipped].sort((a, b) => a - b),
            tokens: state().hiddenTokens.map(token => [token.itemId, token.boxId, token.slot, token.revealed]),
            columns: engine.columns || [],
            queue: engine.queue.map(box => box.id)
        });
        if (signature === state().viewSignature) return;
        state().viewSignature = signature;
        if (engine.onBlockerUpdated) engine.onBlockerUpdated(state());
    }

    function refresh() {
        if (!active()) return;
        for (const record of allRecords()) {
            if (record.type === 'hidden-box' && !record.revealed && columnIndex(record.boxId) === 0) record.revealed = true;
            if ((record.type !== 'frozen' && record.type !== 'urgent') || record.thawed || record.completed) continue;
            const box = actual(record.boxId);
            if (engine.clockStarted && visibleBoardBox(box) && !inQueue(box) && !record.activated) {
                record.activated = true;
                record.remaining = record.duration;
            }
        }
        notify();
    }

    function dependencyMet(record) {
        if (blockerHas(record, 'shipCount')) return state().shipped.size >= record.shipCount;
        const target = blockerHas(record, 'dependsOnBoxId') ? record.dependsOnBoxId : record.unlockAfterBoxId;
        return state().shipped.has(target);
    }

    function releaseDependencies() {
        for (const record of allRecords()) {
            if (record.type === 'locked' && !record.unlocked && dependencyMet(record)) record.unlocked = true;
            if (record.type !== 'stuck' || record.released || !dependencyMet(record)) continue;
            record.released = true;
            const box = actual(record.boxId);
            if (box && onBoard(box) && box.isEmpty()) {
                engine.boxes = engine.boxes.filter(candidate => candidate !== box);
                engine._removeFromColumn(box.id);
                if (engine.onBoxUpdated) engine.onBoxUpdated(box, true);
            }
        }
    }

    function recordShipment(box) {
        if (!active() || !box || state().shipped.has(box.id)) return;
        state().shipped.add(box.id);
        releaseDependencies();
        refresh();
    }

    function queueAssessment(id) {
        const box = actual(id);
        if (engine.gameState !== 'PLAYING') return { ok: false, reason: 'Play is not active.' };
        if (!box || !onBoard(box)) return { ok: false, reason: 'Stale box: it is no longer on the board.' };
        if (!box.isWrapped) return { ok: false, reason: 'Only a wrapped box can enter the queue.' };
        if (!base.isAccessible.call(engine, box.id)) return { ok: false, reason: 'That box is not accessible.' };
        const blocked = guard(box);
        if (blocked) return { ok: false, reason: blocked };
        const record = recordOf(box);
        if (record?.type === 'frozen' && !record.thawed) {
            return { ok: false, reason: 'That wrapped box must thaw before entering the queue.' };
        }
        if (record?.type === 'connector') {
            const pair = record.boxIds.map(actual);
            if (pair.some(partner => !partner || !onBoard(partner) || !partner.isWrapped ||
                !base.isAccessible.call(engine, partner.id) || guard(partner) ||
                (recordOf(partner)?.type === 'frozen' && !recordOf(partner).thawed))) {
                return { ok: false, reason: 'Both connected boxes must be wrapped, accessible, and waiting on the board.' };
            }
            if (engine.maxQueueSize - engine.queue.length < 2) return { ok: false, reason: 'The connected pair needs two free queue slots.' };
            return { ok: true, boxes: pair };
        }
        if (engine.queue.length >= engine.maxQueueSize) return { ok: false, reason: 'No free queue slot; the box remains on the board.' };
        return { ok: true, boxes: [box] };
    }

    function admitBoxes(boxes) {
        const ids = new Set(boxes.map(box => box.id));
        engine.boxes = engine.boxes.filter(box => !ids.has(box.id));
        for (const box of boxes) engine._removeFromColumn(box.id);
        engine.queue.push(...boxes);
        const records = new Set(boxes.map(recordOf).filter(Boolean));
        for (const record of records) {
            if (record.type === 'urgent') {
                record.queued = true;
                record.completed = true;
            } else if (record.type === 'defective') {
                record.queued = true;
                record.holdRemaining = record.holdSeconds;
            } else if (record.type === 'connector') {
                record.admitted = true;
            }
        }
        if (ids.has(engine.draggedBoxId)) engine.draggedBoxId = null;
        for (const box of boxes) if (engine.onBoxUpdated) engine.onBoxUpdated(box, true);
        if (engine.onQueueUpdated) engine.onQueueUpdated(engine.queue);
    }

    function admitReadyPair() {
        if (admitting) return false;
        admitting = true;
        try {
            for (const record of allRecords()) {
                if (record.type !== 'connector') continue;
                if (engine.onBoxWrapped && !record.admissionRequested) continue;
                const candidate = actual(record.boxIds[0]);
                const assessment = candidate && onBoard(candidate) ? queueAssessment(candidate.id) : null;
                if (assessment?.ok) {
                    atomic(() => admitBoxes(assessment.boxes));
                    return true;
                }
            }
            return false;
        } finally {
            admitting = false;
        }
    }

    function settle() {
        refresh();
        if (!active() || mutationDepth > 0 || settling) return;
        settling = true;
        try {
            for (let pass = 0; pass < 128 && engine.gameState === 'PLAYING'; pass++) {
                let changed = false;
                if (!engine.onTrayDelivered) {
                    // Headless delivery still passes through deliverQueueBox and shipment accounting.
                    for (let count = 0; count < 128 && engine.gameState === 'PLAYING'; count++) {
                        if (!engine.tryAutoFillTray()) break;
                        changed = true;
                        refresh();
                    }
                }
                if (engine.gameState === 'PLAYING' && admitReadyPair()) {
                    changed = true;
                    refresh();
                }
                if (!changed) break;
            }
        } finally {
            settling = false;
        }
        refresh();
        if (active() && mutationDepth === 0) engine.checkConditions();
    }

    function legalMove(sourceId, sourceSlot, targetId, targetSlot = null) {
        const source = actual(sourceId), target = actual(targetId);
        if (engine.gameState !== 'PLAYING' || !source || !target || source === target || !onBoard(source) || !onBoard(target)) return false;
        if (!Number.isInteger(sourceSlot) || sourceSlot < 0 || sourceSlot > 2 || source.slots[sourceSlot] === null) return false;
        if (targetSlot !== null && (!Number.isInteger(targetSlot) || targetSlot < 0 || targetSlot > 2)) return false;
        if (source.isWrapped || target.isWrapped || source.isEmpty() || !target.canAccept(targetSlot)) return false;
        if (!base.isAccessible.call(engine, source.id) || !base.isAccessible.call(engine, target.id)) return false;
        if (guard(source) || guard(target)) return false;
        const sourceRecord = recordOf(source);
        if (sourceRecord?.type === 'frozen' && !sourceRecord.thawed && sourceRecord.slot === sourceSlot) return false;
        const targetRecord = recordOf(target);
        if (targetRecord?.type === 'frozen' && !targetRecord.thawed) {
            const item = source.slots[sourceSlot];
            const occupied = target.slots.filter(value => value !== null);
            if (occupied.length === 2 && occupied.every(value => value === item)) return false;
        }
        return true;
    }

    function directDragAssessment(id) {
        const box = actual(id);
        if (!box || !onBoard(box) || !box.isWrapped || !base.isAccessible.call(engine, box.id)) return { ok: false, reason: 'Only an actual accessible wrapped board box can be dragged.' };
        const blocked = guard(box);
        if (blocked) return { ok: false, reason: blocked };
        const record = recordOf(box);
        if (record?.type === 'frozen' && !record.thawed) {
            return { ok: false, reason: 'That wrapped box must thaw before it can be dragged.' };
        }
        if (['defective', 'connector', 'urgent'].includes(record?.type)) {
            return { ok: false, reason: 'This blocker box must use the staging queue.' };
        }
        return { ok: true, box };
    }

    engine.canQueueBlockerBox = id => !active() || queueAssessment(id).ok;
    engine.canMoveBlockerItem = (sourceId, sourceSlot, targetId, targetSlot = null) => {
        if (!active()) return true;
        if (targetId === undefined || targetId === null) {
            const source = actual(sourceId);
            if (engine.gameState !== 'PLAYING') return deny('Play is not active.');
            if (!source || !onBoard(source)) return deny('That source box is no longer on the board.');
            if (!base.isAccessible.call(engine, source.id)) return deny('That source box is not accessible.');
            const blocked = guard(source);
            if (blocked) return deny(blocked);
            if (source.isWrapped) return deny('A wrapped source box has no movable item slot.');
            if (source.isEmpty()) return deny('That source box is empty.');
            if (!Number.isInteger(sourceSlot) || sourceSlot < 0 || sourceSlot > 2) {
                return deny('Choose an occupied integer source slot in 0..2.');
            }
            if (source.slots[sourceSlot] === null || source.slots[sourceSlot] === undefined) {
                return deny('That source slot is empty.');
            }
            const record = recordOf(source);
            if (record?.type === 'frozen' && !record.thawed && record.slot === sourceSlot) {
                return deny('That occupied source slot is frozen.');
            }
            engine.lastBlockerError = '';
            return true;
        }
        if (!legalMove(sourceId, sourceSlot, targetId, targetSlot)) {
            return deny('That move is blocked or is not currently legal.');
        }
        engine.lastBlockerError = '';
        return true;
    };
    engine.canDispatchBlockerBox = id => {
        if (!active()) return true;
        const box = actual(id);
        if (!box || !inQueue(box) || engine.gameState !== 'PLAYING') return false;
        const record = recordOf(box);
        if (record?.type === 'defective' && record.holdRemaining > 0) return false;
        if (record?.type === 'connector' && !record.admitted) return false;
        return true;
    };

    engine.startLevel = function(levelConfig) {
        let next;
        if (levelConfig && blockerHas(levelConfig, 'blockers') && !Array.isArray(levelConfig.blockers)) {
            throw new Error('Invalid blocker level: blockers must be an array.');
        }
        // Normalize, validate, and construct runtime state before replacing any engine state.
        const hasBlockers = Array.isArray(levelConfig?.blockers) && levelConfig.blockers.length > 0;
        const runtimeLevel = hasBlockers ? normalizeBlockerLevel(levelConfig) : levelConfig;
        next = hasBlockers ? runtimeState(runtimeLevel) : disabledState();
        engine.blockerState = next;
        engine.lastBlockerError = '';
        mutationDepth = 0;
        settling = false;
        admitting = false;
        const result = base.startLevel.call(engine, runtimeLevel);
        if (next.enabled) refresh();
        return result;
    };

    engine.startClock = function() {
        if (!active()) return base.startClock.call(engine);
        const result = base.startClock.call(engine);
        refresh();
        return result;
    };

    engine.selectSource = function(boxId, slotIndex) {
        if (!active()) return base.selectSource.call(engine, boxId, slotIndex);
        const box = actual(boxId);
        if (!box || guard(box)) return deny(box ? guard(box) : 'That source box does not exist.');
        const record = recordOf(box);
        if (record?.type === 'frozen' && !record.thawed && record.slot === slotIndex && box.slots[slotIndex] !== null) {
            return deny('That occupied source slot is frozen.');
        }
        const result = base.selectSource.call(engine, boxId, slotIndex);
        if (result) engine.lastBlockerError = '';
        refresh();
        return result;
    };

    engine.moveItem = function(sourceId, sourceSlot, targetId, targetSlot = null) {
        if (!active()) return base.moveItem.call(engine, sourceId, sourceSlot, targetId, targetSlot);
        if (!legalMove(sourceId, sourceSlot, targetId, targetSlot)) return deny('That move is blocked or is not currently legal.');
        const source = actual(sourceId), target = actual(targetId);
        const landingSlot = targetSlot === null ? target.slots.findIndex(item => item === null) : targetSlot;
        const movedTokens = state().hiddenTokens.filter(token => !token.revealed && token.boxId === source.id && token.slot === sourceSlot);
        const previous = movedTokens.map(token => ({ token, boxId: token.boxId, slot: token.slot }));
        for (const token of movedTokens) {
            token.boxId = target.id;
            token.slot = landingSlot;
        }
        let result;
        try {
            result = atomic(() => base.moveItem.call(engine, source.id, sourceSlot, target.id, targetSlot));
        } catch (error) {
            for (const old of previous) { old.token.boxId = old.boxId; old.token.slot = old.slot; }
            throw error;
        }
        if (!result) {
            for (const old of previous) { old.token.boxId = old.boxId; old.token.slot = old.slot; }
            refresh();
            return deny('The move was rejected; hidden items were restored.');
        }
        for (const token of movedTokens) {
            if (target.slots[token.slot] !== token.itemId) {
                const found = target.slots.findIndex(item => item === token.itemId);
                if (found !== -1) token.slot = found;
            }
        }
        const matchingTriple = target.items.length === 3 && target.items.every(item => item === target.items[0]);
        if (target.isWrapped && matchingTriple) {
            for (const token of state().hiddenTokens) {
                if (token.boxId === target.id && token.itemId === target.items[0]) token.revealed = true;
            }
        }
        engine.lastBlockerError = '';
        refresh();
        settle();
        return true;
    };

    engine.getValidTargets = function(sourceId) {
        if (!active()) return base.getValidTargets.call(engine, sourceId);
        const source = actual(sourceId);
        if (!source || !onBoard(source) || source.isWrapped || source.isEmpty()) return [];
        let slots;
        const selected = engine.selectedSource && actual(engine.selectedSource.boxId) === source ? engine.selectedSource.itemIndex : null;
        if (selected !== null && source.slots[selected] !== null && source.slots[selected] !== undefined) slots = [selected];
        else slots = source.slots.map((item, slot) => item !== null ? slot : -1).filter(slot => slot !== -1);
        const targets = [];
        for (const target of engine.boxes) {
            if (target === source || !target.canAccept()) continue;
            if (slots.some(slot => legalMove(source.id, slot, target.id, null))) targets.push(target.id);
        }
        return targets;
    };

    engine.moveBoxToQueue = function(boxOrId) {
        if (!active()) return base.moveBoxToQueue.call(engine, boxOrId);
        const box = boxOrId && typeof boxOrId === 'object' ? actual(boxOrId.id) : actual(boxOrId);
        const stale = !!(box && boxOrId && typeof boxOrId === 'object' && box !== boxOrId);
        const pairRecord = !stale && box && onBoard(box) ? recordOf(box) : null;
        if (pairRecord?.type === 'connector') pairRecord.admissionRequested = true;
        const assessment = stale
            ? { ok: false, reason: 'A stale box object cannot be queued.' }
            : queueAssessment(box ? box.id : boxOrId);
        if (!assessment.ok) {
            if (pairRecord?.type === 'connector') refresh();
            return deny(assessment.reason);
        }
        atomic(() => admitBoxes(assessment.boxes));
        engine.lastBlockerError = '';
        refresh();
        settle();
        return true;
    };

    engine.findQueueMatch = function() {
        if (!active()) return base.findQueueMatch.call(engine);
        const trays = engine.conveyor.getAllActiveTrays();
        for (const box of engine.queue) {
            if (!engine.canDispatchBlockerBox(box.id)) continue;
            const tray = trays.find(candidate => candidate.canAccept(box));
            if (tray) return { box, tray };
        }
        return null;
    };

    engine.deliverQueueBox = function(boxId, trayId) {
        if (!active()) return base.deliverQueueBox.call(engine, boxId, trayId);
        const box = actual(boxId);
        if (!box || !engine.canDispatchBlockerBox(box.id)) return deny('This queued box is held or is no longer dispatchable.');
        const result = atomic(() => base.deliverQueueBox.call(engine, box.id, trayId));
        if (!result) return false;
        engine.lastBlockerError = '';
        recordShipment(box);
        refresh();
        settle();
        return true;
    };

    engine.startDragWrappedBox = function(boxId) {
        if (!active()) return base.startDragWrappedBox.call(engine, boxId);
        const assessment = directDragAssessment(boxId);
        if (!assessment.ok) return deny(assessment.reason);
        const result = base.startDragWrappedBox.call(engine, assessment.box.id);
        if (result) engine.lastBlockerError = '';
        return result;
    };

    engine.dropOnTray = function(trayId) {
        if (!active()) return base.dropOnTray.call(engine, trayId);
        if (engine.draggedBoxId === null) return false;
        const assessment = directDragAssessment(engine.draggedBoxId);
        if (!assessment.ok) return deny(assessment.reason);
        const box = assessment.box;
        const result = atomic(() => base.dropOnTray.call(engine, trayId));
        if (!result) return false;
        engine.lastBlockerError = '';
        recordShipment(box);
        refresh();
        settle();
        return true;
    };

    engine.completeTrayExit = function(trayId) {
        if (!active()) return base.completeTrayExit.call(engine, trayId);
        atomic(() => base.completeTrayExit.call(engine, trayId));
        refresh();
        settle();
    };

    function boosterRestriction() {
        for (const record of allRecords()) {
            if (record.type === 'locked' && !record.unlocked) return 'A locked box is unresolved.';
            if (record.type === 'stuck' && !record.released) return 'A stuck box is unresolved.';
            if (record.type === 'frozen' && !record.thawed) return 'A frozen slot is unresolved.';
            if (record.type === 'hidden-box' && !record.revealed) return 'A concealed box is unresolved.';
            if (record.type === 'urgent' && !record.completed) return 'The urgent box must enter the queue first.';
            if (record.type === 'defective' && !state().shipped.has(record.boxId)) return 'The defective box must ship first.';
            if (record.type === 'connector' && !record.admitted) return 'The connected pair has not been admitted.';
        }
        if (state().hiddenTokens.some(token => !token.revealed)) return 'Hidden items must be revealed before changing the board.';
        return '';
    }

    function wrapBooster(name) {
        engine[name] = function(...args) {
            if (!active()) return base[name].apply(engine, args);
            const restriction = boosterRestriction();
            if (restriction) {
                engine.lastBlockerError = restriction;
                return engine._boosterFail(restriction);
            }
            const result = atomic(() => base[name].apply(engine, args));
            if (result) engine.lastBlockerError = '';
            refresh();
            if (result) settle();
            return result;
        };
    }
    wrapBooster('shuffleItems');
    wrapBooster('removeTray');

    engine.addExtraTray = function() {
        if (!active()) return base.addExtraTray.call(engine);
        const result = atomic(() => base.addExtraTray.call(engine));
        refresh();
        if (result) settle();
        return result;
    };

    function nextLocalExpiry() {
        let next = Infinity;
        for (const record of allRecords()) {
            if (record.type === 'frozen' && record.activated && !record.thawed) next = Math.min(next, record.remaining);
            if (record.type === 'urgent' && record.activated && !record.completed) next = Math.min(next, record.remaining);
            if (record.type === 'defective' && record.holdRemaining > 0 && inQueue(actual(record.boxId))) next = Math.min(next, record.holdRemaining);
        }
        return next;
    }

    function tickBlockers(delta) {
        state().localTime += delta;
        let urgentExpired = false;
        for (const record of allRecords()) {
            if (record.type === 'frozen' && record.activated && !record.thawed) {
                record.remaining = Math.max(0, record.remaining - delta);
                if (record.remaining <= 1e-9) { record.remaining = 0; record.thawed = true; }
            } else if (record.type === 'urgent' && record.activated && !record.completed) {
                record.remaining = Math.max(0, record.remaining - delta);
                if (record.remaining <= 1e-9) { record.remaining = 0; urgentExpired = true; }
            } else if (record.type === 'defective' && record.holdRemaining > 0 && inQueue(actual(record.boxId))) {
                record.holdRemaining = Math.max(0, record.holdRemaining - delta);
                if (record.holdRemaining <= 1e-9) record.holdRemaining = 0;
            }
        }
        if (urgentExpired && engine.gameState === 'PLAYING') {
            engine.loseReason = 'An urgent box expired before entering the staging queue.';
            engine.setGameState('LOST');
        }
    }

    engine.advanceClock = function(deltaSeconds) {
        if (!active()) return base.advanceClock.call(engine, deltaSeconds);
        if (engine.gameState !== 'PLAYING' || !engine.clockStarted || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;
        let remainingDelta = deltaSeconds;
        refresh();
        for (let iteration = 0; iteration < 256 && remainingDelta > 1e-9 && engine.gameState === 'PLAYING'; iteration++) {
            let localExpiry = nextLocalExpiry();
            if (localExpiry <= 1e-9) {
                tickBlockers(0);
                refresh();
                if (engine.gameState !== 'PLAYING') break;
                localExpiry = nextLocalExpiry();
                if (localExpiry <= 1e-9) break;
            }
            let globalExpiry = Infinity;
            if (engine.timeRemainingSeconds !== null && engine.hasPlayerWorkRemaining()) {
                globalExpiry = Math.max(0, engine.freezeRemainingSeconds + engine.timeRemainingSeconds);
            }
            const step = Math.min(remainingDelta, localExpiry, globalExpiry);
            if (!(step > 1e-9)) break;
            // Each segment ends at a local or global expiry, preserving chronological losses.
            atomic(() => base.advanceClock.call(engine, step));
            if (engine.gameState !== 'PLAYING') break;
            tickBlockers(step);
            remainingDelta -= step;
            refresh();
        }
        refresh();
        if (engine.gameState === 'PLAYING') settle();
    };

    function anyLegalBoardMove() {
        for (const source of engine.boxes) {
            if (source.isWrapped || source.isEmpty()) continue;
            for (let slot = 0; slot < source.slots.length; slot++) {
                if (source.slots[slot] === null) continue;
                for (const target of engine.boxes) {
                    if (target !== source && legalMove(source.id, slot, target.id, null)) return true;
                }
            }
        }
        return false;
    }

    engine.checkConditions = function() {
        if (!active()) return base.checkConditions.call(engine);
        if (engine.gameState !== 'PLAYING' || mutationDepth > 0) return;
        refresh();
        if (engine.hasPendingTrayExits()) return;
        const noItems = engine.boxes.every(box => box.isEmpty());
        const noStuck = allRecords().every(record => record.type !== 'stuck' || record.released);
        if (noItems && engine.queue.length === 0 && noStuck && !engine.conveyor.hasRemainingTrays()) {
            engine.setGameState('WON');
            return;
        }
        if (engine.queue.length > engine.maxQueueSize) {
            engine.loseReason = 'The staging queue exceeded its capacity.';
            engine.setGameState('LOST');
            return;
        }
        if (engine.findQueueMatch()) return;
        const trays = engine.conveyor.getAllActiveTrays();
        for (const box of engine.boxes) {
            if (!box.isWrapped) continue;
            if (queueAssessment(box.id).ok) return;
            if (directDragAssessment(box.id).ok && trays.some(tray => tray.canAccept(box))) return;
        }
        for (const record of allRecords()) {
            if (record.type === 'frozen' && record.activated && !record.thawed && Number.isFinite(record.remaining) && record.remaining > 0) return;
            if (record.type === 'defective' && Number.isFinite(record.holdRemaining) && record.holdRemaining > 0 && inQueue(actual(record.boxId))) return;
        }
        if (anyLegalBoardMove()) return;
        engine.loseReason = engine.queue.length >= engine.maxQueueSize
            ? 'The staging queue is full and no guarded delivery or pair admission is possible.'
            : 'No legal blocker-aware move, delivery, or finite wait remains.';
        engine.setGameState('LOST');
    };

    engine.getBlockerView = function(boxId) {
        const blank = { badges: [], concealed: false, hiddenSlots: [], frozenSlots: [], blocked: false, queueHeld: false };
        if (!active()) return blank;
        const box = actual(boxId);
        if (!box) return blank;
        const record = recordOf(box);
        const concealed = !!(onBoard(box) && !base.isAccessible.call(engine, box.id)) ||
            !!(record?.type === 'hidden-box' && !record.revealed);
        const movingTokens = state().hiddenTokens.filter(token => !token.revealed && token.boxId === box.id);
        const hiddenSlots = [...new Set(movingTokens.map(token => token.slot))];
        const frozenSlots = record?.type === 'frozen' && !record.thawed ? [record.slot] : [];
        const blocked = !!guard(box);
        const queueHeld = !!(record?.type === 'defective' && inQueue(box) && record.holdRemaining > 0) ||
            !!(record?.type === 'connector' && inQueue(box) && !record.admitted);
        const badges = [];
        if (record) {
            const seconds = value => Math.ceil(Math.max(0, value || 0));
            const dependencyBoxId = blockerHas(record, 'dependsOnBoxId') ? record.dependsOnBoxId : record.unlockAfterBoxId;
            if (record.type === 'locked' && !record.unlocked) {
                if (blockerHas(record, 'shipCount')) {
                    const remaining = Math.max(0, record.shipCount - state().shipped.size);
                    badges.push(`🔒 Khoá: giao thêm ${remaining} đơn để mở hộp`);
                } else {
                    badges.push(`🔒 Khoá: giao hộp #${dependencyBoxId} để mở`);
                }
            }
            if (record.type === 'stuck' && !record.released) {
                if (blockerHas(record, 'shipCount')) {
                    const remaining = Math.max(0, record.shipCount - state().shipped.size);
                    badges.push(`🧱 Kẹt: giao thêm ${remaining} đơn để dọn hộp`);
                } else {
                    badges.push(`🧱 Kẹt: giao hộp #${dependencyBoxId} để dọn chỗ`);
                }
            }
            if (record.type === 'frozen' && !record.thawed) {
                badges.push(`❄️ Băng: còn ${seconds(record.remaining ?? record.duration)}s — chờ tan rồi lấy món`);
            }
            if (record.type === 'defective' && !state().shipped.has(box.id)) {
                if (queueHeld) {
                    badges.push(`🛠️ Lỗi: còn ${seconds(record.holdRemaining)}s kiểm tra trước khi giao`);
                } else if (inQueue(box)) {
                    badges.push('🛠️ Kiểm tra lỗi xong — có thể giao');
                } else {
                    badges.push(`🛠️ Lỗi: sẽ giữ kiểm tra ${seconds(record.holdSeconds)}s trong hàng chờ`);
                }
            }
            if (record.type === 'connector') {
                const partnerId = record.boxIds.find(id => id !== box.id);
                badges.push(`🔗 Nối với hộp #${partnerId}: đóng gói và xếp cặp cùng nhau`);
            }
            if (record.type === 'hidden-box' && !record.revealed) {
                badges.push('❔ Hộp giấu: đưa lên đầu cột để lộ nội dung');
            }
            if (record.type === 'urgent') {
                badges.push(record.completed
                    ? '⏱️ Gấp: đã hoàn tất'
                    : `⏱️ Gấp: vào hàng chờ trong ${seconds(record.remaining ?? record.duration)}s`);
            }
        }
        for (const token of movingTokens) {
            badges.push(`? Món giấu: ${token.itemId} — đối chiếu đơn hàng`);
        }
        return { badges, concealed, hiddenSlots, frozenSlots, blocked, queueHeld };
    };
}
