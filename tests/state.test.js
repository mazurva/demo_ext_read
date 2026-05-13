import test from "node:test";
import assert from "node:assert/strict";

import { setLogLevel } from "../src/logger.js";
import { getState, resetState, updateState } from "../src/state.js";

setLogLevel("silent");

test("demo mode is disabled by default", () => {
  resetState();

  assert.equal(getState().isDemoMode, false);
});

test("demo mode can be toggled through state updates", () => {
  resetState();

  updateState({ isDemoMode: true });
  assert.equal(getState().isDemoMode, true);

  updateState({ isDemoMode: false });
  assert.equal(getState().isDemoMode, false);
});
