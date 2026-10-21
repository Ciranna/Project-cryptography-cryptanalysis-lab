
export function initializeECCAttackVisualization() {
  const panel = document.getElementById(
    "ecc-attack-visualization"
  );

  const progress = document.getElementById(
    "ecc-visual-progress"
  );

  const progressLabel = document.getElementById(
    "ecc-visual-progress-label"
  );

  const candidateOutput = document.getElementById(
    "ecc-visual-candidate"
  );

  const equation = document.getElementById(
    "ecc-visual-equation"
  );

  const matchOutput = document.getElementById(
    "ecc-visual-match"
  );

  const publicKeyOutput = document.getElementById(
    "ecc-visual-public-key"
  );

  const targetKeyOutput = document.getElementById(
    "ecc-visual-target-key"
  );

  const attemptsBody = document.getElementById(
    "ecc-visual-attempts"
  );

  const explanation = document.getElementById(
    "ecc-visual-explanation"
  );

  const previousButton = document.getElementById(
    "ecc-visual-prev"
  );

  const nextButton = document.getElementById(
    "ecc-visual-next"
  );

  const finishButton = document.getElementById(
    "ecc-visual-finish"
  );

  const resetButton = document.getElementById(
    "ecc-visual-reset"
  );

  let attempts = [];
  let targetPublicKey = "";
  let maxKey = 1000;
  let currentIndex = -1;

  function render() {
    if (attempts.length === 0) {
      panel.hidden = true;
      return;
    }

    const completed = currentIndex + 1;

    progress.max = maxKey;
    progress.value = completed;

    progressLabel.textContent =
      `${completed} / ${maxKey}`;

    previousButton.disabled = currentIndex < 0;
    nextButton.disabled =
      currentIndex >= attempts.length - 1;

    finishButton.disabled =
      currentIndex >= attempts.length - 1;

    targetKeyOutput.textContent = targetPublicKey;

    attemptsBody.replaceChildren();

    if (currentIndex < 0) {
      candidateOutput.textContent = "—";
      equation.textContent = "d × G = ?";
      matchOutput.textContent =
        "Eve has not tested any candidate yet.";

      publicKeyOutput.textContent = "—";

      explanation.textContent =
        "Click Next Attempt to test the first key.";

      return;
    }

    const current = attempts[currentIndex];

    candidateOutput.textContent =
      String(current.candidate);

    equation.textContent =
      `${current.candidate} × G ${
        current.match ? "=" : "≠"
      } Q`;

    matchOutput.textContent = current.match
      ? "MATCH FOUND — Bob's private key recovered!"
      : "No match — Eve must try another key.";

    publicKeyOutput.textContent =
      current.publicKeyHex;

    const first = Math.max(0, currentIndex - 4);

    for (let i = first; i <= currentIndex; i++) {
      const attempt = attempts[i];

      const row = document.createElement("tr");

      const candidateCell =
        document.createElement("td");

      candidateCell.textContent =
        String(attempt.candidate);

      const operationCell =
        document.createElement("td");

      operationCell.textContent =
        `${attempt.candidate} × G`;

      const resultCell =
        document.createElement("td");

      resultCell.textContent = attempt.match
        ? "Match"
        : "No match";

      resultCell.className = attempt.match
        ? "ecc-match"
        : "ecc-no-match";

      row.append(
        candidateCell,
        operationCell,
        resultCell
      );

      attemptsBody.appendChild(row);
    }

    if (current.match) {
      explanation.textContent =
        `Eve found d = ${current.candidate}. ` +
        "She can now compute S = d × R, " +
        "derive the keystream, and decrypt " +
        "the intercepted ciphertext.";
    } else if (currentIndex === attempts.length - 1) {
      explanation.textContent =
        `No matching private key was found ` +
        `among the ${attempts.length} tested candidates.`;
    } else {
      explanation.textContent =
        `Candidate ${current.candidate} does not ` +
        "produce Bob's public key. " +
        "Eve continues with the next candidate.";
    }
  }

  previousButton.addEventListener("click", () => {
    currentIndex = Math.max(-1, currentIndex - 1);
    render();
  });

  nextButton.addEventListener("click", () => {
    currentIndex = Math.min(
      attempts.length - 1,
      currentIndex + 1
    );

    render();
  });

  finishButton.addEventListener("click", () => {
    currentIndex = attempts.length - 1;
    render();
  });

  resetButton.addEventListener("click", () => {
    currentIndex = -1;
    render();
  });

  function loadAttack(data) {
    attempts = data.attempts;
    targetPublicKey = data.targetPublicKey;
    maxKey = data.maxKey;
    currentIndex = -1;

    panel.hidden = false;
    render();
  }

  function clearAttack() {
    attempts = [];
    currentIndex = -1;
    render();
  }

  return {
    loadAttack,
    clearAttack
  };
}
