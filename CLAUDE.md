# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides tools for interacting with the JSR (JavaScript Registry) API. It's built with Deno and TypeScript, using the MCP SDK to expose JSR functionality to AI assistants.

## Development Commands

- **Run development server**: `deno task dev` (watches for changes)
- **Run production server**: `deno task start`
- **Type checking**: `deno task check`
- **Formatting**: `deno task fmt`
- **Linting**: `deno task lint`
- **Build binary**: `deno task build`
- **Run tests**: `deno task test`

## Architecture

The codebase follows a modular architecture:

- **Entry point**: `src/index.ts` - Sets up the MCP server, handles stdio transport, and routes tool requests
- **JSR client**: `src/clients/jsr.ts` - Handles all HTTP communication with JSR API and Registry endpoints
- **Tool definitions**: `src/tools/jsr-tools.ts` - Defines available MCP tools and handles tool execution
- **Type definitions**:
  - `src/types/jsr.ts` - JSR API response types and validation schemas
  - `src/types/mcp.ts` - MCP-specific types

The server uses environment variables for configuration (JSR_API_TOKEN, JSR_API_URL, JSR_REGISTRY_URL) and implements error handling at multiple levels.

## Key Design Patterns

- All JSR API interactions go through the `JSRConfig` interface created by `createJSRConfig()`
- Tool handlers use Zod schemas for input validation before processing
- API responses are wrapped in a consistent format with proper error handling
- The server tests JSR connectivity on startup but continues running even if the connection fails
