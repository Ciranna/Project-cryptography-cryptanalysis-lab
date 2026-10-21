import {
  initializeECCAttackVisualization
} from "./ui/eccAttackVisualization.js";

import {
  initializeECCTutorial,
  updateECCTutorial,
  updateECCTutorialDecryption,
  resetECCTutorial
} from "./ui/eccTutorial.js";

import {
  renderCaesarKeyScores
} from "./ui/caesarKeyScores.js";

import {
  renderFrequencyChart
} from "./ui/frequencyChart.js";

import {
  renderCaesarSteps
} from "./ui/caesarSteps.js";

import {
  attackAndDecryptECC
} from "./attacks/eccBruteForce.js";

import {
  publicKeyFromPrivate,
  serializePublicKey
} from "./primitives/ecc.js";

import {
  encryptECC,
  decryptECC
} from "./primitives/encryption.js";

import {
  runCaesarExperiments
} from "./analysis/experiments.js";

const experimentsButton = document.getElementById(
  "run-experiments-btn"
);

const experimentsStatus = document.getElementById(
  "experiments-status"
);

const experimentsResults = document.getElementById(
  "experiments-results"
);

const experimentsTableBody = document.getElementById(
  "experiments-table-body"
);

const accuracyChart = document.getElementById(
  "accuracy-chart"
);

const experimentsInterpretation = document.getElementById(
  "experiments-interpretation"
);

import {
  caesarEncrypt,
  caesarDecrypt
} from "./primitives/caesar.js";

import {
  attackCaesar
} from "./attacks/caesarAttack.js";

const messageInput = document.getElementById("message-input");
const keyInput = document.getElementById("caesar-key");

const encryptButton = document.getElementById(
  "caesar-encrypt-btn"
);
const decryptButton = document.getElementById(
  "caesar-decrypt-btn"
);
const attackButton = document.getElementById(
  "caesar-attack-btn"
);

const ciphertextOutput = document.getElementById(
  "caesar-ciphertext"
);
const plaintextOutput = document.getElementById(
  "caesar-plaintext"
);

const attackStatus = document.getElementById(
  "caesar-attack-status"
);
const attackResults = document.getElementById(
  "caesar-attack-results"
);
const recoveredKeyOutput = document.getElementById(
  "recovered-caesar-key"
);
const recoveredTextOutput = document.getElementById(
  "recovered-caesar-text"
);
const candidatesBody = document.getElementById(
  "caesar-candidates-body"
);


let currentCiphertext = null;

function getCaesarKey() {
  const value = keyInput.value.trim();
  const key = Number(value);

  if (
    value === "" ||
    !Number.isInteger(key) ||
    key < 0 ||
    key > 25
  ) {
    throw new RangeError(
      "Please enter an integer key between 0 and 25."
    );
  }

  return key;
}

function resetAttackResults() {
  attackResults.hidden = true;
  candidatesBody.replaceChildren();
  attackStatus.textContent =
    "Encrypt a message first, then run the attack.";
}

function encryptMessage() {
  try {
    const plaintext = messageInput.value;
    const key = getCaesarKey();

    currentCiphertext = caesarEncrypt(
      messageInput.value,
      key
    );

    ciphertextOutput.textContent = currentCiphertext;
    renderCaesarSteps(
        plaintext,
        key,
        document.getElementById("caesar-steps-content")
    );

    plaintextOutput.textContent = "—";

    resetAttackResults();
  } catch (error) {
    alert(error.message);
  }
}

function decryptMessage() {
  try {
    if (currentCiphertext === null) {
      throw new Error("Encrypt a message first.");
    }

    const key = getCaesarKey();

    plaintextOutput.textContent = caesarDecrypt(
      currentCiphertext,
      key
    );
  } catch (error) {
    alert(error.message);
  }
}

function runCaesarAttack() {
  try {
    if (currentCiphertext === null) {
      throw new Error("Encrypt a message first.");
    }

    const result = attackCaesar(currentCiphertext);
    const best = result.bestCandidate;

    renderFrequencyChart(
        best.plaintext,
        document.getElementById("frequency-chart")
    );

    renderCaesarKeyScores(
        result.candidates,
        document.getElementById("caesar-key-scores")
    );

    recoveredKeyOutput.textContent =
      `Candidate key: ${best.key}`;

    recoveredTextOutput.textContent = best.plaintext;

    candidatesBody.replaceChildren();

    for (const [index, candidate] of
      result.candidates.slice(0, 5).entries()) {

      const row = document.createElement("tr");

      const values = [
        index + 1,
        candidate.key,
        candidate.score.toFixed(2),
        candidate.plaintext.slice(0, 65)
      ];

      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        row.appendChild(cell);
      }

      candidatesBody.appendChild(row);
    }

    attackStatus.textContent =
      `Analyzed ${result.analyzedLetters} letters. ` +
      "The lowest chi-squared score is the best " +
      "statistical candidate, not a guaranteed match.";

    attackResults.hidden = false;
  } catch (error) {
    alert(error.message);
  }
}


function renderAccuracyChart(results) {
  accuracyChart.replaceChildren();

  for (const result of results) {
    const row = document.createElement("div");
    row.className = "chart-row";

    const label = document.createElement("span");
    label.textContent = `${result.length} letters`;

    const track = document.createElement("div");
    track.className = "chart-track";

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.width = `${result.accuracy}%`;

    const value = document.createElement("span");
    value.textContent = `${result.accuracy.toFixed(1)}%`;

    track.appendChild(bar);
    row.append(label, track, value);
    accuracyChart.appendChild(row);
  }
}

function runExperiments() {
  experimentsButton.disabled = true;
  experimentsStatus.textContent =
    "Running reproducible statistical experiments...";

  try {
    const results = runCaesarExperiments();

    experimentsTableBody.replaceChildren();

    for (const result of results) {
      const row = document.createElement("tr");

      const values = [
        result.length,
        result.trials,
        result.successes,
        `${result.accuracy.toFixed(1)}%`,
        result.averageRank.toFixed(2)
      ];

      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        row.appendChild(cell);
      }

      experimentsTableBody.appendChild(row);
    }

    renderAccuracyChart(results);

    const first = results[0];
    const last = results.at(-1);

    const difference = last.accuracy - first.accuracy;

    const trend = difference > 0
      ? "increased"
      : difference < 0
        ? "decreased"
        : "remained unchanged";

    experimentsInterpretation.textContent =
      `Across the tested sample lengths, accuracy ` +
      `${trend} from ${first.accuracy.toFixed(1)}% ` +
      `at ${first.length} letters to ` +
      `${last.accuracy.toFixed(1)}% at ` +
      `${last.length} letters. ` +
      `These results depend on the selected corpus, ` +
      `the chi-squared model, and the sampling method. ` +
      `They do not establish a universal success rate.`;

    experimentsStatus.textContent =
      `Completed ${results.reduce(
        (sum, result) => sum + result.trials, 0
      )} attacks using seed 12345.`;

    experimentsResults.hidden = false;
  } catch (error) {
    experimentsStatus.textContent = error.message;
  } finally {
    experimentsButton.disabled = false;
  }
}

encryptButton.addEventListener("click", encryptMessage);
decryptButton.addEventListener("click", decryptMessage);
attackButton.addEventListener("click", runCaesarAttack);

messageInput.addEventListener("input", () => {
  currentCiphertext = null;
  ciphertextOutput.textContent = "—";
  plaintextOutput.textContent = "—";
  resetAttackResults();
});

experimentsButton.addEventListener(
  "click",
  runExperiments
);





const eccPrivateInput = document.getElementById(
  "ecc-private-key"
);

const eccEncryptButton = document.getElementById(
  "ecc-encrypt-btn"
);

const eccDecryptButton = document.getElementById(
  "ecc-decrypt-btn"
);

const eccResults = document.getElementById(
  "ecc-results"
);

const eccPrivateOutput = document.getElementById(
  "ecc-private-output"
);

const eccPublicOutput = document.getElementById(
  "ecc-public-output"
);

const eccROutput = document.getElementById(
  "ecc-r-output"
);

const eccCiphertextOutput = document.getElementById(
  "ecc-ciphertext-output"
);

const eccPlaintextOutput = document.getElementById(
  "ecc-plaintext-output"
);

let currentECCEncrypted = null;
let currentECCPrivateKey = null;
let currentECCPublicKeyBytes = null;

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getECCPrivateKey() {
  const value = eccPrivateInput.value.trim();

  if (!/^\d+$/.test(value)) {
    throw new RangeError(
      "Enter an integer private key between 1 and 1000."
    );
  }

  const key = BigInt(value);

  if (key < 1n || key > 1000n) {
    throw new RangeError(
      "Private key must be between 1 and 1000."
    );
  }

  return key;
}

function encryptECCMessage() {
  try {
    const bobPrivate = getECCPrivateKey();
    const bobPublic = publicKeyFromPrivate(bobPrivate);

    const encrypted = encryptECC(
      messageInput.value,
      bobPublic
    );

    currentECCEncrypted = encrypted;
    currentECCPrivateKey = bobPrivate;

    currentECCPublicKeyBytes =
        serializePublicKey(bobPublic);

    eccPrivateOutput.textContent =
      bobPrivate.toString();

    eccPublicOutput.textContent = bytesToHex(
      serializePublicKey(bobPublic)
    );

    eccROutput.textContent = bytesToHex(encrypted.R);

    eccCiphertextOutput.textContent = bytesToHex(
      encrypted.ciphertext
    );

    eccPlaintextOutput.textContent = "—";

    eccResults.hidden = false;

    updateECCTutorial({
        privateKey: bobPrivate.toString(),
        publicKeyHex: bytesToHex(currentECCPublicKeyBytes),
        rHex: bytesToHex(encrypted.R),
        ciphertextHex: bytesToHex(encrypted.ciphertext)
    });

  } catch (error) {
    alert(error.message);
  }
}

function decryptECCMessage() {
  try {
    if (
      currentECCEncrypted === null ||
      currentECCPrivateKey === null
    ) {
      throw new Error("Encrypt a message first.");
    }

    const decrypted = decryptECC(
      currentECCEncrypted,
      currentECCPrivateKey
    );

    eccPlaintextOutput.textContent = decrypted;
    updateECCTutorialDecryption(decrypted);
  } catch (error) {
    alert(error.message);
  }
}

eccEncryptButton.addEventListener(
  "click",
  encryptECCMessage
);

eccDecryptButton.addEventListener(
  "click",
  decryptECCMessage
);

// Prevent showing an old ciphertext after
// the message or key has changed.
function resetECCResults() {
  currentECCEncrypted = null;
  currentECCPrivateKey = null;
  eccResults.hidden = true;
  currentECCPublicKeyBytes = null;
  resetECCTutorial();
}

messageInput.addEventListener(
  "input",
  resetECCResults
);

eccPrivateInput.addEventListener(
  "input",
  resetECCResults
);

const eccAttackVisualization =
  initializeECCAttackVisualization();

const eccAttackButton = document.getElementById(
  "ecc-attack-btn"
);

const eccAttackMaxInput = document.getElementById(
  "ecc-attack-max"
);

const eccAttackStatus = document.getElementById(
  "ecc-attack-status"
);

const eccAttackResults = document.getElementById(
  "ecc-attack-results"
);

const eccRecoveredKey = document.getElementById(
  "ecc-recovered-key"
);

const eccAttackAttempts = document.getElementById(
  "ecc-attack-attempts"
);

const eccAttackPlaintext = document.getElementById(
  "ecc-attack-plaintext"
);

function runECCAttack() {
  try {
    if (currentECCEncrypted === null) {
      throw new Error(
        "First encrypt a message using ECC."
      );
    }

    const rawMax = eccAttackMaxInput.value.trim();

    if (!/^\d+$/.test(rawMax)) {
      throw new RangeError(
        "Enter an integer between 1 and 1000."
      );
    }

    const maxKey = Number(rawMax);

    if (maxKey < 1 || maxKey > 1000) {
      throw new RangeError(
        "Maximum key must be between 1 and 1000."
      );
    }

    
    const recordedAttempts = [];

    const result = attackAndDecryptECC(
        currentECCPublicKeyBytes,
        currentECCEncrypted,
        maxKey,
        (attempt) => {
            recordedAttempts.push(attempt);
        }
    );

    eccAttackVisualization.loadAttack({
        attempts: recordedAttempts,
        targetPublicKey: bytesToHex(
            currentECCPublicKeyBytes
        ),
        maxKey
    });


    eccAttackAttempts.textContent =
      String(result.attempts);

    if (result.success) {
      eccRecoveredKey.textContent =
        result.recoveredKey.toString();

      eccAttackPlaintext.textContent =
        result.plaintext;

      eccAttackStatus.textContent =
        "Attack successful: private key recovered.";
    } else {
      eccRecoveredKey.textContent =
        "Not found";

      eccAttackPlaintext.textContent =
        "Unable to decrypt";

      eccAttackStatus.textContent =
        "The private key was not found in the tested range.";
    }

    eccAttackResults.hidden = false;
  } catch (error) {
    alert(error.message);
  }
}

eccAttackButton.addEventListener(
  "click",
  runECCAttack
);

messageInput.addEventListener(
  "input",
  () => eccAttackVisualization.clearAttack()
);

eccPrivateInput.addEventListener(
  "input",
  () => eccAttackVisualization.clearAttack()
);

eccAttackMaxInput.addEventListener(
  "input",
  () => eccAttackVisualization.clearAttack()
);


const originalAlphabet = document.getElementById(
  "original-alphabet"
);

const shiftedAlphabet = document.getElementById(
  "shifted-alphabet"
);

const shiftExplanation = document.getElementById(
  "shift-explanation"
);

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function renderAlphabetShift() {
  const key = Number(keyInput.value);

  originalAlphabet.replaceChildren();
  shiftedAlphabet.replaceChildren();

  if (!Number.isInteger(key) || key < 0 || key > 25) {
    shiftExplanation.textContent =
      "Enter a valid key between 0 and 25.";
    return;
  }

  for (let i = 0; i < 26; i++) {
    const originalCell = document.createElement("span");
    originalCell.textContent = ALPHABET[i];

    const shiftedCell = document.createElement("span");
    shiftedCell.textContent =
      ALPHABET[(i + key) % 26];

    originalAlphabet.appendChild(originalCell);
    shiftedAlphabet.appendChild(shiftedCell);
  }

  shiftExplanation.textContent =
    `With key ${key}, A becomes ` +
    `${ALPHABET[key]}, B becomes ` +
    `${ALPHABET[(1 + key) % 26]}, and so on.`;
}

keyInput.addEventListener("input", renderAlphabetShift);

renderAlphabetShift();

initializeECCTutorial();



