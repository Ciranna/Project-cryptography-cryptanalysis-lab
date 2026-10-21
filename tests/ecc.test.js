
import test from "node:test";
import assert from "node:assert/strict";

import {
  publicKeyFromPrivate,
  serializePublicKey,
  deserializePublicKey,
  computeSharedPoint
} from "../js/primitives/ecc.js";

test("Generate a valid secp256k1 public key", () => {
  const Q = publicKeyFromPrivate(357n);

  assert.equal(
    serializePublicKey(Q).length,
    33
  );
});

test("Public key serialization round trip", () => {
  const Q = publicKeyFromPrivate(357n);

  const restored = deserializePublicKey(
    serializePublicKey(Q)
  );

  assert.ok(Q.equals(restored));
});

test("ECDH produces the same shared point", () => {
  const bobPrivate = 357n;
  const alicePrivate = 123n;

  const bobPublic = publicKeyFromPrivate(bobPrivate);
  const alicePublic = publicKeyFromPrivate(alicePrivate);

  const sharedAlice = computeSharedPoint(
    alicePrivate,
    bobPublic
  );

  const sharedBob = computeSharedPoint(
    bobPrivate,
    alicePublic
  );

  assert.ok(sharedAlice.equals(sharedBob));
});

test("Reject invalid private keys", () => {
  assert.throws(
    () => publicKeyFromPrivate(0n),
    RangeError
  );

  assert.throws(
    () => publicKeyFromPrivate(-1n),
    RangeError
  );
});
