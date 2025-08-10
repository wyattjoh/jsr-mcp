#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-net

/**
 * JSR MCP Server
 *
 * A Model Context Protocol (MCP) server that provides access to the JSR (JavaScript Registry) API.
 * This server allows AI assistants to search, browse, and manage JavaScript packages in the JSR registry.
 *
 * @module
 */

// Re-export the main MCP server entry point
export * from "./src/index.ts";

// For direct execution
if (import.meta.main) {
  await import("./src/index.ts");
}
