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

function readNonNegativeNumberFlag(args, name) {
  const index = args.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  const value = Number(args[index + 1]);

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number.`);
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

function parseRgbColor(value) {
  const normalized = value.trim();
  const hex = normalized.startsWith("#") ? normalized.slice(1) : normalized;

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return {
      red: Number.parseInt(hex[0] + hex[0], 16),
      green: Number.parseInt(hex[1] + hex[1], 16),
      blue: Number.parseInt(hex[2] + hex[2], 16),
    };
  }

  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return {
      red: Number.parseInt(hex.slice(0, 2), 16),
      green: Number.parseInt(hex.slice(2, 4), 16),
      blue: Number.parseInt(hex.slice(4, 6), 16),
    };
  }

  const parts = normalized.split(",").map((part) => Number(part.trim()));

  if (parts.length === 3 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)) {
    return {
      red: parts[0],
      green: parts[1],
      blue: parts[2],
    };
  }

  throw new Error(`${value} is not a valid color. Use #fff, #ffffff, or 255,255,255.`);
}

function readColorFlag(args, name) {
  const value = readStringFlag(args, name);

  return value ? parseRgbColor(value) : undefined;
}

function readAlphaModeFlag(args) {
  const value = readStringFlag(args, "--alpha-mode");

  if (!value) {
    return undefined;
  }

  if (value !== "threshold" && value !== "density") {
    throw new Error("--alpha-mode must be threshold or density.");
  }

  return value;
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
  --alpha-mode <m> Alpha mode: threshold or density
  --alpha-threshold <n>
                  Alpha cutoff, 0-255
  --alpha-empty <c>
                  Character for alpha-empty cells
  --no-alpha      Disable alpha handling
  --background <c>
                  Enable background key color, #fff/#ffffff/r,g,b
  --background-variance <n>
                  Allowed RGB variance for background keying
  --background-empty <c>
                  Character for background-empty cells
  --dither         Enable Floyd-Steinberg dithering
  --no-trim       Keep trailing whitespace
  --charsets       List available charsets

Examples:
  npm run ascii:preview -- public/bg-alice.jpeg
  npm run ascii:preview -- public/file.svg --columns 72 --invert
  npm run ascii:preview -- public/images/cloud.jpg --background "#fff"
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

  const backgroundColor = readColorFlag(args, "--background");
  const alphaEmptyChar = readStringFlag(args, "--alpha-empty") ?? asciiConfig.terminal.alpha.emptyChar;
  const backgroundEmptyChar = readStringFlag(args, "--background-empty") ?? asciiConfig.terminal.background.emptyChar;

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
    alpha: {
      ...asciiConfig.terminal.alpha,
      enabled: readBooleanFlag(args, "--alpha", asciiConfig.terminal.alpha.enabled),
      mode: readAlphaModeFlag(args) ?? asciiConfig.terminal.alpha.mode,
      threshold: readNonNegativeNumberFlag(args, "--alpha-threshold") ?? asciiConfig.terminal.alpha.threshold,
      emptyChar: alphaEmptyChar,
    },
    background: {
      ...asciiConfig.terminal.background,
      enabled: Boolean(backgroundColor) || readBooleanFlag(args, "--background-key", asciiConfig.terminal.background.enabled),
      color: backgroundColor ?? asciiConfig.terminal.background.color,
      maxVariance:
        readNonNegativeNumberFlag(args, "--background-variance") ?? asciiConfig.terminal.background.maxVariance,
      emptyChar: backgroundEmptyChar,
    },
    dither: readBooleanFlag(args, "--dither", asciiConfig.terminal.dither),
    charAspectRatio: asciiConfig.terminal.charAspectRatio,
    trimTrailingWhitespace: readBooleanFlag(args, "--trim", asciiConfig.terminal.trimTrailingWhitespace),
  });

  console.log(ascii);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
