
import test from "node:test";
import assert from "node:assert/strict";

import {
  publicKeyFromPrivate,
  serializePublicKey
} from "../js/primitives/ecc.js";

import {
  encryptECC
} from "../js/primitives/encryption.js";

import {
  bruteForceECC,
  attackAndDecryptECC
} from "../js/attacks/eccBruteForce.js";

test("Recover private key 357", () => {
  const publicKey = serializePublicKey(
    publicKeyFromPrivate(357n)
  );

  const result = bruteForceECC(publicKey, 1000);

  assert.equal(result.success, true);
  assert.equal(result.recoveredKey, 357n);
  assert.equal(result.attempts, 357);
});

test("Recover private key at start of range", () => {
  const publicKey = serializePublicKey(
    publicKeyFromPrivate(1n)
  );

  const result = bruteForceECC(publicKey, 1000);

  assert.equal(result.recoveredKey, 1n);
  assert.equal(result.attempts, 1);
});

test("Recover private key at end of range", () => {
  const publicKey = serializePublicKey(
    publicKeyFromPrivate(1000n)
  );

  const result = bruteForceECC(publicKey, 1000);

  assert.equal(result.recoveredKey, 1000n);
  assert.equal(result.attempts, 1000);
});

test("Attack fails if key is outside search range", () => {
  const publicKey = serializePublicKey(
    publicKeyFromPrivate(357n)
  );

  const result = bruteForceECC(publicKey, 100);

  assert.equal(result.success, false);
  assert.equal(result.recoveredKey, null);
  assert.equal(result.attempts, 100);
});

test("Attacker recovers key and decrypts message", () => {
  const bobPrivate = 357n;
  const bobPublic = publicKeyFromPrivate(bobPrivate);

  const encrypted = encryptECC(
    "HELLO WORLD",
    bobPublic,
    123n
  );

  const result = attackAndDecryptECC(
    serializePublicKey(bobPublic),
    encrypted,
    1000
  );

  assert.equal(result.success, true);
  assert.equal(result.recoveredKey, bobPrivate);
  assert.equal(result.plaintext, "HELLO WORLD");
});

test("Reject invalid search ranges", () => {
  const publicKey = serializePublicKey(
    publicKeyFromPrivate(357n)
  );

  assert.throws(
    () => bruteForceECC(publicKey, 0),
    RangeError
  );

  assert.throws(
    () => bruteForceECC(publicKey, 1.5),
    RangeError
  );
});
