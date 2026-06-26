# Project Status

## Current goal

Goal: Prepare the plugin for Obsidian community directory submission and attempt the initial listing.

Status: Obsidian Community entry is live; GitHub release `1.0.3` is published; automated review completed with no Error; manual review request is submitted.

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
- Pushed `master` to GitHub and published release `1.0.0` with `main.js` and `manifest.json`.
- Attempted the Obsidian community directory submission form.
- User connected the owning GitHub account on Obsidian Community.
- Submitted and published the `CSDN Sync` community entry.
- Published follow-up releases `1.0.1`, `1.0.2`, and `1.0.3` to address Obsidian automated review findings.
- Obsidian Community now lists current release `1.0.3`; automated review completed without Error.
- Submitted a manual review request explaining that remaining source-code warnings are from the companion Chrome extension source or the documented token-copy clipboard command.

## In progress

- Waiting for Obsidian manual review feedback on the live community entry.

## Blocked / Questions

- None right now.
- Non-blocking review warnings remain because Obsidian scans the whole repository, including `extension/`. Fix only if Obsidian maintainers require it.

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
- GitHub release `1.0.0` is published and contains `main.js` and `manifest.json`.
- Community submission attempt reached `/account/plugins/new`; form submission failed because the Obsidian Community account has not connected the owning GitHub account.
- Release `1.0.0` automated review failed on direct style assignment.
- Release `1.0.1` preview failed because the Chrome extension content script created a `<style>` element.
- Release `1.0.2` review completed without Error after moving extension styles into a CSS file.
- Release `1.0.3` review completed without Error after removing the remaining CSS warning.
- GitHub release `1.0.3` is published and contains `main.js` and `manifest.json`.
- Obsidian Community shows `Current release` as `1.0.3` and review status as `Completed`.
- Manual review request was submitted from the Obsidian Community dashboard.

## Next actions

1. Monitor the Obsidian Community dashboard and the `Review branch` page for maintainer feedback.
2. If maintainers ask for changes, patch the issue, bump the version, package, publish a release, and check for new releases on the dashboard.
3. Consider excluding or splitting the companion Chrome extension source later if repository-wide warnings become a review concern.
