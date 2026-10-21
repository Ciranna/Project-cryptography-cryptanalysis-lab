
const ENGLISH_FREQUENCIES = [
  8.167, 1.492, 2.782, 4.253, 12.702, 2.228,
  2.015, 6.094, 6.966, 0.153, 0.772, 4.025,
  2.406, 6.749, 7.507, 1.929, 0.095, 5.987,
  6.327, 9.056, 2.758, 0.978, 2.360, 0.150,
  1.974, 0.074
];

export function renderFrequencyChart(
  plaintext,
  container
) {
  container.replaceChildren();

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const counts = Array(26).fill(0);

  for (const character of plaintext.toUpperCase()) {
    const index = alphabet.indexOf(character);

    if (index >= 0) {
      counts[index]++;
    }
  }

  const total = counts.reduce(
    (sum, value) => sum + value, 0
  );

  if (total === 0) {
    container.textContent =
      "No letters available for frequency analysis.";
    return;
  }

  const legend = document.createElement("p");
  legend.className = "frequency-legend";
  legend.textContent =
    "Expected English | Observed candidate";

  container.appendChild(legend);

  for (let i = 0; i < 26; i++) {
    const observed = counts[i] / total * 100;
    const expected = ENGLISH_FREQUENCIES[i];

    const row = document.createElement("div");
    row.className = "frequency-row";

    const letter = document.createElement("strong");
    letter.textContent = alphabet[i];

    const bars = document.createElement("div");
    bars.className = "frequency-bars";

    const expectedBar = document.createElement("div");
    expectedBar.className = "frequency-expected";
    expectedBar.style.width =
      `${expected / 15 * 100}%`;

    const observedBar = document.createElement("div");
    observedBar.className = "frequency-observed";
    observedBar.style.width =
      `${observed / 15 * 100}%`;

    const values = document.createElement("span");
    values.textContent =
      `${expected.toFixed(1)}% / ` +
      `${observed.toFixed(1)}%`;

    bars.append(expectedBar, observedBar);
    row.append(letter, bars, values);

    container.appendChild(row);
  }
}
