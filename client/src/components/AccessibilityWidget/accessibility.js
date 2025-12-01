// src/utils/accessibility.js

function setFontScale(scale) {
  // מגבילים לטווח סביר
  const clamped = Math.min(1.5, Math.max(0.85, scale));
  document.documentElement.style.setProperty("--a11y-font-scale", clamped);
}

let currentScale = 1;

export function increaseText() {
  currentScale += 0.1;
  setFontScale(currentScale);
}

export function decreaseText() {
  currentScale -= 0.1;
  setFontScale(currentScale);
}

export function resetText() {
  currentScale = 1;
  setFontScale(currentScale);
}
