
let currentEncryption = null;

const steps = [
  {
    title: "Bob Generates His Keys",
    description:
      "Bob chooses a private key d and computes " +
      "his public key by multiplying the elliptic-" +
      "curve generator G.",
    formula: "Q = d × G",
    note:
      "The public key can be shared. " +
      "The private key must remain secret."
  },
  {
    title: "Alice Creates an Ephemeral Key",
    description:
      "Alice generates a fresh random scalar r " +
      "and calculates the public point R.",
    formula: "R = r × G",
    note:
      "R is transmitted with the ciphertext. " +
      "The secret scalar r is not transmitted."
  },
  {
    title: "ECDH Shared Secret",
    description:
      "Alice computes r × Q. Bob independently " +
      "computes d × R. Both calculations " +
      "produce the same elliptic-curve point.",
    formula: "S = r × Q = d × R",
    note:
      "This is possible because Q = d × G " +
      "and R = r × G."
  },
  {
    title: "SHA-256 Keystream Derivation",
    description:
      "The shared secret is processed with " +
      "a SHA-256-based derivation procedure " +
      "to obtain a sequence of bytes.",
    formula: "K = KDF(S)",
    note:
      "SHA-256 is a hash function, not " +
      "an encryption algorithm."
  },
  {
    title: "Encrypt with XOR",
    description:
      "Alice converts the message into UTF-8 " +
      "bytes and XORs them with the keystream.",
    formula: "C = M XOR K",
    note:
      "The resulting ciphertext hides the " +
      "original message bytes."
  },
  {
    title: "Bob Decrypts the Message",
    description:
      "Bob reconstructs the same shared secret " +
      "and keystream, then applies XOR again.",
    formula: "M = C XOR K",
    note:
      "This educational construction is not " +
      "authenticated and must not be used " +
      "to protect real-world messages."
  }
];

export function initializeECCTutorial() {
  const counter = document.getElementById(
    "ecc-step-counter"
  );

  const title = document.getElementById(
    "ecc-step-title"
  );

  const description = document.getElementById(
    "ecc-step-description"
  );

  const formula = document.getElementById(
    "ecc-step-formula"
  );

  const note = document.getElementById(
    "ecc-step-note"
  );

  const previous = document.getElementById(
    "ecc-step-prev"
  );

  const next = document.getElementById(
    "ecc-step-next"
  );

  let currentStep = 0;

  function render() {
    const step = steps[currentStep];

    counter.textContent =
      `Step ${currentStep + 1} of ${steps.length}`;

    title.textContent = step.title;
    description.textContent = step.description;
    formula.textContent = step.formula;
    note.textContent = step.note;

    if (currentEncryption !== null) {
      if (currentStep === 0) {
        formula.textContent =
          `Q = ${currentEncryption.privateKey} × G`;

        note.textContent =
          "Bob's compressed public key: " +
          currentEncryption.publicKeyHex;
      }

      if (currentStep === 1) {
        formula.textContent = "R = r × G";

        note.textContent =
          "Alice's ephemeral public point R: " +
          currentEncryption.rHex;
      }

      if (currentStep === 4) {
        formula.textContent = "C = M XOR K";

        note.textContent =
          "Ciphertext (hex): " +
          currentEncryption.ciphertextHex;
      }

      if (currentStep === 5) {
        formula.textContent = "M = C XOR K";

        note.textContent =
          currentEncryption.decryptedMessage === null
            ? "Click Decrypt with ECC to recover the message."
            : "Recovered message: " +
              currentEncryption.decryptedMessage;
      }
    }

    previous.disabled = currentStep === 0;

    next.textContent =
      currentStep === steps.length - 1
        ? "Start Again"
        : "Next Step";
  }

  previous.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    render();
  });

  next.addEventListener("click", () => {
    currentStep =
      (currentStep + 1) % steps.length;

    render();
  });

  document.addEventListener(
    "ecc-tutorial-update",
    render
  );

  render();
}

// Called after ECC encryption
export function updateECCTutorial(data) {
  currentEncryption = {
    ...data,
    decryptedMessage: null
  };

  document.dispatchEvent(
    new Event("ecc-tutorial-update")
  );
}

// Called after ECC decryption
export function updateECCTutorialDecryption(message) {
  if (currentEncryption === null) {
    return;
  }

  currentEncryption.decryptedMessage = message;

  document.dispatchEvent(
    new Event("ecc-tutorial-update")
  );
}

// Called when the message or key changes
export function resetECCTutorial() {
  currentEncryption = null;

  document.dispatchEvent(
    new Event("ecc-tutorial-update")
  );
}
