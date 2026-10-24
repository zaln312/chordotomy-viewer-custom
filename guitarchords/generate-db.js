// Regenerate db.js after updating guitar.json from tombatossals/chords-db.
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const folder = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(folder, "guitar.json"), "utf8"));
const text =
  "// Generated from tombatossals/chords-db lib/guitar.json (MIT).\n" +
  "(function (root, data) {\n" +
  "  root.GuitarChordsDb = data;\n" +
  "})(typeof window === \"object\" ? window : globalThis, " +
  JSON.stringify(data) +
  ");\n";

fs.writeFileSync(path.join(folder, "db.js"), text);
console.log(`db.js: ${Buffer.byteLength(text)} bytes`);
