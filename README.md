# CSDN Sync

Demo Obsidian plugin + Chrome extension for opening the CSDN Markdown editor and filling it with the current Obsidian note.

## How it works

1. Obsidian reads the active Markdown note.
2. Obsidian exposes a localhost task API on `127.0.0.1`.
3. Obsidian opens a local trigger page.
4. The Chrome extension content script sees the trigger page and starts the extension background task.
5. The extension opens the CSDN Markdown editor in the same Chrome profile.
6. A CSDN editor content script fills the title and Markdown body.
7. The user manually saves the draft or publishes from CSDN.

This demo does not store CSDN cookies or ask for a CSDN password. It only sends the current note content from Obsidian to the local Chrome extension.

## Obsidian plugin setup

```bash
npm install
npm run build
```

Copy these files into your vault plugin folder:

```text
<Vault>/.obsidian/plugins/csdn-sync/
  main.js
  manifest.json
  styles.css
```

Reload Obsidian, enable **CSDN Sync**, then copy the extension token from the plugin settings or the command palette.

## Chrome extension setup

```bash
cd extension
npm install
npm run build
```

Open `chrome://extensions`, enable developer mode, and load `extension/dist` as an unpacked extension.

In the extension popup:

- Set Obsidian URL to `http://127.0.0.1:27187`.
- Paste the token copied from Obsidian.
- Select **Check connection**.

## Demo flow

1. Log in to CSDN in Chrome.
2. Open a Markdown note in Obsidian.
3. Select the left ribbon upload icon, select **Open editor** in plugin settings, or run **Open current note in csdn editor** from the command palette.
4. A local trigger page opens in Chrome.
5. Chrome opens the CSDN Markdown editor and fills the title and body.
6. Review the content in CSDN, then select **保存草稿** or **发布文章** manually.

If your default browser is not Chrome, copy the trigger page URL into the Chrome profile where the extension is installed.

## Current limits

- Only the current active Markdown note is synced.
- The extension does not auto-save. CSDN draft creation happens only when the user selects **保存草稿**.
- Local images are not uploaded to CSDN yet.
- Tags, categories, cover images, and publishing are not included.
- Desktop Obsidian only.

## Development checks

```bash
npm test
npm run build
npm run lint
cd extension && npm test && npm run build
```
