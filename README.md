# Cryptography & Cryptanalysis Lab

An interactive educational web application demonstrating the relationship between encryption, decryption, cryptanalysis, and key-space security.

The project compares a classical substitution cipher with a simplified elliptic-curve-based encryption scheme and demonstrates how different weaknesses can be exploited by an attacker.

## Features

### 1. Caesar Cipher

- Encrypt and decrypt text using a configurable shift key.
- Visualize character transformations and alphabet shifts.
- Preserve letter case, spaces, numbers, and punctuation.
- Recover candidate encryption keys through frequency analysis.
- Compare observed letter frequencies with expected English-language frequencies.
- Rank candidate keys using the chi-squared statistic.
- Experiment with ciphertext length and attack success rates.

### 2. Elliptic-Curve Cryptography (ECC)

- Generate secp256k1 public keys from private keys.
- Demonstrate elliptic-curve scalar multiplication.
- Use an ephemeral elliptic-curve key to establish a shared secret through ECDH.
- Derive a keystream using an educational SHA-256-based procedure.
- Encrypt and decrypt UTF-8 messages using XOR.
- Explore the encryption process through a six-step interactive tutorial.

### 3. ECC Brute-Force Cryptanalysis

- Demonstrate an attack against an artificially restricted private-key space.
- Test candidate private keys against a known public key.
- Visualize actual candidate public keys and comparisons.
- Inspect individual attempts and attack progress.
- Recover the private key when it falls within the search range.
- Decrypt intercepted ciphertext using the recovered key.

## Mathematical Background

### Caesar Cipher

Encryption:

\[
E_k(x) = (x + k) \bmod 26
\]

Decryption:

\[
D_k(y) = (y - k) \bmod 26
\]

The statistical attack evaluates candidate shifts against expected English letter frequencies using a chi-squared goodness-of-fit statistic.

### Elliptic-Curve Cryptography

Bob generates his public key:

\[
Q_B = d_B G
\]

Alice generates an ephemeral public point:

\[
R = rG
\]

Both parties compute the same shared secret:

\[
S = rQ_B = d_BR
\]

A keystream is derived from the shared secret:

\[
K = \operatorname{KDF}(S)
\]

Encryption and decryption use XOR:

\[
C = M \oplus K
\]

\[
M = C \oplus K
\]

### ECC Brute-Force Attack

The attacker searches for a private key \(d\) satisfying:

\[
dG = Q_B
\]

For educational purposes, the search is restricted to a small range, typically 1–1000.

This demonstrates the consequences of weak private-key selection. It does not imply that correctly generated secp256k1 private keys are practically recoverable by brute force.

## Technologies

- HTML5
- CSS3
- JavaScript (ES modules)
- Vite
- Node.js test runner
- `@noble/curves` for secp256k1 operations
- SHA-256

## Installation

Requirements: Node.js and npm.

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production application:

```bash
npm run build
```

Run the automated tests:

```bash
npm test
```

## Testing

The project includes 35 automated tests covering Caesar encryption and decryption, statistical cryptanalysis, elliptic-curve operations, ECDH shared-secret agreement, key recovery, XOR, UTF-8 messages, and encryption/decryption consistency.

The project also includes statistical experiments exploring the effect of ciphertext length on Caesar key recovery.

## Educational Security Disclaimer

**This application is designed exclusively for educational and experimental purposes.**

The ECC encryption construction uses a simplified, nonstandard SHA-256-based keystream derivation procedure and XOR without authenticated encryption. It must not be used to protect sensitive or real-world information.

The ECC brute-force demonstration deliberately restricts the private-key space to illustrate the consequences of insufficient key entropy.

## Academic Context

Developed as an educational project exploring cryptography, cryptanalysis, probability, and statistical reasoning.

The goal is to make cryptographic operations and attacks observable, understandable, and reproducible through an interactive browser interface.
