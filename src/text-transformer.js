const TOKEN_PATTERN = /(\s+|[\p{L}\p{M}\p{N}]+(?:[-'][\p{L}\p{M}\p{N}]+)*)/gu;
const WORD_PATTERN = /^[\p{L}\p{M}\p{N}]+(?:[-'][\p{L}\p{M}\p{N}]+)*$/u;
const TRAILING_PUNCTUATION_PATTERN = /^(.+?)([.,!?;:)"'\]\u00bb]+)$/u;

export function createSeededRandom(seed = 1) {
  let value = Math.trunc(seed) || 1;

  return function random() {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

export function tokenizeText(text) {
  const source = String(text ?? "");
  const tokens = [];
  let cursor = 0;

  for (const match of source.matchAll(TOKEN_PATTERN)) {
    if (match.index > cursor) {
      tokens.push({
        type: "punctuation",
        value: source.slice(cursor, match.index)
      });
    }

    const value = match[0];
    tokens.push({
      type: /^\s+$/u.test(value) ? "space" : "word",
      value
    });
    cursor = match.index + value.length;
  }

  if (cursor < source.length) {
    tokens.push({
      type: "punctuation",
      value: source.slice(cursor)
    });
  }

  return tokens;
}

export function splitCharacters(text) {
  return Array.from(String(text ?? ""));
}

export function createRotationCharacters(text) {
  return splitCharacters(text).map((character, index) => ({
    type: /\s/u.test(character) ? "space" : "char",
    value: character,
    index
  }));
}

function splitTrailingPunctuation(word) {
  const match = word.match(TRAILING_PUNCTUATION_PATTERN);

  if (!match || WORD_PATTERN.test(word)) {
    return { body: word, punctuation: "" };
  }

  return {
    body: match[1],
    punctuation: match[2]
  };
}

export function shuffleWordKeepingFirstLetter(word, random = Math.random) {
  const { body, punctuation } = splitTrailingPunctuation(String(word ?? ""));
  const letters = Array.from(body);

  if (letters.length <= 2 || !WORD_PATTERN.test(body)) {
    return word;
  }

  const first = letters[0];
  const rest = letters.slice(1);

  for (let index = rest.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [rest[index], rest[swapIndex]] = [rest[swapIndex], rest[index]];
  }

  return `${first}${rest.join("")}${punctuation}`;
}

export function shuffleWordKeepingFirstAndLastLetter(word, random = Math.random) {
  const { body, punctuation } = splitTrailingPunctuation(String(word ?? ""));
  const letters = Array.from(body);

  if (letters.length <= 3 || !WORD_PATTERN.test(body)) {
    return word;
  }

  const first = letters[0];
  const last = letters.at(-1);
  const middle = letters.slice(1, -1);

  for (let index = middle.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [middle[index], middle[swapIndex]] = [middle[swapIndex], middle[index]];
  }

  return `${first}${middle.join("")}${last}${punctuation}`;
}

export function shuffleTextWords(text, seed = 1) {
  const random = createSeededRandom(seed);
  return tokenizeText(text)
    .map((token) => {
      if (token.type !== "word") {
        return token.value;
      }

      return shuffleWordKeepingFirstLetter(token.value, random);
    })
    .join("");
}

export function shuffleTextWordsKeepingEdges(text, seed = 1) {
  const random = createSeededRandom(seed);
  return tokenizeText(text)
    .map((token) => {
      if (token.type !== "word") {
        return token.value;
      }

      return shuffleWordKeepingFirstAndLastLetter(token.value, random);
    })
    .join("");
}
