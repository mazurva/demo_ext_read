import { bindControls } from "./controls.js";
import { logger } from "./logger.js";
import { renderTrainingText } from "./renderer.js";
import { subscribe } from "./state.js";

function getElements() {
  return {
    appRoot: document.querySelector("[data-app]"),
    sourceText: document.querySelector("[data-source-text]"),
    modeInputs: Array.from(document.querySelectorAll("[data-mode]")),
    rotationType: document.querySelector("[data-rotation-type]"),
    level: document.querySelector("[data-level]"),
    levelValue: document.querySelector("[data-level-value]"),
    speed: document.querySelector("[data-speed]"),
    speedValue: document.querySelector("[data-speed-value]"),
    revealDuration: document.querySelector("[data-reveal-duration]"),
    pauseToggle: document.querySelector("[data-pause-toggle]"),
    showOriginal: document.querySelector("[data-show-original]"),
    demoToggle: document.querySelector("[data-demo-toggle]"),
    preview: document.querySelector("[data-training-preview]"),
    status: document.querySelector("[data-status]"),
    textCounter: document.querySelector("[data-text-counter]")
  };
}

function init() {
  const elements = getElements();
  const render = bindControls(elements, (state) => {
    renderTrainingText(elements.preview, state);
  });

  subscribe(render);
  logger.debug("[app] initialized");
}

document.addEventListener("DOMContentLoaded", init);
