# Project Status

## Current goal

Goal: Prepare the plugin for Obsidian community directory submission and attempt the initial listing.

Status: Obsidian listing materials are merged into `master`; local release package generation is verified.

## Done

- Ran setup-light and created the lightweight workflow docs.
- Confirmed the repository is still mostly the Obsidian sample plugin template.
- Cloned and inspected Wechatsync source under `/tmp/Wechatsync-csdnsync-source` for CSDN draft-save behavior.
- User selected the local HTTP bridge approach.
- Drafted `docs/brainstorm.md` and `project_spec.md`.
- Moved the spec into `docs/project_spec.md`.
- Saved the implementation plan under `docs/superpowers/plans/2026-06-26-csdn-sync-demo.md`.
- Implemented the Obsidian plugin localhost task bridge.
- Implemented the Chrome MV3 extension skeleton, trigger flow, CSDN signing, payload, and draft save client.
- Updated README with setup and demo instructions.
- Fixed title selection so Obsidian filename is used before the first H1 heading, avoiding CSDN draft-save failures when the first H1 is too short.
- Rebuilt and copied the plugin artifacts into `/Users/lien/Obsidian-data/☘️/.obsidian/plugins/csdn-sync/`.
- Changed the demo direction: sync now opens the CSDN Markdown editor and fills title/body. The extension no longer calls CSDN draft-save APIs by default.
- Removed the unused CSDN draft-save client, signing/header code, and `marked` dependency from the extension.
- Created `feat/obsidian-store-readiness` from `master` because Chrome Web Store publishing needs a paid registration.
- Replaced the sample README with plugin-specific usage, setup, privacy, limits, and release documentation.
- Added `npm run package:obsidian` and a local release packaging script.
- Removed the unused sample `styles.css` file from release artifacts.
- Added `docs/obsidian-store/submission-checklist.md` for the official community directory process.
- Updated `manifest.json` description and `authorUrl`.
- Merged `feat/obsidian-store-readiness` into `master` using `--no-ff`.

## In progress

- Preparing the GitHub release and community directory submission attempt.

## Blocked / Questions

- Actual Obsidian community submission requires signing in at `https://community.obsidian.md` with an Obsidian account and linking the owning GitHub account.

## Checkpoints

- `git status --short --branch` showed the repo on `dev` with no pre-existing uncommitted changes before setup-light.
- Wechatsync CSDN adapter uses Chrome extension fetch with existing cookies, request signing, and dynamic `Origin` / `Referer` header rules.
- Selected communication model: Obsidian local HTTP service plus a Chrome extension trigger page/content script.
- Latest completed checks: root tests, root build, root lint, extension tests, extension build.
- Post-bugfix checks: `npm test`, `npm run build`, `npm run lint`.
- Editor-fill mode checks: `npm test`, `npm run build`, `npm run lint`, `cd extension && npm test`, `cd extension && npm run build`.
- Copied updated Obsidian plugin artifacts into `/Users/lien/Obsidian-data/☘️/.obsidian/plugins/csdn-sync/`.
- User hit a stale Chrome service worker error from the removed draft-save flow: `Cannot read properties of undefined (reading 'updateDynamicRules')`.
- Bumped the Chrome extension to `0.1.1` and rebuilt `extension/dist`; current dist contains no `updateDynamicRules`, `saveArticle`, or `bizapi` references.
- User then reached the CSDN editor but content was not filled. Chrome logs showed `SyntaxError: Cannot use import statement outside a module` from `editor-fill-content.js`.
- Fixed the editor content script by removing its runtime import so it builds as a plain content script.
- User then confirmed fill works, but Markdown paragraphs were collapsed. The Obsidian task body preserved blank lines, so the issue was CSDN handling `execCommand('insertText')` as a single editor section.
- Updated editor fill to dispatch a `paste` event with `text/plain` Markdown first, falling back to `insertText` only if CSDN does not handle paste.
- User found that syncing multiple notes close together could reuse the same CSDN editor state: the second note appended to the first note's body and overwrote the title.
- Added a per-task CSDN editor window handle and clear-before-fill behavior so each trigger/editor tab resolves its own task and removes any previous unsaved editor content before inserting Markdown.
- User found the CSDN title display text and title input could appear together, making the title look duplicated.
- Fixed title fill so the display layer is cleared while the input layer is active.
- Created `feat/csdn-image-upload` to fix CSDN image transfer failures.
- Added local Obsidian image extraction: Markdown images and wiki embeds are replaced with internal placeholders and binary image assets are attached to the sync task.
- Added CSDN image upload in the editor content script: local images are uploaded to CSDN image storage before filling Markdown.
- Rebuilt and copied updated Obsidian plugin artifacts into `/Users/lien/Obsidian-data/☘️/.obsidian/plugins/csdn-sync/`.
- User confirmed the CSDN editor now fills notes with uploaded images successfully.
- Merged `dev` into `master` while keeping `master`'s README content.
- Official Obsidian submission docs checked on 2026-06-27: root README, LICENSE, and manifest are required; release tag must match `manifest.version`; release assets are `main.js`, `manifest.json`, and optional `styles.css`; community submission happens at `community.obsidian.md`.
- Obsidian package check passed: `release/csdn-sync-1.0.0.zip` contains `main.js` and `manifest.json`.
- Store readiness checks passed: `npm test`, `npm run package:obsidian`, `npm run lint`, `git diff --check`.
- Source branch pre-merge checks passed after confirming `origin/master` was already up to date: `npm test`, `npm run package:obsidian`, `npm run lint`, `git diff --check`.
- Merged `feat/obsidian-store-readiness` into `master` with `--no-ff`; post-merge checks passed: `npm test`, `npm run package:obsidian`, `npm run lint`, `git diff --check`.

## Next actions

1. Push `master`.
2. Create GitHub release `1.0.0` with `main.js` and `manifest.json`.
3. Submit `https://github.com/Jul1en-Lin/obsidian-plugin-csdnsync` at `https://community.obsidian.md`.
