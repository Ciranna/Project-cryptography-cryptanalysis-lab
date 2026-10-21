
import test from "node:test";
import assert from "node:assert/strict";

import {
  publicKeyFromPrivate
} from "../js/primitives/ecc.js";

import {
  encryptECC,
  decryptECC,
  xorBytes,
  deriveKeystream
} from "../js/primitives/encryption.js";

test("XOR is reversible", () => {
  const message = Uint8Array.from([72, 69, 76, 76, 79]);
  const key = Uint8Array.from([1, 2, 3, 4, 5]);

  const encrypted = xorBytes(message, key);
  const decrypted = xorBytes(encrypted, key);

  assert.deepEqual(decrypted, message);
});

test("Encrypt and decrypt HELLO WORLD", () => {
  const bobPrivate = 357n;
  const bobPublic = publicKeyFromPrivate(bobPrivate);

  const encrypted = encryptECC(
    "HELLO WORLD",
    bobPublic,
    123n
  );

  const decrypted = decryptECC(
    encrypted,
    bobPrivate
  );

  assert.equal(decrypted, "HELLO WORLD");
});

test("Encrypt and decrypt UTF-8 messages", () => {
  const bobPrivate = 357n;
  const bobPublic = publicKeyFromPrivate(bobPrivate);

  const message = "Crittografia: è tutto chiaro! 🔐";

  const encrypted = encryptECC(
    message,
    bobPublic,
    123n
  );

  assert.equal(
    decryptECC(encrypted, bobPrivate),
    message
  );
});

test("Ciphertext differs from plaintext bytes", () => {
  const bobPublic = publicKeyFromPrivate(357n);

  const encrypted = encryptECC(
    "HELLO WORLD",
    bobPublic,
    123n
  );

  const original = new TextEncoder().encode(
    "HELLO WORLD"
  );

  assert.notDeepEqual(
    encrypted.ciphertext,
    original
  );
});

test("Keystream supports messages longer than SHA-256 block", () => {
  const shared = publicKeyFromPrivate(42n);

  const stream = deriveKeystream(shared, 100);

  assert.equal(stream.length, 100);
});

test("Different ephemeral keys produce different ciphertexts", () => {
  const bobPublic = publicKeyFromPrivate(357n);

  const first = encryptECC(
    "HELLO WORLD",
    bobPublic,
    123n
  );

  const second = encryptECC(
    "HELLO WORLD",
    bobPublic,
    124n
  );

  assert.notDeepEqual(
    first.ciphertext,
    second.ciphertext
  );
});
