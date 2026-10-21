
import { secp256k1 } from "@noble/curves/secp256k1.js";

import {
  serializePublicKey,
  deserializePublicKey
} from "../primitives/ecc.js";

import { decryptECC } from "../primitives/encryption.js";

/**
 * Educational brute-force attack against an
 * artificially restricted ECC private-key space.
 *
 * Search range: 1 ... maxKey
 */

export function bruteForceECC(
  publicKeyBytes,
  maxKey = 1000,
  onAttempt = null
) {
  if (
    !Number.isSafeInteger(maxKey) ||
    maxKey < 1 ||
    maxKey > 100000
  ) {
    throw new RangeError(
      "maxKey must be an integer between 1 and 100000."
    );
  }

  if (
    onAttempt !== null &&
    typeof onAttempt !== "function"
  ) {
    throw new TypeError(
      "onAttempt must be a function or null."
    );
  }

  const target = deserializePublicKey(publicKeyBytes);

  target.assertValidity();

  if (target.equals(secp256k1.Point.ZERO)) {
    throw new Error(
      "Invalid public key: point at infinity."
    );
  }

  const generator = secp256k1.Point.BASE;
  let candidatePoint = generator;

  for (
    let candidate = 1;
    candidate <= maxKey;
    candidate++
  ) {
    const match = candidatePoint.equals(target);

    if (onAttempt !== null) {
      onAttempt({
        candidate,
        match,
        publicKeyHex: Array.from(
          candidatePoint.toBytes(true),
          byte => byte.toString(16).padStart(2, "0")
        ).join("")
      });
    }

    if (match) {
      return {
        recoveredKey: BigInt(candidate),
        attempts: candidate,
        success: true
      };
    }

    if (candidate < maxKey) {
      candidatePoint = candidatePoint.add(generator);
    }
  }

  return {
    recoveredKey: null,
    attempts: maxKey,
    success: false
  };
}


/**
 * Recover the private key and then decrypt
 * the intercepted message.
 */

export function attackAndDecryptECC(
  publicKeyBytes,
  encrypted,
  maxKey = 1000,
  onAttempt = null
) {
  const attack = bruteForceECC(
    publicKeyBytes,
    maxKey,
    onAttempt
  );

  if (!attack.success) {
    return {
      ...attack,
      plaintext: null
    };
  }

  const plaintext = decryptECC(
    encrypted,
    attack.recoveredKey
  );

  return {
    ...attack,
    plaintext
  };
}

