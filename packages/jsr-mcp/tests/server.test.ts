import { assertEquals, assertExists } from "jsr:@std/assert";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJSRConfig } from "@wyattjoh/jsr";

// Since the server uses inline tool definitions, we'll test the server creation
// and basic functionality

Deno.test("Server can be created with valid config", () => {
  const _config = createJSRConfig(
    "https://api.jsr.io",
    "https://jsr.io",
  );

  // Test that server creation doesn't throw
  const server = new McpServer({
    name: "jsr-mcp-test",
    version: "0.0.1",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  assertExists(server);
  assertEquals(typeof server.tool, "function");
});

Deno.test("JSR config creation works correctly", () => {
  const _config = createJSRConfig(
    "https://api.jsr.io/",
    "https://jsr.io/",
    "test-token",
  );

  assertEquals(_config.apiUrl, "https://api.jsr.io");
  assertEquals(_config.registryUrl, "https://jsr.io");
  assertEquals(_config.apiToken, "test-token");
});

// Additional integration tests would require a full server setup
// These would be better as integration tests that actually start the server
// and test the MCP protocol communication
