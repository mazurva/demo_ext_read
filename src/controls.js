import { getState, updateState } from "./state.js";
import { logger } from "./logger.js";

let revealTimer = null;
let inputTimer = null;

const statusByMode = {
  "rotating-letters": "Вращение",
  "shuffled-words": "Перемешивание",
  "shuffled-edges": "Первая и последняя",
  "mix-transform": "Микс-трансформ"
};

function clearRevealTimer() {
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
    logger.warn("[controls] reveal timer reset");
  }
}

function updateLabel(elements, state) {
  elements.appRoot.classList.toggle("is-demo-mode", state.isDemoMode);
  document.body.classList.toggle("has-demo-mode", state.isDemoMode);
  elements.levelValue.textContent = String(state.level);
  elements.speedValue.textContent = state.speed.toFixed(1);
  elements.textCounter.textContent = `${state.sourceText.length} символов`;
  elements.pauseToggle.textContent = state.isPaused ? "Продолжить" : "Пауза";
  elements.status.textContent = state.isOriginalVisible ? "Оригинал" : statusByMode[state.mode];
}

function setDemoMode(isDemoMode) {
  updateState({ isDemoMode });
  logger.debug("[controls] demo mode changed", isDemoMode);
}

export function bindControls(elements, onRender) {
  elements.sourceText.addEventListener("input", (event) => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      updateState({ sourceText: event.target.value });
      logger.debug("[controls] source text updated", {
        textLength: event.target.value.length
      });
    }, 120);
  });

  elements.modeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) {
        return;
      }

      clearRevealTimer();
      updateState({
        mode: input.value,
        isOriginalVisible: false
      });
      logger.debug("[controls] mode changed", input.value);
    });
  });

  elements.rotationType.addEventListener("change", (event) => {
    updateState({ rotationType: event.target.value });
  });

  elements.level.addEventListener("input", (event) => {
    updateState({ level: event.target.value });
  });

  elements.speed.addEventListener("input", (event) => {
    updateState({ speed: event.target.value });
  });

  elements.revealDuration.addEventListener("input", (event) => {
    updateState({ originalRevealDuration: event.target.value });
  });

  elements.pauseToggle.addEventListener("click", () => {
    const nextPaused = !getState().isPaused;
    updateState({ isPaused: nextPaused });
    logger.debug("[controls] pause toggled", nextPaused);
  });

  elements.showOriginal.addEventListener("click", () => {
    clearRevealTimer();
    const state = getState();
    const durationMs = state.originalRevealDuration * 1000;

    updateState({ isOriginalVisible: true });
    logger.debug("[controls] original reveal started", durationMs);

    revealTimer = setTimeout(() => {
      updateState({ isOriginalVisible: false });
      revealTimer = null;
      logger.debug("[controls] original reveal ended");
    }, durationMs);
  });

  elements.demoToggle.addEventListener("click", () => {
    setDemoMode(true);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !getState().isDemoMode) {
      return;
    }

    setDemoMode(false);
    logger.debug("[controls] demo mode closed by escape");
  });

  return (state) => {
    updateLabel(elements, state);
    onRender(state);
  };
}
