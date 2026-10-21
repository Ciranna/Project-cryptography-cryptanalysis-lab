
import {
  caesarDecrypt
} from "../primitives/caesar.js";

import {
  countLetters,
  calculateChiSquared
} from "../analysis/statistics.js";

/**
 * Try every Caesar key and rank the resulting
 * plaintext candidates by chi-squared score.
 */
export function attackCaesar(ciphertext) {
  if (typeof ciphertext !== "string") {
    throw new TypeError("Ciphertext must be a string.");
  }

  const { total } = countLetters(ciphertext);

  if (total === 0) {
    throw new Error(
      "Ciphertext must contain at least one A-Z letter."
    );
  }

  const candidates = [];

  for (let key = 0; key < 26; key++) {
    const plaintext = caesarDecrypt(ciphertext, key);

    const score = calculateChiSquared(plaintext);

    candidates.push({
      key,
      plaintext,
      score
    });
  }

  candidates.sort(
    (a, b) => a.score - b.score || a.key - b.key
  );

  return {
    bestCandidate: candidates[0],
    candidates,
    analyzedLetters: total
  };
}
