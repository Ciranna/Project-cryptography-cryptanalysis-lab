
export function renderCaesarKeyScores(
  candidates,
  container
) {
  container.replaceChildren();

  if (!Array.isArray(candidates) ||
      candidates.length !== 26) {
    container.textContent =
      "Expected 26 Caesar key candidates.";
    return;
  }

  const sorted = [...candidates].sort(
    (a, b) => a.key - b.key
  );

  const scores = sorted.map(candidate => candidate.score);

  if (scores.some(score =>
    !Number.isFinite(score) || score < 0
  )) {
    container.textContent =
      "Invalid chi-squared scores.";
    return;
  }

  const maxScore = Math.max(...scores, 1);

  const best = candidates.reduce(
    (current, candidate) =>
      candidate.score < current.score
        ? candidate
        : current
  );

  const legend = document.createElement("p");
  legend.className = "hint";
  legend.textContent =
    `Best-ranked key: ${best.key} ` +
    `(chi-squared: ${best.score.toFixed(2)}).`;

  container.appendChild(legend);

  for (const candidate of sorted) {
    const row = document.createElement("div");
    row.className = "key-score-row";

    const label = document.createElement("strong");
    label.textContent = `Key ${candidate.key}`;

    const track = document.createElement("div");
    track.className = "key-score-track";

    const bar = document.createElement("div");
    bar.className = "key-score-bar";

    const isBest = candidate.key === best.key;

    if (isBest) {
      bar.classList.add("best-key");
      row.classList.add("best-key-row");
    }

    bar.style.width =
      `${candidate.score / maxScore * 100}%`;

    track.appendChild(bar);

    const value = document.createElement("span");
    value.textContent = candidate.score.toFixed(2);

    row.append(label, track, value);
    container.appendChild(row);
  }
}
