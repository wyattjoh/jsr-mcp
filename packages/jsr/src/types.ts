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
 * User details.
 * Returns details of a user.
 */
export interface User {
  /** The ID of the user */
  id: string;
  /** The user's display name */
  name: string;
  /** The user's email address */
  email?: string | undefined;
  /** The URL to the user's avatar */
  avatarUrl: string;
  /** The user's GitHub ID */
  githubId?: number | undefined;
  /** Whether the user is blocked from using the registry */
  isBlocked?: boolean | undefined;
  /** Whether the user is a staff member */
  isStaff?: boolean | undefined;
  /** The number of scopes the user created */
  scopeUsage?: number | undefined;
  /** The maximum number of scopes the user can create */
  scopeLimit?: number | undefined;
  /** The number of invites pending for the user */
  inviteCount?: number | undefined;
  /** The date and time when the user profile was created */
  createdAt: string;
  /** The date and time when the user profile was last updated */
  updatedAt: string;
}

/**
 * Scope member details.
 * Returns details of a scope member.
 */
export interface ScopeMember {
  /** The name of the scope */
  scope: string;
  /** The user who is a member of the scope */
  user: User;
  /** Whether the user is an admin of the scope */
  isAdmin: boolean;
  /** The date and time when the user was added to the scope */
  createdAt: string;
  /** The date and time when the scope member roles were last updated */
  updatedAt: string;
}

/**
 * Scope invite details.
 * Returns details of a scope invite.
 */
export interface ScopeInvite {
  /** The name of the scope */
  scope: string;
  /** The user that the invite is for */
  targetUser: User;
  /** The user that sent the invite */
  inviter: User;
  /** The date and time when the invite was created */
  createdAt: string;
  /** The date and time when the invite was last updated */
  updatedAt: string;
}

/**
 * Dependent package details.
 * Returns packages that depend on a specific package.
 */
export interface Dependent {
  /** The scope of the dependent package */
  scope: string;
  /** The name of the dependent package */
  name: string;
  /** The versions of the dependent package that depend on this package */
  versions: string[];
  /** The total number of versions of the package */
  totalVersions: number;
}

/**
 * Package score details.
 * Returns the package score details including various quality metrics.
 */
export interface PackageScore {
  /** Whether the package has a README file */
  hasReadme: boolean;
  /** Whether the README includes examples */
  hasReadmeExamples: boolean;
  /** Whether all entrypoints have documentation */
  allEntrypointsDocs: boolean;
  /** The percentage of documented symbols */
  percentageDocumentedSymbols: number;
  /** Whether all entrypoints pass fast check */
  allFastCheck: boolean;
  /** Whether the package has provenance */
  hasProvenance: boolean;
  /** Whether the package has a description */
  hasDescription: boolean;
  /** Whether the package is compatible with at least one runtime */
  atLeastOneRuntimeCompatible: boolean;
  /** Whether the package is compatible with multiple runtimes */
  multipleRuntimesCompatible: boolean;
  /** The total package score */
  total: number;
}

/**
 * Dependency details.
 * Returns a list of dependencies of a package.
 */
export interface Dependency {
  /** The kind of dependency */
  kind: "jsr" | "npm";
  /** The fully qualified name of the dependency (e.g., "@std/fs") */
  name: string;
  /** The semver constraint of the dependency (e.g., "^0.50.0") */
  constraint: string;
  /** The path being imported from the dependency. Empty string if the "default entrypoint" is being imported */
  path: string;
}

/**
 * Publishing task details.
 * Returns details of a publishing task.
 */
export interface PublishingTask {
  /** The ID of the publishing task */
  id: string;
  /** The status of the publishing task */
  status: "pending" | "processing" | "processed" | "success" | "failure";
  /** Error information if the task failed */
  error?:
    | {
      /** The error code */
      code: string;
      /** The error message */
      message: string;
    }
    | null
    | undefined;
  /** The ID of the user who initiated the task */
  userId?: string | null | undefined;
  /** The scope of the package being published */
  packageScope: string;
  /** The name of the package being published */
  packageName: string;
  /** The version of the package being published */
  packageVersion: string;
  /** The date and time when the publishing task was created */
  createdAt: string;
  /** The date and time when the publishing task was last updated */
  updatedAt: string;
}

/**
 * Registry statistics.
 * Returns stats about the registry including newest packages, recent updates, and featured packages.
 */
export interface Stats {
  /** The newest packages */
  newest: JSRPackageResponse[];
  /** The recently uploaded package versions */
  updated: JSRVersionResponse[];
  /** The featured packages */
  featured: JSRPackageResponse[];
}

/**
 * Package publishing permission.
 * Represents different levels of package publishing permissions.
 */
export type Permission =
  | {
    /** The permission name */
    permission: "package/publish";
    /** The scope the permission applies to */
    scope: string;
  }
  | {
    /** The permission name */
    permission: "package/publish";
    /** The scope the permission applies to */
    scope: string;
    /** The package the permission applies to */
    package: string;
  }
  | {
    /** The permission name */
    permission: "package/publish";
    /** The scope the permission applies to */
    scope: string;
    /** The package the permission applies to */
    package: string;
    /** The version the permission applies to */
    version: string;
    /** The SHA256 hash of the tarball */
    tarballHash: string;
  };

/**
 * Authorization details.
 * Returns details of an authorization.
 */
export interface Authorization {
  /** The authorization code */
  code: string;
  /** The permissions that the token will have */
  permissions: Permission[];
  /** The date and time until which the authorization can be approved/exchanged */
  expiresAt: string;
}
