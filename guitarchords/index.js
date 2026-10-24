// Guitar chord shapes for the current chord. chords-db supplies the fingerings and VexChords
// draws them. A label that has no exact equivalent in chords-db returns false so the caller can
// keep the piano picture: a different chord is worse than no guitar shape.
"use strict";

(function (root, factory) {
  const api = factory(root.GuitarChordsDb, root.vexchords);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.GuitarChords = api;
})(typeof window === "object" ? window : globalThis, (db, vexchords) => {
  const ROOT_PC = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
    Cb: 11,
    "B#": 0,
    "E#": 5,
    Fb: 4,
  };
  // chords-db spells the black keys that have two names with the flat spelling.
  const DB_ROOT = {
    C: "C",
    "C#": "Csharp",
    Db: "Csharp",
    D: "D",
    "D#": "Eb",
    Eb: "Eb",
    E: "E",
    F: "F",
    "F#": "Fsharp",
    Gb: "Fsharp",
    G: "G",
    "G#": "Ab",
    Ab: "Ab",
    A: "A",
    "A#": "Bb",
    Bb: "Bb",
    B: "B",
    Cb: "B",
    "B#": "C",
    "E#": "F",
    Fb: "E",
  };
  // Exact equivalents only. full_chord_list.txt uses the extended ChordFormer names; labels
  // outside this table stay with the piano rather than being shown as a simpler, wrong chord.
  const QUALITY = {
    maj: "major",
    min: "minor",
    "7": "7",
    maj7: "maj7",
    min7: "m7",
    min6: "m6",
    hdim7: "m7b5",
    dim7: "dim7",
    sus4: "sus4",
    aug: "aug",
    dim: "dim",
    sus2: "sus2",
    "sus4(b7)": "7sus4",
    "maj(9)": "add9",
    "maj(2)": "add9",
    "min(9)": "madd9",
    "min(2)": "madd9",
    "maj(4)": "add11",
    "5": "5",
    "6": "6",
    maj6: "6",
    "maj(6)": "6",
    "69": "69",
    "maj6(9)": "69",
    "maj(6,9)": "69",
    "maj6(2)": "69",
    "m6": "m6",
    "min(6)": "m6",
    "m69": "m69",
    "min6(9)": "m69",
    "7b5": "7b5",
    "7(b5)": "7b5",
    "7#9": "7#9",
    "7(#9)": "7#9",
    "7b9": "7b9",
    "7(b9)": "7b9",
    "9": "9",
    "7(9)": "9",
    "9b5": "9b5",
    "9(b5)": "9b5",
    "9#11": "9#11",
    "9(#11)": "9#11",
    "11": "11",
    "maj(11)": "add11",
    "13": "13",
    "7(13)": "13",
    maj9: "maj9",
    "maj7(9)": "maj9",
    "maj7(2)": "maj9",
    maj11: "maj11",
    maj13: "maj13",
    "maj9(13)": "maj13",
    min7: "m7",
    "min(7)": "m7",
    "min7(b5)": "m7b5",
    m7b5: "m7b5",
    min9: "m9",
    "min7(9)": "m9",
    "min7(2)": "m9",
    min11: "m11",
    "min7(11)": "m11",
    "min7(4)": "m11",
    min13: "m13",
    "min9(13)": "m13",
    minmaj7: "mmaj7",
    aug7: "aug7",
    "aug(7)": "aug7",
    "aug(b7)": "aug7",
    aug9: "aug9",
    "aug(9)": "aug9",
    maj7b5: "maj7b5",
    "maj7(b5)": "maj7b5",
    "maj7(#5)": "maj7#5",
    "sus2(4)": "sus2sus4",
    "sus4(2)": "sus2sus4",
  };

  const pitchClass = (note) => ROOT_PC[note] ?? null;

  function qualitySuffix(quality) {
    return QUALITY[quality] ?? null;
  }

  function slashPitch(root, token) {
    if (!token) return null;
    const note = pitchClass(token);
    if (note !== null) return note;
    const match = /^([b#]{0,2})(\d+)$/.exec(token.replace(/^\*/, ""));
    if (!match) return null;
    const number = Number(match[2]);
    const degree = ((number - 1) % 7) + 1;
    const octave = Math.floor((number - 1) / 7);
    const semitones = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };
    const accidental = [...match[1]].reduce((sum, mark) => sum + (mark === "#" ? 1 : -1), 0);
    return (pitchClass(root) + semitones[degree] + octave * 12 + accidental + 120) % 12;
  }

  function parseLabel(label) {
    if (typeof label !== "string" || label === "N" || label === "X") return null;
    const [head, writtenBass] = label.split("/");
    const [root, quality] = head.split(":");
    const suffix = qualitySuffix(quality);
    if (!suffix || pitchClass(root) === null || !DB_ROOT[root]) return null;
    return { root, quality, suffix, writtenBass: writtenBass ?? null };
  }

  function positionsFor(root, suffix) {
    const chords = db?.chords?.[DB_ROOT[root]];
    const entry = chords?.find((chord) => chord.suffix === suffix);
    return entry?.positions?.length ? entry.positions : null;
  }

  function choosePosition(positions, bass, rootPc) {
    if (!positions?.length) return null;
    const bassPc = typeof bass === "number"
      ? bass
      : bass === null || bass === undefined
        ? null
        : pitchClass(bass);
    const byBass = bassPc === null
      ? null
      : positions.find((position) => position.midi?.[0] % 12 === bassPc);
    if (byBass) return byBass;
    const byRoot = rootPc === null
      ? null
      : positions.find((position) => position.midi?.[0] % 12 === rootPc);
    return byRoot || positions[0];
  }

  function match(label, bass = null) {
    const parsed = parseLabel(label);
    if (!parsed) return null;
    const positions = positionsFor(parsed.root, parsed.suffix);
    if (!positions) return null;
    const wantedBass = bass ?? (parsed.writtenBass
      ? slashPitch(parsed.root, parsed.writtenBass)
      : null);
    return {
      ...parsed,
      position: choosePosition(positions, wantedBass, pitchClass(parsed.root)),
      positions,
    };
  }

  function barresFor(position) {
    return (position.barres || []).flatMap((fret) => {
      const strings = position.frets
        .map((value, index) => (value === fret ? index : -1))
        .filter((index) => index >= 0);
      if (strings.length < 2) return [];
      return [{
        fromString: 6 - Math.min(...strings),
        toString: 6 - Math.max(...strings),
        fret,
      }];
    });
  }

  function vexChord(position) {
    return position.frets.map((fret, index) => {
      const string = 6 - index;
      if (fret < 0) return [string, "x"];
      const finger = position.fingers?.[index];
      return finger > 0 ? [string, fret, String(finger)] : [string, fret];
    });
  }

  function pageColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      ink: style.getPropertyValue("--ink").trim() || "#1c2330",
      sheet: style.getPropertyValue("--sheet").trim() || "#f8f9f5",
    };
  }

  function render(button, segment, highlight, action) {
    if (!db || !vexchords || !segment || segment.chord === "N") return false;
    const found = match(segment.chord, segment.bass);
    if (!found?.position) return false;

    try {
      // The bundled VexChords build can't resolve an HTML element as its drawing target, so draw
      // into a temporary SVG host and keep the SVG it creates inside.
      const host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      button.append(host);
      // VexChords draws at 75% of the canvas, so this produces a diagram about 135 by 162,
      // larger than the piano picture while the page's own inks style the drawing.
      const { width, height } = { width: 180, height: 216 };
      const colors = pageColors();
      const box = new vexchords.ChordBox(host, {
        width,
        height,
        defaultColor: colors.ink,
        bgColor: colors.sheet,
        labelColor: colors.sheet,
      });
      box.draw({
        chord: vexChord(found.position),
        position: found.position.baseFret || 1,
        barres: barresFor(found.position),
        tuning: ["E", "A", "D", "G", "B", "E"],
      });
      const svg = host.querySelector("svg");
      if (!svg) throw new Error("VexChords did not create an SVG");
      button.replaceChildren(svg);
      svg.setAttribute(
        "viewBox",
        `0 0 ${svg.getAttribute("width")} ${svg.getAttribute("height")}`,
      );
      svg.setAttribute("aria-hidden", "true");
      const shape = vexChord(found.position)
        .map(([string, fret]) => (fret === "x" ? `string ${string} muted` : `string ${string} fret ${fret}`))
        .join(", ");
      const label = `${action} ${segment.chord} on guitar, ${shape}`;
      button.setAttribute("aria-label", label);
      button.title = "Play this chord";
      button.dataset.instrument = "guitar";
      return true;
    } catch (error) {
      console.error("Guitar chord rendering failed", error);
      button.replaceChildren();
      delete button.dataset.instrument;
      return false;
    }
  }

  return { match, qualitySuffix, render };
});
