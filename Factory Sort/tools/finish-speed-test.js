import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const uiSource = readFileSync(new URL('../ab_test/src/ui/UIManager.js', import.meta.url), 'utf8');
const UI = vm.runInNewContext(`(${uiSource.slice(uiSource.indexOf('class UIManager {'), uiSource.indexOf('// Bootstrap'))})`);
const ui = Object.create(UI.prototype);
ui.engine = { gameState: 'PLAYING', boxes: [], queue: [{}] };
ui.trayRenderer = { speedMultiplier: 1 };
ui.updateConveyorSpeed();
assert.equal(ui.trayRenderer.speedMultiplier, 1.5, 'queued goods do not prevent the finish boost');
ui.engine.boxes = [{ isEmpty: () => false }];
ui.updateConveyorSpeed();
assert.equal(ui.trayRenderer.speedMultiplier, 1, 'any board box, including hidden or wrapped boxes, prevents boost');
ui.engine.boxes = [{ isEmpty: () => true }];
ui.updateConveyorSpeed();
assert.equal(ui.trayRenderer.speedMultiplier, 1.5, 'empty logical boxes do not block finish boost');
for (const state of ['IDLE', 'LOST', 'WON']) {
    ui.engine.gameState = state;
    ui.updateConveyorSpeed();
    assert.equal(ui.trayRenderer.speedMultiplier, 1);
}

const rendererSource = readFileSync(new URL('../ab_test/src/ui/TrayRenderer.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace('export class', 'class');
const Renderer = vm.runInNewContext(rendererSource + ';TrayRenderer', { requestAnimationFrame() {} });
function distance(multiplier, shiftDecayTime = 0) {
    const renderer = Object.create(Renderer.prototype);
    Object.assign(renderer, { running: true, lastTime: 0, baseSpeed: .015, speedMultiplier: multiplier,
        shiftDecayTime, offset: 0, respaceTau: 260, trayElements: [], updatePositions() {} });
    renderer.animate(16.66);
    return renderer.offset;
}
assert.ok(Math.abs(distance(1.5) / distance(1) - 1.5) < 1e-10, 'angular motion increases exactly 1.5 times');
assert.ok(Math.abs(distance(1.5, 1200) / distance(1, 1200) - 1.5) < 1e-10, 'finish boost composes with existing shift boost');
const resetRenderer = Object.create(Renderer.prototype);
resetRenderer.container = { innerHTML: '' };
resetRenderer.speedMultiplier = 1.5;
resetRenderer.reset();
assert.equal(resetRenderer.speedMultiplier, 1, 'new level restores normal speed');
console.log('Finish speed: empty board, staging queue, terminal states, exact multiplier and reset passed');
