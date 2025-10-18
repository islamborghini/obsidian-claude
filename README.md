# Obsidian MCP Server

A Model Context Protocol (MCP) server that connects Claude to your Obsidian vault, enabling intelligent note management with a learning-focused approach.

## Features

- **Search & Read**: Search through your vault and read specific notes
- **Create & Update**: Create new notes and update existing ones
- **Vault Analysis**: Analyze your vault's folder structure and organization
- **Related Notes**: Find notes related to topics before creating duplicates
- **Backlink Detection**: Automatically find backlinks to notes
- **Frontmatter Support**: Full support for YAML frontmatter metadata

## Prerequisites

- Node.js (v18 or higher)
- An Obsidian vault
- Claude Desktop app or MCP-compatible client

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/islamborghini/obsidian-claude.git
cd obsidian-claude
```

### 2. Install Dependencies

```bash
npm install
```

Required packages:
- `@modelcontextprotocol/sdk` - MCP SDK
- `gray-matter` - Frontmatter parsing
- `glob` - File pattern matching

### 3. Configure Claude Desktop

Edit your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": [
        "/absolute/path/to/obsidian-claude/obsidian-mcp.js"
      ],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/absolute/path/to/your/obsidian/vault"
      }
    }
  }
}
```

**Important**: Replace the paths with your actual paths:
- First path: Location where you cloned this repo
- Second path: Location of your Obsidian vault

### 4. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

### 5. Verify Connection

In Claude, ask: "Can you list the tools you have access to?"

You should see tools like `search_notes`, `create_note`, `analyze_vault_structure`, etc.

## Usage

### Basic Commands

**Search for notes:**
```
Search my vault for notes about "quantum mechanics"
```

**Read a note:**
```
Read the note at path "Physics/Quantum Mechanics"
```

**Create a note:**
```
Create a note called "Einstein Field Equations" in the Physics folder
```

**List notes in a folder:**
```
List all notes in the derivations folder
```

**Analyze vault structure:**
```
Analyze my vault structure and show me the folder organization
```

### Learning Mode (Recommended Setup)

For the best learning-focused experience, give Claude these instructions:

```
When helping me create notes in Obsidian, follow this process:

1. First, immediately analyze my vault structure to understand the organization (you have the path to the vault)
2. Check for related notes on the topic
3. Ask me questions about the concept to ensure I understand it
4. Propose where the note should be placed and ask for my confirmation
5. Keep notes concise (max half page), direct, and non-repetitive
6. Avoid poetic language - be straightforward
7. For derivations:
   - Put them in the /derivations folder
   - Ask me to derive it first before creating the note
   - Only create the note after I demonstrate understanding

Your role is to be a learning partner, not just a note generator.
```

#### Setting Up Custom Instructions

1. Open Claude Desktop
2. Click on your profile (bottom left) -> Settings
3. Select "General" Tab
4. Paste the learning mode instructions under "What personal preferences should Claude consider in responses?"
5. Save

You can also paste these instructions into your specific project:
1. Select "Projects" Tab
2. Select your project or create a new one
3. Add a new instruction and paste the text above

Now Claude will automatically follow this workflow whenever you ask to create notes.

## Troubleshooting

### Server not connecting
- Verify the paths in `claude_desktop_config.json` are absolute paths
- Check that Node.js is installed: `node --version`
- Look at Claude Desktop logs for errors

### Cannot find vault
- Ensure `OBSIDIAN_VAULT_PATH` points to your vault root directory
- Path should not include a trailing slash
- Use absolute paths, not relative paths

### Tools not appearing
- Restart Claude Desktop completely
- Verify the config file is valid JSON (use a JSON validator)
- Check that the MCP server file is executable

### Notes not being created
- Ensure your vault path has write permissions
- Check that folder names match exactly (case-sensitive)
- Verify there are no special characters in file paths

Built with:
- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic

---

**Note**: This tool is designed to work with plain markdown files. It does not support Obsidian Canvas files, Excalidraw drawings, or other binary formats.