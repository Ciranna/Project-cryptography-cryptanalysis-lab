
import { caesarEncrypt } from "../primitives/caesar.js";
import { attackCaesar } from "../attacks/caesarAttack.js";
import { ENGLISH_CORPUS } from "../../data/englishCorpus.js";

export const DEFAULT_LENGTHS = [
  10, 25, 50, 100, 200, 500
];

/**
 * Deterministic pseudo-random generator.
 * Used only for reproducible experiments.
 * NOT cryptographically secure.
 */
export function createSeededRandom(seed = 12345) {
  let state = seed >>> 0;

  return function random() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function normalizeCorpus(corpus) {
  if (typeof corpus !== "string") {
    throw new TypeError("Corpus must be a string.");
  }

  return corpus.toUpperCase().replace(/[^A-Z]/g, "");
}

export function runCaesarExperiments({
  corpus = ENGLISH_CORPUS,
  lengths = DEFAULT_LENGTHS,
  trialsPerLength = 100,
  seed = 12345
} = {}) {
  const normalized = normalizeCorpus(corpus);

  if (
    !Array.isArray(lengths) ||
    lengths.length === 0 ||
    lengths.some(n => !Number.isInteger(n) || n <= 0)
  ) {
    throw new RangeError("Invalid sample lengths.");
  }

  if (
    !Number.isInteger(trialsPerLength) ||
    trialsPerLength <= 0
  ) {
    throw new RangeError("Invalid number of trials.");
  }

  if (!Number.isSafeInteger(seed)) {
    throw new RangeError("Seed must be a safe integer.");
  }

  if (Math.max(...lengths) > normalized.length) {
    throw new RangeError(
      "Corpus is shorter than the largest sample."
    );
  }

  const random = createSeededRandom(seed);
  const results = [];

  for (const length of lengths) {
    let successfulAttacks = 0;
    let rankSum = 0;
    let correctScoreSum = 0;

    for (let trial = 0; trial < trialsPerLength; trial++) {
      const maxStart = normalized.length - length;

      const start = Math.floor(
        random() * (maxStart + 1)
      );

      const plaintext = normalized.slice(
        start,
        start + length
      );

      const key = Math.floor(random() * 26);

      const ciphertext = caesarEncrypt(
        plaintext,
        key
      );

      const attack = attackCaesar(ciphertext);

      if (attack.bestCandidate.key === key) {
        successfulAttacks++;
      }

      const correctIndex = attack.candidates.findIndex(
        candidate => candidate.key === key
      );

      rankSum += correctIndex + 1;
      correctScoreSum += attack.candidates[
        correctIndex
      ].score;
    }

    results.push({
      length,
      trials: trialsPerLength,
      successes: successfulAttacks,
      accuracy: 100 * successfulAttacks / trialsPerLength,
      averageRank: rankSum / trialsPerLength,
      averageCorrectScore:
        correctScoreSum / trialsPerLength
    });
  }

  return results;
}
