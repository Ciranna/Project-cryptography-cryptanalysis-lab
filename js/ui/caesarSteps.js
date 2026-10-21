
export function renderCaesarSteps(
  plaintext,
  key,
  container
) {
  container.replaceChildren();

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const letters = [...plaintext].slice(0, 40);

  for (const character of letters) {
    const upper = character.toUpperCase();
    const position = alphabet.indexOf(upper);

    const card = document.createElement("div");
    card.className = "character-step";

    if (position === -1 || upper.length !== 1) {
      card.textContent =
        `${character} → ${character} (unchanged)`;
    } else {
      const shiftedPosition = (position + key) % 26;
      const encrypted = alphabet[shiftedPosition];

      const finalLetter =
        character === character.toLowerCase()
          ? encrypted.toLowerCase()
          : encrypted;

      const title = document.createElement("strong");
      title.textContent =
        `${character} → ${finalLetter}`;

      const formula = document.createElement("small");
      formula.textContent =
        `(${position} + ${key}) mod 26 = ` +
        shiftedPosition;

      card.append(title, formula);
    }

    container.appendChild(card);
  }

  if ([...plaintext].length > 40) {
    const notice = document.createElement("p");
    notice.className = "hint";
    notice.textContent =
      "Showing the first 40 characters only.";

    container.appendChild(notice);
  }
}
