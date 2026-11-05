import assert from 'node:assert/strict';
import { ITEM_CATALOG } from '../ab_test/src/data/ItemCatalog.js';
import { applyItemArt, getItemArtDataUri } from '../ab_test/src/ui/ItemArt.js';
import { AudioManager } from '../ab_test/src/ui/AudioManager.js';

const ids = ITEM_CATALOG.categories.flatMap((c) => c.items.map((i) => i.id));
assert.equal(ids.length, 32, 'catalog must expose 32 items');
assert.equal(new Set(ids).size, 32, 'catalog ids must be unique');
const urls = ids.map((id) => getItemArtDataUri(id));
urls.forEach((uri) => {
  assert.ok(uri.startsWith('data:image/svg+xml;charset=utf-8,'), 'svg data uri prefix');
  const svg = decodeURIComponent(uri.slice(uri.indexOf(',') + 1));
  assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'), 'svg namespace');
  ['<image', '<script', '<use', 'href'].forEach((bad) => assert.ok(!svg.includes(bad), 'forbidden ' + bad));
});
assert.equal(new Set(urls).size, 32, 'art urls must be unique');
assert.equal(getItemArtDataUri('not-a-real-item'), null, 'unknown id yields null');

const makeEl = () => {
  const map = new Map();
  return {
    textContent: 'unchanged',
    classList: {
      set: new Set(),
      add(...c) { c.forEach((x) => this.set.add(x)); },
      remove(...c) { c.forEach((x) => this.set.delete(x)); },
    },
    art: { get: (k) => map.get(k), has: (k) => map.has(k) },
    style: { setProperty(k, v) { map.set(k, v); }, removeProperty(k) { map.delete(k); } },
  };
};
const el = makeEl();
const bear = ids.find((id) => getItemArtDataUri(id));
const duck = ids.filter((id) => getItemArtDataUri(id))[1];
applyItemArt(el, bear);
assert.ok(el.classList.set.has('item-art'), 'adds item-art class');
const bearUri = getItemArtDataUri(bear);
assert.equal(el.art.get('--item-art'), 'url("' + bearUri + '")');
applyItemArt(el, duck);
assert.notEqual(getItemArtDataUri(bear), getItemArtDataUri(duck), 'duck changes uri');
assert.equal(el.art.get('--item-art'), 'url("' + getItemArtDataUri(duck) + '")');
applyItemArt(el, 'unknown-item');
assert.ok(!el.classList.set.has('item-art'), 'unknown does not add class');
assert.ok(!el.art.has('--item-art'), 'unknown clears art');
assert.equal(el.textContent, 'unchanged', 'unknown keeps textContent');
assert.doesNotThrow(() => applyItemArt(null, bear), 'null element safe');
assert.equal(el.textContent, 'unchanged', 'null element keeps textContent');

const calls = [];
const original = AudioManager.prototype.blip;
AudioManager.prototype.blip = function (...args) { calls.push(args); return original ? 0 : 0; };
const audio = Object.create(AudioManager.prototype);
const expected = {
  tap: [900],
  swap: [220, 1500],
  reject: [200],
  wrap: [320, 1300],
  deliver: [523, 659, 784, 1046],
  win: [523, 659, 784, 1046, 784, 1046, 1318],
  lose: [420, 300],
};
Object.entries(expected).forEach(([name, freqs]) => {
  calls.length = 0;
  audio[name]();
  assert.equal(calls.length, freqs.length, name + ' blip count');
  assert.deepEqual(calls.map(args => args[0]), freqs, name + ' frequencies');
});
assert.equal(calls[0][0], 420, 'starts freq last call');
assert.ok(typeof AudioManager.prototype.blip === 'function', 'blip exists');
assert.doesNotThrow(() => new AudioManager(), 'no web audio needed');
console.log('pass: item art + audio tests');
