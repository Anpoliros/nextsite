#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { asciiConfig } = jiti("../config/ascii.ts");
const { renderImageFileToAscii } = jiti("../lib/ascii/image.ts");

function readNumberFlag(args, name) {
  const index = args.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  const value = Number(args[index + 1]);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }

  return value;
}

function readStringFlag(args, name) {
  const index = args.indexOf(name);

  return index === -1 ? undefined : args[index + 1];
}

function readBooleanFlag(args, name, defaultValue) {
  if (args.includes(name)) {
    return true;
  }

  if (args.includes(`--no-${name.slice(2)}`)) {
    return false;
  }

  return defaultValue;
}

function printHelp() {
  console.log(`Usage: npm run ascii:preview -- <image> [options]

Options:
  --columns <n>    Output width in terminal characters
  --rows <n>       Output height in terminal rows
  --charset <name> Charset from config/ascii.ts
  --contrast <n>   Contrast strength
  --gamma <n>      Midtone correction
  --invert         Invert luminance mapping
  --no-levels      Disable automatic luminance range stretching
  --dither         Enable Floyd-Steinberg dithering
  --charsets       List available charsets

Examples:
  npm run ascii:preview -- public/bg-alice.jpeg
  npm run ascii:preview -- public/file.svg --columns 72 --invert
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--charsets")) {
    for (const [name, chars] of Object.entries(asciiConfig.charsets)) {
      console.log(`${name}: ${chars}`);
    }

    return;
  }

  const imagePath = args.find((arg) => !arg.startsWith("--"));

  if (!imagePath) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const charsetName = readStringFlag(args, "--charset") ?? asciiConfig.terminal.charset;
  const charset = asciiConfig.charsets[charsetName];

  if (!charset) {
    throw new Error(`Unknown charset "${charsetName}". Available: ${Object.keys(asciiConfig.charsets).join(", ")}`);
  }

  const ascii = await renderImageFileToAscii(path.resolve(imagePath), {
    columns: readNumberFlag(args, "--columns") ?? asciiConfig.terminal.columns,
    rows: readNumberFlag(args, "--rows"),
    maxRows: asciiConfig.terminal.maxRows,
    charset,
    invert: readBooleanFlag(args, "--invert", asciiConfig.terminal.invert),
    contrast: readNumberFlag(args, "--contrast") ?? asciiConfig.terminal.contrast,
    gamma: readNumberFlag(args, "--gamma") ?? asciiConfig.terminal.gamma,
    autoLevels: {
      ...asciiConfig.terminal.autoLevels,
      enabled: readBooleanFlag(args, "--levels", asciiConfig.terminal.autoLevels.enabled),
    },
    dither: readBooleanFlag(args, "--dither", asciiConfig.terminal.dither),
    charAspectRatio: asciiConfig.terminal.charAspectRatio,
  });

  console.log(ascii);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
