import { logger } from "./logger.js";

export const MIX_TRANSFORM_STATES = Object.freeze([
  "normal",
  "flip",
  "mirror",
  "flip-mirror"
]);

export const MIX_TRANSFORM_SEQUENCES = Object.freeze({
  alpha: Object.freeze(["normal", "mirror", "flip", "flip-mirror", "mirror"]),
  beta: Object.freeze(["flip", "normal", "flip-mirror", "mirror", "normal"]),
  gamma: Object.freeze(["mirror", "flip-mirror", "normal", "flip", "flip-mirror"]),
  delta: Object.freeze(["flip-mirror", "flip", "mirror", "normal", "flip"])
});

export function getRotationDuration({ level, speed }) {
  const levelFactor = 1 + (Number(level) - 1) * 0.55;
  const speedFactor = Math.max(0.5, Number(speed));
  return Math.max(0.18, 3.2 / (levelFactor * speedFactor));
}

function hashValue(index, seed = 1, salt = 0) {
  let value = Math.imul(index + 1, 2654435761) ^ Math.trunc(seed || 1) ^ Math.imul(salt + 3, 2246822519);
  value ^= value >>> 16;
  value = Math.imul(value, 2246822519);
  value ^= value >>> 13;
  value = Math.imul(value, 3266489917);
  value ^= value >>> 16;
  return value >>> 0;
}

export function sequenceHasAdjacentRepeats(sequence) {
  if (!Array.isArray(sequence) || sequence.length < 2) {
    return false;
  }

  return sequence.some((state, index) => {
    const nextState = sequence[(index + 1) % sequence.length];
    return state === nextState;
  });
}

export function getRotationStyle(index, state) {
  const duration = getRotationDuration(state);
  const direction = (index * 9301 + 49297) % 233280 > 116640 ? 1 : -1;
  const delay = -((index % 17) * duration) / 17;

  return {
    duration,
    direction,
    delay
  };
}

export function getMixTransformStyle(index, state) {
  const duration = getRotationDuration(state);
  const seed = Number(state.shuffleSeed || 1);
  const effectHash = hashValue(index, seed, 11);
  const effect = effectHash % 2 === 0 ? "rotate" : "transform";
  const delay = -((index % 23) * duration) / 23;

  if (effect === "rotate") {
    return {
      effect,
      direction: hashValue(index, seed, 17) % 2 === 0 ? 1 : -1,
      duration,
      delay
    };
  }

  const sequenceNames = Object.keys(MIX_TRANSFORM_SEQUENCES);
  const sequence = sequenceNames[hashValue(index, seed, 23) % sequenceNames.length];

  return {
    effect,
    sequence,
    states: MIX_TRANSFORM_SEQUENCES[sequence],
    duration: duration * 1.35,
    delay
  };
}

export function applyAnimationState(rootElement, state) {
  rootElement.classList.toggle("is-paused", state.isPaused);
  rootElement.classList.toggle("is-discrete", state.rotationType === "discrete");
  rootElement.classList.toggle("is-original-visible", state.isOriginalVisible);

  logger.debug("[animation] settings", {
    rotationType: state.rotationType,
    level: state.level,
    speed: state.speed,
    isPaused: state.isPaused
  });
}
