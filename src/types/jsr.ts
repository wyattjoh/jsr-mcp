import { z } from "zod";
import { PaginationSchema } from "./mcp.ts";

// Scope schemas
export const ScopeNameSchema = z.string().regex(
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  "Invalid scope name format",
);

export const ScopeSchema = z.object({
  scope: ScopeNameSchema,
  creator: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().optional(),
    avatarUrl: z.string(),
    githubId: z.number().optional(),
    isBlocked: z.boolean().optional(),
    isStaff: z.boolean().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }).optional(),
  quotas: z.object({
    packageUsage: z.number(),
    packageLimit: z.number(),
    newPackagePerWeekUsage: z.number(),
    newPackagePerWeekLimit: z.number(),
    publishAttemptsPerWeekUsage: z.number(),
    publishAttemptsPerWeekLimit: z.number(),
  }).optional(),
  ghActionsVerifyActor: z.boolean().optional(),
  requirePublishingFromCI: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Package schemas
export const PackageNameSchema = z.string().regex(
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  "Invalid package name format",
);

export const RuntimeCompatSchema = z.object({
  browser: z.boolean().nullable().optional(),
  deno: z.boolean().nullable().optional(),
  node: z.boolean().nullable().optional(),
  workerd: z.boolean().nullable().optional(),
  bun: z.boolean().nullable().optional(),
});

export const PackageSchema = z.object({
  scope: ScopeNameSchema,
  name: PackageNameSchema,
  description: z.string(),
  runtimeCompat: RuntimeCompatSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  githubRepository: z.object({
    owner: z.string(),
    name: z.string(),
  }).optional(),
  score: z.number().optional(),
});

export const VersionSchema = z.string();

export const PackageVersionSchema = z.object({
  scope: ScopeNameSchema,
  package: PackageNameSchema,
  version: VersionSchema,
  yanked: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  rekorLogId: z.string().nullable().optional(),
});

// Tool input schemas
export const SearchPackagesSchema = PaginationSchema.extend({
  query: z.string().optional().describe("The search query"),
});

export const GetPackageSchema = z.object({
  scope: ScopeNameSchema.describe("The scope name (without @ prefix)"),
  name: PackageNameSchema.describe("The package name"),
});

export const GetPackageVersionSchema = GetPackageSchema.extend({
  version: VersionSchema.describe("The semantic version"),
});

export const ListPackageVersionsSchema = GetPackageSchema.extend({
  limit: z.number().optional().describe("Maximum number of results to return"),
  page: z.number().optional().describe("Page number (1-indexed)"),
});

export const GetScopeSchema = z.object({
  scope: ScopeNameSchema.describe("The scope name (without @ prefix)"),
});

export const ListScopePackagesSchema = GetScopeSchema.merge(PaginationSchema);

// API response types
export interface JSRSearchResponse {
  items: Array<{
    scope: string;
    name: string;
    description: string;
    runtimeCompat?: RuntimeCompat | undefined;
    score?: number | undefined;
  }>;
  total: number;
}

export interface RuntimeCompat {
  browser?: boolean | null | undefined;
  deno?: boolean | null | undefined;
  node?: boolean | null | undefined;
  workerd?: boolean | null | undefined;
  bun?: boolean | null | undefined;
}

export interface JSRPackageResponse {
  scope: string;
  name: string;
  description: string;
  runtimeCompat?: RuntimeCompat | undefined;
  createdAt: string;
  updatedAt: string;
  githubRepository?: {
    owner: string;
    name: string;
  } | undefined;
  score?: number | undefined;
}

export interface JSRVersionResponse {
  scope: string;
  package: string;
  version: string;
  yanked: boolean;
  createdAt: string;
  updatedAt: string;
  rekorLogId?: string | null | undefined;
}

export interface JSRScopeResponse {
  scope: string;
  creator?: {
    id: string;
    name: string;
    avatarUrl: string;
    createdAt: string;
    updatedAt: string;
  } | undefined;
  quotas?: {
    packageUsage: number;
    packageLimit: number;
    newPackagePerWeekUsage: number;
    newPackagePerWeekLimit: number;
    publishAttemptsPerWeekUsage: number;
    publishAttemptsPerWeekLimit: number;
  } | undefined;
  ghActionsVerifyActor?: boolean | undefined;
  requirePublishingFromCI?: boolean | undefined;
  createdAt: string;
  updatedAt: string;
}

// User schemas
export const UserIdSchema = z.string().uuid();

export const UserSchema = z.object({
  id: UserIdSchema,
  name: z.string(),
  email: z.string().optional(),
  avatarUrl: z.string(),
  githubId: z.number().optional(),
  isBlocked: z.boolean().optional(),
  isStaff: z.boolean().optional(),
  scopeUsage: z.number().optional(),
  scopeLimit: z.number().optional(),
  inviteCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Scope member schemas
export const ScopeMemberSchema = z.object({
  scope: ScopeNameSchema,
  user: UserSchema,
  isAdmin: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ScopeInviteSchema = z.object({
  scope: ScopeNameSchema,
  targetUser: UserSchema,
  inviter: UserSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Dependent schema
export const DependentSchema = z.object({
  scope: ScopeNameSchema,
  name: PackageNameSchema,
  versions: z.array(VersionSchema),
  totalVersions: z.number(),
});

// Package score schema
export const PackageScoreSchema = z.object({
  hasReadme: z.boolean(),
  hasReadmeExamples: z.boolean(),
  allEntrypointsDocs: z.boolean(),
  percentageDocumentedSymbols: z.number(),
  allFastCheck: z.boolean(),
  hasProvenance: z.boolean(),
  hasDescription: z.boolean(),
  atLeastOneRuntimeCompatible: z.boolean(),
  multipleRuntimesCompatible: z.boolean(),
  total: z.number(),
});

// Dependency schema
export const DependencySchema = z.object({
  kind: z.enum(["jsr", "npm"]),
  name: z.string(),
  constraint: z.string(),
  path: z.string(),
});

// Publishing task schema
export const PublishingTaskSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "processing", "processed", "success", "failure"]),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).nullable().optional(),
  userId: UserIdSchema.nullable().optional(),
  packageScope: ScopeNameSchema,
  packageName: PackageNameSchema,
  packageVersion: VersionSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Stats schema
export const StatsSchema = z.object({
  newest: z.array(PackageSchema),
  updated: z.array(PackageVersionSchema),
  featured: z.array(PackageSchema),
});

// Permission schema
export const PermissionSchema = z.union([
  z.object({
    permission: z.literal("package/publish"),
    scope: ScopeNameSchema,
  }),
  z.object({
    permission: z.literal("package/publish"),
    scope: ScopeNameSchema,
    package: PackageNameSchema,
  }),
  z.object({
    permission: z.literal("package/publish"),
    scope: ScopeNameSchema,
    package: PackageNameSchema,
    version: VersionSchema,
    tarballHash: z.string(),
  }),
]);

// Authorization schemas
export const AuthorizationSchema = z.object({
  code: z.string(),
  permissions: z.array(PermissionSchema),
  expiresAt: z.string(),
});

// Request schemas
export const CreateScopeRequestSchema = z.object({
  scope: ScopeNameSchema,
  description: z.string().optional(),
});

export const UpdateScopeRequestSchema = z.union([
  z.object({
    ghActionsVerifyActor: z.boolean(),
  }),
  z.object({
    requirePublishingFromCI: z.boolean(),
  }),
]);

export const AddScopeMemberRequestSchema = z.object({
  githubLogin: z.string(),
});

export const UpdateScopeMemberRequestSchema = z.object({
  isAdmin: z.boolean(),
});

export const CreatePackageRequestSchema = z.object({
  package: PackageNameSchema,
});

export const UpdatePackageRequestSchema = z.union([
  z.object({
    description: z.string().max(250),
  }),
  z.object({
    githubRepository: z.object({
      owner: z.string(),
      repo: z.string(),
    }).nullable(),
  }),
  z.object({
    runtimeCompat: RuntimeCompatSchema,
  }),
  z.object({
    isArchived: z.boolean(),
  }),
]);

export const UpdatePackageVersionRequestSchema = z.object({
  yanked: z.boolean(),
});

export const CreateAuthorizationRequestSchema = z.object({
  challenge: z.string(),
  permissions: z.array(PermissionSchema).optional(),
});

export const AuthorizationExchangeRequestSchema = z.object({
  exchangeToken: z.string(),
  verifier: z.string(),
});

// Tool input schemas for new endpoints
export const ListPackagesSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  query: z.string().optional(),
});

// Write operation schemas
export const CreateScopeSchema = z.object({
  scope: ScopeNameSchema,
  description: z.string().optional(),
});

export const UpdateScopeSchema = GetScopeSchema.extend({
  ghActionsVerifyActor: z.boolean().optional(),
  requirePublishingFromCI: z.boolean().optional(),
});

export const DeleteScopeSchema = GetScopeSchema;

export const AddScopeMemberSchema = GetScopeSchema.extend({
  githubLogin: z.string(),
});

export const UpdateScopeMemberSchema = GetScopeSchema.extend({
  userId: UserIdSchema,
  isAdmin: z.boolean(),
});

export const RemoveScopeMemberSchema = GetScopeSchema.extend({
  userId: UserIdSchema,
});

export const DeleteScopeInviteSchema = GetScopeSchema.extend({
  userId: UserIdSchema,
});

export const CreatePackageSchema = GetScopeSchema.extend({
  package: PackageNameSchema,
});

export const UpdatePackageSchema = GetPackageSchema.extend({
  description: z.string().max(250).optional(),
  githubRepository: z.object({
    owner: z.string(),
    repo: z.string(),
  }).nullable().optional(),
  runtimeCompat: RuntimeCompatSchema.optional(),
  isArchived: z.boolean().optional(),
});

export const DeletePackageSchema = GetPackageSchema;

export const CreatePackageVersionSchema = GetPackageVersionSchema.extend({
  configPath: z.string(),
  tarballPath: z.string(),
});

export const UpdatePackageVersionSchema = GetPackageVersionSchema.extend({
  yanked: z.boolean(),
});

export const CreateAuthorizationSchema = z.object({
  challenge: z.string(),
  permissions: z.array(PermissionSchema).optional(),
});

export const GetAuthorizationDetailsSchema = z.object({
  code: z.string(),
});

export const ApproveAuthorizationSchema = z.object({
  code: z.string(),
});

export const DenyAuthorizationSchema = z.object({
  code: z.string(),
});

export const ExchangeAuthorizationSchema = z.object({
  exchangeToken: z.string(),
  verifier: z.string(),
});

export const GetPackageDependentsSchema = GetPackageSchema.extend({
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  versionsPerPackageLimit: z.number().min(1).max(10).optional(),
});

export const GetPackageScoreSchema = GetPackageSchema;

export const GetPackageDependenciesSchema = GetPackageVersionSchema;

export const GetPublishingTaskSchema = z.object({
  id: z.string().uuid(),
});

export const GetUserSchema = z.object({
  id: UserIdSchema,
});

export const GetUserScopesSchema = GetUserSchema;

export const ListScopeMembersSchema = GetScopeSchema;

export const ListScopeInvitesSchema = GetScopeSchema;

export const GetSelfUserScopeMemberSchema = GetScopeSchema;

export const AcceptScopeInviteSchema = GetScopeSchema;

export const DeclineScopeInviteSchema = GetScopeSchema;

// Type exports
export type Scope = z.infer<typeof ScopeSchema>;
export type Package = z.infer<typeof PackageSchema>;
export type PackageVersion = z.infer<typeof PackageVersionSchema>;
export type User = z.infer<typeof UserSchema>;
export type ScopeMember = z.infer<typeof ScopeMemberSchema>;
export type ScopeInvite = z.infer<typeof ScopeInviteSchema>;
export type Dependent = z.infer<typeof DependentSchema>;
export type PackageScore = z.infer<typeof PackageScoreSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type PublishingTask = z.infer<typeof PublishingTaskSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type Authorization = z.infer<typeof AuthorizationSchema>;

