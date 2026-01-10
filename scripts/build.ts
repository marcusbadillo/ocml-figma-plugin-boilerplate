// "documentAccess": "dynamic-page",
import { build, context, type BuildOptions, type Plugin } from "esbuild";
import { copyFile, mkdir, readFile } from "node:fs/promises";
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

const codeEntry = path.join(srcDir, "code.ts");
const uiEntry = path.join(srcDir, "ui", "main.tsx");

const uiHtmlSrc = path.join(srcDir, "ui.html");
const uiHtmlDist = path.join(distDir, "ui.html");

await mkdir(distDir, { recursive: true });

async function copyUiHtml() {
  await copyFile(uiHtmlSrc, uiHtmlDist);
}

/**
 * Plugin: copies ui.html to dist/ui.html after each successful UI rebuild.
 * This keeps dist/ inspectable, but runtime uses inlined __html__ (see below).
 */
const copyUiHtmlPlugin: Plugin = {
  name: "copy-ui-html",
  setup(api) {
    api.onEnd(async (result) => {
      if (result.errors.length > 0) return;
      try {
        await copyUiHtml();
      } catch (err) {
        console.error("[copy-ui-html] Failed:", err);
      }
    });
  },
};

/**
 * Plugin: defines `__html__` for code.ts by inlining src/ui.html into the JS bundle.
 * This makes `figma.showUI(__html__)` correct and deterministic.
 */
const inlineUiHtmlPlugin: Plugin = {
  name: "inline-ui-html",
  setup(api) {
    api.onLoad({ filter: /\.[tj]s$/ }, async (args) => {
      // Only affect the code.ts entry (plugin runtime)
      const normalized = path.normalize(args.path);
      if (normalized !== path.normalize(codeEntry)) return null;

      const [source, html] = await Promise.all([
        readFile(codeEntry, "utf8"),
        readFile(uiHtmlSrc, "utf8"),
      ]);

      const injected = `const __html__ = ${JSON.stringify(html)};\n${source}`;
      return { contents: injected, loader: "ts" };
    });
  },
};

const codeBuild: BuildOptions = {
  entryPoints: [codeEntry],
  bundle: true,
  outfile: path.join(distDir, "code.js"),
  platform: "browser",
  format: "iife",
  target: ["es2020"],
  sourcemap: true,
  logLevel: "info",
  plugins: [inlineUiHtmlPlugin],
};

const uiBuild: BuildOptions = {
  entryPoints: [uiEntry],
  bundle: true,
  outfile: path.join(distDir, "ui.js"),
  platform: "browser",
  format: "iife",
  target: ["es2020"],
  sourcemap: true,
  logLevel: "info",
  jsx: "automatic",
  plugins: [copyUiHtmlPlugin],
};

if (isWatch) {
  // Initial copy so dist/ always has ui.html for inspection
  await copyUiHtml();

  const codeCtx = await context(codeBuild);
  const uiCtx = await context(uiBuild);

  await codeCtx.watch();
  await uiCtx.watch();

  console.log("Watching…");
} else {
  await build(codeBuild);
  await build(uiBuild);
  await copyUiHtml();
}
