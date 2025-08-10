import { z } from "zod";

/**
 * Common pagination schema used across list endpoints.
 * Provides limit and skip parameters for pagination.
 */
const PaginationSchema = z.object({
  limit: z.number().optional().describe(
    "Maximum number of results to return",
  ),
  skip: z.number().optional().describe(
    "Number of results to skip (for pagination)",
  ),
});

/**
 * Zod schema for validating scope names in JSR.
 * The name of a scope. This must not be @ prefixed.
 * @example "denoland"
 */
export const ScopeNameSchema = z.string().regex(
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  "Invalid scope name format",
);

/**
 * Zod schema for a scope.
 * Returns details of a scope including creator, quotas, and settings.
 */
export const ScopeSchema = z.object({
  /** The name of the scope */
  scope: ScopeNameSchema,
  /** The user who created the scope */
  creator: z.object({
    /** The ID of the user */
    id: z.string().uuid(),
    /** The user's display name */
    name: z.string(),
    /** The user's email address */
    email: z.string().optional(),
    /** The URL to the user's avatar */
    avatarUrl: z.string(),
    /** The user's GitHub ID */
    githubId: z.number().optional(),
    /** Whether the user is blocked from using the registry */
    isBlocked: z.boolean().optional(),
    /** Whether the user is a staff member */
    isStaff: z.boolean().optional(),
    /** The date and time when the user profile was created */
    createdAt: z.string(),
    /** The date and time when the user profile was last updated */
    updatedAt: z.string(),
  }).optional(),
  /** Quota usage and limits for the scope */
  quotas: z.object({
    /** The number of packages in the scope */
    packageUsage: z.number(),
    /** The maximum number of packages allowed in the scope */
    packageLimit: z.number(),
    /** The number of new packages created in the scope in the last week */
    newPackagePerWeekUsage: z.number(),
    /** The maximum number of new packages allowed to be created in the scope in a week */
    newPackagePerWeekLimit: z.number(),
    /** The number of times packages in the scope have been published in the last week */
    publishAttemptsPerWeekUsage: z.number(),
    /** The maximum number of times packages in the scope can be published in a week */
    publishAttemptsPerWeekLimit: z.number(),
  }).optional(),
  /** Whether to verify the actor of a GitHub Actions run when authenticating publishing with a GitHub Actions OIDC token */
  ghActionsVerifyActor: z.boolean().optional(),
  /** Whether to require publishing from a CI environment. This disables publishing from a local environment */
  requirePublishingFromCI: z.boolean().optional(),
  /** The date and time when the scope was created */
  createdAt: z.string(),
  /** The date and time when the scope was last updated */
  updatedAt: z.string(),
});

/**
 * Zod schema for validating package names in JSR.
 * The name of a package.
 * @example "fmt"
 */
export const PackageNameSchema = z.string().regex(
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  "Invalid package name format",
);

/**
 * Zod schema for runtime compatibility information.
 * Indicates which JavaScript runtimes a package is compatible with.
 */
export const RuntimeCompatSchema = z.object({
  /** Whether the package is compatible with web browsers */
  browser: z.boolean().nullable().optional(),
  /** Whether the package is compatible with Deno */
  deno: z.boolean().nullable().optional(),
  /** Whether the package is compatible with Node.js */
  node: z.boolean().nullable().optional(),
  /** Whether the package is compatible with workerd */
  workerd: z.boolean().nullable().optional(),
  /** Whether the package is compatible with Bun */
  bun: z.boolean().nullable().optional(),
});

/**
 * Zod schema for a package.
 * Returns details of a package.
 */
export const PackageSchema = z.object({
  /** The scope that contains this package */
  scope: ScopeNameSchema,
  /** The name of the package */
  name: PackageNameSchema,
  /** The description of the package */
  description: z.string(),
  /** Runtime compatibility information */
  runtimeCompat: RuntimeCompatSchema.optional(),
  /** The date and time when the package was created */
  createdAt: z.string(),
  /** The date and time when the package was last updated */
  updatedAt: z.string(),
  /** Associated GitHub repository */
  githubRepository: z.object({
    /** The GitHub user/organization of the repository */
    owner: z.string(),
    /** The GitHub repository name */
    name: z.string(),
  }).optional(),
  /** The package quality score */
  score: z.number().optional(),
});

/**
 * Zod schema for a semantic version.
 * @example "1.2.3"
 */
export const VersionSchema = z.string();

/**
 * Zod schema for a package version.
 * Returns details of a package version.
 */
export const PackageVersionSchema = z.object({
  /** The scope that contains this package */
  scope: ScopeNameSchema,
  /** The name of the package */
  package: PackageNameSchema,
  /** The semantic version */
  version: VersionSchema,
  /** Whether the version has been yanked */
  yanked: z.boolean(),
  /** The date and time when the package version was created */
  createdAt: z.string(),
  /** The date and time when the package version was last updated */
  updatedAt: z.string(),
  /** Rekor log ID for the published package version */
  rekorLogId: z.string().nullable().optional(),
});

/**
 * Zod schema for searching packages.
 * Input parameters for package search operations.
 */
export const SearchPackagesSchema = PaginationSchema.extend({
  query: z.string().optional().describe("The search query"),
});

/**
 * Zod schema for getting package details.
 * Input parameters for retrieving a specific package.
 */
export const GetPackageSchema = z.object({
  scope: ScopeNameSchema.describe("The scope name (without @ prefix)"),
  name: PackageNameSchema.describe("The package name"),
});

/**
 * Zod schema for getting package version details.
 * Input parameters for retrieving a specific package version.
 */
export const GetPackageVersionSchema = GetPackageSchema.extend({
  version: VersionSchema.describe("The semantic version"),
});

/**
 * Zod schema for listing package versions.
 * Input parameters for retrieving all versions of a package.
 */
export const ListPackageVersionsSchema = GetPackageSchema.extend({
  limit: z.number().optional().describe("Maximum number of results to return"),
  page: z.number().optional().describe("Page number (1-indexed)"),
});

/**
 * Zod schema for getting scope details.
 * Input parameters for retrieving a specific scope.
 */
export const GetScopeSchema = z.object({
  scope: ScopeNameSchema.describe("The scope name (without @ prefix)"),
});

/**
 * Zod schema for listing packages in a scope.
 * Input parameters for retrieving all packages within a scope.
 */
export const ListScopePackagesSchema = GetScopeSchema.merge(PaginationSchema);

/**
 * Response type for package search results.
 * Returns a list of packages matching the query.
 */
export interface JSRSearchResponse {
  /** Array of matching packages */
  items: Array<{
    /** The scope that contains this package */
    scope: string;
    /** The name of the package */
    name: string;
    /** The description of the package */
    description: string;
    /** Runtime compatibility information */
    runtimeCompat?: RuntimeCompat | undefined;
    /** The package quality score */
    score?: number | undefined;
  }>;
  /** Total number of matching packages */
  total: number;
}

/**
 * Runtime compatibility information.
 * Indicates which JavaScript runtimes a package is compatible with.
 */
export interface RuntimeCompat {
  /** Whether the package is compatible with web browsers */
  browser?: boolean | null | undefined;
  /** Whether the package is compatible with Deno */
  deno?: boolean | null | undefined;
  /** Whether the package is compatible with Node.js */
  node?: boolean | null | undefined;
  /** Whether the package is compatible with workerd */
  workerd?: boolean | null | undefined;
  /** Whether the package is compatible with Bun */
  bun?: boolean | null | undefined;
}

/**
 * Response type for package details.
 * Returns details of a package.
 */
export interface JSRPackageResponse {
  /** The scope that contains this package */
  scope: string;
  /** The name of the package */
  name: string;
  /** The description of the package */
  description: string;
  /** Runtime compatibility information */
  runtimeCompat?: RuntimeCompat | undefined;
  /** The date and time when the package was created */
  createdAt: string;
  /** The date and time when the package was last updated */
  updatedAt: string;
  /** Associated GitHub repository */
  githubRepository?: {
    /** The GitHub user/organization of the repository */
    owner: string;
    /** The GitHub repository name */
    name: string;
  } | undefined;
  /** The package quality score */
  score?: number | undefined;
}

/**
 * Response type for package version details.
 * Returns details of a package version.
 */
export interface JSRVersionResponse {
  /** The scope that contains this package */
  scope: string;
  /** The name of the package */
  package: string;
  /** The semantic version */
  version: string;
  /** Whether the version has been yanked */
  yanked: boolean;
  /** The date and time when the package version was created */
  createdAt: string;
  /** The date and time when the package version was last updated */
  updatedAt: string;
  /** Rekor log ID for the published package version */
  rekorLogId?: string | null | undefined;
}

/**
 * Response type for scope details.
 * Returns details of a scope.
 */
export interface JSRScopeResponse {
  /** The name of the scope */
  scope: string;
  /** The user who created the scope */
  creator?: {
    /** The ID of the user */
    id: string;
    /** The user's display name */
    name: string;
    /** The URL to the user's avatar */
    avatarUrl: string;
    /** The date and time when the user profile was created */
    createdAt: string;
    /** The date and time when the user profile was last updated */
    updatedAt: string;
  } | undefined;
  /** Quota usage and limits for the scope */
  quotas?: {
    /** The number of packages in the scope */
    packageUsage: number;
    /** The maximum number of packages allowed in the scope */
    packageLimit: number;
    /** The number of new packages created in the scope in the last week */
    newPackagePerWeekUsage: number;
    /** The maximum number of new packages allowed to be created in the scope in a week */
    newPackagePerWeekLimit: number;
    /** The number of times packages in the scope have been published in the last week */
    publishAttemptsPerWeekUsage: number;
    /** The maximum number of times packages in the scope can be published in a week */
    publishAttemptsPerWeekLimit: number;
  } | undefined;
  /** Whether to verify the actor of a GitHub Actions run when authenticating publishing with a GitHub Actions OIDC token */
  ghActionsVerifyActor?: boolean | undefined;
  /** Whether to require publishing from a CI environment. This disables publishing from a local environment */
  requirePublishingFromCI?: boolean | undefined;
  /** The date and time when the scope was created */
  createdAt: string;
  /** The date and time when the scope was last updated */
  updatedAt: string;
}

/**
 * Zod schema for a user ID.
 * The ID of a user.
 */
export const UserIdSchema = z.string().uuid();

/**
 * Zod schema for a user.
 * Returns details of a user.
 */
export const UserSchema = z.object({
  /** The ID of the user */
  id: UserIdSchema,
  /** The user's display name */
  name: z.string(),
  /** The user's email address */
  email: z.string().optional(),
  /** The URL to the user's avatar */
  avatarUrl: z.string(),
  /** The user's GitHub ID */
  githubId: z.number().optional(),
  /** Whether the user is blocked from using the registry */
  isBlocked: z.boolean().optional(),
  /** Whether the user is a staff member */
  isStaff: z.boolean().optional(),
  /** The number of scopes the user created */
  scopeUsage: z.number().optional(),
  /** The maximum number of scopes the user can create */
  scopeLimit: z.number().optional(),
  /** The number of invites pending for the user */
  inviteCount: z.number().optional(),
  /** The date and time when the user profile was created */
  createdAt: z.string(),
  /** The date and time when the user profile was last updated */
  updatedAt: z.string(),
});

/**
 * Zod schema for a scope member.
 * Returns details of a scope member.
 */
export const ScopeMemberSchema = z.object({
  /** The name of the scope */
  scope: ScopeNameSchema,
  /** The user who is a member of the scope */
  user: UserSchema,
  /** Whether the user is an admin of the scope */
  isAdmin: z.boolean(),
  /** The date and time when the user was added to the scope */
  createdAt: z.string(),
  /** The date and time when the scope member roles were last updated */
  updatedAt: z.string(),
});

/**
 * Zod schema for a scope invite.
 * Returns details of a scope invite.
 */
export const ScopeInviteSchema = z.object({
  /** The name of the scope */
  scope: ScopeNameSchema,
  /** The user that the invite is for */
  targetUser: UserSchema,
  /** The user that sent the invite */
  inviter: UserSchema,
  /** The date and time when the invite was created */
  createdAt: z.string(),
  /** The date and time when the invite was last updated */
  updatedAt: z.string(),
});

/**
 * Zod schema for a dependent package.
 * Returns packages that depend on a specific package.
 */
export const DependentSchema = z.object({
  /** The scope of the dependent package */
  scope: ScopeNameSchema,
  /** The name of the dependent package */
  name: PackageNameSchema,
  /** The versions of the dependent package that depend on this package */
  versions: z.array(VersionSchema),
  /** The total number of versions of the package */
  totalVersions: z.number(),
});

/**
 * Zod schema for package score details.
 * Returns the package score details including various quality metrics.
 */
export const PackageScoreSchema = z.object({
  /** Whether the package has a README file */
  hasReadme: z.boolean(),
  /** Whether the README includes examples */
  hasReadmeExamples: z.boolean(),
  /** Whether all entrypoints have documentation */
  allEntrypointsDocs: z.boolean(),
  /** The percentage of documented symbols */
  percentageDocumentedSymbols: z.number(),
  /** Whether all entrypoints pass fast check */
  allFastCheck: z.boolean(),
  /** Whether the package has provenance */
  hasProvenance: z.boolean(),
  /** Whether the package has a description */
  hasDescription: z.boolean(),
  /** Whether the package is compatible with at least one runtime */
  atLeastOneRuntimeCompatible: z.boolean(),
  /** Whether the package is compatible with multiple runtimes */
  multipleRuntimesCompatible: z.boolean(),
  /** The total package score */
  total: z.number(),
});

/**
 * Zod schema for a dependency.
 * Returns a list of dependencies of a package.
 */
export const DependencySchema = z.object({
  /** The kind of dependency */
  kind: z.enum(["jsr", "npm"]),
  /** The fully qualified name of the dependency (e.g., "@std/fs") */
  name: z.string(),
  /** The semver constraint of the dependency (e.g., "^0.50.0") */
  constraint: z.string(),
  /** The path being imported from the dependency. Empty string if the "default entrypoint" is being imported */
  path: z.string(),
});

/**
 * Zod schema for a publishing task.
 * Returns details of a publishing task.
 */
export const PublishingTaskSchema = z.object({
  /** The ID of the publishing task */
  id: z.string().uuid(),
  /** The status of the publishing task */
  status: z.enum(["pending", "processing", "processed", "success", "failure"]),
  /** Error information if the task failed */
  error: z.object({
    /** The error code */
    code: z.string(),
    /** The error message */
    message: z.string(),
  }).nullable().optional(),
  /** The ID of the user who initiated the task */
  userId: UserIdSchema.nullable().optional(),
  /** The scope of the package being published */
  packageScope: ScopeNameSchema,
  /** The name of the package being published */
  packageName: PackageNameSchema,
  /** The version of the package being published */
  packageVersion: VersionSchema,
  /** The date and time when the publishing task was created */
  createdAt: z.string(),
  /** The date and time when the publishing task was last updated */
  updatedAt: z.string(),
});

/**
 * Zod schema for registry statistics.
 * Returns stats about the registry including newest packages, recent updates, and featured packages.
 */
export const StatsSchema = z.object({
  /** The newest packages */
  newest: z.array(PackageSchema),
  /** The recently uploaded package versions */
  updated: z.array(PackageVersionSchema),
  /** The featured packages */
  featured: z.array(PackageSchema),
});

/**
 * Zod schema for permissions.
 * Represents different levels of package publishing permissions.
 */
export const PermissionSchema = z.union([
  z.object({
    /** The permission name */
    permission: z.literal("package/publish"),
    /** The scope the permission applies to */
    scope: ScopeNameSchema,
  }),
  z.object({
    /** The permission name */
    permission: z.literal("package/publish"),
    /** The scope the permission applies to */
    scope: ScopeNameSchema,
    /** The package the permission applies to */
    package: PackageNameSchema,
  }),
  z.object({
    /** The permission name */
    permission: z.literal("package/publish"),
    /** The scope the permission applies to */
    scope: ScopeNameSchema,
    /** The package the permission applies to */
    package: PackageNameSchema,
    /** The version the permission applies to */
    version: VersionSchema,
    /** The SHA256 hash of the tarball */
    tarballHash: z.string(),
  }),
]);

/**
 * Zod schema for an authorization.
 * Returns details of an authorization.
 */
export const AuthorizationSchema = z.object({
  /** The authorization code */
  code: z.string(),
  /** The permissions that the token will have */
  permissions: z.array(PermissionSchema),
  /** The date and time until which the authorization can be approved/exchanged */
  expiresAt: z.string(),
});

/**
 * Zod schema for creating a new scope.
 * Creates a new scope.
 */
export const CreateScopeRequestSchema = z.object({
  /** The name of the scope */
  scope: ScopeNameSchema,
  /** The description of the scope */
  description: z.string().optional(),
});

/**
 * Zod schema for updating scope settings.
 * Updates the details of a scope.
 */
export const UpdateScopeRequestSchema = z.union([
  z.object({
    /** Whether to verify the actor of a GitHub Actions run when authenticating publishing with a GitHub Actions OIDC token */
    ghActionsVerifyActor: z.boolean(),
  }),
  z.object({
    /** Whether to require publishing from a CI environment. This disables publishing from a local environment */
    requirePublishingFromCI: z.boolean(),
  }),
]);

/**
 * Zod schema for adding a scope member.
 * Invites a user to a scope.
 */
export const AddScopeMemberRequestSchema = z.object({
  /** The GitHub login of the user to add to the scope */
  githubLogin: z.string(),
});

/**
 * Zod schema for updating a scope member.
 * Updates the roles of a scope member.
 */
export const UpdateScopeMemberRequestSchema = z.object({
  /** Whether the user should be an admin of the scope */
  isAdmin: z.boolean(),
});

/**
 * Zod schema for creating a new package.
 * Creates a new package in a scope.
 */
export const CreatePackageRequestSchema = z.object({
  /** The name of the package */
  package: PackageNameSchema,
});

/**
 * Zod schema for updating a package.
 * Updates the details of a package.
 */
export const UpdatePackageRequestSchema = z.union([
  z.object({
    /** The description of the package (max 250 chars) */
    description: z.string().max(250),
  }),
  z.object({
    /** GitHub repository information */
    githubRepository: z.object({
      /** The GitHub user/organization of the repository */
      owner: z.string(),
      /** The GitHub repository name */
      repo: z.string(),
    }).nullable(),
  }),
  z.object({
    /** Runtime compatibility information */
    runtimeCompat: RuntimeCompatSchema,
  }),
  z.object({
    /** Whether this package should be archived or not */
    isArchived: z.boolean(),
  }),
]);

/**
 * Zod schema for updating a package version.
 * Updates the details of a package version.
 */
export const UpdatePackageVersionRequestSchema = z.object({
  /** Whether the version is yanked or not */
  yanked: z.boolean(),
});

/**
 * Zod schema for creating an authorization.
 * Starts an authorization flow.
 */
export const CreateAuthorizationRequestSchema = z.object({
  /** The challenge that will later be needed to retrieve the token after authorization */
  challenge: z.string(),
  /** The permissions that the token will have */
  permissions: z.array(PermissionSchema).optional(),
});

/**
 * Zod schema for exchanging authorization code for access token.
 * Exchanges an authorization code for an access token.
 */
export const AuthorizationExchangeRequestSchema = z.object({
  /** The token that can be used to exchange for a device token after the authorization has been approved */
  exchangeToken: z.string(),
  /** The verifier that was used to generate the challenge */
  verifier: z.string(),
});

/**
 * Zod schema for listing all packages.
 * Input parameters for retrieving packages from the registry.
 */
export const ListPackagesSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  query: z.string().optional(),
});

/**
 * Zod schema for creating a scope.
 * Input parameters for creating a new scope.
 */
export const CreateScopeSchema = z.object({
  scope: ScopeNameSchema,
  description: z.string().optional(),
});

/**
 * Zod schema for updating scope settings.
 * Input parameters for updating an existing scope.
 */
export const UpdateScopeSchema = GetScopeSchema.extend({
  ghActionsVerifyActor: z.boolean().optional(),
  requirePublishingFromCI: z.boolean().optional(),
});

/**
 * Zod schema for deleting a scope.
 * Input parameters for deleting a scope.
 */
export const DeleteScopeSchema = GetScopeSchema;

/**
 * Zod schema for adding a scope member.
 * Input parameters for inviting a user to a scope.
 */
export const AddScopeMemberSchema = GetScopeSchema.extend({
  githubLogin: z.string(),
});

/**
 * Zod schema for updating scope member roles.
 * Input parameters for updating a scope member's permissions.
 */
export const UpdateScopeMemberSchema = GetScopeSchema.extend({
  userId: UserIdSchema,
  isAdmin: z.boolean(),
});

/**
 * Zod schema for removing a scope member.
 * Input parameters for removing a member from a scope.
 */
export const RemoveScopeMemberSchema = GetScopeSchema.extend({
  userId: UserIdSchema,
});

/**
 * Zod schema for deleting a scope invite.
 * Input parameters for deleting an invite to a scope.
 */
export const DeleteScopeInviteSchema = GetScopeSchema.extend({
  userId: UserIdSchema,
});

/**
 * Zod schema for creating a package.
 * Input parameters for creating a new package in a scope.
 */
export const CreatePackageSchema = GetScopeSchema.extend({
  package: PackageNameSchema,
});

/**
 * Zod schema for updating a package.
 * Input parameters for updating package details.
 */
export const UpdatePackageSchema = GetPackageSchema.extend({
  description: z.string().max(250).optional(),
  githubRepository: z.object({
    owner: z.string(),
    name: z.string(),
  }).nullable().optional(),
  runtimeCompat: RuntimeCompatSchema.optional(),
  isArchived: z.boolean().optional(),
});

/**
 * Zod schema for deleting a package.
 * Input parameters for deleting a package.
 */
export const DeletePackageSchema = GetPackageSchema;

/**
 * Zod schema for creating a package version.
 * Input parameters for publishing a new package version.
 */
export const CreatePackageVersionSchema = GetPackageVersionSchema.extend({
  configPath: z.string(),
  tarballPath: z.string(),
});

/**
 * Zod schema for updating a package version.
 * Input parameters for updating package version status.
 */
export const UpdatePackageVersionSchema = GetPackageVersionSchema.extend({
  yanked: z.boolean(),
});

/**
 * Zod schema for creating an authorization.
 * Input parameters for starting an authorization flow.
 */
export const CreateAuthorizationSchema = z.object({
  challenge: z.string(),
  permissions: z.array(PermissionSchema).optional(),
});

/**
 * Zod schema for getting authorization details.
 * Input parameters for retrieving authorization information.
 */
export const GetAuthorizationDetailsSchema = z.object({
  code: z.string(),
});

/**
 * Zod schema for approving an authorization.
 * Input parameters for approving an authorization request.
 */
export const ApproveAuthorizationSchema = z.object({
  code: z.string(),
});

/**
 * Zod schema for denying an authorization.
 * Input parameters for denying an authorization request.
 */
export const DenyAuthorizationSchema = z.object({
  code: z.string(),
});

/**
 * Zod schema for exchanging authorization code.
 * Input parameters for exchanging an authorization code for an access token.
 */
export const ExchangeAuthorizationSchema = z.object({
  exchangeToken: z.string(),
  verifier: z.string(),
});

/**
 * Zod schema for getting package dependents.
 * Input parameters for retrieving packages that depend on a specific package.
 */
export const GetPackageDependentsSchema = GetPackageSchema.extend({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  versionsPerPackageLimit: z.number().min(1).max(10).optional(),
});

/**
 * Zod schema for getting package score.
 * Input parameters for retrieving package quality metrics.
 */
export const GetPackageScoreSchema = GetPackageSchema;

/**
 * Zod schema for getting package dependencies.
 * Input parameters for retrieving dependencies of a package version.
 */
export const GetPackageDependenciesSchema = GetPackageVersionSchema;

/**
 * Zod schema for getting publishing task details.
 * Input parameters for retrieving publishing task status.
 */
export const GetPublishingTaskSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Zod schema for getting user details.
 * Input parameters for retrieving user information.
 */
export const GetUserSchema = z.object({
  id: UserIdSchema,
});

/**
 * Zod schema for getting user scopes.
 * Input parameters for retrieving scopes a user belongs to.
 */
export const GetUserScopesSchema = GetUserSchema;

/**
 * Zod schema for listing scope members.
 * Input parameters for retrieving members of a scope.
 */
export const ListScopeMembersSchema = GetScopeSchema;

/**
 * Zod schema for listing scope invites.
 * Input parameters for retrieving pending invites to a scope.
 */
export const ListScopeInvitesSchema = GetScopeSchema;

/**
 * Zod schema for getting current user's scope membership.
 * Input parameters for retrieving authenticated user's scope membership details.
 */
export const GetSelfUserScopeMemberSchema = GetScopeSchema;

/**
 * Zod schema for accepting a scope invite.
 * Input parameters for accepting an invitation to a scope.
 */
export const AcceptScopeInviteSchema = GetScopeSchema;

/**
 * Zod schema for declining a scope invite.
 * Input parameters for declining an invitation to a scope.
 */
export const DeclineScopeInviteSchema = GetScopeSchema;

/**
 * TypeScript type for a scope.
 * Inferred from the ScopeSchema.
 */
export type Scope = z.infer<typeof ScopeSchema>;

/**
 * TypeScript type for a package.
 * Inferred from the PackageSchema.
 */
export type Package = z.infer<typeof PackageSchema>;

/**
 * TypeScript type for a package version.
 * Inferred from the PackageVersionSchema.
 */
export type PackageVersion = z.infer<typeof PackageVersionSchema>;

/**
 * TypeScript type for a user.
 * Inferred from the UserSchema.
 */
export type User = z.infer<typeof UserSchema>;

/**
 * TypeScript type for a scope member.
 * Inferred from the ScopeMemberSchema.
 */
export type ScopeMember = z.infer<typeof ScopeMemberSchema>;

/**
 * TypeScript type for a scope invite.
 * Inferred from the ScopeInviteSchema.
 */
export type ScopeInvite = z.infer<typeof ScopeInviteSchema>;

/**
 * TypeScript type for a dependent package.
 * Inferred from the DependentSchema.
 */
export type Dependent = z.infer<typeof DependentSchema>;

/**
 * TypeScript type for package score details.
 * Inferred from the PackageScoreSchema.
 */
export type PackageScore = z.infer<typeof PackageScoreSchema>;

/**
 * TypeScript type for a dependency.
 * Inferred from the DependencySchema.
 */
export type Dependency = z.infer<typeof DependencySchema>;

/**
 * TypeScript type for a publishing task.
 * Inferred from the PublishingTaskSchema.
 */
export type PublishingTask = z.infer<typeof PublishingTaskSchema>;

/**
 * TypeScript type for registry statistics.
 * Inferred from the StatsSchema.
 */
export type Stats = z.infer<typeof StatsSchema>;

/**
 * TypeScript type for permissions.
 * Inferred from the PermissionSchema.
 */
export type Permission = z.infer<typeof PermissionSchema>;

/**
 * TypeScript type for an authorization.
 * Inferred from the AuthorizationSchema.
 */
export type Authorization = z.infer<typeof AuthorizationSchema>;
