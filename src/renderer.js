import { applyAnimationState, getMixTransformStyle, getRotationStyle } from "./animation.js";
import {
  createRotationCharacters,
  shuffleTextWordsKeepingEdges,
  shuffleTextWords,
  tokenizeText
} from "./text-transformer.js";
import { logger } from "./logger.js";

function appendPlainText(container, text) {
  container.classList.remove("training-preview--rotating", "training-preview--mixed");
  container.classList.add("training-preview--plain");
  container.textContent = text;
}

function createAnimatedLetter(character, className) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = character.value;
  return span;
}

function renderRotatingLetters(container, state) {
  container.classList.add("training-preview--rotating");
  container.classList.remove("training-preview--plain", "training-preview--mixed");

  const fragment = document.createDocumentFragment();
  const characters = createRotationCharacters(state.sourceText);

  characters.forEach((character) => {
    if (character.type === "space") {
      fragment.append(document.createTextNode(character.value));
      return;
    }

    const span = createAnimatedLetter(character, "rotating-letter");
    const style = getRotationStyle(character.index, state);
    span.style.setProperty("--rotation-direction", style.direction);
    span.style.setProperty("--rotation-duration", `${style.duration}s`);
    span.style.setProperty("--rotation-delay", `${style.delay}s`);
    fragment.append(span);
  });

  container.replaceChildren(fragment);
  logger.debug("[renderer] render", {
    mode: state.mode,
    tokenCount: characters.length,
    textLength: state.sourceText.length
  });
}

function renderMixTransformLetters(container, state) {
  container.classList.add("training-preview--mixed");
  container.classList.remove("training-preview--plain", "training-preview--rotating");

  const fragment = document.createDocumentFragment();
  const characters = createRotationCharacters(state.sourceText);
  let rotateCount = 0;
  let transformCount = 0;

  characters.forEach((character) => {
    if (character.type === "space") {
      fragment.append(document.createTextNode(character.value));
      return;
    }

    const style = getMixTransformStyle(character.index, state);
    const span = createAnimatedLetter(character, "mix-transform-letter");
    span.style.setProperty("--mix-duration", `${style.duration}s`);
    span.style.setProperty("--mix-delay", `${style.delay}s`);

    if (style.effect === "rotate") {
      rotateCount += 1;
      span.classList.add("mix-transform-letter--rotate");
      span.style.setProperty("--rotation-direction", style.direction);
    } else {
      transformCount += 1;
      span.classList.add("mix-transform-letter--morph", `mix-transform-sequence-${style.sequence}`);
    }

    fragment.append(span);
  });

  container.replaceChildren(fragment);
  logger.debug("[renderer] mix transform rendered", {
    charCount: rotateCount + transformCount,
    rotateCount,
    transformCount,
    textLength: state.sourceText.length
  });
}

function renderShuffledWords(container, state) {
  const shuffled = shuffleTextWords(state.sourceText, state.shuffleSeed);
  appendPlainText(container, shuffled);

  const wordCount = tokenizeText(state.sourceText).filter((token) => token.type === "word").length;
  logger.debug("[renderer] shuffled text rendered", { wordCount });
}

function renderEdgeShuffledWords(container, state) {
  const shuffled = shuffleTextWordsKeepingEdges(state.sourceText, state.shuffleSeed);
  appendPlainText(container, shuffled);

  const wordCount = tokenizeText(state.sourceText).filter((token) => token.type === "word").length;
  logger.debug("[renderer] fixed-edge shuffled text rendered", { wordCount });
}

export function renderTrainingText(container, state) {
  applyAnimationState(container, state);

  if (!state.sourceText.trim()) {
    logger.warn("[renderer] empty source text");
    appendPlainText(container, "");
    return;
  }

  if (state.isOriginalVisible) {
    appendPlainText(container, state.sourceText);
    logger.debug("[renderer] render", {
      mode: "original",
      tokenCount: tokenizeText(state.sourceText).length,
      textLength: state.sourceText.length
    });
    return;
  }

  if (state.mode === "shuffled-words") {
    renderShuffledWords(container, state);
    return;
  }

  if (state.mode === "shuffled-edges") {
    renderEdgeShuffledWords(container, state);
    return;
  }

  if (state.mode === "mix-transform") {
    renderMixTransformLetters(container, state);
    return;
  }

  renderRotatingLetters(container, state);
}
