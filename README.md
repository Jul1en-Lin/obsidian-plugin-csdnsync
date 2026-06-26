# CSDN Sync

CSDN Sync opens the current Obsidian note in the CSDN Markdown editor and fills the title, Markdown body, and local images.

It uses a local bridge:

- The Obsidian plugin reads the active Markdown note and starts a localhost task server.
- The companion Chrome extension uses your existing CSDN login session in Chrome.
- The extension opens the CSDN editor and inserts the note content. You still review and save or publish manually.

## Requirements

- Obsidian desktop app.
- Google Chrome.
- A signed-in CSDN account in Chrome.
- The companion Chrome extension from this repository.

This plugin is desktop-only because it starts a local HTTP server and depends on a browser extension.

## Install

### From Obsidian community plugins

After the plugin is accepted, install it from **Settings -> Community plugins** by searching for **CSDN Sync**.

### Manual install for testing

1. Download `main.js` and `manifest.json` from the GitHub release.
2. If `styles.css` is included in the release, download it too.
3. Copy the files to `<Vault>/.obsidian/plugins/csdn-sync/`.
4. Reload Obsidian.
5. Enable **CSDN Sync** in **Settings -> Community plugins**.

## Chrome extension setup

The Chrome extension is currently distributed from this repository.

1. Run `cd extension && npm install && npm run build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose `extension/dist`.
5. Open the extension popup.
6. Set the Obsidian base URL to `http://127.0.0.1:27187`.
7. Copy the token from **Obsidian -> Settings -> CSDN Sync** into the extension.
8. Select **Check connection**.

## Use

1. Open a Markdown note in Obsidian.
2. Run **CSDN Sync: Open current note in CSDN editor** from the command palette, or use the ribbon icon.
3. Chrome opens the CSDN Markdown editor and fills the note.
4. Review the content in CSDN.
5. Save the draft or publish manually.

## Title rules

The plugin chooses the article title in this order:

1. `title` in frontmatter.
2. The Obsidian file name.
3. The first H1 heading.

## Image handling

Local Obsidian images are uploaded to CSDN image storage before the Markdown is inserted. Remote images are left as Markdown links.

## Privacy and data

CSDN Sync does not collect analytics and does not send vault data to any service controlled by this project.

When you run the sync command:

- The active note title, Markdown body, and referenced local images are exposed on `127.0.0.1` for the companion Chrome extension.
- Task endpoints require the token shown in the plugin settings.
- The Chrome extension sends the note content and images to CSDN only when you explicitly run the command.
- The local server listens on `127.0.0.1` only.

## Limits

- Only the active Markdown file is supported.
- The plugin does not publish articles automatically.
- The plugin does not edit existing CSDN articles.
- CSDN editor UI changes can break the fill flow.

## Development

```bash
npm install
npm run test
npm run build
npm run lint
```

For Chrome extension development:

```bash
cd extension
npm install
npm run test
npm run build
```

## Release

1. Update `manifest.json` and `versions.json`.
2. Run `npm run package:obsidian`.
3. Create a GitHub release whose tag exactly matches `manifest.json` `version`.
4. Upload `main.js` and `manifest.json` as release assets.
5. Upload `styles.css` only if it is included.

The generated local release folder is written to `release/csdn-sync-<version>/`.
