
import test from "node:test";
import assert from "node:assert/strict";

import {
  caesarEncrypt,
  caesarDecrypt,
  validateCaesarKey
} from "../js/primitives/caesar.js";

test("Encrypt HELLO WORLD with key 3", () => {
  assert.equal(
    caesarEncrypt("HELLO WORLD", 3),
    "KHOOR ZRUOG"
  );
});

test("Decrypt KHOOR ZRUOG with key 3", () => {
  assert.equal(
    caesarDecrypt("KHOOR ZRUOG", 3),
    "HELLO WORLD"
  );
});

test("Preserve lowercase letters", () => {
  assert.equal(
    caesarEncrypt("hello", 3),
    "khoor"
  );
});

test("Wrap around the alphabet", () => {
  assert.equal(
    caesarEncrypt("XYZ", 3),
    "ABC"
  );
});

test("Preserve spaces, numbers and punctuation", () => {
  assert.equal(
    caesarEncrypt("Hello, World! 123", 3),
    "Khoor, Zruog! 123"
  );
});

test("Key zero leaves the message unchanged", () => {
  assert.equal(
    caesarEncrypt("HELLO", 0),
    "HELLO"
  );
});

test("Key 25 works correctly", () => {
  assert.equal(
    caesarEncrypt("ABC", 25),
    "ZAB"
  );
});

test("Reject invalid keys", () => {
  assert.throws(() => validateCaesarKey(-1), RangeError);
  assert.throws(() => validateCaesarKey(26), RangeError);
  assert.throws(() => validateCaesarKey(1.5), RangeError);
  assert.throws(() => validateCaesarKey("3"), RangeError);
});

test("Reject non-string messages", () => {
  assert.throws(
    () => caesarEncrypt(null, 3),
    TypeError
  );
});

test("Encryption and decryption are inverse operations", () => {
  const messages = [
    "HELLO WORLD",
    "Cryptography 2026!",
    "XYZ abc",
    "A longer message with punctuation."
  ];

  for (let key = 0; key < 26; key++) {
    for (const message of messages) {
      const encrypted = caesarEncrypt(message, key);
      const decrypted = caesarDecrypt(encrypted, key);

      assert.equal(decrypted, message);
    }
  }
});
