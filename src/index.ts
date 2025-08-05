#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-net

import "@std/dotenv/load";
import process from "node:process";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import deno from "../deno.json" with { type: "json" };
import {
  createJSRConfig,
  testConnection as testJSRConnection,
} from "./clients/jsr.ts";
import type { JSRConfig } from "./clients/jsr.ts";
import { createJSRTools, handleJSRTool } from "./tools/jsr-tools.ts";

interface ServerState {
  server: Server;
  jsrConfig: JSRConfig;
}

function createServer(): ServerState {
  const server = new Server(
    {
      name: "jsr-mcp",
      version: deno.version,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const state: ServerState = {
    server,
    jsrConfig: loadConfig(),
  };

  setupHandlers(state);
  return state;
}

function loadConfig(): JSRConfig {
  const apiUrl = Deno.env.get("JSR_API_URL") || "https://api.jsr.io";
  const registryUrl = Deno.env.get("JSR_REGISTRY_URL") || "https://jsr.io";
  const apiToken = Deno.env.get("JSR_API_TOKEN");

  return createJSRConfig(apiUrl, registryUrl, apiToken);
}

function setupHandlers(state: ServerState): void {
  state.server.setRequestHandler(ListToolsRequestSchema, () => {
    return { tools: createJSRTools() };
  });

  state.server.setRequestHandler(
    CallToolRequestSchema,
    async (
      request,
    ): Promise<{ content: Array<{ type: string; text: string }> }> => {
      const { name, arguments: args } = request.params;

      try {
        if (name.startsWith("jsr_")) {
          return await handleJSRTool(name, args, state.jsrConfig);
        }

        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },
  );

  // Error handling
  state.server.onerror = (error) => {
    console.error("[MCP Error]", error);
  };

  process.on("SIGINT", async () => {
    await state.server.close();
  });
}

async function runServer(state: ServerState): Promise<void> {
  // Test connection before starting
  try {
    const result = await testJSRConnection(state.jsrConfig);
    if (result.success) {
      console.error("[INFO] Successfully connected to JSR API");
    } else {
      console.error("[WARNING] Failed to connect to JSR API:", result.error);
    }
  } catch (error) {
    console.error(
      "[WARNING] JSR connection test failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  const transport = new StdioServerTransport();
  await state.server.connect(transport);
  console.error("[INFO] JSR MCP Server running on stdio");
}

async function main(): Promise<void> {
  try {
    const serverState = createServer();
    await runServer(serverState);
  } catch (error) {
    console.error(
      "[FATAL]",
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
