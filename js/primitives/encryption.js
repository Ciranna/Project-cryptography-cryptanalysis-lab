
import { sha256 } from "@noble/hashes/sha2.js";
import { randomBytes } from "@noble/hashes/utils.js";

import {
  CURVE_ORDER,
  validatePrivateKey,
  publicKeyFromPrivate,
  computeSharedPoint,
  serializePublicKey,
  deserializePublicKey
} from "./ecc.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

const DOMAIN = encoder.encode("ECC-TOY-HMWK2-V1");

function concatBytes(...arrays) {
  const total = arrays.reduce(
    (sum, array) => sum + array.length, 0
  );

  const result = new Uint8Array(total);
  let offset = 0;

  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }

  return result;
}

function counterBytes(counter) {
  const result = new Uint8Array(4);
  const view = new DataView(result.buffer);

  view.setUint32(0, counter, false);

  return result;
}

export function deriveKeystream(sharedPoint, length) {
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new RangeError("Invalid keystream length.");
  }

  const sharedBytes = serializePublicKey(sharedPoint);
  const output = new Uint8Array(length);

  let offset = 0;
  let counter = 0;

  while (offset < length) {
    const block = sha256(
      concatBytes(
        DOMAIN,
        sharedBytes,
        counterBytes(counter)
      )
    );

    const available = Math.min(
      block.length,
      length - offset
    );

    output.set(block.subarray(0, available), offset);

    offset += available;
    counter++;
  }

  return output;
}

export function xorBytes(a, b) {
  if (a.length !== b.length) {
    throw new RangeError("XOR inputs must have equal length.");
  }

  const result = new Uint8Array(a.length);

  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }

  return result;
}

export function generateEphemeralPrivateKey() {
  while (true) {
    const bytes = randomBytes(32);

    const hex = Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");

    const candidate = BigInt(`0x${hex}`);

    if (candidate >= 1n && candidate < CURVE_ORDER) {
      return candidate;
    }
  }
}

/**
 * Educational encryption.
 *
 * recipientPublicKey: Bob's public point
 * ephemeralPrivateKey: optional, for deterministic tests
 */
export function encryptECC(
  plaintext,
  recipientPublicKey,
  ephemeralPrivateKey = generateEphemeralPrivateKey()
) {
  if (typeof plaintext !== "string") {
    throw new TypeError("Plaintext must be a string.");
  }

  validatePrivateKey(ephemeralPrivateKey);

  const R = publicKeyFromPrivate(ephemeralPrivateKey);

  const sharedPoint = computeSharedPoint(
    ephemeralPrivateKey,
    recipientPublicKey
  );

  const plaintextBytes = encoder.encode(plaintext);

  const keystream = deriveKeystream(
    sharedPoint,
    plaintextBytes.length
  );

  const ciphertext = xorBytes(
    plaintextBytes,
    keystream
  );

  return {
    R: serializePublicKey(R),
    ciphertext
  };
}

export function decryptECC(
  encrypted,
  recipientPrivateKey
) {
  validatePrivateKey(recipientPrivateKey);

  const R = deserializePublicKey(encrypted.R);

  const sharedPoint = computeSharedPoint(
    recipientPrivateKey,
    R
  );

  const keystream = deriveKeystream(
    sharedPoint,
    encrypted.ciphertext.length
  );

  const plaintextBytes = xorBytes(
    encrypted.ciphertext,
    keystream
  );

  return decoder.decode(plaintextBytes);
}
