# Project Spec: Obsidian to CSDN Editor Fill Demo

## Objective

开发一个 demo：用户在 Obsidian 里执行命令后，当前笔记会通过本机 HTTP 服务交给 Chrome 扩展。扩展使用 Chrome 中已有的 CSDN 登录态打开 CSDN Markdown 编辑器，并把标题和正文填入页面。用户在 CSDN 页面手动保存草稿或发布。

## Product behavior

1. 用户在 Chrome 中登录 CSDN。
2. 用户安装并启用 Chrome 扩展，配置 Obsidian 本机服务地址和 token。
3. 用户在 Obsidian 打开一篇 Markdown 笔记。
4. 用户执行命令 **Open current note in csdn editor**。
5. Obsidian 插件创建同步任务，并打开本机 trigger 页面。
6. Chrome 扩展 content script 识别 trigger 页面，通知扩展后台。
7. Chrome 扩展后台读取任务，暂存待填充内容，并返回 CSDN 编辑器 URL。
8. trigger 页面跳转到 CSDN Markdown 编辑器。
9. CSDN 编辑器 content script 上传本地图片附件，把 Markdown 图片地址替换为 CSDN 图片地址。
10. CSDN 编辑器 content script 填充标题和 Markdown 正文。
11. Obsidian 收到 `manual-fill` 结果后提示用户在 CSDN 页面手动保存。

## Architecture

```text
Obsidian plugin
  - current note extractor
  - localhost HTTP server
  - task queue
  - result display

Chrome extension
  - trigger content script
  - task loader
- pending editor task store
- CSDN image upload helper
  - CSDN editor fill content script
  - result reporter

CSDN Web editor
  - existing browser cookies
  - Markdown editor page
  - user-controlled save/publish actions
```

## Repository layout

```text
src/
  main.ts
  settings.ts
  types.ts
  obsidian/
    note-extractor.ts
    title.ts
  server/
    local-server.ts
    task-store.ts
    token.ts
  commands/
    register-commands.ts

extension/
  manifest.json
  package.json
  src/
    background.ts
    editor-fill-content.ts
    editor-task-store.ts
    trigger-content.ts
    settings.ts
    obsidian-api.ts
    csdn/
      editor-url.ts
    popup/
      index.html
      popup.ts
```

## Obsidian plugin

### Manifest

- `id`: `csdn-sync`
- `name`: `CSDN Sync`
- `isDesktopOnly`: `true`

Desktop only is required because the demo uses a local HTTP server.

### Settings

```ts
interface CsdnSyncSettings {
  port: number;
  token: string;
  serverEnabled: boolean;
}
```

Defaults:

- `port`: `27187`
- `token`: generated on first load
- `serverEnabled`: `true`

### Commands

- `sync-current-note-to-csdn-draft`
  - Requires an active Markdown file.
  - Extracts title and Markdown.
  - Creates a pending task.
  - Opens `/trigger?taskId=<id>` in the browser.
  - Shows a notice with current task status.

- `copy-extension-token`
  - Copies the token for Chrome extension setup.

### Local HTTP API

All endpoints require:

```http
X-CSDNSync-Token: <token>
```

#### `GET /health`

Response:

```json
{
  "ok": true,
  "plugin": "csdn-sync"
}
```

#### `GET /trigger?taskId=<id>`

Returns a small HTML page. It does not include the note body. The Chrome extension content script reads the `taskId` from the URL and sends it to the extension background.

#### `GET /tasks/:id`

Returns the task by id.

Success response:

```json
{
  "id": "sync_...",
  "title": "Title",
  "markdown": "...",
  "sourcePath": "folder/note.md",
  "createdAt": "2026-06-26T00:00:00.000Z"
}
```

#### `POST /tasks/:id/result`

Request:

```json
{
  "status": "manual-fill",
  "postUrl": "https://editor.csdn.net/md/?csdnSyncTaskId=sync_..."
}
```

or:

```json
{
  "status": "error",
  "error": "请先在 Chrome 中登录 CSDN"
}
```

## Chrome extension

### Manifest permissions

Required:

- `storage`

Host permissions:

- `http://127.0.0.1/*`
- `https://editor.csdn.net/*`

Content script match:

- `http://127.0.0.1/*`
- `https://editor.csdn.net/md*`

### Settings

```ts
interface ExtensionSettings {
  obsidianBaseUrl: string;
  token: string;
}
```

Defaults:

- `obsidianBaseUrl`: `http://127.0.0.1:27187`

### Task flow

1. User runs the Obsidian command.
2. Obsidian opens `/trigger?taskId=<id>`.
3. Extension content script sends `{ type: "START_CSDN_SYNC", taskId }` to background.
4. Extension background calls `GET /tasks/:id`.
5. Extension background stores the task in Chrome local storage under a pending editor task key.
6. Extension background posts `{ status: "manual-fill", postUrl }` to Obsidian.
7. Trigger page navigates to the CSDN editor URL with `csdnSyncTaskId`.
8. CSDN editor content script loads the pending task.
9. Local Obsidian images are uploaded to CSDN image storage and placeholder image URLs are replaced.
10. The content script fills title and Markdown body, clears the pending task, and shows an in-page notice.

Popup can also expose a manual **Check connection** action for setup/debug.

## CSDN editor fill

The extension must not call CSDN draft-save APIs in the default flow.

Editor fill behavior:

- Open `https://editor.csdn.net/md/?csdnSyncTaskId=<taskId>`.
- Fill title from the Obsidian task title.
- Upload local Obsidian image attachments referenced by Markdown image syntax or wiki embeds.
- Replace uploaded local image references with CSDN image URLs.
- Fill Markdown body from the prepared Obsidian task Markdown.
- Show an in-page notice telling the user to select **保存草稿** or **发布文章** manually.
- Clear pending task content from Chrome local storage after a successful fill.

## Error handling

### Obsidian plugin

- No active Markdown file: show notice and do not create task.
- Local port in use: show exact port and ask user to change settings.
- Invalid token: return `401`.
- Result for unknown task: return `404`.

### Chrome extension

- Cannot reach Obsidian: show trigger page or popup status.
- Token rejected: show setup error in popup.
- CSDN not logged in: CSDN editor page handles login; the extension should show a visible fill failure if editor controls never appear.
- CSDN editor DOM changed: show a visible fill failure in the editor page.
- CSDN image upload failure: keep the original image source and show the upload failure count in the editor notice.

## Testing plan

### Unit checks

- Title extraction from frontmatter, H1, and filename.
- Token validation for HTTP API.
- Task queue state changes.
- CSDN editor URL task id round trip.
- Pending editor task store behavior.
- Obsidian local image extraction and placeholder replacement.
- CSDN image placeholder replacement and upload signing.

### Manual demo check

1. Run Obsidian plugin dev build.
2. Load Chrome extension as unpacked extension.
3. Configure token and base URL.
4. Log in to CSDN in Chrome.
5. Open a Markdown note in Obsidian.
6. Run **Open current note in csdn editor**.
7. Confirm a local trigger page opens in Chrome.
8. Confirm Chrome opens the CSDN Markdown editor.
9. Confirm title/body are filled.
10. Select **保存草稿** manually and confirm CSDN creates the draft.

## First implementation pass

1. Rename sample plugin metadata and commands.
2. Add settings with port and token.
3. Add current-note extraction.
4. Add local HTTP server and in-memory task queue.
5. Add local trigger page.
6. Add Chrome extension skeleton.
7. Add extension settings/popup.
8. Add trigger content script.
9. Add Obsidian task client in extension.
10. Add CSDN editor fill content script.
11. Add result callback to Obsidian.
12. Run build/lint and manual demo check.

## Deferred work

- Remote web image download/re-upload.
- Frontmatter to tags/categories mapping.
- Optional API-based draft save behind explicit user opt-in.
- Better task history in Obsidian.
- One-click extension setup from Obsidian.
- Better popup progress UI.
