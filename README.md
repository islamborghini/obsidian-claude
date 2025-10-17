# Obsidian MCP Server

A Model Context Protocol (MCP) server that enables Claude Desktop to directly interact with your Obsidian vault. Search, read, create, and update notes seamlessly through natural conversation.

## Features

- 🔍 **Full-text search** across your entire vault
- 📖 **Read notes** with frontmatter and backlinks
- ✍️ **Create new notes** with automatic directory creation
- 🔄 **Update existing notes** (replace or append content)
- 📁 **List notes** from your vault or specific folders
- 🔗 **Backlink detection** to understand note relationships
- 🏷️ **Frontmatter support** for metadata management

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Claude Desktop](https://claude.ai/download) app
- An Obsidian vault on your local machine

## Installation

1. **Clone or download this repository:**
```bash
git clone https://github.com/yourusername/obsidian-mcp-server.git
cd obsidian-mcp-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Claude Desktop:**

Find your Claude Desktop configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/absolute/path/to/obsidian-mcp-server/server.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/absolute/path/to/your/obsidian/vault"
      }
    }
  }
}
```

**Important:** Use absolute paths, not relative paths or `~`

4. **Restart Claude Desktop** to load the MCP server

## Usage

Once configured, you can ask Claude to interact with your Obsidian vault:

### Example Commands

- **Search notes:**
  - "Search my notes for information about project planning"
  - "Find all notes mentioning Python"

- **Read notes:**
  - "Read my note about meeting notes from today"
  - "What's in my 'Ideas/startup-ideas' note?"

- **Create notes:**
  - "Create a new note called 'Books/ToRead' with a list of book recommendations"
  - "Make a daily note for today with my schedule"

- **Update notes:**
  - "Add these action items to my project note"
  - "Update my reading list with this new book"

- **List notes:**
  - "Show me all notes in my Projects folder"
  - "What notes do I have about machine learning?"

## Project Structure

```
obsidian-mcp-server/
├── server.js          # Main MCP server implementation
├── package.json       # Node.js dependencies
├── README.md         # This file
└── .gitignore        # Git ignore rules
```

## Configuration Options

### Environment Variables

- `OBSIDIAN_VAULT_PATH`: Path to your Obsidian vault (required)

### Alternative Setup

You can also pass the vault path as a command argument:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": [
        "/path/to/server.js",
        "/path/to/your/vault"
      ]
    }
  }
}
```

## Troubleshooting

### Server doesn't start

1. Check that paths in the config are absolute paths
2. Verify Node.js is installed: `node --version`
3. Check Claude Desktop logs for errors
4. Ensure your vault path exists and is accessible

### "Tool not found" errors

1. Restart Claude Desktop after configuration changes
2. Verify the MCP server is listed in Claude's settings

### Permission errors

- Ensure the script has read/write access to your vault directory
- On macOS, you may need to grant Claude Desktop file system permissions

## Security & Privacy

- **100% Local**: This server runs entirely on your machine
- **No Internet Required**: Works offline, no data leaves your computer
- **Direct File Access**: Reads/writes directly to your vault files
- **No Authentication**: Relies on local file system permissions

## Limitations

- Cannot access Obsidian plugin-generated content (e.g., Dataview queries)
- Simple text-based search (no semantic search yet)
- Doesn't handle binary attachments or images
- No support for Canvas files

## Development

### Adding New Features

The server is built with the MCP SDK. To add new tools:

1. Add tool definition in `setupHandlers()`
2. Implement the tool function
3. Add the case in the `CallToolRequestSchema` handler

### Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `gray-matter` - Frontmatter parsing
- `glob` - File pattern matching

## Roadmap

- [ ] Semantic search using embeddings
- [ ] Support for Canvas files
- [ ] Integration with Obsidian templates
- [ ] Tag management and filtering
- [ ] Graph analysis tools
- [ ] Support for attachments and images
- [ ] Daily notes automation
- [ ] Dataview query execution

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - feel free to use this in your own projects!

## Acknowledgments

- Built on [Anthropic's MCP SDK](https://github.com/anthropics/mcp)
- Designed for [Obsidian](https://obsidian.md/) knowledge management
- Inspired by the Obsidian community's automation needs

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Consult the [MCP documentation](https://modelcontextprotocol.io/docs)

---

**Note:** This project is not officially affiliated with Obsidian or Anthropic.