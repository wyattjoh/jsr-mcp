# JSR MCP

A Deno monorepo containing packages for JSR (JavaScript Registry) access:

- **[@wyattjoh/jsr](packages/jsr)** - Core library for JSR API access
- **[@wyattjoh/jsr-mcp](packages/jsr-mcp)** - Model Context Protocol (MCP) server for LLM integration

## Features

- Search packages across the JSR registry
- Get package details, versions, and dependencies
- Manage scopes and package publishing
- Handle member invitations and permissions
- Access registry statistics and metadata
- Full authentication support for write operations

## Requirements

- Deno 2.x or later
- Network access to JSR API
- JSR API token for authenticated operations (optional)

## Packages

### @wyattjoh/jsr

Core library for accessing JSR API:

```bash
deno add @wyattjoh/jsr
```

```typescript
import { getPackage, searchPackages } from "@wyattjoh/jsr";

const results = await searchPackages({ query: "react" });
const pkg = await getPackage("deno", "std");
```

[See full documentation](packages/jsr/README.md)

### @wyattjoh/jsr-mcp

MCP server for LLM integration:

```bash
# Run directly from JSR
deno run --allow-net --allow-env jsr:@wyattjoh/jsr-mcp

# Or install globally
deno install --global --allow-net --allow-env -n jsr-mcp jsr:@wyattjoh/jsr-mcp
```

For Claude Desktop app integration, add this to your `claude_desktop_config.json`:

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

### Option 2: From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   deno cache packages/*/mod.ts
   ```
3. Run the server:
   ```bash
   deno run --allow-net --allow-env packages/jsr-mcp/mod.ts
   ```

### Available Tools

The MCP server provides 40+ tools for comprehensive JSR access:

#### Package Operations

- **jsr_search_packages** - Search for packages
- **jsr_get_package** - Get package details
- **jsr_get_package_version** - Get specific version details
- **jsr_list_package_versions** - List all versions
- **jsr_get_package_metadata** - Get package metadata
- **jsr_get_package_dependencies** - Get dependencies
- **jsr_get_package_score** - Get package quality score
- **jsr_get_package_dependents** - Find dependent packages

#### Scope Management

- **jsr_get_scope** - Get scope details
- **jsr_list_scope_packages** - List packages in a scope
- **jsr_create_scope** - Create new scope (requires auth)
- **jsr_update_scope** - Update scope settings (requires auth)
- **jsr_delete_scope** - Delete scope (requires auth)

#### Member Management

- **jsr_list_scope_members** - List scope members
- **jsr_add_scope_member** - Invite member (requires auth)
- **jsr_update_scope_member** - Update member role (requires auth)
- **jsr_remove_scope_member** - Remove member (requires auth)

#### User Operations

- **jsr_get_current_user** - Get authenticated user
- **jsr_get_user** - Get user details
- **jsr_list_packages** - List all registry packages
- **jsr_get_stats** - Get registry statistics

### Example Usage

```javascript
// Search for packages
jsr_search_packages({ query: "react", limit: 10 });

// Get package details
jsr_get_package({ scope: "deno", name: "std" });

// List versions with pagination
jsr_list_package_versions({
  scope: "deno",
  name: "std",
  limit: 20,
  page: 1,
});

// Get dependencies for a specific version
jsr_get_package_dependencies({
  scope: "deno",
  name: "std",
  version: "1.0.0",
});

// Create a new scope (requires authentication)
jsr_create_scope({
  scope: "my-org",
  description: "My organization's packages",
});
```

## Security Notes

- Read operations do not require authentication
- Write operations require a valid JSR API token
- The server only accesses the JSR API endpoints
- No local file system access beyond reading environment variables

## Development

This is a Deno workspace monorepo. All commands run from the root affect all packages.

```bash
# Clone the repository
git clone https://github.com/wyattjoh/jsr-mcp.git
cd jsr-mcp

# Cache dependencies
deno cache packages/*/mod.ts

# Format all code
deno fmt

# Lint all packages
deno lint

# Type check all packages
deno check packages/jsr/mod.ts packages/jsr-mcp/mod.ts

# Run tests
deno test --allow-net packages/

# Run MCP server locally (with watch mode)
deno run --allow-read --allow-write --allow-env --allow-run --allow-net --watch packages/jsr-mcp/mod.ts

# Run MCP server in production
deno run --allow-read --allow-write --allow-env --allow-run --allow-net packages/jsr-mcp/mod.ts

# Build binary
cd packages/jsr-mcp
deno compile --allow-read --allow-write --allow-env --allow-run --allow-net --output=jsr-mcp mod.ts

# Publish packages (CI/CD)
deno publish
```

### Working on Individual Packages

```bash
# Work on @wyattjoh/jsr
cd packages/jsr
deno test --allow-net

# Work on @wyattjoh/jsr-mcp
cd packages/jsr-mcp
deno run --allow-net --allow-env mod.ts
```

## License

MIT
