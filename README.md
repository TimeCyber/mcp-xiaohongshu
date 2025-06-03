# RedNote MCP

[![English](https://img.shields.io/badge/English-Click-yellow)](docs/README.en.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](README.md)
[![npm](https://img.shields.io/npm/v/rednote-mcp)](https://www.npmjs.com/package/rednote-mcp)

小红书内容访问和发布的MCP服务器，支持通过Model Context Protocol在AI客户端中搜索、获取和发布小红书内容。

https://github.com/user-attachments/assets/06b2c67f-d9ed-4a30-8f1d-9743f3edaa3a

## ✨ 功能特性

### 🔍 内容获取功能
- **关键词搜索笔记** - 根据关键词搜索小红书笔记，获取标题、内容、作者、互动数据等
- **获取笔记详情** - 通过URL获取笔记的完整内容和元数据
- **获取笔记评论** - 获取指定笔记的评论列表，包括评论者、内容、点赞数等

### 📝 内容发布功能
- **发布图文笔记** - 支持发布带图片的小红书笔记
- **发布纯文本笔记** - 发布纯文本内容（有限支持）
- **标签和隐私设置** - 支持添加标签和设置笔记隐私状态
- **多图片上传** - 支持同时上传多张图片

### 🔐 认证和管理
- **Cookie持久化** - 自动保存和管理登录状态
- **智能登录检测** - 自动检测登录状态，确保操作有效性
- **跨平台支持** - 支持Windows、macOS、Linux系统

## 快速开始

开始前确保安装了 [playwright](https://github.com/microsoft/playwright) 环境：

```bash
npx playwright install
```

### NPM 全局安装

```bash
# 全局安装
npm install -g rednote-mcp

# 初始化登录，会自动记录cookie到 ~/.mcp/rednote/cookies.json
rednote-mcp init
```

### 从源码安装

```bash
# 克隆项目
git clone https://github.com/TimeCyber/mcp-xiaohongshu.git
cd mcp-xiaohongshu

# 安装依赖
npm install

# 构建项目
npm run build

# 全局安装（可选，方便命令行调用）
npm install -g .

# 或者直接运行，如初始化登录
npm run dev -- init
```

## 📋 详细配置指南

### 1. 初始化登录

首次使用需要先进行登录初始化：

```bash
# 使用全局安装的命令
rednote-mcp init

# 或者从源码run
npm run dev -- init

# 支持自定义超时时间（秒）
rednote-mcp init 30

# 或者在mcp-client里选择login工具
```

执行此命令后：

1. 🌐 会自动打开浏览器窗口
2. 📱 跳转到小红书登录页面
3. 👤 请手动完成登录操作（扫码或密码登录）
4. ✅ 登录成功后会自动保存 Cookie 到 `~/.mcp/rednote/cookies.json` 文件

### 2. MCP客户端配置

#### MCP-X编辑器配置

在 MCP-X 的 工具管理 中添加以下配置：

**方式一：使用全局安装的命令**
```json
{
  "mcpServers": {
    "rednote": {
      "command": "rednote-mcp",
      "args": ["--stdio"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**方式二：使用npx方式**
```json
{
  "mcpServers": {
    "rednote": {
      "command": "npx",
      "args": ["rednote-mcp", "--stdio"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**方式三：使用本地路径（源码安装）**
```json
{
  "mcpServers": {
    "rednote": {
      "command": "node",
      "args": ["/path/to/mcp-xiaohongshu/dist/cli.js", "--stdio"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 3. 重启客户端

配置完成后，重启您的MCP客户端（Cursor或MCP-X）使配置生效。

## 🛠️ 使用方法

配置成功后，您可以在AI客户端中使用以下工具：

### 搜索笔记

```
请帮我搜索关于"美食"的小红书笔记，限制10条结果
```

### 获取笔记内容

```
请获取这个小红书笔记的详细内容：https://www.xiaohongshu.com/discovery/item/...
```

### 发布笔记

```
请帮我发布一篇小红书笔记：
标题：今日美食分享
内容：今天尝试了新的菜谱，味道很棒！推荐给大家。
标签：美食，生活，分享
图片：/path/to/image1.jpg, /path/to/image2.jpg
```

### 获取评论

```
请获取这个笔记下的评论：https://www.xiaohongshu.com/discovery/item/...
```

## 🔧 可用工具列表

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `search_notes` | 根据关键词搜索笔记 | `keywords` (必需), `limit` (可选，默认10) |
| `get_note_content` | 获取笔记详细内容 | `url` (必需) |
| `get_note_comments` | 获取笔记评论 | `url` (必需) |
| `add_note` | 发布小红书笔记 | `title` (必需), `content` (必需), `tags` (可选), `images` (可选), `isPrivate` (可选) |
| `login` | 登录小红书账号 | 无参数 |

## 🎯 使用示例

### 示例1：搜索美食相关笔记
```javascript
// 在支持MCP的AI客户端中
search_notes({
  keywords: "美食推荐",
  limit: 5
})
```

### 示例2：发布带图片的笔记
```javascript
add_note({
  title: "今日美食分享",
  content: "发现了一家超棒的餐厅！\n\n📍 地址：xxx\n💰 人均：xxx\n⭐ 推荐指数：五星",
  tags: ["美食", "探店", "推荐"],
  images: [
    "/Users/username/Pictures/food1.jpg",
    "/Users/username/Pictures/food2.jpg"
  ],
  isPrivate: false
})
```

## 🔧 命令行工具

除了MCP服务外，还提供命令行工具：

```bash
# 初始化登录
rednote-mcp init [timeout]

# 打包日志文件
rednote-mcp pack-logs

# 打开日志目录
rednote-mcp open-logs

# 查看帮助
rednote-mcp --help
```

## 开发指南

### 环境要求

- Node.js >= 16
- npm >= 7

### 开发流程

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式运行
npm run dev

# 运行测试
npm test
```

### 使用 MCP Inspector 进行调试

MCP Inspector 是一个用于调试 MCP 服务器的工具，可以帮助开发者检查和验证 MCP 服务器的行为。使用以下命令启动：

```bash
# 使用全局安装的版本
npx @modelcontextprotocol/inspector rednote-mcp --stdio

# 使用npx版本
npx @modelcontextprotocol/inspector npx rednote-mcp --stdio

# 使用本地构建版本
npx @modelcontextprotocol/inspector node dist/cli.js --stdio
```

这个命令会：

1. 启动 MCP Inspector 工具
2. 通过 Inspector 运行 rednote-mcp 服务
3. 提供一个交互式界面来检查请求和响应
4. 帮助调试和验证 MCP 协议的实现

### 日志管理

项目提供完整的日志系统：

```bash
# 查看日志目录
rednote-mcp open-logs

# 打包所有日志
rednote-mcp pack-logs
```

日志文件位置：
- **Windows:** `%APPDATA%\rednote-mcp\logs\`
- **macOS/Linux:** `~/.local/share/rednote-mcp/logs/`

## ⚠️ 注意事项

1. **登录要求**：首次使用必须执行 `init` 命令进行登录
2. **Cookie安全**：Cookie 文件包含敏感信息，请妥善保管
3. **定期更新**：建议定期重新登录，避免 Cookie 失效
4. **网络环境**：确保网络连接稳定，能够访问小红书
5. **图片路径**：发布笔记时，图片路径必须是绝对路径
6. **发布限制**：遵守小红书社区规范，避免频繁发布
7. **Node.js版本**：确保已正确安装 Node.js >= 16 环境

## 🐛 常见问题

### Q: 登录失败或Cookie失效怎么办？
A: 重新运行 `rednote-mcp init` 命令进行登录。

### Q: 图片上传失败？
A: 确保图片路径是绝对路径，并且图片文件存在且格式正确（JPG/PNG）。

### Q: 在Cursor中配置后无法使用？
A: 检查配置文件语法是否正确，重启Cursor，确保已执行登录命令。

### Q: 搜索结果为空？
A: 检查关键词是否合适，确保网络连接正常，登录状态有效。

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔄 更新日志

### v0.2.3
- ✅ 完善发布功能，支持图片上传
- ✅ 优化登录检测逻辑，改进页面元素识别
- ✅ 完善tab切换功能，使用JavaScript强制点击
- ✅ 增强错误处理和日志记录系统

### v0.2.x
- ✅ 支持小红书笔记发布功能
- ✅ 添加标签和隐私设置
- ✅ 完善认证管理

### v0.1.x  
- ✅ 基础搜索和获取功能
- ✅ MCP协议支持
- ✅ Cookie持久化
