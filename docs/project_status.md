# Project Status

## Current goal

Goal: Design a demo that syncs the current Obsidian note to a CSDN draft through a Chrome extension using the browser's existing CSDN login state.

Status: Demo implementation completed; post-demo bugfix copied into the test vault.

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

## In progress

- Manual re-test in Obsidian after reloading the CSDN Sync plugin.

## Blocked / Questions

- None right now.

## Checkpoints

- `git status --short --branch` showed the repo on `dev` with no pre-existing uncommitted changes before setup-light.
- Wechatsync CSDN adapter uses Chrome extension fetch with existing cookies, request signing, and dynamic `Origin` / `Referer` header rules.
- Selected communication model: Obsidian local HTTP service plus a Chrome extension trigger page/content script.
- Latest completed checks: root tests, root build, root lint, extension tests, extension build.
- Post-bugfix checks: `npm test`, `npm run build`, `npm run lint`.

## Next actions

1. Reload the CSDN Sync plugin in Obsidian.
2. Run sync again from the `Java 脚手架` note.
3. Confirm CSDN opens the generated draft link.
