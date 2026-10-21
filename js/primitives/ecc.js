
import { secp256k1 } from "@noble/curves/secp256k1.js";

export const CURVE_ORDER = secp256k1.Point.CURVE().n;

export function validatePrivateKey(privateKey) {
  if (
    typeof privateKey !== "bigint" ||
    privateKey < 1n ||
    privateKey >= CURVE_ORDER
  ) {
    throw new RangeError(
      "Private key must be a bigint in [1, n-1]."
    );
  }
}

export function publicKeyFromPrivate(privateKey) {
  validatePrivateKey(privateKey);

  return secp256k1.Point.BASE.multiply(privateKey);
}

export function serializePublicKey(point) {
  return point.toBytes(true);
}

export function deserializePublicKey(bytes) {
  return secp256k1.Point.fromBytes(bytes);
}

export function computeSharedPoint(
  privateKey,
  otherPublicKey
) {
  validatePrivateKey(privateKey);

  if (!(otherPublicKey instanceof secp256k1.Point)) {
    throw new TypeError("Expected a secp256k1 point.");
  }

  otherPublicKey.assertValidity();

  if (otherPublicKey.equals(secp256k1.Point.ZERO)) {
    throw new Error("Point at infinity is not allowed.");
  }

  return otherPublicKey.multiply(privateKey);
}
