#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

class ObsidianMCPServer {
  constructor(vaultPath) {
    this.vaultPath = vaultPath;
    this.server = new Server(
      {
        name: 'obsidian-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        },
      }
    );
    
    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_notes',
          description: 'Search for notes in the Obsidian vault',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'read_note',
          description: 'Read a specific note from the vault',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the note (without .md extension)'
              }
            },
            required: ['path']
          }
        },
        {
          name: 'create_note',
          description: 'Create a new note in the vault',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path for the new note'
              },
              content: {
                type: 'string',
                description: 'Content of the note'
              },
              frontmatter: {
                type: 'object',
                description: 'Optional frontmatter metadata'
              }
            },
            required: ['path', 'content']
          }
        },
        {
          name: 'list_notes',
          description: 'List all notes in the vault or a specific folder',
          inputSchema: {
            type: 'object',
            properties: {
              folder: {
                type: 'string',
                description: 'Optional folder path to list notes from'
              }
            }
          }
        },
        {
          name: 'update_note',
          description: 'Update an existing note',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the note'
              },
              content: {
                type: 'string',
                description: 'New content for the note'
              },
              append: {
                type: 'boolean',
                description: 'Whether to append to existing content'
              }
            },
            required: ['path', 'content']
          }
        }
      ]
    }));

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'vault://index',
          name: 'Vault Index',
          description: 'List of all notes in the vault',
          mimeType: 'application/json'
        }
      ]
    }));

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      if (uri === 'vault://index') {
        const notes = await this.getAllNotes();
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(notes, null, 2)
          }]
        };
      }
      
      throw new Error(`Unknown resource: ${uri}`);
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'search_notes':
          return await this.searchNotes(args.query);
          
        case 'read_note':
          return await this.readNote(args.path);
          
        case 'create_note':
          return await this.createNote(args.path, args.content, args.frontmatter);
          
        case 'list_notes':
          return await this.listNotes(args.folder);
          
        case 'update_note':
          return await this.updateNote(args.path, args.content, args.append);
          
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async getAllNotes() {
    const pattern = path.join(this.vaultPath, '**/*.md');
    const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/.obsidian/**'] });
    
    return files.map(file => ({
      path: path.relative(this.vaultPath, file).replace(/\.md$/, ''),
      fullPath: file
    }));
  }

  async searchNotes(query) {
    try {
      const notes = await this.getAllNotes();
      const results = [];
      
      for (const note of notes) {
        const content = await fs.readFile(note.fullPath, 'utf-8');
        const { data, content: body } = matter(content);
        
        // Simple search in content and title
        if (body.toLowerCase().includes(query.toLowerCase()) ||
            note.path.toLowerCase().includes(query.toLowerCase())) {
          // Extract context around the match
          const index = body.toLowerCase().indexOf(query.toLowerCase());
          const start = Math.max(0, index - 100);
          const end = Math.min(body.length, index + query.length + 100);
          const context = body.substring(start, end);
          
          results.push({
            path: note.path,
            title: data.title || note.path.split('/').pop(),
            context: context,
            tags: data.tags || []
          });
        }
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error searching notes: ${error.message}`
        }]
      };
    }
  }

  async readNote(notePath) {
    try {
      const fullPath = path.join(this.vaultPath, `${notePath}.md`);
      const content = await fs.readFile(fullPath, 'utf-8');
      const { data, content: body } = matter(content);
      
      // Find backlinks
      const backlinks = await this.findBacklinks(notePath);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            path: notePath,
            frontmatter: data,
            content: body,
            backlinks: backlinks
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error reading note: ${error.message}`
        }]
      };
    }
  }

  async findBacklinks(targetPath) {
    const notes = await this.getAllNotes();
    const backlinks = [];
    const targetName = targetPath.split('/').pop();
    
    for (const note of notes) {
      if (note.path === targetPath) continue;
      
      const content = await fs.readFile(note.fullPath, 'utf-8');
      // Simple link detection - could be improved
      if (content.includes(`[[${targetName}]]`) || 
          content.includes(`[[${targetPath}]]`)) {
        backlinks.push(note.path);
      }
    }
    
    return backlinks;
  }

  async createNote(notePath, content, frontmatter = {}) {
    try {
      const fullPath = path.join(this.vaultPath, `${notePath}.md`);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      // Prepare content with frontmatter
      let noteContent = content;
      if (Object.keys(frontmatter).length > 0) {
        noteContent = matter.stringify(content, frontmatter);
      }
      
      await fs.writeFile(fullPath, noteContent, 'utf-8');
      
      return {
        content: [{
          type: 'text',
          text: `Note created successfully at: ${notePath}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error creating note: ${error.message}`
        }]
      };
    }
  }

  async listNotes(folder = '') {
    try {
      const pattern = folder 
        ? path.join(this.vaultPath, folder, '**/*.md')
        : path.join(this.vaultPath, '**/*.md');
        
      const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/.obsidian/**'] });
      
      const notes = [];
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const { data } = matter(content);
        const notePath = path.relative(this.vaultPath, file).replace(/\.md$/, '');
        
        notes.push({
          path: notePath,
          title: data.title || notePath.split('/').pop(),
          tags: data.tags || [],
          created: data.created,
          modified: (await fs.stat(file)).mtime
        });
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(notes, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error listing notes: ${error.message}`
        }]
      };
    }
  }

  async updateNote(notePath, newContent, append = false) {
    try {
      const fullPath = path.join(this.vaultPath, `${notePath}.md`);
      
      if (append) {
        const existingContent = await fs.readFile(fullPath, 'utf-8');
        const { data, content: body } = matter(existingContent);
        const updatedContent = matter.stringify(body + '\n\n' + newContent, data);
        await fs.writeFile(fullPath, updatedContent, 'utf-8');
      } else {
        await fs.writeFile(fullPath, newContent, 'utf-8');
      }
      
      return {
        content: [{
          type: 'text',
          text: `Note updated successfully: ${notePath}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error updating note: ${error.message}`
        }]
      };
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Obsidian MCP Server started');
  }
}

// Start the server
const vaultPath = process.env.OBSIDIAN_VAULT_PATH || process.argv[2];

if (!vaultPath) {
  console.error('Please provide vault path as environment variable OBSIDIAN_VAULT_PATH or as argument');
  process.exit(1);
}

const server = new ObsidianMCPServer(vaultPath);
server.start().catch(console.error);