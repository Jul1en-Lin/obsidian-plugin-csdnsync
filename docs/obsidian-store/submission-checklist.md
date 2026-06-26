# Obsidian store submission checklist

Source: Obsidian docs, "Submit your plugin", checked on 2026-06-27.

## Repository files

- [x] Root `README.md` describes what the plugin does and how to use it.
- [x] Root `LICENSE` exists.
- [x] Root `manifest.json` exists.
- [x] Root `versions.json` maps plugin version to minimum Obsidian version.

## Manifest

- [x] `id`: `csdn-sync`
- [x] `name`: `CSDN Sync`
- [x] `version`: `1.0.0`
- [x] `minAppVersion`: `1.0.0`
- [x] `description` is user-facing and specific.
- [x] `author` and `authorUrl` are present.
- [x] `isDesktopOnly` is `true`.

## Release

- [x] Run `npm run package:obsidian`.
- [x] Create a GitHub release tagged exactly `1.0.0`.
- [x] Upload release assets as individual files:
  - `main.js`
  - `manifest.json`
  - `styles.css` if included

## Community directory submission

- [x] Sign in at `https://community.obsidian.md`.
- [ ] Link the GitHub account that owns `Jul1en-Lin/obsidian-plugin-csdnsync`.
- [ ] Select **Plugins -> New plugin**.
- [ ] Submit `https://github.com/Jul1en-Lin/obsidian-plugin-csdnsync`.
- [ ] Review automated feedback and publish a new release if fixes are required.

## Notes

- The Chrome extension is required for the CSDN login/session part of the flow. The README documents manual extension installation while Chrome Web Store publishing is not ready.
- Obsidian reads `manifest.json` and `README.md` from the default branch, and installs plugin files from the GitHub release whose tag matches `manifest.json` `version`.
- Local package check passed: `release/csdn-sync-1.0.0.zip` contains `main.js` and `manifest.json`.
- GitHub release is published at `https://github.com/Jul1en-Lin/obsidian-plugin-csdnsync/releases/tag/1.0.0` with `main.js` and `manifest.json`.
- Submission attempt reached the New plugin form, but Obsidian returned: `You do not own this repository. Connect your GitHub account and ensure the repo owner matches your username or an organization you administer.`
