import {
  assertEquals,
  assertExists,
  assertRejects,
  assertStringIncludes,
} from "jsr:@std/assert@1.0.13";
import {
  createJSRConfig,
  getPackage,
  getPackageDependencies,
  getPackageDependents,
  getPackageMetadata,
  getPackageScore,
  getPackageVersion,
  getPublishingTask,
  getScope,
  getStats,
  getUser,
  getUserScopes,
  listPackages,
  listPackageVersions,
  listScopeMembers,
  listScopePackages,
  searchPackages,
  testConnection,
} from "../mod.ts";

const TEST_CONFIG = createJSRConfig(
  "https://api.jsr.io",
  "https://jsr.io",
);

Deno.test("createJSRConfig removes trailing slashes", () => {
  const config = createJSRConfig(
    "https://api.jsr.io/",
    "https://jsr.io/",
    "test-token",
  );
  assertEquals(config.apiUrl, "https://api.jsr.io");
  assertEquals(config.registryUrl, "https://jsr.io");
  assertEquals(config.apiToken, "test-token");
});

Deno.test("testConnection returns success for valid config", async () => {
  const result = await testConnection(TEST_CONFIG);
  assertEquals(result.success, true);
  assertEquals(result.error, undefined);
});

Deno.test("testConnection returns error for invalid config", async () => {
  const invalidConfig = createJSRConfig(
    "https://invalid-api-url.example.com",
    "https://invalid-registry-url.example.com",
  );
  const result = await testConnection(invalidConfig);
  assertEquals(result.success, false);
  assertExists(result.error);
});

Deno.test("searchPackages returns results", async () => {
  const results = await searchPackages(TEST_CONFIG, "std", 5, 1);
  assertExists(results);
  assertExists(results.items);
  assertExists(results.total);
  assertEquals(Array.isArray(results.items), true);
});

Deno.test("searchPackages with empty query", async () => {
  const results = await searchPackages(TEST_CONFIG, undefined, 5, 1);
  assertExists(results);
  assertExists(results.items);
  assertEquals(Array.isArray(results.items), true);
});

Deno.test("getPackage returns package details", async () => {
  const pkg = await getPackage(TEST_CONFIG, "std", "assert");
  assertExists(pkg);
  assertEquals(pkg.scope, "std");
  assertEquals(pkg.name, "assert");
  assertExists(pkg.description);
  assertExists(pkg.runtimeCompat);
});

Deno.test("getPackage throws for non-existent package", async () => {
  await assertRejects(
    async () => await getPackage(TEST_CONFIG, "nonexistent", "package"),
    Error,
    "JSR API request failed",
  );
});

Deno.test("getPackageVersion returns version details", async () => {
  // Get a known version directly
  const version = await getPackageVersion(
    TEST_CONFIG,
    "std",
    "assert",
    "1.0.0",
  );
  assertExists(version);
  assertEquals(version.version, "1.0.0");
  assertExists(version.createdAt);
  assertExists(version.updatedAt);
});

Deno.test("listPackageVersions returns paginated results", async () => {
  const results = await listPackageVersions(TEST_CONFIG, "std", "assert", 5, 1);
  assertExists(results);
  assertExists(results.data);
  assertExists(results.total);
  assertExists(results.returned);
  assertEquals(Array.isArray(results.data), true);
  assertEquals(results.returned, results.data.length);
});

Deno.test("getScope returns scope details", async () => {
  const scope = await getScope(TEST_CONFIG, "std");
  assertExists(scope);
  assertEquals(scope.scope, "std");
  assertExists(scope.createdAt);
  assertExists(scope.updatedAt);
});

Deno.test("listScopePackages returns packages in scope", async () => {
  const results = await listScopePackages(TEST_CONFIG, "std", 5, 0);
  assertExists(results);
  assertExists(results.data);
  assertEquals(Array.isArray(results.data), true);
  assertExists(results.total);
  assertEquals(results.skip, 0);
});

Deno.test("getPackageMetadata returns metadata from registry", async () => {
  const metadata = await getPackageMetadata(TEST_CONFIG, "std", "assert");
  assertExists(metadata);
  assertEquals(metadata.scope, "std");
  assertEquals(metadata.name, "assert");
  assertExists(metadata.latest);
  assertExists(metadata.versions);
});

Deno.test("listPackages returns all packages", async () => {
  const results = await listPackages(TEST_CONFIG, 10, 1);
  assertExists(results);
  assertExists(results.items);
  assertEquals(Array.isArray(results.items), true);
  assertExists(results.total);
});

Deno.test("getPackageDependents returns dependent packages", async () => {
  const results = await getPackageDependents(
    TEST_CONFIG,
    "std",
    "assert",
    5,
    1,
    2,
  );
  assertExists(results);
  assertExists(results.data);
  assertEquals(Array.isArray(results.data), true);
  assertExists(results.total);
});

Deno.test("getPackageScore returns package score", async () => {
  const score = await getPackageScore(TEST_CONFIG, "std", "assert");
  assertExists(score);
  assertExists(score.total);
  assertExists(score.percentageDocumentedSymbols);
  assertExists(score.hasReadme);
  assertExists(score.hasReadmeExamples);
  assertExists(score.hasDescription);
  assertExists(score.hasProvenance);
  assertExists(score.allEntrypointsDocs);
  assertExists(score.allFastCheck);
  assertExists(score.atLeastOneRuntimeCompatible);
  assertExists(score.multipleRuntimesCompatible);
});

Deno.test("getPackageDependencies returns dependencies", async () => {
  const versions = await listPackageVersions(TEST_CONFIG, "std", "path", 1);
  if (versions.data.length > 0) {
    const firstVersion = versions.data[0];
    const deps = await getPackageDependencies(
      TEST_CONFIG,
      "std",
      "path",
      firstVersion.version,
    );
    assertExists(deps);
    assertEquals(Array.isArray(deps), true);
  }
});

Deno.test("getUser returns user details", async () => {
  const userScopes = await listScopeMembers(TEST_CONFIG, "std");
  if (userScopes.length > 0) {
    const firstMember = userScopes[0];
    const user = await getUser(TEST_CONFIG, firstMember.user.id);
    assertExists(user);
    assertEquals(user.id, firstMember.user.id);
    assertExists(user.name);
    assertExists(user.avatarUrl);
  }
});

Deno.test("getUserScopes returns user's scopes", async () => {
  const scopeMembers = await listScopeMembers(TEST_CONFIG, "std");
  if (scopeMembers.length > 0) {
    const firstMember = scopeMembers[0];
    const scopes = await getUserScopes(TEST_CONFIG, firstMember.user.id);
    assertExists(scopes);
    assertEquals(Array.isArray(scopes), true);
  }
});

Deno.test("listScopeMembers returns scope members", async () => {
  const members = await listScopeMembers(TEST_CONFIG, "std");
  assertExists(members);
  assertEquals(Array.isArray(members), true);
  if (members.length > 0) {
    assertExists(members[0].user);
    assertExists(members[0].user.id);
    assertExists(members[0].user.name);
  }
});

// Note: listScopeInvites requires authentication, so we can't test it without credentials

Deno.test("getPublishingTask throws for non-existent task", async () => {
  await assertRejects(
    async () =>
      await getPublishingTask(
        TEST_CONFIG,
        "00000000-0000-0000-0000-000000000000",
      ),
    Error,
    "JSR API request failed",
  );
});

Deno.test("getStats returns registry statistics", async () => {
  const stats = await getStats(TEST_CONFIG);
  assertExists(stats);
  assertExists(stats.newest);
  assertExists(stats.updated);
  assertExists(stats.featured);
  assertEquals(Array.isArray(stats.newest), true);
  assertEquals(Array.isArray(stats.updated), true);
  assertEquals(Array.isArray(stats.featured), true);
});

Deno.test("API errors include status and message", async () => {
  try {
    await getPackage(TEST_CONFIG, "nonexistent", "package");
  } catch (error) {
    assertExists(error);
    if (error instanceof Error) {
      assertStringIncludes(error.message, "JSR API request failed");
      assertStringIncludes(error.message, "404");
    }
  }
});

Deno.test("searchPackages respects pagination", async () => {
  const page1 = await searchPackages(TEST_CONFIG, "test", 5, 1);
  const page2 = await searchPackages(TEST_CONFIG, "test", 5, 2);

  assertExists(page1.items);
  assertExists(page2.items);

  if (page1.items.length > 0 && page2.items.length > 0) {
    const page1Ids = page1.items.map((p) => `${p.scope}/${p.name}`);
    const page2Ids = page2.items.map((p) => `${p.scope}/${p.name}`);
    const intersection = page1Ids.filter((id) => page2Ids.includes(id));
    assertEquals(intersection.length, 0);
  }
});
