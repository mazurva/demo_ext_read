import { logger } from "./logger.js";

const MODE_VALUES = new Set([
  "rotating-letters",
  "shuffled-words",
  "shuffled-edges",
  "mix-transform"
]);
const ROTATION_VALUES = new Set(["smooth", "discrete"]);

const initialState = Object.freeze({
  sourceText: "",
  mode: "rotating-letters",
  rotationType: "smooth",
  level: 1,
  speed: 1,
  isPaused: false,
  isDemoMode: false,
  isOriginalVisible: false,
  originalRevealDuration: 3,
  shuffleSeed: 1
});

let currentState = { ...initialState };
const subscribers = new Set();

function clampNumber(value, min, max, fallback, field) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    logger.warn("[state] invalid value", { field, value, fallback });
    return fallback;
  }

  const clamped = Math.min(max, Math.max(min, numberValue));
  if (clamped !== numberValue) {
    logger.warn("[state] invalid value", { field, value, clamped });
  }

  return clamped;
}

function sanitizePatch(patch) {
  const nextPatch = { ...patch };

  if (Object.hasOwn(nextPatch, "sourceText")) {
    nextPatch.sourceText = String(nextPatch.sourceText ?? "");
    nextPatch.shuffleSeed = Date.now();
  }

  if (Object.hasOwn(nextPatch, "mode") && !MODE_VALUES.has(nextPatch.mode)) {
    logger.warn("[state] invalid value", { field: "mode", value: nextPatch.mode });
    delete nextPatch.mode;
  }

  if (Object.hasOwn(nextPatch, "rotationType") && !ROTATION_VALUES.has(nextPatch.rotationType)) {
    logger.warn("[state] invalid value", {
      field: "rotationType",
      value: nextPatch.rotationType
    });
    delete nextPatch.rotationType;
  }

  if (Object.hasOwn(nextPatch, "level")) {
    nextPatch.level = Math.round(clampNumber(nextPatch.level, 1, 5, currentState.level, "level"));
  }

  if (Object.hasOwn(nextPatch, "speed")) {
    nextPatch.speed = clampNumber(nextPatch.speed, 0.5, 3, currentState.speed, "speed");
  }

  if (Object.hasOwn(nextPatch, "originalRevealDuration")) {
    nextPatch.originalRevealDuration = Math.round(
      clampNumber(
        nextPatch.originalRevealDuration,
        1,
        10,
        currentState.originalRevealDuration,
        "originalRevealDuration"
      )
    );
  }

  if (Object.hasOwn(nextPatch, "isDemoMode")) {
    nextPatch.isDemoMode = Boolean(nextPatch.isDemoMode);
  }

  if (Object.hasOwn(nextPatch, "isPaused")) {
    nextPatch.isPaused = Boolean(nextPatch.isPaused);
  }

  if (Object.hasOwn(nextPatch, "isOriginalVisible")) {
    nextPatch.isOriginalVisible = Boolean(nextPatch.isOriginalVisible);
  }

  return nextPatch;
}

export function getState() {
  return { ...currentState };
}

export function updateState(patch) {
  const sanitizedPatch = sanitizePatch(patch);
  currentState = {
    ...currentState,
    ...sanitizedPatch
  };

  logger.debug("[state] updated", {
    mode: currentState.mode,
    rotationType: currentState.rotationType,
    level: currentState.level,
    speed: currentState.speed,
    isPaused: currentState.isPaused,
    isDemoMode: currentState.isDemoMode,
    isOriginalVisible: currentState.isOriginalVisible,
    textLength: currentState.sourceText.length
  });

  subscribers.forEach((subscriber) => subscriber(getState()));
}

export function subscribe(listener) {
  subscribers.add(listener);
  listener(getState());

  return () => {
    subscribers.delete(listener);
  };
}

export function resetState() {
  currentState = { ...initialState };
  subscribers.forEach((subscriber) => subscriber(getState()));
}
