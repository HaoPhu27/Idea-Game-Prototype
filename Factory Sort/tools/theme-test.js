import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ITEM_CATALOG } from '../ab_test/src/data/ItemCatalog.js';
import {
    THEMES, getTheme, setTheme, getThemedItemAsset, getThemedItemLabel, DEFAULT_THEME_ID,
} from '../ab_test/src/ui/ThemeManager.js';
import { applyItemArt, getItemArtDataUri } from '../ab_test/src/ui/ItemArt.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_ROOT = path.join(ROOT, 'assets/retheme-review/2026-11-10');

const ids = ITEM_CATALOG.categories.flatMap((c) => c.items.map((i) => i.id));
assert.equal(ids.length, 32, 'catalog exposes 32 ids');
assert.equal(new Set(ids).size, 32, 'catalog ids unique');

// --- metadata theme ---
assert.ok(THEMES.candy && THEMES.food, 'candy + food themes exist');
for (const themeId of Object.keys(THEMES)) {
    const theme = THEMES[themeId];
    assert.equal(theme.id, themeId, 'theme id matches key');
    assert.ok(typeof theme.label === 'string' && theme.label.length > 0, 'theme label');
    const keys = Object.keys(theme.items);
    assert.equal(keys.length, 32, `${themeId} maps exactly 32 items`);
    assert.equal(new Set(keys).size, 32, `${themeId} keys unique`);
    assert.deepEqual(new Set(keys), new Set(ids), `${themeId} keys equal catalog`);
    const values = Object.values(theme.items);
    assert.equal(new Set(values).size, 32, `${themeId} asset paths unique`);
    for (const rel of values) {
        const abs = path.join(ASSET_ROOT, rel);
        assert.ok(fs.existsSync(abs), `${themeId} asset exists: ${rel}`);
    }
    const labelKeys = Object.keys(theme.labels);
    assert.equal(labelKeys.length, 32, `${themeId} has 32 themed labels`);
    assert.deepEqual(new Set(labelKeys), new Set(ids), `${themeId} labels keys equal catalog`);
    for (const id of ids) {
        const label = theme.labels[id];
        assert.ok(typeof label === 'string' && label.length > 0, `${themeId}/${id} label non-empty`);
    }
}

// --- getThemedItemAsset(Node) trả đường dẫn tương đối cho fs check ---
for (const themeId of Object.keys(THEMES)) {
    for (const id of ids) {
        const rel = getThemedItemAsset(id, themeId);
        assert.ok(typeof rel === 'string' && rel.startsWith('../assets/retheme-review/'),
            `${themeId}/${id} node asset is relative asset path`);
        const abs = path.resolve(ROOT, 'ab_test', rel);
        assert.ok(fs.existsSync(abs), `${themeId}/${id} node asset resolves on disk`);
    }
}
assert.equal(getThemedItemAsset('not-a-real-item', 'candy'), null, 'unknown id asset null');
assert.equal(getThemedItemAsset('bear', 'nope'), null, 'unknown theme asset null');
assert.equal(getThemedItemLabel('not-a-real-item'), null, 'unknown label null');
assert.equal(getThemedItemLabel('bear', 'nope'), null, 'unknown theme label false/null');
assert.equal(getThemedItemLabel('bear'), 'Kẹo mút xoắn ốc', 'bear themed candy label');
assert.notEqual(getThemedItemLabel('bear', 'food'), 'Kẹo mút xoắn ốc', 'bear food label differs');

// --- themes distinct per id ---
for (const id of ids) {
    assert.notEqual(getThemedItemAsset(id, 'candy'), getThemedItemAsset(id, 'food'),
        `same item differs between themes: ${id}`);
}

// --- theme default + storage/env stubs ---
assert.equal(getTheme(), DEFAULT_THEME_ID, 'default theme is candy');
assert.equal(setTheme('nope'), false, 'invalid theme returns false');
assert.equal(getTheme(), DEFAULT_THEME_ID, 'invalid theme keeps current');
assert.equal(setTheme(DEFAULT_THEME_ID), false, 'same theme no-op returns false (dedup)');

const events = [];
globalThis.localStorage = {
    _m: new Map(),
    getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
    setItem(k, v) { this._m.set(k, v); },
};
globalThis.CustomEvent = class CustomEvent {
    constructor(type, init) { this.type = type; this.detail = init && init.detail; }
};
globalThis.document = {
    body: { dataset: {} },
    dispatchEvent(ev) { events.push(ev); },
    querySelectorAll() { return []; },
};

assert.equal(setTheme('food'), true, 'switch to food returns true');
assert.equal(getTheme(), 'food', 'theme is food');
assert.equal(globalThis.localStorage.getItem('factory-sort-theme'), 'food', 'persisted');
assert.equal(globalThis.document.body.dataset.theme, 'food', 'body dataset set');
assert.equal(events.length, 1, 'one themechange event');
assert.equal(events[0].type, 'themechange', 'event type');
assert.equal(events[0].detail.theme, 'food', 'event detail theme');
assert.equal(setTheme('food'), false, 'no duplicate event for same theme');
assert.equal(events.length, 1, 'still one event');

// --- refresh DOM: visible refresh, masked/concealed skip ---
function makeDomElement(itemId, classes = []) {
    const cls = new Set(classes);
    return {
        dataset: { itemId },
        style: {
            _m: new Map(),
            setProperty(k, v) { this._m.set(k, v); },
            removeProperty(k) { this._m.delete(k); },
        },
        classList: {
            contains: (c) => cls.has(c),
            add: (...c) => c.forEach((x) => cls.add(x)),
            remove: (...c) => c.forEach((x) => cls.delete(x)),
        },
        setAttribute(name, value) { this[name] = value; },
        removeAttribute(name) { if (name === 'title') { this.title = ''; } else { delete this[name]; } },
        getAttribute(n) { return this[n]; },
        title: '',
        parentNode: null,
    };
}

const visible = makeDomElement('bear');
const masked = makeDomElement('bear', ['blocker-masked']);
const concealed = makeDomElement('bear', ['blocker-concealed']);
const otherVisible = makeDomElement('apple');
globalThis.document = {
    body: { dataset: {} },
    dispatchEvent() {},
    querySelectorAll() { return [visible, masked, concealed, otherVisible]; },
};

if (getTheme() !== 'candy') setTheme('candy');
applyItemArt(visible, 'bear');
assert.equal(visible.dataset.itemId, 'bear', 'applyItemArt keeps dataset.itemId');
assert.ok(visible.style._m.has('--item-art'), 'art set');
assert.equal(visible.title, getThemedItemLabel('bear', 'candy'), 'themed title applied');

const before = {
    visible: visible.style._m.get('--item-art'),
    masked: masked.style._m.get('--item-art'),
    concealed: concealed.style._m.get('--item-art'),
    other: otherVisible.style._m.get('--item-art'),
};
assert.equal(setTheme('food'), true, 'switch food again');
assert.equal(visible.dataset.itemId, 'bear', 'item id stable across theme');
assert.notEqual(visible.style._m.get('--item-art'), before.visible, 'visible slot refreshed');
assert.equal(visible.title, getThemedItemLabel('bear', 'food'), 'visible title updated');
assert.equal(masked.style._m.get('--item-art'), before.masked, 'masked slot not refreshed');
assert.equal(concealed.style._m.get('--item-art'), before.concealed, 'concealed slot not refreshed');
assert.notEqual(otherVisible.style._m.get('--item-art'), before.other, 'other visible refreshed');

// same element same ID different URI between themes
const uriFood = visible.style._m.get('--item-art');
assert.notEqual(uriFood, `url("${before.visible}")`, 'same id different uri across theme');

// unknown clear keeps textContent, clears owned attrs
const clearEl = makeDomElement('bear');
clearEl.textContent = 'label text';
applyItemArt(clearEl, 'bear');
applyItemArt(clearEl, 'not-a-real-item');
assert.equal(clearEl.textContent, 'label text', 'unknown keeps textContent');
assert.ok(!clearEl.style._m.has('--item-art'), 'unknown clears art');
assert.equal(clearEl.title, '', 'unknown clears owned title');
assert.ok(!('aria-label' in clearEl), 'unknown clears owned aria-label');
assert.equal(clearEl.dataset.itemId, undefined, 'unknown clears dataset.itemId');

// --- legacy SVG behavior for fake element without dataset ---
const map = new Map();
const legacyEl = {
    textContent: 'unchanged',
    classList: { set: new Set(), add(...c) { c.forEach((x) => this.set.add(x)); }, remove(...c) { c.forEach((x) => this.set.delete(x)); } },
    style: { setProperty(k, v) { map.set(k, v); }, removeProperty(k) { map.delete(k); } },
};
applyItemArt(legacyEl, 'bear');
assert.equal(legacyEl.textContent, 'unchanged', 'legacy keeps textContent');
assert.ok(map.has('--item-art'), 'legacy SVG path applied');
applyItemArt(legacyEl, 'not-a-real-item');
assert.ok(!map.has('--item-art'), 'legacy unknown clears art');
assert.equal(legacyEl.textContent, 'unchanged', 'legacy unknown keeps textContent');
assert.equal(getItemArtDataUri('bear').startsWith('data:image/svg+xml'), true, 'svg data uri retained');

// --- browser baseURI: source (ab_test/) vs dist (ab_test/dist/) ---
// new URL() normalizes '../' / '../../', so both resolve to the same
// published asset URL under the repo Pages root.
const EXPECTED_BEAR_CANDY_URL =
    'https://example.github.io/FactorySort/assets/retheme-review/2026-11-10/gpt/candy/items/candy_01_spiral_lollipop.png';

globalThis.document = {
    body: { dataset: {} },
    dispatchEvent() {},
    querySelectorAll() { return []; },
    baseURI: 'https://example.github.io/FactorySort/ab_test/index.html',
};
const srcUrl = getThemedItemAsset('bear', 'candy');
assert.equal(srcUrl, EXPECTED_BEAR_CANDY_URL, 'source baseURI resolves to normalized asset URL');

globalThis.document = {
    body: { dataset: {} },
    dispatchEvent() {},
    querySelectorAll() { return []; },
    baseURI: 'https://example.github.io/FactorySort/ab_test/dist/FactorySort_ABTest_Inverted.html',
};
const distUrl = getThemedItemAsset('bear', 'candy');
assert.equal(distUrl, EXPECTED_BEAR_CANDY_URL, 'dist baseURI resolves to normalized asset URL');
assert.equal(distUrl, srcUrl, 'source and dist asset URLs are equal after normalization');
assert.ok(!srcUrl.includes('/../'), 'asset URL has no leftover ../ segment');

// injected standalone map wins
const injected = { candy: { bear: 'data:image/png;base64,AAA=' } };
globalThis.__FACTORY_THEME_ASSETS__ = injected;
assert.equal(getThemedItemAsset('bear', 'candy'), 'data:image/png;base64,AAA=', 'injected map first');
delete globalThis.__FACTORY_THEME_ASSETS__;

// --- storage failure safety: setItem/getItem throwing must not break flow ---
{
    const failEvents = [];
    globalThis.localStorage = {
        getItem() { throw new Error('storage get denied'); },
        setItem() { throw new Error('storage quota exceeded'); },
    };
    globalThis.CustomEvent = class CustomEvent {
        constructor(type, init) { this.type = type; this.detail = init && init.detail; }
    };
    globalThis.document = {
        body: { dataset: {} },
        dispatchEvent(ev) { failEvents.push(ev); },
        querySelectorAll() { return []; },
    };

    const startTheme = getTheme();
    const targetTheme = startTheme === 'candy' ? 'food' : 'candy';

    assert.doesNotThrow(() => setTheme(targetTheme), 'setTheme never throws when storage fails');
    assert.equal(getTheme(), targetTheme, 'theme changes even if persistence fails');
    assert.equal(globalThis.document.body.dataset.theme, targetTheme, 'body dataset applied despite storage failure');
    assert.equal(failEvents.length, 1, 'one event dispatched despite storage failure');
    assert.equal(failEvents[0].type, 'themechange', 'event type despite storage failure');
    assert.equal(failEvents[0].detail.theme, targetTheme, 'event detail despite storage failure');

    // asset resolution still works after a failed persistence write
    assert.ok(typeof getThemedItemAsset('bear', targetTheme) === 'string', 'asset resolves after storage failure');

    // switching back also does not throw
    assert.doesNotThrow(() => setTheme(startTheme), 'switching back never throws when storage fails');
    assert.equal(getTheme(), startTheme, 'theme returns to start on failing storage');
}

// cleanup
delete globalThis.localStorage;
delete globalThis.CustomEvent;
delete globalThis.document;
assert.doesNotThrow(() => setTheme('candy'), 'setTheme safe without document/localStorage');

console.log('pass: theme manager tests');
