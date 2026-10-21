
/**
 * Reference frequencies for English letters.
 * Approximate percentages from general English text.
 */

export const ENGLISH_FREQUENCIES = Object.freeze([
  8.167, 1.492, 2.782, 4.253, 12.702, 2.228,
  2.015, 6.094, 6.966, 0.153, 0.772, 4.025,
  2.406, 6.749, 7.507, 1.929, 0.095, 5.987,
  6.327, 9.056, 2.758, 0.978, 2.360, 0.150,
  1.974, 0.074
]);

export function countLetters(text) {
  if (typeof text !== "string") {
    throw new TypeError("Text must be a string.");
  }

  const counts = Array(26).fill(0);
  let total = 0;

  for (const character of text.toUpperCase()) {
    const code = character.charCodeAt(0);

    if (code >= 65 && code <= 90) {
      counts[code - 65]++;
      total++;
    }
  }

  return { counts, total };
}

export function calculateChiSquared(
  text,
  referenceFrequencies = ENGLISH_FREQUENCIES
) {
  if (
    !Array.isArray(referenceFrequencies) ||
    referenceFrequencies.length !== 26 ||
    referenceFrequencies.some(
      (value) => !Number.isFinite(value) || value <= 0
    )
  ) {
    throw new TypeError(
      "Reference frequencies must contain 26 positive values."
    );
  }

  const { counts, total } = countLetters(text);

  if (total === 0) {
    return Infinity;
  }

  const frequencySum = referenceFrequencies.reduce(
    (sum, value) => sum + value,
    0
  );

  let chiSquared = 0;

  for (let i = 0; i < 26; i++) {
    const observed = counts[i];

    const expected =
      total * referenceFrequencies[i] / frequencySum;

    chiSquared +=
      ((observed - expected) ** 2) / expected;
  }

  return chiSquared;
}
