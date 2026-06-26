# CSDN Sync Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a demo that sends the current Obsidian note to a Chrome extension, saves it as a CSDN draft with the browser login state, and returns the draft link to Obsidian.

**Architecture:** Obsidian reads the active Markdown file and exposes a localhost task API. A Chrome MV3 extension is triggered by a localhost page, loads the task, calls CSDN editor APIs with Chrome cookies, and posts the result back.

**Tech Stack:** Obsidian Plugin API, TypeScript, Node `http`, Chrome MV3, Vite, Vitest, CSDN Web editor API.

---

### Task 1: Documentation And Metadata

**Files:**
- Move: `project_spec.md` -> `docs/project_spec.md`
- Create: `docs/superpowers/plans/2026-06-26-csdn-sync-demo.md`
- Modify: `manifest.json`, `package.json`, `README.md`, `versions.json`, `docs/project_status.md`

- [ ] Move the spec into `docs/`.
- [ ] Replace sample plugin metadata with CSDN Sync metadata.
- [ ] Update README with install, setup, and demo flow.
- [ ] Update project status after implementation.

### Task 2: Tests And Pure Shared Logic

**Files:**
- Create: `src/obsidian/title.ts`, `src/server/task-store.ts`, `src/server/token.ts`
- Create: `src/obsidian/title.test.ts`, `src/server/task-store.test.ts`, `src/server/token.test.ts`
- Modify: `package.json`

- [ ] Add Vitest and root `npm test` script.
- [ ] Write tests for title extraction, task store state, and token validation.
- [ ] Run tests and confirm they fail before implementation.
- [ ] Implement the pure modules.
- [ ] Run tests and confirm they pass.

### Task 3: Obsidian Plugin And Local HTTP API

**Files:**
- Create: `src/types.ts`, `src/obsidian/note-extractor.ts`, `src/server/local-server.ts`, `src/commands/register-commands.ts`
- Modify: `src/main.ts`, `src/settings.ts`

- [ ] Add settings: port, token, serverEnabled.
- [ ] Keep `main.ts` to lifecycle, settings, server startup, command registration.
- [ ] Implement current note extraction.
- [ ] Implement localhost API: `/health`, `/trigger`, `/tasks/:id`, `/tasks/:id/result`.
- [ ] Add command to create task and open trigger URL.
- [ ] Add command to copy extension token.

### Task 4: Chrome Extension Skeleton And Task Flow

**Files:**
- Create: `extension/package.json`, `extension/tsconfig.json`, `extension/vite.config.ts`, `extension/manifest.json`
- Create: `extension/src/background.ts`, `extension/src/trigger-content.ts`, `extension/src/settings.ts`, `extension/src/obsidian-api.ts`
- Create: `extension/src/popup/index.html`, `extension/src/popup/popup.ts`, `extension/src/popup/popup.css`

- [ ] Add MV3 extension build.
- [ ] Add popup settings for base URL and token.
- [ ] Add Check connection against `/health`.
- [ ] Add trigger content script that sends `START_CSDN_SYNC`.
- [ ] Add background task flow that loads task and posts result.

### Task 5: CSDN Draft Client

**Files:**
- Create: `extension/src/csdn/sign.ts`, `extension/src/csdn/payload.ts`, `extension/src/csdn/headers.ts`, `extension/src/csdn/client.ts`, `extension/src/markdown.ts`
- Create: `extension/src/csdn/sign.test.ts`, `extension/src/csdn/payload.test.ts`

- [ ] Write tests for CSDN payload and HMAC signing.
- [ ] Implement markdown-to-HTML conversion with `marked`.
- [ ] Implement CSDN auth check and draft save.
- [ ] Add dynamic header rules for CSDN requests and clear them after use.
- [ ] Return `https://editor.csdn.net/md?articleId=<id>` on success.

### Task 6: Verification

**Commands:**
- `npm test`
- `npm run build`
- `npm run lint`
- `cd extension && npm install && npm test && npm run build`

- [ ] Run all commands above.
- [ ] If Chrome/CSDN manual demo cannot be completed, document the exact reason and what remains.
