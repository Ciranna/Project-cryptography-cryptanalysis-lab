
/**
 * Caesar Cipher — educational implementation.
 *
 * Alphabet: A-Z and a-z
 * Key: integer between 0 and 25
 * Other characters remain unchanged.
 */

export function validateCaesarKey(key) {
  if (!Number.isInteger(key) || key < 0 || key > 25) {
    throw new RangeError(
      "Caesar key must be an integer between 0 and 25."
    );
  }
}

function shiftCharacter(character, shift) {
  const code = character.charCodeAt(0);

  let alphabetStart;

  if (code >= 65 && code <= 90) {
    alphabetStart = 65;
  } else if (code >= 97 && code <= 122) {
    alphabetStart = 97;
  } else {
    return character;
  }

  const position = code - alphabetStart;

  const newPosition = ((position + shift) % 26 + 26) % 26;

  return String.fromCharCode(alphabetStart + newPosition);
}

export function caesarEncrypt(plaintext, key) {
  validateCaesarKey(key);

  if (typeof plaintext !== "string") {
    throw new TypeError("Plaintext must be a string.");
  }

  return [...plaintext]
    .map((character) => shiftCharacter(character, key))
    .join("");
}

export function caesarDecrypt(ciphertext, key) {
  validateCaesarKey(key);

  if (typeof ciphertext !== "string") {
    throw new TypeError("Ciphertext must be a string.");
  }

  return [...ciphertext]
    .map((character) => shiftCharacter(character, -key))
    .join("");
}
