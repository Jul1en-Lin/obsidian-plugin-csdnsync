# Project Spec: Obsidian to CSDN Draft Demo

## Objective

开发一个 demo：用户在 Obsidian 里执行命令后，当前笔记会通过本机 HTTP 服务交给 Chrome 扩展。扩展使用 Chrome 中已有的 CSDN 登录态保存草稿，并把草稿链接回传给 Obsidian。

## Product behavior

1. 用户在 Chrome 中登录 CSDN。
2. 用户安装并启用 Chrome 扩展，配置 Obsidian 本机服务地址和 token。
3. 用户在 Obsidian 打开一篇 Markdown 笔记。
4. 用户执行命令 **Sync current note to CSDN draft**。
5. Obsidian 插件创建同步任务，并打开本机 trigger 页面。
6. Chrome 扩展 content script 识别 trigger 页面，通知扩展后台。
7. Chrome 扩展后台读取任务，检查 CSDN 登录态。
8. 扩展保存 CSDN 草稿。
9. Obsidian 收到结果后显示草稿链接。

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
  - CSDN auth checker
  - markdown to HTML converter
  - CSDN draft client
  - result reporter

CSDN Web editor API
  - existing browser cookies
  - signed requests
  - draft save endpoint
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
    trigger-content.ts
    settings.ts
    obsidian-api.ts
    markdown.ts
    csdn/
      client.ts
      sign.ts
      payload.ts
      headers.ts
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
  "status": "success",
  "postId": "123",
  "postUrl": "https://editor.csdn.net/md?articleId=123"
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
- `declarativeNetRequest`
- `declarativeNetRequestWithHostAccess`

Host permissions:

- `http://127.0.0.1/*`
- `https://bizapi.csdn.net/*`
- `https://editor.csdn.net/*`

Content script match:

- `http://127.0.0.1/*`

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
5. Extension calls CSDN auth check.
6. Extension converts Markdown to HTML.
7. Extension saves CSDN draft.
8. Extension posts the result to Obsidian.

Popup can also expose a manual **Check connection** action for setup/debug.

## CSDN client

### Auth check

Call:

```text
GET /blog-console-api/v3/editor/getBaseInfo
```

Full URL:

```text
https://bizapi.csdn.net/blog-console-api/v3/editor/getBaseInfo
```

If response has `code: 200` and user info, treat as logged in.

### Draft save

Call:

```text
POST /blog-console-api/v3/mdeditor/saveArticle
```

Full URL:

```text
https://bizapi.csdn.net/blog-console-api/v3/mdeditor/saveArticle
```

Payload includes:

```json
{
  "title": "Title",
  "markdowncontent": "...",
  "content": "<h1>...</h1>",
  "readType": "public",
  "level": 0,
  "tags": "",
  "status": 2,
  "categories": "",
  "type": "original",
  "original_link": "",
  "authorized_status": false,
  "not_auto_saved": "1",
  "source": "pc_mdeditor",
  "cover_images": [],
  "cover_type": 1,
  "is_new": 1,
  "vote_id": 0,
  "resource_id": "",
  "pubStatus": "draft",
  "creator_activity_id": ""
}
```

### Signing

Use the public Wechatsync CSDN adapter as the reference for:

- nonce generation
- HMAC-SHA256 signing
- signed headers
- method/path based signing string

Keep signing code in `extension/src/csdn/sign.ts` so CSDN changes do not leak into the rest of the extension.

### Header rules

For `https://bizapi.csdn.net/*`, set:

```http
Origin: https://editor.csdn.net
Referer: https://editor.csdn.net/
```

Use `chrome.declarativeNetRequest.updateDynamicRules`. Clear temporary rules after the request batch finishes.

## Error handling

### Obsidian plugin

- No active Markdown file: show notice and do not create task.
- Local port in use: show exact port and ask user to change settings.
- Invalid token: return `401`.
- Result for unknown task: return `404`.

### Chrome extension

- Cannot reach Obsidian: show trigger page or popup status.
- Token rejected: show setup error in popup.
- CSDN not logged in: post error to Obsidian.
- CSDN API failure: include CSDN message when available.
- Markdown to HTML conversion failure: use a basic escaped paragraph fallback.

## Testing plan

### Unit checks

- Title extraction from frontmatter, H1, and filename.
- Token validation for HTTP API.
- Task queue state changes.
- CSDN payload mapping.
- Signing function with a fixed nonce and known expected output.

### Manual demo check

1. Run Obsidian plugin dev build.
2. Load Chrome extension as unpacked extension.
3. Configure token and base URL.
4. Log in to CSDN in Chrome.
5. Open a Markdown note in Obsidian.
6. Run **Sync current note to CSDN draft**.
7. Confirm a local trigger page opens in Chrome.
8. Confirm Obsidian shows a CSDN draft link.
9. Open the link and confirm title/body are present.

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
10. Add CSDN auth and draft save client.
11. Add result callback to Obsidian.
12. Run build/lint and manual demo check.

## Deferred work

- CSDN image upload.
- Frontmatter to tags/categories mapping.
- Draft update instead of always creating a new draft.
- Better task history in Obsidian.
- One-click extension setup from Obsidian.
- Better popup progress UI.
