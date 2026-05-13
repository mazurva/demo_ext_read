import test from "node:test";
import assert from "node:assert/strict";

import { setLogLevel } from "../src/logger.js";
import {
  MIX_TRANSFORM_SEQUENCES,
  MIX_TRANSFORM_STATES,
  getMixTransformStyle,
  getRotationDuration,
  sequenceHasAdjacentRepeats
} from "../src/animation.js";

setLogLevel("silent");

const baseState = {
  level: 1,
  speed: 1,
  shuffleSeed: 42
};

test("mix-transform helper returns supported effect types", () => {
  const effects = new Set();

  for (let index = 0; index < 40; index += 1) {
    const style = getMixTransformStyle(index, baseState);
    effects.add(style.effect);
    assert.match(style.effect, /^(rotate|transform)$/u);
  }

  assert.deepEqual([...effects].sort(), ["rotate", "transform"]);
});

test("mix-transform rotate effects use valid directions", () => {
  for (let index = 0; index < 80; index += 1) {
    const style = getMixTransformStyle(index, baseState);

    if (style.effect === "rotate") {
      assert.ok(style.direction === 1 || style.direction === -1);
    }
  }
});

test("mix-transform sequences use only supported states and avoid adjacent repeats", () => {
  const supportedStates = new Set(MIX_TRANSFORM_STATES);

  Object.values(MIX_TRANSFORM_SEQUENCES).forEach((sequence) => {
    assert.equal(sequenceHasAdjacentRepeats(sequence), false);
    sequence.forEach((state) => {
      assert.equal(supportedStates.has(state), true);
    });
  });
});

test("mix-transform duration follows existing level and speed model", () => {
  const slowStyle = getMixTransformStyle(3, { ...baseState, level: 1, speed: 1 });
  const fastStyle = getMixTransformStyle(3, { ...baseState, level: 5, speed: 3 });
  const slowMultiplier = slowStyle.effect === "transform" ? 1.35 : 1;

  assert.equal(slowStyle.duration, getRotationDuration({ level: 1, speed: 1 }) * slowMultiplier);
  assert.ok(fastStyle.duration < slowStyle.duration);
});
