# @wyattjoh/jsr-mcp

A Model Context Protocol (MCP) server that provides LLMs with access to the JSR (JavaScript Registry) API. This package enables AI assistants to search packages, manage versions, and interact with the JSR ecosystem.

## Installation

```bash
deno add @wyattjoh/jsr-mcp
```

## Features

- **40+ MCP Tools** for comprehensive JSR access:
  - Package search and discovery
  - Version management and dependencies
  - Scope and member management
  - User authentication and authorization
  - Publishing and registry operations

- **Type-Safe** - Full TypeScript support with Zod schemas
- **Authenticated Operations** - Support for JSR API token authentication
- **Comprehensive Coverage** - Complete JSR API functionality

## Usage

### As MCP Server

The package can be run directly as an MCP server:

```bash
deno run --allow-net --allow-env jsr:@wyattjoh/jsr-mcp
```

### In Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "jsr": {
      "command": "deno",
      "args": [
        "run",
        "--allow-net",
        "--allow-env",
        "jsr:@wyattjoh/jsr-mcp"
      ],
      "env": {
        "JSR_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

### With Binary

Build and run as a standalone binary:

```bash
# Build the binary
deno compile --allow-net --allow-env --output=jsr-mcp jsr:@wyattjoh/jsr-mcp

# Run the binary
./jsr-mcp
```

### Programmatic Usage

```typescript
import { startServer } from "@wyattjoh/jsr-mcp";

// Start the MCP server
await startServer();
```

## Configuration

The server can be configured via environment variables:

- `JSR_API_TOKEN` - Authentication token for JSR API (optional)
- `JSR_API_URL` - Custom JSR API URL (default: https://api.jsr.io)
- `JSR_REGISTRY_URL` - Custom JSR registry URL (default: https://jsr.io)

## Available Tools

### Package Operations

- `jsr_search_packages` - Search for packages
- `jsr_get_package` - Get package details
- `jsr_get_package_version` - Get version details
- `jsr_list_package_versions` - List all versions
- `jsr_get_package_metadata` - Get package metadata
- `jsr_get_package_dependencies` - Get dependencies
- `jsr_get_package_score` - Get package score
- `jsr_get_package_dependents` - Get dependents
- `jsr_create_package` - Create new package
- `jsr_update_package` - Update package
- `jsr_delete_package` - Delete package

### Version Management

- `jsr_create_package_version` - Upload new version
- `jsr_update_package_version` - Update version (yank/unyank)

### Scope Management

- `jsr_get_scope` - Get scope details
- `jsr_list_scope_packages` - List packages in scope
- `jsr_create_scope` - Create new scope
- `jsr_update_scope` - Update scope settings
- `jsr_delete_scope` - Delete scope

### Member Management

- `jsr_list_scope_members` - List scope members
- `jsr_add_scope_member` - Invite member
- `jsr_update_scope_member` - Update member role
- `jsr_remove_scope_member` - Remove member
- `jsr_list_scope_invites` - List pending invites
- `jsr_accept_scope_invite` - Accept invite
- `jsr_decline_scope_invite` - Decline invite

### User Operations

- `jsr_get_current_user` - Get authenticated user
- `jsr_get_current_user_scopes` - Get user's scopes
- `jsr_get_user` - Get user details
- `jsr_get_user_scopes` - Get user's scopes

### Registry Operations

- `jsr_list_packages` - List all packages
- `jsr_get_stats` - Get registry statistics

### Authentication

- `jsr_create_authorization` - Start auth flow
- `jsr_get_authorization_details` - Get auth details
- `jsr_approve_authorization` - Approve auth
- `jsr_deny_authorization` - Deny auth
- `jsr_exchange_authorization` - Exchange for token

### Publishing

- `jsr_get_publishing_task` - Get publishing task status

## Permissions

The server requires the following Deno permissions:

- `--allow-net`: Network access to JSR API
- `--allow-env`: Environment variable access for configuration

## Requirements

- Deno 2.x or later
- Network access to JSR API
- JSR API token for authenticated operations (optional)

## License

MIT
