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
- [x] `version`: `1.0.3`
- [x] `minAppVersion`: `1.0.0`
- [x] `description` is user-facing and specific.
- [x] `author` and `authorUrl` are present.
- [x] `isDesktopOnly` is `true`.

## Release

- [x] Run `npm run package:obsidian`.
- [x] Create a GitHub release tagged exactly `1.0.3`.
- [x] Upload release assets as individual files:
  - `main.js`
  - `manifest.json`
  - `styles.css` if included

## Community directory submission

- [x] Sign in at `https://community.obsidian.md`.
- [x] Link the GitHub account that owns `Jul1en-Lin/obsidian-plugin-csdnsync`.
- [x] Select **Plugins -> New plugin**.
- [x] Submit `https://github.com/Jul1en-Lin/obsidian-plugin-csdnsync`.
- [x] Publish the community entry.
- [x] Review automated feedback and publish new releases for required fixes.
- [x] Request manual review after release `1.0.3` completed automated review without Error.

## Notes

- The Chrome extension is required for the CSDN login/session part of the flow. The README documents manual extension installation while Chrome Web Store publishing is not ready.
- Obsidian reads `manifest.json` and `README.md` from the default branch, and installs plugin files from the GitHub release whose tag matches `manifest.json` `version`.
- Local package check passed: `release/csdn-sync-1.0.3.zip` contains `main.js` and `manifest.json`.
- GitHub release is published at `https://github.com/Jul1en-Lin/obsidian-plugin-csdnsync/releases/tag/1.0.3` with `main.js` and `manifest.json`.
- Obsidian Community page: `https://community.obsidian.md/account/plugins/csdn-sync`.
- Public listing page is available from **View listing**: `https://community.obsidian.md/plugins/csdn-sync`.
- Current release on Obsidian Community is `1.0.3`; automated review status is `Completed` with no Error.
- Remaining warnings are source-code warnings from the companion Chrome extension under `extension/` plus a clipboard-access recommendation for copying the extension token.
- Manual review request text submitted: `Please review release 1.0.3. The automated scan completed with no Error. The remaining source-code warnings are from the companion Chrome extension source under extension/ or from the documented token-copy clipboard command; the Obsidian release assets contain only main.js and manifest.json.`
