# CSDN Sync Demo Brainstorm

## Goal

做一个 demo：在 Obsidian 里取当前笔记内容，交给 Chrome 扩展。Chrome 扩展使用浏览器里已有的 CSDN 登录态，调用 CSDN Web 编辑器接口，把文章保存成草稿，并把草稿链接回传给 Obsidian。

## Known context

- 当前仓库仍接近 Obsidian 官方插件模板。
- Wechatsync 的 CSDN 思路可参考，但不照搬整套多平台系统。
- CSDN 请求必须放在 Chrome 扩展里做，因为登录 Cookie 在浏览器里。
- Obsidian 插件不能直接调用 `chrome.runtime.sendMessage`，两者中间需要桥接。

## Chosen approach

采用本机 HTTP 桥接：

1. Obsidian 插件启动只监听 `127.0.0.1` 的 HTTP 服务。
2. 用户在 Obsidian 执行同步命令，插件提取当前笔记并创建一条待处理任务。
3. Obsidian 打开本机 trigger 页面，例如 `http://127.0.0.1:27187/trigger?taskId=...`。
4. Chrome 扩展 content script 识别 trigger 页面，把任务 id 交给扩展后台。
5. 扩展后台从 Obsidian 本机服务读取任务，执行 CSDN 草稿保存。
6. 扩展把结果回传到 Obsidian，Obsidian 显示草稿链接或错误。

这个方案的边界最清楚：Obsidian 只读笔记，Chrome 扩展只处理浏览器登录态和 CSDN 接口。

## Alternatives considered

### Extension popup manual action

扩展 popup 里点按钮后主动读取 Obsidian 当前笔记。

优点：调试简单。

缺点：Obsidian 里点了同步还要去扩展里再点一次，demo 体验差。

### Background polling only

扩展后台固定间隔请求 Obsidian 本机服务。

优点：概念简单。

缺点：Chrome MV3 service worker 会休眠，短间隔轮询不可靠。适合作为兜底，不适合作为第一版主流程。

### JSON handoff

Obsidian 导出同步任务 JSON，扩展读取或粘贴后同步。

优点：几乎没有桥接问题。

缺点：自动化程度低，不像插件协同。

### Direct CSDN calls from Obsidian

Obsidian 插件直接调 CSDN 接口。

这个方向不太对。Obsidian 没有用户浏览器里的 CSDN Cookie，会变成复制 Cookie 或输入账号密码，安全边界差，也偏离需求。

## Demo scope

### Included

- Obsidian 命令：同步当前笔记到 CSDN 草稿。
- 当前 Markdown 文件读取。
- 标题提取：优先 frontmatter `title`，其次第一个 `#` 标题，最后用文件名。
- 本机 HTTP 服务：任务读取、结果回传、健康检查。
- 本机 trigger 页面：唤起 Chrome 扩展 content script。
- Chrome 扩展后台任务：读取任务、检查 CSDN 登录、保存草稿。
- CSDN 草稿链接回传。
- 基础状态提示和错误提示。

### Not included yet

- 图片上传到 CSDN 图床。
- 标签、分类、封面、摘要等完整编辑字段。
- 自动发布。
- 多平台同步。
- 移动端 Obsidian。
- 与 Wechatsync 官方扩展/MCP 直接集成。
- 全 vault 扫描或批量同步。

## CSDN technical notes from Wechatsync

Wechatsync 的 CSDN adapter 做了这些事：

- 通过 `GET https://bizapi.csdn.net/blog-console-api/v3/editor/getBaseInfo` 检查登录状态。
- 保存草稿时调用 `POST https://bizapi.csdn.net/blog-console-api/v3/mdeditor/saveArticle`。
- 请求带 `credentials: include`，让 Chrome 自动带上用户已有 Cookie。
- 请求需要签名 header：`x-ca-key`、`x-ca-nonce`、`x-ca-signature`、`x-ca-signature-headers`。
- 扩展通过 `declarativeNetRequest` 给请求补 `Origin: https://editor.csdn.net` 和 `Referer: https://editor.csdn.net/`。
- 草稿保存成功后，根据返回的 article id 拼出 `https://editor.csdn.net/md?articleId=<id>`。

这些接口属于 CSDN Web 编辑器内部接口，可能变化。demo 要把 CSDN client 单独隔离，后面接口变了只改这一层。

## Data shape

Obsidian 交给扩展的任务：

```json
{
  "id": "sync_...",
  "title": "文章标题",
  "markdown": "# Markdown content",
  "sourcePath": "folder/note.md",
  "createdAt": "2026-06-26T00:00:00.000Z"
}
```

扩展回传结果：

```json
{
  "id": "sync_...",
  "status": "success",
  "postId": "123",
  "postUrl": "https://editor.csdn.net/md?articleId=123"
}
```

失败时：

```json
{
  "id": "sync_...",
  "status": "error",
  "error": "请先在 Chrome 中登录 CSDN"
}
```

## Security notes

- 本机服务只监听 `127.0.0.1`，不监听局域网地址。
- Obsidian 插件生成 token，扩展请求时必须带 `X-CSDNSync-Token`。
- token 存在 Obsidian 插件设置和 Chrome 扩展 storage 中。
- 不存 CSDN Cookie，不存账号密码。
- 不自动发布，只保存草稿。
- 当前笔记内容会从 Obsidian 进到 Chrome 扩展，这是功能本身需要的传输，README 里要说清楚。

## Open risks

- CSDN Web 编辑器接口可能改动。
- 如果 trigger 页面打开在非 Chrome 浏览器里，扩展不会执行。demo 需要提示用户把页面放到已安装扩展的 Chrome 里打开。
- Obsidian 本机服务端口可能被占用，需要允许用户改端口。
- 如果 Markdown 里有本地图片，demo 第一版不会上传，CSDN 草稿里可能无法显示。
