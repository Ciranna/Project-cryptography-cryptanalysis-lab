
import test from "node:test";
import assert from "node:assert/strict";

import {
  countLetters,
  calculateChiSquared
} from "../js/analysis/statistics.js";

import {
  caesarEncrypt
} from "../js/primitives/caesar.js";

import {
  attackCaesar
} from "../js/attacks/caesarAttack.js";

test("Count English letters correctly", () => {
  const result = countLetters("AAB! 123");

  assert.equal(result.total, 3);
  assert.equal(result.counts[0], 2);
  assert.equal(result.counts[1], 1);
});

test("Chi-squared returns a finite score", () => {
  const score = calculateChiSquared(
    "THIS IS A SAMPLE ENGLISH SENTENCE"
  );

  assert.ok(Number.isFinite(score));
  assert.ok(score >= 0);
});

test("Empty letter sample has no statistical score", () => {
  assert.equal(calculateChiSquared("123 !!!"), Infinity);
});

test("Attack evaluates all 26 Caesar keys", () => {
  const result = attackCaesar("KHOOR ZRUOG");

  assert.equal(result.candidates.length, 26);
  assert.deepEqual(
    result.candidates.map(item => item.key).sort((a, b) => a - b),
    Array.from({ length: 26 }, (_, i) => i)
  );
});

test("Correct plaintext appears among candidates", () => {
  const result = attackCaesar("KHOOR ZRUOG");

  const candidate = result.candidates.find(
    item => item.key === 3
  );

  assert.equal(candidate.plaintext, "HELLO WORLD");
});

test("Recover key on a sufficiently long English sample", () => {
  const plaintext = (
    "THE STUDENTS ARE LEARNING ABOUT CRYPTOGRAPHY " +
    "AND STATISTICAL ANALYSIS OF ENGLISH TEXT. " +
    "THE DISTRIBUTION OF LETTERS PROVIDES USEFUL " +
    "INFORMATION WHEN THE MESSAGE IS LONG ENOUGH. "
  ).repeat(20);

  const key = 7;
  const ciphertext = caesarEncrypt(plaintext, key);

  const result = attackCaesar(ciphertext);

  assert.equal(result.bestCandidate.key, key);
  assert.equal(result.bestCandidate.plaintext, plaintext);
});

test("Reject ciphertext without letters", () => {
  assert.throws(
    () => attackCaesar("123 !!!"),
    /at least one/
  );
});

test("Reject non-string ciphertext", () => {
  assert.throws(
    () => attackCaesar(null),
    TypeError
  );
});
