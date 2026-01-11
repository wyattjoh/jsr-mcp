import { assertEquals } from "jsr:@std/assert@1.0.13";
import { createJSRConfig } from "@wyattjoh/jsr";

// Since the server uses inline tool definitions, we'll test the server creation
// and basic functionality

Deno.test("JSR config creation works correctly", () => {
  const config = createJSRConfig(
    "https://api.jsr.io/",
    "https://jsr.io/",
    "test-token",
  );

  assertEquals(config.apiUrl, "https://api.jsr.io");
  assertEquals(config.registryUrl, "https://jsr.io");
  assertEquals(config.apiToken, "test-token");
});

// Additional integration tests would require a full server setup
// These would be better as integration tests that actually start the server
// and test the MCP protocol communication
