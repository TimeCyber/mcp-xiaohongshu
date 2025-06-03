# RedNote MCP

[![English](https://img.shields.io/badge/English-Click-yellow)](README.en.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](../README.md)
[![npm](https://img.shields.io/npm/v/rednote-mcp)](https://www.npmjs.com/package/rednote-mcp)

A friendly tool to help you access and interact with Xiaohongshu (RedNote) content through Model Context Protocol.

https://github.com/user-attachments/assets/06b2c67f-d9ed-4a30-8f1d-9743f3edaa3a

## Getting Started

Before getting started, make sure the [playwright](https://github.com/microsoft/playwright) is installed:

```bash
npx playwright install
```

### Install via NPM

The easiest way to get started is to install RedNote MCP globally:

```bash
# Install the package globally
npm install -g rednote-mcp

# Set up your account
rednote-mcp init   # This will save your login info to ~/.mcp/rednote/cookies.json
```

### Build from Source

If you prefer to build from source:

```bash
# Get the code
git clone https://github.com/ifuryst/rednote-mcp.git
cd rednote-mcp

# Set up the project
npm install

# Optional: Install globally for easier CLI access
npm install -g .

# Or just run it directly for initial setup
npm run dev -- init
```

## What's Included

Here's what you can do with RedNote MCP:

- Log in and stay logged in (with automatic cookie management)
- Search through notes using keywords
- Use our handy command-line tools
- View note content using URLs

Coming soon:

- [ ] Access comment sections using URLs

## How to Use

### First Time Setup

Before you start, you'll need to log in. You have a few options:

```bash
rednote-mcp init
# If you installed from source:
npm run dev -- init
# Or simply use the login option in mcp-client
```

Here's what happens:

1. Your browser will open automatically
2. You'll see the Xiaohongshu login page
3. Log in like you normally would
4. Once you're in, we'll save your login info to `~/.mcp/rednote/cookies.json`

### Setting up in Cursor

To use RedNote MCP in Cursor, add this to your settings.json:

```json
{
  "mcpServers": {
    "RedNote MCP": {
      "command": "rednote-mcp",
      "args": [
        "--stdio"
      ]
    }
  }
}
```

Or if you prefer using npx:

```json
{
  "mcpServers": {
    "RedNote MCP": {
      "command": "npx",
      "args": [
        "rednote-mcp",
        "--stdio"
      ]
    }
  }
}
```

A few things to note:

- You can use either the global command (`rednote-mcp`) or `npx`
- Make sure to include `--stdio` - it's needed for Cursor communication

## Development

### What You'll Need

- Node.js version 16 or newer
- npm version 7 or newer

### Development Commands

```bash
# Get everything installed
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run the test suite
npm test
```

### Debugging with MCP Inspector

Need to debug? MCP Inspector is your friend:

```bash
npx @modelcontextprotocol/inspector npx rednote-mcp --stdio
```

This will:

1. Start up the Inspector
2. Run RedNote MCP through it
3. Give you a nice interface to watch requests and responses
4. Help you understand what's happening under the hood

## Important Things to Know

1. Don't forget to run `init` when you first start
2. Keep your cookie file safe - it has your login info
3. Your login might expire occasionally - just log in again when it does
4. Make sure you have Node.js set up properly

## Want to Contribute?

We'd love your help! Here's how:

1. Fork this repo
2. Create a branch for your feature (`git checkout -b feature/CoolNewThing`)
3. Make your changes (`git commit -m 'Added this cool new thing'`)
4. Push it up (`git push origin feature/CoolNewThing`)
5. Open a Pull Request

## License

This project is under the MIT License - check out the [LICENSE](LICENSE) file for the details 
