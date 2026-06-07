#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const defaultAsciiConfig = jiti("../lib/ascii/configs/default.ts").default;
const { renderImageFileToAscii } = jiti("../lib/ascii/image.ts");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const configsDir = path.resolve(scriptDir, "../lib/ascii/configs");

const VALUE_FLAGS = new Set([
  "--alpha-empty",
  "--alpha-mode",
  "--alpha-threshold",
  "--background",
  "--background-empty",
  "--background-variance",
  "--charset",
  "--columns",
  "--config",
  "--contrast",
  "--gamma",
  "--rows",
]);

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base, override) {
  if (!isObject(base) || !isObject(override)) {
    return override ?? base;
  }

  const output = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) {
      continue;
    }

    output[key] = isObject(value) && isObject(output[key]) ? deepMerge(output[key], value) : value;
  }

  return output;
}

function getPositionals(args) {
  const positionals = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (VALUE_FLAGS.has(arg)) {
      index += 1;
      continue;
    }

    if (!arg.startsWith("--")) {
      positionals.push(arg);
    }
  }

  return positionals;
}

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

function readConfigName(args) {
  const name = readStringFlag(args, "--config");

  if (!name) {
    return undefined;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error("--config only accepts a config name, for example: --config shell.");
  }

  return name;
}

function loadNamedConfig(name) {
  const configPath = path.join(configsDir, `${name}.ts`);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Unknown ASCII config "${name}". Available: ${listConfigNames().join(", ")}`);
  }

  const loaded = jiti(configPath);

  return loaded.default ?? loaded;
}

function listConfigNames() {
  return fs
    .readdirSync(configsDir)
    .filter((fileName) => fileName.endsWith(".ts") && fileName !== "type.ts")
    .map((fileName) => fileName.replace(/\.ts$/, ""))
    .sort();
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
  --config <name>  Load lib/ascii/configs/<name>.ts
  --columns <n>    Output width in terminal characters
  --rows <n>       Output height in terminal rows
  --charset <name> Charset from the resolved config
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
  --configs        List available configs
  --print-config   Print the final resolved config and exit

Examples:
  npm run ascii:preview -- public/bg-alice.jpeg
  npm run ascii:preview -- public/temp/IMG_7324.jpeg --config shell
  npm run ascii:preview -- public/file.svg --columns 72 --invert
  npm run ascii:preview -- public/images/cloud.jpg --background "#fff"
`);
}

function resolveConfig(args) {
  const configName = readConfigName(args);
  const profileConfig = configName ? loadNamedConfig(configName) : {};
  const resolvedConfig = deepMerge(defaultAsciiConfig, profileConfig);
  const backgroundColor = readColorFlag(args, "--background");
  const alphaEmptyChar = readStringFlag(args, "--alpha-empty") ?? resolvedConfig.alpha.emptyChar;
  const backgroundEmptyChar = readStringFlag(args, "--background-empty") ?? resolvedConfig.background.emptyChar;

  return {
    ...resolvedConfig,
    columns: readNumberFlag(args, "--columns") ?? resolvedConfig.columns,
    rows: readNumberFlag(args, "--rows") ?? resolvedConfig.rows,
    charset: readStringFlag(args, "--charset") ?? resolvedConfig.charset,
    invert: readBooleanFlag(args, "--invert", resolvedConfig.invert),
    contrast: readNumberFlag(args, "--contrast") ?? resolvedConfig.contrast,
    gamma: readNumberFlag(args, "--gamma") ?? resolvedConfig.gamma,
    autoLevels: {
      ...resolvedConfig.autoLevels,
      enabled: readBooleanFlag(args, "--levels", resolvedConfig.autoLevels.enabled),
    },
    alpha: {
      ...resolvedConfig.alpha,
      enabled: readBooleanFlag(args, "--alpha", resolvedConfig.alpha.enabled),
      mode: readAlphaModeFlag(args) ?? resolvedConfig.alpha.mode,
      threshold: readNonNegativeNumberFlag(args, "--alpha-threshold") ?? resolvedConfig.alpha.threshold,
      emptyChar: alphaEmptyChar,
    },
    background: {
      ...resolvedConfig.background,
      enabled: Boolean(backgroundColor) || readBooleanFlag(args, "--background-key", resolvedConfig.background.enabled),
      color: backgroundColor ?? resolvedConfig.background.color,
      maxVariance: readNonNegativeNumberFlag(args, "--background-variance") ?? resolvedConfig.background.maxVariance,
      emptyChar: backgroundEmptyChar,
    },
    dither: readBooleanFlag(args, "--dither", resolvedConfig.dither),
    trimTrailingWhitespace: readBooleanFlag(args, "--trim", resolvedConfig.trimTrailingWhitespace),
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--configs")) {
    for (const name of listConfigNames()) {
      console.log(name);
    }

    return;
  }

  const resolvedConfig = resolveConfig(args);

  if (args.includes("--charsets")) {
    for (const [name, chars] of Object.entries(resolvedConfig.charsets)) {
      console.log(`${name}: ${chars}`);
    }

    return;
  }

  if (args.includes("--print-config")) {
    console.log(JSON.stringify(resolvedConfig, null, 2));
    return;
  }

  const imagePath = getPositionals(args)[0];

  if (!imagePath) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const charset = resolvedConfig.charsets[resolvedConfig.charset];

  if (!charset) {
    throw new Error(`Unknown charset "${resolvedConfig.charset}". Available: ${Object.keys(resolvedConfig.charsets).join(", ")}`);
  }

  const ascii = await renderImageFileToAscii(path.resolve(imagePath), {
    columns: resolvedConfig.columns,
    rows: resolvedConfig.rows,
    maxRows: resolvedConfig.maxRows,
    charset,
    invert: resolvedConfig.invert,
    contrast: resolvedConfig.contrast,
    gamma: resolvedConfig.gamma,
    autoLevels: resolvedConfig.autoLevels,
    alpha: resolvedConfig.alpha,
    background: resolvedConfig.background,
    dither: resolvedConfig.dither,
    charAspectRatio: resolvedConfig.charAspectRatio,
    trimTrailingWhitespace: resolvedConfig.trimTrailingWhitespace,
  });

  console.log(ascii);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
