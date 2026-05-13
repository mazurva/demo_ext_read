import test from "node:test";
import assert from "node:assert/strict";

import {
  createRotationCharacters,
  createSeededRandom,
  shuffleTextWordsKeepingEdges,
  shuffleTextWords,
  shuffleWordKeepingFirstAndLastLetter,
  shuffleWordKeepingFirstLetter,
  tokenizeText
} from "../src/text-transformer.js";

test("tokenizeText handles an empty string", () => {
  assert.deepEqual(tokenizeText(""), []);
});

test("tokenizeText preserves words, spaces, punctuation, and line breaks", () => {
  const source = "Hello, мир!\n\nNew line.";
  const tokens = tokenizeText(source);
  assert.equal(tokens.map((token) => token.value).join(""), source);
  assert.ok(tokens.some((token) => token.type === "space" && token.value.includes("\n\n")));
  assert.ok(tokens.some((token) => token.type === "punctuation" && token.value === ","));
});

test("createRotationCharacters preserves character positions", () => {
  const source = "A Б\nC";
  const characters = createRotationCharacters(source);
  assert.equal(characters.map((character) => character.value).join(""), source);
  assert.deepEqual(characters.map((character) => character.index), [0, 1, 2, 3, 4]);
});

test("shuffleWordKeepingFirstLetter keeps short words unchanged", () => {
  assert.equal(shuffleWordKeepingFirstLetter("я"), "я");
  assert.equal(shuffleWordKeepingFirstLetter("мы"), "мы");
});

test("shuffleWordKeepingFirstLetter keeps first letter and punctuation", () => {
  const random = createSeededRandom(7);
  const result = shuffleWordKeepingFirstLetter("память!", random);
  assert.equal(result[0], "п");
  assert.equal(result.at(-1), "!");
  assert.equal(Array.from(result.slice(0, -1)).length, Array.from("память").length);
});

test("shuffleTextWords preserves spaces and line breaks", () => {
  const source = "Первый  текст.\nSecond line!";
  const result = shuffleTextWords(source, 3);
  assert.equal(result.includes("  "), true);
  assert.equal(result.includes("\n"), true);
  assert.equal(result.endsWith("!"), true);
});

test("shuffleTextWords keeps word order and first letters", () => {
  const result = shuffleTextWords("alpha beta gamma", 5);
  const words = result.split(" ");
  assert.equal(words.length, 3);
  assert.equal(words[0][0], "a");
  assert.equal(words[1][0], "b");
  assert.equal(words[2][0], "g");
});

test("shuffleWordKeepingFirstAndLastLetter keeps short words unchanged", () => {
  assert.equal(shuffleWordKeepingFirstAndLastLetter("a"), "a");
  assert.equal(shuffleWordKeepingFirstAndLastLetter("at"), "at");
  assert.equal(shuffleWordKeepingFirstAndLastLetter("cat"), "cat");
});

test("shuffleWordKeepingFirstAndLastLetter preserves first, last, and punctuation", () => {
  const result = shuffleWordKeepingFirstAndLastLetter("training!", createSeededRandom(11));
  assert.equal(result[0], "t");
  assert.equal(result.at(-2), "g");
  assert.equal(result.at(-1), "!");
  assert.equal(Array.from(result.slice(0, -1)).sort().join(""), Array.from("training").sort().join(""));
});

test("shuffleTextWordsKeepingEdges preserves spacing and fixed word edges", () => {
  const source = "alpha  beta\ngamma!";
  const result = shuffleTextWordsKeepingEdges(source, 13);
  const words = result.split(/\s+/u);

  assert.equal(result.includes("  "), true);
  assert.equal(result.includes("\n"), true);
  assert.equal(words[0][0], "a");
  assert.equal(words[0].at(-1), "a");
  assert.equal(words[1][0], "b");
  assert.equal(words[1].at(-1), "a");
  assert.equal(words[2][0], "g");
  assert.equal(words[2].at(-2), "a");
  assert.equal(words[2].at(-1), "!");
});
