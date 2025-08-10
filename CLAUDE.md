# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Deno workspace containing two packages:

1. **@wyattjoh/jsr** - A TypeScript client library for the JSR (JavaScript Registry) API
2. **@wyattjoh/jsr-mcp** - A Model Context Protocol (MCP) server that exposes JSR functionality to AI assistants

The workspace structure follows Deno best practices with separate packages that can be independently published to JSR.

## Workspace Structure

```
/
├── deno.json                 # Workspace configuration
├── packages/
│   ├── jsr/                  # JSR client library package
│   │   ├── deno.json        # Package configuration
│   │   ├── mod.ts           # Main exports
│   │   ├── src/
│   │   │   ├── client.ts    # JSR API client implementation
│   │   │   └── types.ts     # TypeScript types and Zod schemas
│   │   └── tests/
│   │       └── client.test.ts
│   └── jsr-mcp/             # MCP server package
│       ├── deno.json        # Package configuration
│       ├── mod.ts           # Main entry point
│       ├── src/
│       │   └── index.ts     # MCP server implementation with inline tool definitions
│       └── tests/
│           └── server.test.ts
```

## Development Commands

**Workspace-level commands** (run from root):

- **Format all code**: `deno fmt`
- **Lint all code**: `deno lint`
- **Type check all code**: `deno check packages/jsr/mod.ts packages/jsr-mcp/mod.ts`
- **Run all tests**: `deno test --allow-net packages/`
- **Run a single test file**: `deno test --allow-net packages/jsr/tests/client.test.ts`
- **Run development server**: `deno run --allow-read --allow-write --allow-env --allow-run --allow-net --watch packages/jsr-mcp/mod.ts`
- **Run production server**: `deno run --allow-read --allow-write --allow-env --allow-run --allow-net packages/jsr-mcp/mod.ts`
- **Build MCP server binary**: `cd packages/jsr-mcp && deno compile --allow-read --allow-write --allow-env --allow-run --allow-net --output=jsr-mcp mod.ts`

**Git hooks** (managed via deno-task-hooks):

- **Install hooks**: `deno task hooks:install`
- **Pre-commit**: Runs `deno check`, `deno fmt --check`, and `deno lint`
- **Pre-push**: Runs `deno publish --dry-run --allow-dirty`

## Architecture

### JSR Client Package (`packages/jsr/`)

- **Purpose**: Reusable TypeScript client for the JSR API
- **Main exports**: `mod.ts` exports all client functions and types
- **Dependencies**: Only `zod` for schema validation
- **Can be used independently** of the MCP server
- **Testing**: Uses `jsr:@std/assert` for assertions

### MCP Server Package (`packages/jsr-mcp/`)

- **Purpose**: MCP server that exposes JSR functionality to AI assistants
- **Dependencies**:
  - Local: `@wyattjoh/jsr` (the client package, imported via relative path)
  - External: `@modelcontextprotocol/sdk`, `@std/dotenv`, `zod`
- **Pattern**: Uses inline `server.tool()` calls for MCP tool definitions
- **Configuration**: Via environment variables (JSR_API_URL, JSR_REGISTRY_URL, JSR_API_TOKEN)

## Key Design Patterns

- **Workspace imports**: The MCP server imports the JSR client using a relative path configured in workspace root
- **Type safety**: All API interactions use Zod schemas for validation
- **Error handling**: Consistent error wrapping and reporting
- **Testing**: Each package has its own test suite using Deno's built-in test runner
- **MCP tools**: Defined inline using `server.tool()` with Zod schemas that mirror the JSR client types

## Repository Management

- Always run `deno fmt`, `deno lint`, and `deno check packages/jsr/mod.ts packages/jsr-mcp/mod.ts` after modifying code
- Run `deno test --allow-net packages/` to verify all tests pass
- When updating tool definitions in the MCP server, ensure schemas match the JSR client types
- The JSR client package can be published independently to JSR for reuse in other projects

## Publishing

Each package can be published separately to JSR:

- `packages/jsr/` as `@wyattjoh/jsr`
- `packages/jsr-mcp/` as `@wyattjoh/jsr-mcp`

Both packages include their own LICENSE file and are configured for JSR publishing via `deno publish`.
