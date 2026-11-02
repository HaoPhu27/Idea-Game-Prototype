import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise the actual UI method without bootstrapping the browser/game.
const source = readFileSync(new URL('../ab_test/src/ui/UIManager.js', import.meta.url), 'utf8');
const begin = source.indexOf('    checkQueuePickup(');
const end = source.indexOf('    triggerQueueDelivery(', begin);
const method = vm.runInNewContext(`({${source.slice(begin, end)}}).checkQueuePickup`, {
    document: { querySelector: () => ({ id: 'queue-slot' }) },
});
const box = { id: 'box-unrelated-id', queueEnteredTime: 100 };
const trays = ['far', 'near', 'other'].map(id => ({ id, canAccept: () => true }));
const visuals = trays.map(t => ({ id: t.id, el: {}, inZone: t.id !== 'far' }));
const deliveries = [];
const ui = {
    _deliveryAnimating: false,
    _queueFlightActive: false,
    _drainQueueFlights() {},
    engine: { gameState: 'PLAYING', getQueue: () => [box], conveyor: { getAllActiveTrays: () => trays } },
    trayRenderer: { trayElements: visuals, isInDeliveryZone: t => t.inZone },
    triggerQueueDelivery: (b, t) => deliveries.push([b.id, t.id]),
};
method.call(ui, 1000);
assert.deepEqual(deliveries, [['box-unrelated-id', 'near']], 'later matching tray in pickup zone must be selected, irrespective of box ID');
visuals[1].isReceiving = true;
deliveries.length = 0;
method.call(ui, 1000);
assert.deepEqual(deliveries, [['box-unrelated-id', 'other']], 'receiving tray must not block another eligible tray');
ui._deliveryAnimating = true;
deliveries.length = 0;
method.call(ui, 1000);
assert.equal(deliveries.length, 0, 'only one delivery transaction at a time');
ui._deliveryAnimating = false;
box.queueEnteredTime = 900;
method.call(ui, 1000);
assert.equal(deliveries.length, 0, 'newly arriving box must settle first');
box.queueEnteredTime = 100;
trays.forEach(t => { t.canAccept = () => false; });
method.call(ui, 1000);
assert.equal(deliveries.length, 0, 'mismatched boxes must stay queued');
console.log('Queue pickup selection regression passed');
