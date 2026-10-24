// Non-visual checks for the local chord vocabulary and the guitar data.
"use strict";

const fs = require("node:fs");
const path = require("node:path");

require("./db.js");
const GuitarChords = require("./index.js");

const roots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const qualities = [
  "maj",
  "min",
  "7",
  "maj7",
  "min7",
  "min6",
  "hdim7",
  "dim7",
  "sus4",
  "aug",
  "dim",
  "sus2",
  "sus4(b7)",
  "maj(9)",
  "min(9)",
];

const missing = [];
for (const root of roots) {
  for (const quality of qualities) {
    const label = `${root}:${quality}`;
    if (!GuitarChords.match(label)) missing.push(label);
  }
}
const slash = GuitarChords.match("C:maj/5");
if (!slash || slash.position.midi[0] % 12 !== 7) {
  missing.push("C:maj/5 bass");
}

const list = fs
  .readFileSync(path.join(__dirname, "..", "full_chord_list.txt"), "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
let matched = 0;
let fallback = 0;
const errors = [];
for (const label of list) {
  if (label === "N" || label === "X") continue;
  try {
    const found = GuitarChords.match(label);
    if (!found) {
      fallback += 1;
    } else if (found.position.frets.length !== 6) {
      errors.push(`${label}: shape does not cover six strings`);
    } else {
      matched += 1;
    }
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
  }
}

console.log(
  JSON.stringify(
    {
      currentVocabulary: { checked: roots.length * qualities.length, missing },
      fullChordList: { checked: list.length, matched, fallback, errors: errors.slice(0, 5) },
    },
    null,
    2,
  ),
);
process.exitCode = missing.length || errors.length ? 1 : 0;
