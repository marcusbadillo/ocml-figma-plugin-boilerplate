import { build, context, type BuildOptions } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isWatch = process.argv.includes("--watch");

// Resolve paths relative to this script file, not cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root = one level up from /scripts
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");

await mkdir(distDir, { recursive: true });

const codeBuild: BuildOptions = {
  entryPoints: [path.join(srcDir, "code.ts")],
  bundle: true,
  outfile: path.join(distDir, "code.js"),
  platform: "browser",
  format: "iife",
  target: ["es2020"],
  sourcemap: true,
  logLevel: "info",
};

const uiBuild: BuildOptions = {
  entryPoints: [path.join(srcDir, "ui.ts")],
  bundle: true,
  outfile: path.join(distDir, "ui.js"),
  platform: "browser",
  format: "iife",
  target: ["es2020"],
  sourcemap: true,
  logLevel: "info",
};

async function copyUiHtml() {
  await copyFile(path.join(srcDir, "ui.html"), path.join(distDir, "ui.html"));
}

if (isWatch) {
  const codeCtx = await context(codeBuild);
  const uiCtx = await context(uiBuild);

  await codeCtx.watch();
  await uiCtx.watch();

  await copyUiHtml();
  console.log("Watching…");
} else {
  await build(codeBuild);
  await build(uiBuild);
  await copyUiHtml();
}
