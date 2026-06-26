# Project Status

## Current goal

Goal: Design a demo that syncs the current Obsidian note to a CSDN draft through a Chrome extension using the browser's existing CSDN login state.

Status: Demo implementation completed; editor-fill mode with local image upload is verified manually and ready to merge back to `dev`.

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

## In progress

- Merging `feat/csdn-image-upload` back to `dev` and cleaning up the feature branch.

## Blocked / Questions

- None right now.

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

## Next actions

1. Run root and extension checks on `feat/csdn-image-upload`.
2. Merge `dev` into `feat/csdn-image-upload` and verify.
3. Merge `feat/csdn-image-upload` into `dev` with `--no-ff`, then delete the local feature branch.
