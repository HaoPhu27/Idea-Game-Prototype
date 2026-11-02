import assert from 'node:assert/strict';
import { Tray } from '../ab_test/src/core/Tray.js';
import { Box } from '../ab_test/src/core/Box.js';

function wrapped(id, type) {
    const box = new Box(id);
    box.items = [type, type, type];
    box.checkWrapped();
    return box;
}

const penguin = wrapped('box-unrelated-id', 'penguin');
const bear = wrapped('tray-a', 'bear');
const first = new Tray('tray-a', 'stuffed_animals', 'penguin', 'itemType');
const second = new Tray('tray-b', 'stuffed_animals', 'penguin', 'itemType');
assert.equal(first.canAccept(penguin), true, 'different IDs do not prevent matching');
assert.equal(second.canAccept(penguin), true, 'any empty tray with the same emoji can accept');
assert.equal(first.canAccept(bear), false, 'same category or even equal IDs do not match a different emoji');
assert.equal(first.canAccept(null), false);
const unpacked = new Box('unpacked');
unpacked.items = ['penguin', 'penguin'];
assert.equal(first.canAccept(unpacked), false, 'only wrapped boxes can be delivered');
assert.equal(first.receiveBox(penguin), true);
assert.equal(first.canAccept(wrapped('next', 'penguin')), false, 'each tray accepts only one box');
assert.equal(first.receiveBox(wrapped('next', 'penguin')), false);
assert.equal(first.slot, penguin, 'a second delivery cannot replace the accepted box');
const legacy = new Tray('legacy', 'stuffed_animals', 'penguin', 'category');
assert.equal(legacy.canAccept(bear), false, 'legacy metadata does not override the visible emoji');
assert.equal(legacy.canAccept(wrapped('legacy-box', 'penguin')), true);
console.log('Tray matching: emoji identity, unrelated IDs, wrapping and single-box capacity passed');
