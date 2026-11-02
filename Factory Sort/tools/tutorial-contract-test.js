import assert from 'node:assert/strict';
import { LevelGenerator } from '../ab_test/src/generator/LevelGenerator.js';
import { GameEngine } from '../ab_test/src/core/GameEngine.js';

// TutorialManager's scripted gesture contract must survive offline seed curation.
const level = LevelGenerator.generateLevel({ levelNumber: 1 });
assert.equal(level.config.seed, 506952114, 'the scripted tutorial uses its pinned seed');
assert.equal(level.rules.timeToPlay, null, 'tutorial remains untimed');
assert.equal(level.boxes.length, 4);
for (const id of [0, 1]) assert.ok(level.boxes[id].items.every(it => it === 'penguin'), `box ${id} teaches penguins`);
for (const id of [2, 3]) assert.ok(level.boxes[id].items.every(it => it === 'bear'), `box ${id} teaches bears`);
assert.equal(level.boxes[0].items.length, 2);
assert.equal(level.boxes[1].items.length, 1);
assert.equal(level.boxes[2].items.length, 2);
assert.equal(level.boxes[3].items.length, 1);

const engine = new GameEngine();
const states = [];
engine.onGameStateChanged = state => states.push(state);
engine.startLevel(level);
assert.ok([0, 1, 2, 3].every(id => engine.isAccessible(id)), 'all tutorial boxes are reachable');
for (const [source, target, item] of [[1, 0, 'penguin'], [3, 2, 'bear']]) {
  const slot = engine.getBox(source).slots.findIndex(it => it === item);
  assert.ok(slot >= 0);
  assert.equal(engine.selectSource(source, slot), true);
  assert.equal(engine.selectTarget(target), true, `scripted ${source}->${target} succeeds`);
  assert.notEqual(engine.gameState, 'LOST', 'scripted gestures cannot cause failure');
}
assert.equal(engine.gameState, 'WON');
assert.deepEqual(states, ['PLAYING', 'WON']);
console.log('Tutorial contract: pinned penguin/bear board, accessible scripted gestures and untimed win passed');
