# JSR MCP

A Model Context Protocol (MCP) server that provides AI assistants with tools to interact with the JSR (JavaScript Registry) through natural language interactions.

## Features

- **Package Discovery**: Search and list packages in the JSR registry
- **Package Information**: Get detailed information about packages and their versions
- **Package Analysis**: View package scores, dependencies, and dependents
- **Package Management**: Create, update, and delete packages (with authentication)
- **Version Publishing**: Create and manage package versions with tarball uploads
- **Scope Management**: Create, configure, and manage scopes and their packages
- **Member Management**: Invite, update, and remove scope members
- **User Management**: Access user information and scope memberships
- **Authorization Flow**: Complete OAuth-style authorization workflows
- **Registry Statistics**: Get insights about newest and featured packages
- **Registry Metadata**: Access package metadata directly from the registry
- **Full API Coverage**: Implements all endpoints from the JSR API specification
- **Optional Authentication**: Support for both public and authenticated operations
- **Type-Safe**: Built with TypeScript for reliable operations

## Installation

### JSR (Recommended)

Add to your MCP servers configuration using the JSR package:

```json
{
  "mcpServers": {
    "jsr": {
      "command": "deno",
      "args": ["run", "--allow-all", "jsr:@wyattjoh/jsr-mcp"],
      "env": {
        "JSR_API_TOKEN": "your-jsr-api-token"
      }
    }
  }
}
```

### Direct from GitHub

```json
{
  "mcpServers": {
    "jsr": {
      "command": "deno",
      "args": [
        "run",
        "--allow-all",
        "https://raw.githubusercontent.com/wyattjoh/jsr-mcp/main/src/index.ts"
      ],
      "env": {
        "JSR_API_TOKEN": "your-jsr-api-token"
      }
    }
  }
}
```

## Quick Start

1. **Basic Setup** (no authentication required):

```json
{
  "mcpServers": {
    "jsr": {
      "command": "deno",
      "args": ["run", "--allow-all", "jsr:@wyattjoh/jsr-mcp"]
    }
  }
}
```

2. **With Authentication** (for private packages or higher rate limits):

```json
{
  "mcpServers": {
    "jsr": {
      "command": "deno",
      "args": ["run", "--allow-all", "jsr:@wyattjoh/jsr-mcp"],
      "env": {
        "JSR_API_TOKEN": "your-jsr-api-token"
      }
    }
  }
}
```

## Configuration

The server supports the following environment variables:

- `JSR_API_TOKEN` (optional): Your JSR API token for authenticated requests. Get one from [https://jsr.io/account/tokens](https://jsr.io/account/tokens)
- `JSR_API_URL` (optional): Custom JSR API URL (defaults to `https://api.jsr.io`)
- `JSR_REGISTRY_URL` (optional): Custom JSR Registry URL (defaults to `https://jsr.io`)

## Available Tools

### Package Discovery

- `jsr_search_packages`: Search for packages in the JSR registry
  - `query` (optional): Search query
  - `limit` (optional): Maximum number of results
  - `skip` (optional): Number of results to skip for pagination

- `jsr_list_packages`: List all packages in the JSR registry
  - `limit` (optional): Maximum number of results (1-100)
  - `page` (optional): Page number for pagination
  - `query` (optional): Optional search query

### Package Information

- `jsr_get_package`: Get detailed information about a specific package
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name

- `jsr_get_package_metadata`: Get package metadata from the registry
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name

- `jsr_get_package_score`: Get the package score details
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name

### Package Dependencies

- `jsr_get_package_dependencies`: Get dependencies of a specific package version
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name
  - `version` (required): The semantic version

- `jsr_get_package_dependents`: Get packages that depend on a specific package
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name
  - `limit` (optional): Maximum number of results (1-100)
  - `page` (optional): Page number for pagination
  - `versionsPerPackageLimit` (optional): Maximum versions per package (1-10)

### Version Management

- `jsr_get_package_version`: Get information about a specific package version
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name
  - `version` (required): The semantic version

- `jsr_list_package_versions`: List all versions of a package
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name
  - `limit` (optional): Maximum number of results
  - `page` (optional): Page number for pagination

### Scope Management

- `jsr_get_scope`: Get information about a scope
  - `scope` (required): The scope name (without @ prefix)

- `jsr_list_scope_packages`: List all packages in a scope
  - `scope` (required): The scope name (without @ prefix)
  - `limit` (optional): Maximum number of results
  - `skip` (optional): Number of results to skip for pagination

- `jsr_list_scope_members`: List members of a specific scope
  - `scope` (required): The scope name (without @ prefix)

- `jsr_list_scope_invites`: List pending invites for a specific scope (requires authentication)
  - `scope` (required): The scope name (without @ prefix)

### User Information

- `jsr_get_current_user`: Get details of the authenticated user (requires authentication)

- `jsr_get_current_user_scopes`: List scopes that the authenticated user is a member of (requires authentication)

- `jsr_get_current_user_scope_member`: Get details of the authenticated user's membership in a specific scope (requires authentication)
  - `scope` (required): The scope name (without @ prefix)

- `jsr_get_current_user_invites`: List scope invites for the authenticated user (requires authentication)

- `jsr_get_user`: Get details of a specific user
  - `id` (required): The user ID (UUID)

- `jsr_get_user_scopes`: List scopes that a specific user is a member of
  - `id` (required): The user ID (UUID)

### Registry Information

- `jsr_get_stats`: Get registry statistics including newest packages, recent updates, and featured packages

- `jsr_get_publishing_task`: Get details of a publishing task
  - `id` (required): The publishing task ID (UUID)

### Scope Operations (Requires Authentication)

- `jsr_create_scope`: Create a new scope
  - `scope` (required): The scope name (without @ prefix)
  - `description` (optional): Scope description

- `jsr_update_scope`: Update scope settings (requires scope admin)
  - `scope` (required): The scope name (without @ prefix)
  - `ghActionsVerifyActor` (optional): Whether to verify GitHub Actions actor
  - `requirePublishingFromCI` (optional): Whether to require publishing from CI

- `jsr_delete_scope`: Delete a scope (requires scope admin, scope must have no packages)
  - `scope` (required): The scope name (without @ prefix)

- `jsr_add_scope_member`: Invite a user to a scope (requires scope admin)
  - `scope` (required): The scope name (without @ prefix)
  - `githubLogin` (required): GitHub username to invite

- `jsr_update_scope_member`: Update scope member roles (requires scope admin)
  - `scope` (required): The scope name (without @ prefix)
  - `userId` (required): The user ID (UUID)
  - `isAdmin` (required): Whether the user should be an admin

- `jsr_remove_scope_member`: Remove a member from a scope (requires scope admin)
  - `scope` (required): The scope name (without @ prefix)
  - `userId` (required): The user ID (UUID)

- `jsr_delete_scope_invite`: Delete a scope invite (requires scope admin)
  - `scope` (required): The scope name (without @ prefix)
  - `userId` (required): The user ID (UUID)

- `jsr_accept_scope_invite`: Accept an invite to a scope
  - `scope` (required): The scope name (without @ prefix)

- `jsr_decline_scope_invite`: Decline an invite to a scope
  - `scope` (required): The scope name (without @ prefix)

### Package Operations (Requires Authentication)

- `jsr_create_package`: Create a new package (requires scope membership)
  - `scope` (required): The scope name (without @ prefix)
  - `package` (required): The package name

- `jsr_update_package`: Update package details (requires scope membership)
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name
  - `description` (optional): Package description (max 250 chars)
  - `githubRepository` (optional): GitHub repository info {owner, repo}
  - `runtimeCompat` (optional): Runtime compatibility flags
  - `isArchived` (optional): Whether the package is archived

- `jsr_delete_package`: Delete a package (requires scope admin, package must have no versions)
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name

### Package Version Operations (Requires Authentication)

- `jsr_create_package_version`: Create a new package version (requires scope membership)
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name
  - `version` (required): The semantic version
  - `configPath` (required): Path to config file within tarball
  - `tarballPath` (required): Path to gzipped tarball file

- `jsr_update_package_version`: Update package version yanked status (requires scope membership)
  - `scope` (required): The scope name (without @ prefix)
  - `name` (required): The package name
  - `version` (required): The semantic version
  - `yanked` (required): Whether the version should be yanked

### Authorization Operations

- `jsr_create_authorization`: Start an authorization flow
  - `challenge` (required): The challenge for later token retrieval
  - `permissions` (optional): Array of permissions for the token

- `jsr_get_authorization_details`: Get details of an authorization
  - `code` (required): The authorization code

- `jsr_approve_authorization`: Approve an authorization (requires authentication)
  - `code` (required): The authorization code

- `jsr_deny_authorization`: Deny an authorization (requires authentication)
  - `code` (required): The authorization code

- `jsr_exchange_authorization`: Exchange authorization code for access token
  - `exchangeToken` (required): The exchange token
  - `verifier` (required): The verifier for the challenge

## Example Usage

Once configured, you can interact with JSR through your AI assistant:

### Basic Package Operations
- "Search for packages related to testing"
- "Show me information about the @std/testing package"
- "List all versions of @oak/oak"
- "What packages are in the @std scope?"
- "Get details about version 1.0.0 of @luca/flag"

### Package Analysis
- "What's the quality score of @std/fs?"
- "Show me packages that depend on @oak/oak"
- "What dependencies does @std/http version 1.0.0 have?"
- "List all packages in the registry"

### User and Scope Information
- "Who are the members of the @std scope?"
- "Show me the user with ID abc123..."
- "What scopes is user xyz789... a member of?"

### Registry Statistics
- "Show me the newest packages on JSR"
- "What are the featured packages?"
- "Get the latest registry statistics"

### Package and Scope Management (Requires Authentication)
- "Create a new scope called @mycompany"
- "Create a new package called utils in the @mycompany scope"
- "Update the description of @mycompany/utils package"
- "Invite user123 to be a member of @mycompany scope"
- "Publish version 1.0.0 of @mycompany/utils from ./dist/package.tar.gz"
- "Yank version 0.9.0 of @mycompany/utils"

## Development

### Requirements

- [Deno](https://deno.land/) 1.37+

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/wyattjoh/jsr-mcp.git
cd jsr-mcp
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Edit `.env` with your configuration (optional)

4. Run the development server:

```bash
deno task dev
```

### Testing

Run the test suite:

```bash
deno task test
```

### Building

Build the compiled binary:

```bash
deno task build
```

## License

MIT

