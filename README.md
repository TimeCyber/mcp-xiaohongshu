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

## 🚀 快速开始

### 环境准备

确保您的系统已安装：
- Node.js >= 16
- npm >= 7

首先安装Playwright浏览器环境：

```bash
npx playwright install
```

### 安装方式

#### 方式一：NPM全局安装（推荐）

```bash
# 全局安装
npm install -g rednote-mcp

# 初始化登录
rednote-mcp init
```

#### 方式二：从源码安装

```bash
# 克隆项目
git clone https://github.com/ifuryst/rednote-mcp.git
cd rednote-mcp

# 安装依赖
npm install

# 构建项目
npm run build

# 初始化登录
node dist/cli.js init
```

## 📋 配置使用

### 1. 初始化登录

首次使用需要先进行登录：

```bash
# 使用全局安装的命令
rednote-mcp init

# 或者从源码目录运行
node dist/cli.js init

# 支持自定义超时时间（秒）
rednote-mcp init 30
```

执行登录流程：
1. 🌐 自动打开浏览器窗口
2. 📱 跳转到小红书登录页面
3. 👤 手动完成登录操作（扫码或密码登录）
4. ✅ 登录成功后自动保存Cookie

### 2. 配置MCP客户端

#### Cursor编辑器配置

在Cursor的设置文件中添加MCP服务器配置：

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

**方式二：使用npx**
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
      "args": ["/path/to/rednote-mcp/dist/cli.js", "--stdio"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Claude Desktop配置

在Claude Desktop的配置文件中添加：

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rednote": {
      "command": "rednote-mcp",
      "args": ["--stdio"]
    }
  }
}
```

### 3. 重启客户端

配置完成后，重启您的MCP客户端（Cursor或Claude Desktop）使配置生效。

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

## 🧪 开发和调试

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/ifuryst/rednote-mcp.git
cd rednote-mcp

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建项目
npm run build

# 运行测试
npm test
```

### 使用MCP Inspector调试

MCP Inspector是官方提供的调试工具：

```bash
# 使用全局安装的版本
npx @modelcontextprotocol/inspector rednote-mcp --stdio

# 使用npx版本
npx @modelcontextprotocol/inspector npx rednote-mcp --stdio

# 使用本地构建版本
npx @modelcontextprotocol/inspector node dist/cli.js --stdio
```

这将启动一个Web界面，可以实时查看MCP协议的请求和响应。

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

## 📁 项目结构

```
rednote-mcp/
├── src/
│   ├── auth/          # 认证管理
│   ├── tools/         # 核心功能工具
│   ├── utils/         # 工具函数
│   ├── cli.ts         # 命令行入口
│   └── index.ts       # 主入口
├── dist/              # 构建输出
├── docs/              # 文档
└── test-assets/       # 测试资源
```

## ⚠️ 注意事项

1. **登录要求**：首次使用必须执行`init`命令进行登录
2. **Cookie安全**：Cookie文件包含敏感信息，请妥善保管
3. **定期更新**：建议定期重新登录，避免Cookie失效
4. **网络环境**：确保网络连接稳定，能够访问小红书
5. **图片路径**：发布笔记时，图片路径必须是绝对路径
6. **发布限制**：遵守小红书社区规范，避免频繁发布

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🐛 问题反馈

如果您遇到问题或有功能建议，请：

1. 查看[Issues](https://github.com/ifuryst/rednote-mcp/issues)页面
2. 运行`rednote-mcp pack-logs`打包日志
3. 创建新的Issue并附上日志文件

## 🔄 更新日志

### v0.2.3
- ✅ 完善发布功能，支持图片上传
- ✅ 优化登录检测逻辑
- ✅ 改进页面元素识别
- ✅ 增强错误处理和日志记录

### v0.2.x
- ✅ 支持小红书笔记发布
- ✅ 添加标签和隐私设置
- ✅ 完善认证管理

### v0.1.x  
- ✅ 基础搜索和获取功能
- ✅ MCP协议支持
- ✅ Cookie持久化 
