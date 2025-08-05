import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { JSRConfig } from "../clients/jsr.ts";
import * as jsrClient from "../clients/jsr.ts";
import type { MCPToolResult } from "../types/mcp.ts";
import {
  AcceptScopeInviteSchema,
  AddScopeMemberSchema,
  ApproveAuthorizationSchema,
  CreateAuthorizationSchema,
  CreatePackageSchema,
  CreatePackageVersionSchema,
  CreateScopeSchema,
  DeclineScopeInviteSchema,
  DeletePackageSchema,
  DeleteScopeInviteSchema,
  DeleteScopeSchema,
  DenyAuthorizationSchema,
  ExchangeAuthorizationSchema,
  GetAuthorizationDetailsSchema,
  GetPackageDependenciesSchema,
  GetPackageDependentsSchema,
  GetPackageSchema,
  GetPackageScoreSchema,
  GetPackageVersionSchema,
  GetPublishingTaskSchema,
  GetScopeSchema,
  GetSelfUserScopeMemberSchema,
  GetUserSchema,
  GetUserScopesSchema,
  ListPackagesSchema,
  ListPackageVersionsSchema,
  ListScopeInvitesSchema,
  ListScopeMembersSchema,
  ListScopePackagesSchema,
  RemoveScopeMemberSchema,
  SearchPackagesSchema,
  UpdatePackageSchema,
  UpdatePackageVersionSchema,
  UpdateScopeMemberSchema,
  UpdateScopeSchema,
} from "../types/jsr.ts";

export function createJSRTools(): Tool[] {
  return [
    {
      name: "jsr_search_packages",
      description:
        "Search for packages in the JSR registry. Returns a list of packages matching the query.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return",
          },
          skip: {
            type: "number",
            description: "Number of results to skip (for pagination)",
          },
        },
      },
    },
    {
      name: "jsr_get_package",
      description:
        "Get detailed information about a specific package in the JSR registry.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
        },
        required: ["scope", "name"],
      },
    },
    {
      name: "jsr_get_package_version",
      description:
        "Get detailed information about a specific version of a package.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
          version: {
            type: "string",
            description: "The semantic version",
          },
        },
        required: ["scope", "name", "version"],
      },
    },
    {
      name: "jsr_list_package_versions",
      description: "List all available versions of a specific package.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return",
          },
          page: {
            type: "number",
            description: "Page number (1-indexed)",
          },
        },
        required: ["scope", "name"],
      },
    },
    {
      name: "jsr_get_scope",
      description:
        "Get detailed information about a scope in the JSR registry.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_list_scope_packages",
      description: "List all packages within a specific scope.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return",
          },
          skip: {
            type: "number",
            description: "Number of results to skip (for pagination)",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_get_package_metadata",
      description:
        "Get package metadata from the JSR registry (versions, latest version, etc.).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
        },
        required: ["scope", "name"],
      },
    },
    {
      name: "jsr_list_packages",
      description: "List all packages in the JSR registry.",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of results to return (1-100)",
          },
          page: {
            type: "number",
            description: "Page number (1-indexed)",
          },
          query: {
            type: "string",
            description: "Optional search query",
          },
        },
      },
    },
    {
      name: "jsr_get_package_dependents",
      description:
        "Get packages that depend on a specific package.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (1-100)",
          },
          page: {
            type: "number",
            description: "Page number (1-indexed)",
          },
          versionsPerPackageLimit: {
            type: "number",
            description: "Maximum number of versions per package (1-10)",
          },
        },
        required: ["scope", "name"],
      },
    },
    {
      name: "jsr_get_package_score",
      description:
        "Get the package score details for a specific package.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
        },
        required: ["scope", "name"],
      },
    },
    {
      name: "jsr_get_package_dependencies",
      description:
        "Get the dependencies of a specific package version.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
          version: {
            type: "string",
            description: "The semantic version",
          },
        },
        required: ["scope", "name", "version"],
      },
    },
    {
      name: "jsr_get_current_user",
      description: "Get details of the authenticated user.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "jsr_get_current_user_scopes",
      description: "List scopes that the authenticated user is a member of.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "jsr_get_current_user_scope_member",
      description:
        "Get details of the authenticated user's membership in a specific scope.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_get_current_user_invites",
      description: "List scope invites for the authenticated user.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "jsr_get_user",
      description: "Get details of a specific user.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The user ID (UUID)",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "jsr_get_user_scopes",
      description: "List scopes that a specific user is a member of.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The user ID (UUID)",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "jsr_list_scope_members",
      description: "List members of a specific scope.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_list_scope_invites",
      description: "List pending invites for a specific scope.",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_get_publishing_task",
      description: "Get details of a publishing task.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The publishing task ID (UUID)",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "jsr_get_stats",
      description:
        "Get registry statistics including newest packages, recent updates, and featured packages.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    // Write operations
    {
      name: "jsr_create_scope",
      description: "Create a new scope (requires authentication).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          description: {
            type: "string",
            description: "Optional description for the scope",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_update_scope",
      description: "Update scope settings (requires authentication and scope admin).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          ghActionsVerifyActor: {
            type: "boolean",
            description: "Whether to verify GitHub Actions actor",
          },
          requirePublishingFromCI: {
            type: "boolean",
            description: "Whether to require publishing from CI",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_delete_scope",
      description: "Delete a scope (requires authentication and scope admin, scope must have no packages).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_add_scope_member",
      description: "Invite a user to a scope (requires authentication and scope admin).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          githubLogin: {
            type: "string",
            description: "GitHub username of the user to invite",
          },
        },
        required: ["scope", "githubLogin"],
      },
    },
    {
      name: "jsr_update_scope_member",
      description: "Update scope member roles (requires authentication and scope admin).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          userId: {
            type: "string",
            description: "The user ID (UUID)",
          },
          isAdmin: {
            type: "boolean",
            description: "Whether the user should be an admin",
          },
        },
        required: ["scope", "userId", "isAdmin"],
      },
    },
    {
      name: "jsr_remove_scope_member",
      description: "Remove a member from a scope (requires authentication and scope admin).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          userId: {
            type: "string",
            description: "The user ID (UUID)",
          },
        },
        required: ["scope", "userId"],
      },
    },
    {
      name: "jsr_delete_scope_invite",
      description: "Delete a scope invite (requires authentication and scope admin).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          userId: {
            type: "string",
            description: "The user ID (UUID)",
          },
        },
        required: ["scope", "userId"],
      },
    },
    {
      name: "jsr_create_package",
      description: "Create a new package in a scope (requires authentication and scope membership).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          package: {
            type: "string",
            description: "The package name",
          },
        },
        required: ["scope", "package"],
      },
    },
    {
      name: "jsr_update_package",
      description: "Update package details (requires authentication and scope membership).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
          description: {
            type: "string",
            description: "Package description (max 250 chars)",
          },
          githubRepository: {
            type: "object",
            nullable: true,
            properties: {
              owner: {
                type: "string",
                description: "GitHub repository owner",
              },
              repo: {
                type: "string",
                description: "GitHub repository name",
              },
            },
            description: "GitHub repository information",
          },
          runtimeCompat: {
            type: "object",
            properties: {
              browser: {
                type: "boolean",
                nullable: true,
              },
              deno: {
                type: "boolean",
                nullable: true,
              },
              node: {
                type: "boolean",
                nullable: true,
              },
              workerd: {
                type: "boolean",
                nullable: true,
              },
              bun: {
                type: "boolean",
                nullable: true,
              },
            },
            description: "Runtime compatibility information",
          },
          isArchived: {
            type: "boolean",
            description: "Whether the package is archived",
          },
        },
        required: ["scope", "name"],
      },
    },
    {
      name: "jsr_delete_package",
      description: "Delete a package (requires authentication and scope admin, package must have no versions).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
        },
        required: ["scope", "name"],
      },
    },
    {
      name: "jsr_create_package_version",
      description: "Create a new package version by uploading a tarball (requires authentication and scope membership).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
          version: {
            type: "string",
            description: "The semantic version",
          },
          configPath: {
            type: "string",
            description: "Path to the config file within the tarball",
          },
          tarballPath: {
            type: "string",
            description: "Path to the gzipped tarball file to upload",
          },
        },
        required: ["scope", "name", "version", "configPath", "tarballPath"],
      },
    },
    {
      name: "jsr_update_package_version",
      description: "Update package version yanked status (requires authentication and scope membership).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
          name: {
            type: "string",
            description: "The package name",
          },
          version: {
            type: "string",
            description: "The semantic version",
          },
          yanked: {
            type: "boolean",
            description: "Whether the version should be yanked",
          },
        },
        required: ["scope", "name", "version", "yanked"],
      },
    },
    {
      name: "jsr_accept_scope_invite",
      description: "Accept an invite to a scope (requires authentication).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
        },
        required: ["scope"],
      },
    },
    {
      name: "jsr_decline_scope_invite",
      description: "Decline an invite to a scope (requires authentication).",
      inputSchema: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "The scope name (without @ prefix)",
          },
        },
        required: ["scope"],
      },
    },
    // Authorization operations
    {
      name: "jsr_create_authorization",
      description: "Start an authorization flow.",
      inputSchema: {
        type: "object",
        properties: {
          challenge: {
            type: "string",
            description: "The challenge for later token retrieval",
          },
          permissions: {
            type: "array",
            description: "Optional permissions for the token",
            items: {
              type: "object",
            },
          },
        },
        required: ["challenge"],
      },
    },
    {
      name: "jsr_get_authorization_details",
      description: "Get details of an authorization.",
      inputSchema: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The authorization code",
          },
        },
        required: ["code"],
      },
    },
    {
      name: "jsr_approve_authorization",
      description: "Approve an authorization (requires authentication).",
      inputSchema: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The authorization code",
          },
        },
        required: ["code"],
      },
    },
    {
      name: "jsr_deny_authorization",
      description: "Deny an authorization (requires authentication).",
      inputSchema: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The authorization code",
          },
        },
        required: ["code"],
      },
    },
    {
      name: "jsr_exchange_authorization",
      description: "Exchange authorization code for access token.",
      inputSchema: {
        type: "object",
        properties: {
          exchangeToken: {
            type: "string",
            description: "The exchange token",
          },
          verifier: {
            type: "string",
            description: "The verifier for the challenge",
          },
        },
        required: ["exchangeToken", "verifier"],
      },
    },
  ];
}

export async function handleJSRTool(
  name: string,
  args: unknown,
  config: JSRConfig,
): Promise<MCPToolResult> {
  try {
    switch (name) {
      case "jsr_search_packages": {
        const { query, limit, skip } = SearchPackagesSchema.parse(args);
        const page = skip !== undefined && limit !== undefined
          ? Math.floor(skip / limit) + 1
          : undefined;

        const results = await jsrClient.searchPackages(
          config,
          query,
          limit,
          page,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(results, null, 2),
          }],
        };
      }

      case "jsr_get_package": {
        const { scope, name } = GetPackageSchema.parse(args);
        const result = await jsrClient.getPackage(config, scope, name);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_package_version": {
        const { scope, name, version } = GetPackageVersionSchema.parse(args);
        const result = await jsrClient.getPackageVersion(
          config,
          scope,
          name,
          version,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_list_package_versions": {
        const { scope, name, limit, page } = ListPackageVersionsSchema.parse(
          args,
        );
        const result = await jsrClient.listPackageVersions(
          config,
          scope,
          name,
          limit,
          page,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_scope": {
        const { scope } = GetScopeSchema.parse(args);
        const result = await jsrClient.getScope(config, scope);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_list_scope_packages": {
        const { scope, limit, skip } = ListScopePackagesSchema.parse(args);
        const result = await jsrClient.listScopePackages(
          config,
          scope,
          limit,
          skip,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_package_metadata": {
        const { scope, name } = GetPackageSchema.parse(args);
        const result = await jsrClient.getPackageMetadata(config, scope, name);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_list_packages": {
        const { limit, page, query } = ListPackagesSchema.parse(args);
        const result = await jsrClient.listPackages(config, limit, page, query);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_package_dependents": {
        const { scope, name, limit, page, versionsPerPackageLimit } =
          GetPackageDependentsSchema.parse(args);
        const result = await jsrClient.getPackageDependents(
          config,
          scope,
          name,
          limit,
          page,
          versionsPerPackageLimit,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_package_score": {
        const { scope, name } = GetPackageScoreSchema.parse(args);
        const result = await jsrClient.getPackageScore(config, scope, name);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_package_dependencies": {
        const { scope, name, version } = GetPackageDependenciesSchema.parse(
          args,
        );
        const result = await jsrClient.getPackageDependencies(
          config,
          scope,
          name,
          version,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_current_user": {
        const result = await jsrClient.getCurrentUser(config);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_current_user_scopes": {
        const result = await jsrClient.getCurrentUserScopes(config);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_current_user_scope_member": {
        const { scope } = GetSelfUserScopeMemberSchema.parse(args);
        const result = await jsrClient.getCurrentUserScopeMember(
          config,
          scope,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_current_user_invites": {
        const result = await jsrClient.getCurrentUserInvites(config);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_user": {
        const { id } = GetUserSchema.parse(args);
        const result = await jsrClient.getUser(config, id);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_user_scopes": {
        const { id } = GetUserScopesSchema.parse(args);
        const result = await jsrClient.getUserScopes(config, id);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_list_scope_members": {
        const { scope } = ListScopeMembersSchema.parse(args);
        const result = await jsrClient.listScopeMembers(config, scope);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_list_scope_invites": {
        const { scope } = ListScopeInvitesSchema.parse(args);
        const result = await jsrClient.listScopeInvites(config, scope);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_publishing_task": {
        const { id } = GetPublishingTaskSchema.parse(args);
        const result = await jsrClient.getPublishingTask(config, id);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_stats": {
        const result = await jsrClient.getStats(config);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      // Write operations
      case "jsr_create_scope": {
        const { scope, description } = CreateScopeSchema.parse(args);
        const result = await jsrClient.createScope(config, scope, description);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_update_scope": {
        const { scope, ghActionsVerifyActor, requirePublishingFromCI } =
          UpdateScopeSchema.parse(args);
        const updates: { ghActionsVerifyActor?: boolean | undefined; requirePublishingFromCI?: boolean | undefined } = {};
        
        if (ghActionsVerifyActor !== undefined) {
          updates.ghActionsVerifyActor = ghActionsVerifyActor;
        }
        if (requirePublishingFromCI !== undefined) {
          updates.requirePublishingFromCI = requirePublishingFromCI;
        }
        
        const result = await jsrClient.updateScope(config, scope, updates);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_delete_scope": {
        const { scope } = DeleteScopeSchema.parse(args);
        await jsrClient.deleteScope(config, scope);

        return {
          content: [{
            type: "text",
            text: "Scope deleted successfully",
          }],
        };
      }

      case "jsr_add_scope_member": {
        const { scope, githubLogin } = AddScopeMemberSchema.parse(args);
        const result = await jsrClient.addScopeMember(config, scope, githubLogin);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_update_scope_member": {
        const { scope, userId, isAdmin } = UpdateScopeMemberSchema.parse(args);
        const result = await jsrClient.updateScopeMember(
          config,
          scope,
          userId,
          isAdmin,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_remove_scope_member": {
        const { scope, userId } = RemoveScopeMemberSchema.parse(args);
        await jsrClient.removeScopeMember(config, scope, userId);

        return {
          content: [{
            type: "text",
            text: "Scope member removed successfully",
          }],
        };
      }

      case "jsr_delete_scope_invite": {
        const { scope, userId } = DeleteScopeInviteSchema.parse(args);
        await jsrClient.deleteScopeInvite(config, scope, userId);

        return {
          content: [{
            type: "text",
            text: "Scope invite deleted successfully",
          }],
        };
      }

      case "jsr_create_package": {
        const { scope, package: packageName } = CreatePackageSchema.parse(args);
        const result = await jsrClient.createPackage(config, scope, packageName);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_update_package": {
        const {
          scope,
          name,
          description,
          githubRepository,
          runtimeCompat,
          isArchived,
        } = UpdatePackageSchema.parse(args);
        
        const updates: {
          description?: string | undefined;
          githubRepository?: { owner: string; repo: string } | null | undefined;
          runtimeCompat?: { browser?: boolean | null | undefined; deno?: boolean | null | undefined; node?: boolean | null | undefined; workerd?: boolean | null | undefined; bun?: boolean | null | undefined } | undefined;
          isArchived?: boolean | undefined;
        } = {};
        
        if (description !== undefined) updates.description = description;
        if (githubRepository !== undefined) updates.githubRepository = githubRepository;
        if (runtimeCompat !== undefined) updates.runtimeCompat = runtimeCompat;
        if (isArchived !== undefined) updates.isArchived = isArchived;
        
        const result = await jsrClient.updatePackage(config, scope, name, updates);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_delete_package": {
        const { scope, name } = DeletePackageSchema.parse(args);
        await jsrClient.deletePackage(config, scope, name);

        return {
          content: [{
            type: "text",
            text: "Package deleted successfully",
          }],
        };
      }

      case "jsr_create_package_version": {
        const { scope, name, version, configPath, tarballPath } =
          CreatePackageVersionSchema.parse(args);
        
        // Read the tarball file
        const tarballData = await Deno.readFile(tarballPath);
        const result = await jsrClient.createPackageVersion(
          config,
          scope,
          name,
          version,
          configPath,
          tarballData.buffer as ArrayBuffer,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_update_package_version": {
        const { scope, name, version, yanked } =
          UpdatePackageVersionSchema.parse(args);
        const result = await jsrClient.updatePackageVersion(
          config,
          scope,
          name,
          version,
          yanked,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_accept_scope_invite": {
        const { scope } = AcceptScopeInviteSchema.parse(args);
        const result = await jsrClient.acceptScopeInvite(config, scope);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_decline_scope_invite": {
        const { scope } = DeclineScopeInviteSchema.parse(args);
        await jsrClient.declineScopeInvite(config, scope);

        return {
          content: [{
            type: "text",
            text: "Scope invite declined successfully",
          }],
        };
      }

      // Authorization operations
      case "jsr_create_authorization": {
        const { challenge, permissions } = CreateAuthorizationSchema.parse(args);
        const result = await jsrClient.createAuthorization(
          config,
          challenge,
          permissions,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_get_authorization_details": {
        const { code } = GetAuthorizationDetailsSchema.parse(args);
        const result = await jsrClient.getAuthorizationDetails(config, code);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case "jsr_approve_authorization": {
        const { code } = ApproveAuthorizationSchema.parse(args);
        await jsrClient.approveAuthorization(config, code);

        return {
          content: [{
            type: "text",
            text: "Authorization approved successfully",
          }],
        };
      }

      case "jsr_deny_authorization": {
        const { code } = DenyAuthorizationSchema.parse(args);
        await jsrClient.denyAuthorization(config, code);

        return {
          content: [{
            type: "text",
            text: "Authorization denied successfully",
          }],
        };
      }

      case "jsr_exchange_authorization": {
        const { exchangeToken, verifier } = ExchangeAuthorizationSchema.parse(
          args,
        );
        const result = await jsrClient.exchangeAuthorizationCode(
          config,
          exchangeToken,
          verifier,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      default:
        throw new Error(`Unknown JSR tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }],
      isError: true,
    };
  }
}

