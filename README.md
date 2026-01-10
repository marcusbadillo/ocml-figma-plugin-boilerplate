# OCML Figma Plugin Boilerplate

A minimal, production-ready boilerplate for building **Figma plugins** at [OC Media Lab](https://ocmedialab.com) using **TypeScript**, **ESM**, and **esbuild**. This repository establishes a clean, repeatable foundation for all OCML Figma plugins, with strict boundaries enforced by the Figma runtime.

---

## Why These Files Exist

Figma plugins run in **two isolated execution environments**. This repo follows Figma’s required architecture exactly.

### `src/code.ts` — Plugin Runtime (Document Authority)

- Runs in Figma’s plugin sandbox
- Has exclusive access to the Figma document (`figma.*`)
- Creates, mutates, and inspects nodes, components, and layouts
- Cannot access the DOM or browser APIs
- Communicates with the UI via message passing only

This file is the **only place** where document mutations are allowed.

---

### `src/ui.html` — UI Shell

- Loaded by Figma as a static iframe
- Defines UI structure and styling
- Bootstraps the UI script

Figma requires a static HTML entry point; it cannot load JSX or TypeScript directly.

---

### `src/ui.ts` — UI Logic

- Runs inside the UI iframe
- Handles user input, validation, and UI state
- Sends commands to `code.ts`
- Receives status updates from the plugin runtime

This separation keeps UI concerns isolated from document logic and enables safe iteration.

---

## Messaging Model

The plugin and UI communicate via explicit message passing:

- **UI → Plugin:** user intent (e.g. prompts, actions)
- **Plugin → UI:** status, progress, and errors

There is no shared state or direct access between environments.

---

## Build Strategy

- **Plugin code** is bundled with `esbuild`
- **Scripts** run directly as TypeScript via `tsx`

---

---

## HOW TO USE THIS

see manifest reference below and update as needed

## References

- Figma Plugin Quickstart
  <https://www.figma.com/plugin-docs/plugin-quickstart-guide>

- Figma Plugin Architecture
  <https://www.figma.com/plugin-docs/architecture/>

- Figma Plugin API
  <https://www.figma.com/plugin-docs/api/>

- Figma Manifest Docs
  <https://developers.figma.com/docs/plugins/manifest/>

- Figma Plugin Management as a Developer
 <https://help.figma.com/hc/en-us/articles/360042293714-Manage-plugins-as-a-developer>

- esbuild
  <https://esbuild.github.io/>

- ESLint Flat Config
  <https://eslint.org/docs/latest/use/configure/configuration-files>

- TypeScript
  <https://www.typescriptlang.org/>
