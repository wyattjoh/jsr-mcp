import { load } from "@std/dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as jsrClient from "@wyattjoh/jsr";
import type { JSRConfig } from "@wyattjoh/jsr";
import deno from "../deno.json" with { type: "json" };

// Tool schemas
const SearchPackagesSchema = z.object({
  query: z.string().optional().describe("Search query for packages"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  skip: z.number().optional().describe(
    "Number of results to skip (for pagination)",
  ),
});

const GetPackageSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
});

const GetPackageVersionSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
  version: z.string().describe("The semantic version"),
});

const ListPackageVersionsSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  page: z.number().optional().describe("Page number (1-indexed)"),
});

const GetScopeSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
});

const ListScopePackagesSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  skip: z.number().optional().describe(
    "Number of results to skip (for pagination)",
  ),
});

const GetPackageMetadataSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
});

const ListPackagesSchema = z.object({
  limit: z.number().min(1).max(100).optional().describe(
    "Maximum number of results to return (1-100)",
  ),
  page: z.number().min(1).optional().describe("Page number (1-indexed)"),
  query: z.string().optional().describe("Optional search query"),
});

const GetPackageDependentsSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
  limit: z.number().min(1).max(100).optional().describe(
    "Maximum number of results to return (1-100)",
  ),
  page: z.number().min(1).optional().describe("Page number (1-indexed)"),
  versionsPerPackageLimit: z.number().min(1).max(10).optional().describe(
    "Maximum number of versions per package (1-10)",
  ),
});

const GetPackageScoreSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
});

const GetPackageDependenciesSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
  version: z.string().describe("The semantic version"),
});

const GetUserSchema = z.object({
  id: z.string().describe("The user ID (UUID)"),
});

const GetUserScopesSchema = z.object({
  id: z.string().describe("The user ID (UUID)"),
});

const ListScopeMembersSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
});

const ListScopeInvitesSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
});

const GetPublishingTaskSchema = z.object({
  id: z.string().describe("The publishing task ID (UUID)"),
});

const GetCurrentUserScopeMemberSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
});

// Mutation schemas
const CreateScopeSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  description: z.string().optional().describe(
    "Optional description for the scope",
  ),
});

const UpdateScopeSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  ghActionsVerifyActor: z.boolean().optional().describe(
    "Whether to verify GitHub Actions actor",
  ),
  requirePublishingFromCI: z.boolean().optional().describe(
    "Whether to require publishing from CI",
  ),
});

const DeleteScopeSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
});

const AddScopeMemberSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  githubLogin: z.string().describe("GitHub username of the user to invite"),
});

const UpdateScopeMemberSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  userId: z.string().describe("The user ID (UUID)"),
  isAdmin: z.boolean().describe("Whether the user should be an admin"),
});

const RemoveScopeMemberSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  userId: z.string().describe("The user ID (UUID)"),
});

const DeleteScopeInviteSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  userId: z.string().describe("The user ID (UUID)"),
});

const CreatePackageSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  package: z.string().describe("The package name"),
});

const UpdatePackageSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
  description: z.string().max(250).optional().describe(
    "Package description (max 250 chars)",
  ),
  githubRepository: z.object({
    owner: z.string().describe("GitHub repository owner"),
    name: z.string().describe("GitHub repository name"),
  }).nullable().optional().describe("GitHub repository information"),
  runtimeCompat: z.object({
    deno: z.boolean().nullable().optional(),
    node: z.boolean().nullable().optional(),
    bun: z.boolean().nullable().optional(),
    browser: z.boolean().nullable().optional(),
    workerd: z.boolean().nullable().optional(),
  }).optional().describe("Runtime compatibility information"),
  isArchived: z.boolean().optional().describe(
    "Whether the package is archived",
  ),
});

const DeletePackageSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
});

const CreatePackageVersionSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
  version: z.string().describe("The semantic version"),
  configPath: z.string().describe("Path to the config file within the tarball"),
  tarballPath: z.string().describe(
    "Path to the gzipped tarball file to upload",
  ),
});

const UpdatePackageVersionSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
  name: z.string().describe("The package name"),
  version: z.string().describe("The semantic version"),
  yanked: z.boolean().describe("Whether the version should be yanked"),
});

const AcceptScopeInviteSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
});

const DeclineScopeInviteSchema = z.object({
  scope: z.string().describe("The scope name (without @ prefix)"),
});

const CreateAuthorizationSchema = z.object({
  challenge: z.string().describe("The challenge for later token retrieval"),
  permissions: z.array(z.union([
    z.object({
      permission: z.literal("package/publish"),
      scope: z.string(),
    }),
    z.object({
      permission: z.literal("package/publish"),
      scope: z.string(),
      package: z.string(),
    }),
    z.object({
      permission: z.literal("package/publish"),
      scope: z.string(),
      package: z.string(),
      version: z.string(),
      tarballHash: z.string(),
    }),
  ])).optional().describe("Optional permissions for the token"),
});

const GetAuthorizationDetailsSchema = z.object({
  code: z.string().describe("The authorization code"),
});

const ApproveAuthorizationSchema = z.object({
  code: z.string().describe("The authorization code"),
});

const DenyAuthorizationSchema = z.object({
  code: z.string().describe("The authorization code"),
});

const ExchangeAuthorizationSchema = z.object({
  exchangeToken: z.string().describe("The exchange token"),
  verifier: z.string().describe("The verifier for the challenge"),
});

const createServer = (config: JSRConfig) => {
  const server = new McpServer({
    name: "jsr-mcp",
    version: deno.version,
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Search and browse tools
  server.tool(
    "jsr_search_packages",
    "Search for packages in the JSR registry. Returns a list of packages matching the query.",
    SearchPackagesSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.searchPackages(
          config,
          args.query,
          args.limit,
          args.skip
            ? Math.floor(args.skip / (args.limit || 20)) + 1
            : undefined,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_package",
    "Get detailed information about a specific package in the JSR registry.",
    GetPackageSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getPackage(
          config,
          args.scope,
          args.name,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_package_version",
    "Get detailed information about a specific version of a package.",
    GetPackageVersionSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getPackageVersion(
          config,
          args.scope,
          args.name,
          args.version,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_list_package_versions",
    "List all available versions of a specific package.",
    ListPackageVersionsSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.listPackageVersions(
          config,
          args.scope,
          args.name,
          args.limit,
          args.page,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_scope",
    "Get detailed information about a scope in the JSR registry.",
    GetScopeSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getScope(config, args.scope);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_list_scope_packages",
    "List all packages within a specific scope.",
    ListScopePackagesSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.listScopePackages(
          config,
          args.scope,
          args.limit,
          args.skip,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_package_metadata",
    "Get package metadata from the JSR registry (versions, latest version, etc.).",
    GetPackageMetadataSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getPackageMetadata(
          config,
          args.scope,
          args.name,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_list_packages",
    "List all packages in the JSR registry.",
    ListPackagesSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.listPackages(
          config,
          args.limit,
          args.page,
          args.query,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_package_dependents",
    "Get packages that depend on a specific package.",
    GetPackageDependentsSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getPackageDependents(
          config,
          args.scope,
          args.name,
          args.limit,
          args.page,
          args.versionsPerPackageLimit,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_package_score",
    "Get the package score details for a specific package.",
    GetPackageScoreSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getPackageScore(
          config,
          args.scope,
          args.name,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_package_dependencies",
    "Get the dependencies of a specific package version.",
    GetPackageDependenciesSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getPackageDependencies(
          config,
          args.scope,
          args.name,
          args.version,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  // User and authentication tools
  server.tool(
    "jsr_get_current_user",
    "Get details of the authenticated user.",
    {},
    async () => {
      try {
        const result = await jsrClient.getCurrentUser(config);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_current_user_scopes",
    "List scopes that the authenticated user is a member of.",
    {},
    async () => {
      try {
        const result = await jsrClient.getCurrentUserScopes(config);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_current_user_scope_member",
    "Get details of the authenticated user's membership in a specific scope.",
    GetCurrentUserScopeMemberSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getCurrentUserScopeMember(
          config,
          args.scope,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_current_user_invites",
    "List scope invites for the authenticated user.",
    {},
    async () => {
      try {
        const result = await jsrClient.getCurrentUserInvites(config);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_user",
    "Get details of a specific user.",
    GetUserSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getUser(config, args.id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_user_scopes",
    "List scopes that a specific user is a member of.",
    GetUserScopesSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getUserScopes(config, args.id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_list_scope_members",
    "List members of a specific scope.",
    ListScopeMembersSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.listScopeMembers(config, args.scope);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_list_scope_invites",
    "List pending invites for a specific scope.",
    ListScopeInvitesSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.listScopeInvites(config, args.scope);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_publishing_task",
    "Get details of a publishing task.",
    GetPublishingTaskSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getPublishingTask(config, args.id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_stats",
    "Get registry statistics including newest packages, recent updates, and featured packages.",
    {},
    async () => {
      try {
        const result = await jsrClient.getStats(config);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  // Scope management tools (require authentication)
  server.tool(
    "jsr_create_scope",
    "Create a new scope (requires authentication).",
    CreateScopeSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.createScope(
          config,
          args.scope,
          args.description,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_update_scope",
    "Update scope settings (requires authentication and scope admin).",
    UpdateScopeSchema.shape,
    async (args) => {
      try {
        const updates: Parameters<typeof jsrClient.updateScope>[2] = {};
        if (args.ghActionsVerifyActor !== undefined) {
          updates.ghActionsVerifyActor = args.ghActionsVerifyActor;
        }
        if (args.requirePublishingFromCI !== undefined) {
          updates.requirePublishingFromCI = args.requirePublishingFromCI;
        }
        const result = await jsrClient.updateScope(config, args.scope, updates);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_delete_scope",
    "Delete a scope (requires authentication and scope admin, scope must have no packages).",
    DeleteScopeSchema.shape,
    async (args) => {
      try {
        await jsrClient.deleteScope(config, args.scope);
        return {
          content: [{ type: "text", text: "Scope deleted successfully" }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_add_scope_member",
    "Invite a user to a scope (requires authentication and scope admin).",
    AddScopeMemberSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.addScopeMember(
          config,
          args.scope,
          args.githubLogin,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_update_scope_member",
    "Update scope member roles (requires authentication and scope admin).",
    UpdateScopeMemberSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.updateScopeMember(
          config,
          args.scope,
          args.userId,
          args.isAdmin,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_remove_scope_member",
    "Remove a member from a scope (requires authentication and scope admin).",
    RemoveScopeMemberSchema.shape,
    async (args) => {
      try {
        await jsrClient.removeScopeMember(config, args.scope, args.userId);
        return {
          content: [{ type: "text", text: "Member removed successfully" }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_delete_scope_invite",
    "Delete a scope invite (requires authentication and scope admin).",
    DeleteScopeInviteSchema.shape,
    async (args) => {
      try {
        await jsrClient.deleteScopeInvite(config, args.scope, args.userId);
        return {
          content: [{ type: "text", text: "Invite deleted successfully" }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  // Package management tools (require authentication)
  server.tool(
    "jsr_create_package",
    "Create a new package in a scope (requires authentication and scope membership).",
    CreatePackageSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.createPackage(
          config,
          args.scope,
          args.package,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_update_package",
    "Update package details (requires authentication and scope membership).",
    UpdatePackageSchema.shape,
    async (args) => {
      try {
        const updates: Parameters<typeof jsrClient.updatePackage>[3] = {};
        if (args.description !== undefined) {
          updates.description = args.description;
        }
        if (args.githubRepository !== undefined) {
          updates.githubRepository = args.githubRepository;
        }
        if (args.runtimeCompat !== undefined) {
          updates.runtimeCompat = args.runtimeCompat;
        }
        if (args.isArchived !== undefined) updates.isArchived = args.isArchived;

        const result = await jsrClient.updatePackage(
          config,
          args.scope,
          args.name,
          updates,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_delete_package",
    "Delete a package (requires authentication and scope admin, package must have no versions).",
    DeletePackageSchema.shape,
    async (args) => {
      try {
        await jsrClient.deletePackage(config, args.scope, args.name);
        return {
          content: [{ type: "text", text: "Package deleted successfully" }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_create_package_version",
    "Create a new package version by uploading a tarball (requires authentication and scope membership).",
    CreatePackageVersionSchema.shape,
    async (args) => {
      try {
        const tarballData = await Deno.readFile(args.tarballPath);
        const result = await jsrClient.createPackageVersion(
          config,
          args.scope,
          args.name,
          args.version,
          args.configPath,
          tarballData.buffer,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_update_package_version",
    "Update package version yanked status (requires authentication and scope membership).",
    UpdatePackageVersionSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.updatePackageVersion(
          config,
          args.scope,
          args.name,
          args.version,
          args.yanked,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  // Invite management tools
  server.tool(
    "jsr_accept_scope_invite",
    "Accept an invite to a scope (requires authentication).",
    AcceptScopeInviteSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.acceptScopeInvite(config, args.scope);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_decline_scope_invite",
    "Decline an invite to a scope (requires authentication).",
    DeclineScopeInviteSchema.shape,
    async (args) => {
      try {
        await jsrClient.declineScopeInvite(config, args.scope);
        return {
          content: [{ type: "text", text: "Invite declined successfully" }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  // Authorization tools
  server.tool(
    "jsr_create_authorization",
    "Start an authorization flow.",
    CreateAuthorizationSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.createAuthorization(
          config,
          args.challenge,
          args.permissions,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_get_authorization_details",
    "Get details of an authorization.",
    GetAuthorizationDetailsSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.getAuthorizationDetails(
          config,
          args.code,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_approve_authorization",
    "Approve an authorization (requires authentication).",
    ApproveAuthorizationSchema.shape,
    async (args) => {
      try {
        await jsrClient.approveAuthorization(config, args.code);
        return {
          content: [{
            type: "text",
            text: "Authorization approved successfully",
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_deny_authorization",
    "Deny an authorization (requires authentication).",
    DenyAuthorizationSchema.shape,
    async (args) => {
      try {
        await jsrClient.denyAuthorization(config, args.code);
        return {
          content: [{
            type: "text",
            text: "Authorization denied successfully",
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  server.tool(
    "jsr_exchange_authorization",
    "Exchange authorization code for access token.",
    ExchangeAuthorizationSchema.shape,
    async (args) => {
      try {
        const result = await jsrClient.exchangeAuthorizationCode(
          config,
          args.exchangeToken,
          args.verifier,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          }],
        };
      }
    },
  );

  return server;
};

/**
 * Main function to start the JSR MCP server.
 *
 * This function initializes the JSR client configuration, tests the connection,
 * and starts the MCP server using the StdioServerTransport.
 *
 * @returns {Promise<void>}
 */
export const startLocalServer = async (): Promise<void> => {
  await load();

  const apiUrl = Deno.env.get("JSR_API_URL") || "https://api.jsr.io";
  const registryUrl = Deno.env.get("JSR_REGISTRY_URL") || "https://jsr.io";
  const apiToken = Deno.env.get("JSR_API_TOKEN");

  const config = jsrClient.createJSRConfig(apiUrl, registryUrl, apiToken);

  // Test connection before starting
  try {
    console.error("Testing JSR API connection...");
    const result = await jsrClient.testConnection(config);
    if (result.success) {
      console.error("Successfully connected to JSR API");
    } else {
      console.error("Failed to connect to JSR API:", result.error);
      console.error(
        "The server will continue running but some features may not work.",
      );
    }
  } catch (error) {
    console.error(
      "JSR connection test failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  const transport = new StdioServerTransport();
  const server = createServer(config);

  await server.connect(transport);
  console.error("JSR MCP Server running on stdio");
};
