import type {
  Authorization,
  Dependency,
  Dependent,
  JSRPackageResponse,
  JSRScopeResponse,
  JSRSearchResponse,
  JSRVersionResponse,
  PackageScore,
  Permission,
  PublishingTask,
  RuntimeCompat,
  ScopeInvite,
  ScopeMember,
  Stats,
  User,
} from "./types.ts";
import deno from "../deno.json" with { type: "json" };

/**
 * Configuration interface for JSR API client.
 * Contains API endpoints and optional authentication token.
 */
export interface JSRConfig {
  /** The base URL for the JSR API (e.g., "https://api.jsr.io") */
  readonly apiUrl: string;
  /** The base URL for the JSR registry (e.g., "https://jsr.io") */
  readonly registryUrl: string;
  /** Optional Bearer token for authenticating API requests */
  readonly apiToken?: string | undefined;
}

/**
 * Generic interface for paginated API responses.
 * @template T The type of the data array in the response
 */
export interface PaginatedResponse<T> {
  /** The array of items returned in this page */
  data: T;
  /** Total number of items available across all pages */
  total: number;
  /** Number of items returned in this response */
  returned: number;
  /** Number of items skipped (for pagination) */
  skip: number;
  /** Maximum number of items per page */
  limit?: number | undefined;
}

/**
 * Creates a JSR configuration object.
 * @param apiUrl The base URL for the JSR API (e.g., "https://api.jsr.io")
 * @param registryUrl The base URL for the JSR registry (e.g., "https://jsr.io")
 * @param apiToken Optional Bearer token for authenticating API requests
 * @returns A JSRConfig object with normalized URLs (trailing slashes removed)
 */
export function createJSRConfig(
  apiUrl: string,
  registryUrl: string,
  apiToken?: string | undefined,
): JSRConfig {
  return {
    apiUrl: apiUrl.replace(/\/$/, ""), // Remove trailing slash
    registryUrl: registryUrl.replace(/\/$/, ""), // Remove trailing slash
    apiToken,
  };
}

async function makeApiRequest<T>(
  config: JSRConfig,
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${config.apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent":
      `jsr-client/${deno.version}; https://github.com/wyattjoh/jsr-mcp`,
    ...(options.headers as Record<string, string>),
  };

  if (config.apiToken) {
    headers["Authorization"] = `Bearer ${config.apiToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `JSR API request failed: ${response.status} ${response.statusText}: ${errorText}`,
      );
    }

    // Handle 204 No Content responses that have no body
    if (response.status === 204) {
      await response.body?.cancel();
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `JSR API request failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function makeRegistryRequest<T>(
  config: JSRConfig,
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${config.registryUrl}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent":
      `jsr-client/${deno.version}; https://github.com/wyattjoh/jsr-mcp`,
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `JSR Registry request failed: ${response.status} ${response.statusText}`,
      );
    }

    // Handle 204 No Content responses that have no body
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `JSR Registry request failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Search for packages in the JSR registry.
 * Returns a list of packages matching the query.
 * @param config JSR configuration object
 * @param query The search query
 * @param limit Maximum number of results to return
 * @param page Page number for pagination
 * @returns Search results with matching packages
 */
export async function searchPackages(
  config: JSRConfig,
  query?: string | undefined,
  limit?: number | undefined,
  page?: number | undefined,
): Promise<JSRSearchResponse> {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  if (page !== undefined) {
    params.set("page", String(page));
  }

  return await makeApiRequest<JSRSearchResponse>(
    config,
    `/packages?${params.toString()}`,
  );
}

/**
 * Get detailed information about a specific package in the JSR registry.
 * Returns details of a package.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @returns Package details including description, runtime compatibility, and metadata
 */
export async function getPackage(
  config: JSRConfig,
  scope: string,
  name: string,
): Promise<JSRPackageResponse> {
  return await makeApiRequest<JSRPackageResponse>(
    config,
    `/scopes/${scope}/packages/${name}`,
  );
}

/**
 * Get detailed information about a specific version of a package.
 * Returns details of a package version.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @param version The semantic version
 * @returns Package version details including yanked status and timestamps
 */
export async function getPackageVersion(
  config: JSRConfig,
  scope: string,
  name: string,
  version: string,
): Promise<JSRVersionResponse> {
  return await makeApiRequest<JSRVersionResponse>(
    config,
    `/scopes/${scope}/packages/${name}/versions/${version}`,
  );
}

/**
 * List all available versions of a specific package.
 * Returns a list of versions of a package.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @param limit Maximum number of results to return
 * @param page Page number (1-indexed)
 * @returns Paginated list of package versions
 */
export async function listPackageVersions(
  config: JSRConfig,
  scope: string,
  name: string,
  limit?: number | undefined,
  page?: number | undefined,
): Promise<PaginatedResponse<JSRVersionResponse[]>> {
  const params = new URLSearchParams();

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  if (page !== undefined) {
    params.set("page", String(page));
  }

  const response = await makeApiRequest<JSRVersionResponse[]>(
    config,
    `/scopes/${scope}/packages/${name}/versions?${params.toString()}`,
  );

  return {
    data: response,
    total: response.length, // Note: API doesn't provide total count
    returned: response.length,
    skip: page ? (page - 1) * (limit || 20) : 0,
    limit,
  };
}

/**
 * Get detailed information about a scope in the JSR registry.
 * Returns details of a scope.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @returns Scope details including creator, quotas, and settings
 */
export async function getScope(
  config: JSRConfig,
  scope: string,
): Promise<JSRScopeResponse> {
  return await makeApiRequest<JSRScopeResponse>(config, `/scopes/${scope}`);
}

/**
 * List all packages within a specific scope.
 * Returns a list of packages in a scope.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @param limit Maximum number of results to return
 * @param skip Number of results to skip (for pagination)
 * @returns Paginated list of packages in the scope
 */
export async function listScopePackages(
  config: JSRConfig,
  scope: string,
  limit?: number | undefined,
  skip?: number | undefined,
): Promise<PaginatedResponse<JSRPackageResponse[]>> {
  const params = new URLSearchParams();

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  const page = skip !== undefined ? Math.floor(skip / (limit || 20)) + 1 : 1;
  if (page > 1) {
    params.set("page", String(page));
  }

  const response = await makeApiRequest<{
    items: JSRPackageResponse[];
    total: number;
  }>(config, `/scopes/${scope}/packages?${params.toString()}`);

  return {
    data: response.items,
    total: response.total,
    returned: response.items.length,
    skip: skip || 0,
    limit,
  };
}

/**
 * Get package metadata from the JSR registry (versions, latest version, etc.).
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @returns Package metadata including latest version and all versions
 */
export async function getPackageMetadata(
  config: JSRConfig,
  scope: string,
  name: string,
): Promise<{
  scope: string;
  name: string;
  latest: string;
  versions: Record<string, unknown>;
}> {
  return await makeRegistryRequest(config, `/@${scope}/${name}/meta.json`);
}

/**
 * List all packages in the JSR registry.
 * Returns a list of packages.
 * @param config JSR configuration object
 * @param limit Maximum number of results to return (1-100)
 * @param page Page number (1-indexed)
 * @param query Optional search query
 * @returns List of packages with search metadata
 */
export async function listPackages(
  config: JSRConfig,
  limit?: number | undefined,
  page?: number | undefined,
  query?: string | undefined,
): Promise<JSRSearchResponse> {
  const params = new URLSearchParams();

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  if (page !== undefined) {
    params.set("page", String(page));
  }

  if (query) {
    params.set("query", query);
  }

  return await makeApiRequest<JSRSearchResponse>(
    config,
    `/packages?${params.toString()}`,
  );
}

/**
 * Get packages that depend on a specific package.
 * Returns a list of packages that depend on a package.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @param limit Maximum number of results to return (1-100)
 * @param page Page number (1-indexed)
 * @param versionsPerPackageLimit Maximum number of versions per package (1-10)
 * @returns Paginated list of dependent packages
 */
export async function getPackageDependents(
  config: JSRConfig,
  scope: string,
  name: string,
  limit?: number | undefined,
  page?: number | undefined,
  versionsPerPackageLimit?: number | undefined,
): Promise<PaginatedResponse<Dependent[]>> {
  const params = new URLSearchParams();

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  if (page !== undefined) {
    params.set("page", String(page));
  }

  if (versionsPerPackageLimit !== undefined) {
    params.set("versions_per_package_limit", String(versionsPerPackageLimit));
  }

  const response = await makeApiRequest<{
    items: Dependent[];
    total: number;
  }>(
    config,
    `/scopes/${scope}/packages/${name}/dependents?${params.toString()}`,
  );

  return {
    data: response.items,
    total: response.total,
    returned: response.items.length,
    skip: page ? (page - 1) * (limit || 20) : 0,
    limit,
  };
}

/**
 * Get the package score details for a specific package.
 * Returns the package score details.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @returns Package score breakdown with quality metrics
 */
export async function getPackageScore(
  config: JSRConfig,
  scope: string,
  name: string,
): Promise<PackageScore> {
  return await makeApiRequest<PackageScore>(
    config,
    `/scopes/${scope}/packages/${name}/score`,
  );
}

/**
 * Get the dependencies of a specific package version.
 * Returns a list of dependencies of a package.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @param version The semantic version
 * @returns List of package dependencies with version constraints
 */
export async function getPackageDependencies(
  config: JSRConfig,
  scope: string,
  name: string,
  version: string,
): Promise<Dependency[]> {
  return await makeApiRequest<Dependency[]>(
    config,
    `/scopes/${scope}/packages/${name}/versions/${version}/dependencies`,
  );
}

/**
 * Get details of the authenticated user.
 * Returns details of the authenticated user.
 * @param config JSR configuration object (requires authentication)
 * @returns User details including profile and quotas
 */
export async function getCurrentUser(config: JSRConfig): Promise<User> {
  return await makeApiRequest<User>(config, `/user`);
}

/**
 * List scopes that the authenticated user is a member of.
 * Returns a list of scopes that the authenticated user is a member of.
 * @param config JSR configuration object (requires authentication)
 * @returns List of scopes the user belongs to
 */
export async function getCurrentUserScopes(
  config: JSRConfig,
): Promise<JSRScopeResponse[]> {
  return await makeApiRequest<JSRScopeResponse[]>(config, `/user/scopes`);
}

/**
 * Get details of the authenticated user's membership in a specific scope.
 * Returns details of the authenticated user's membership of a scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @returns Scope membership details including admin status
 */
export async function getCurrentUserScopeMember(
  config: JSRConfig,
  scope: string,
): Promise<ScopeMember> {
  return await makeApiRequest<ScopeMember>(config, `/user/member/${scope}`);
}

/**
 * List scope invites for the authenticated user.
 * Returns a list of invites to scopes that the authenticated user has received.
 * @param config JSR configuration object (requires authentication)
 * @returns List of pending scope invites
 */
export async function getCurrentUserInvites(
  config: JSRConfig,
): Promise<ScopeInvite[]> {
  return await makeApiRequest<ScopeInvite[]>(config, `/user/invites`);
}

/**
 * Get details of a specific user.
 * Returns details of a user.
 * @param config JSR configuration object
 * @param userId The user ID (UUID)
 * @returns User details including profile information
 */
export async function getUser(
  config: JSRConfig,
  userId: string,
): Promise<User> {
  return await makeApiRequest<User>(config, `/users/${userId}`);
}

/**
 * List scopes that a specific user is a member of.
 * Returns a list of scopes that a user is a member of.
 * @param config JSR configuration object
 * @param userId The user ID (UUID)
 * @returns List of scopes the user belongs to
 */
export async function getUserScopes(
  config: JSRConfig,
  userId: string,
): Promise<JSRScopeResponse[]> {
  return await makeApiRequest<JSRScopeResponse[]>(
    config,
    `/users/${userId}/scopes`,
  );
}

/**
 * List members of a specific scope.
 * Returns a list of members of a scope.
 * @param config JSR configuration object
 * @param scope The scope name (without @ prefix)
 * @returns List of scope members with their roles
 */
export async function listScopeMembers(
  config: JSRConfig,
  scope: string,
): Promise<ScopeMember[]> {
  return await makeApiRequest<ScopeMember[]>(
    config,
    `/scopes/${scope}/members`,
  );
}

/**
 * List pending invites for a specific scope.
 * Returns a list of invites to a scope.
 * @param config JSR configuration object (requires authentication and scope admin)
 * @param scope The scope name (without @ prefix)
 * @returns List of pending scope invites
 */
export async function listScopeInvites(
  config: JSRConfig,
  scope: string,
): Promise<ScopeInvite[]> {
  return await makeApiRequest<ScopeInvite[]>(
    config,
    `/scopes/${scope}/invites`,
  );
}

/**
 * Get details of a publishing task.
 * Returns details of a publishing task.
 * @param config JSR configuration object
 * @param taskId The publishing task ID (UUID)
 * @returns Publishing task details including status and error information
 */
export async function getPublishingTask(
  config: JSRConfig,
  taskId: string,
): Promise<PublishingTask> {
  return await makeApiRequest<PublishingTask>(
    config,
    `/publishing_tasks/${taskId}`,
  );
}

/**
 * Get registry statistics including newest packages, recent updates, and featured packages.
 * Returns stats about the registry.
 * @param config JSR configuration object
 * @returns Registry statistics with featured and recent packages
 */
export async function getStats(config: JSRConfig): Promise<Stats> {
  return await makeApiRequest<Stats>(config, `/stats`);
}

/**
 * Create a new scope (requires authentication).
 * Creates a new scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param description Optional description for the scope
 * @returns Created scope details
 */
export async function createScope(
  config: JSRConfig,
  scope: string,
  description?: string | undefined,
): Promise<JSRScopeResponse> {
  return await makeApiRequest<JSRScopeResponse>(config, `/scopes`, {
    method: "POST",
    body: JSON.stringify({ scope, description }),
  });
}

/**
 * Update scope settings (requires authentication and scope admin).
 * Updates the details of a scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param updates Object containing settings to update
 * @returns Updated scope details
 */
export async function updateScope(
  config: JSRConfig,
  scope: string,
  updates: {
    /** Whether to verify GitHub Actions actor */
    ghActionsVerifyActor?: boolean | undefined;
    /** Whether to require publishing from CI */
    requirePublishingFromCI?: boolean | undefined;
  },
): Promise<JSRScopeResponse> {
  return await makeApiRequest<JSRScopeResponse>(config, `/scopes/${scope}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a scope (requires authentication and scope admin, scope must have no packages).
 * Deletes a scope if the scope has no packages.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 */
export async function deleteScope(
  config: JSRConfig,
  scope: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/scopes/${scope}`, {
    method: "DELETE",
  });
}

/**
 * Invite a user to a scope (requires authentication and scope admin).
 * Invites a user to a scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param githubLogin GitHub username of the user to invite
 * @returns Scope invite details
 */
export async function addScopeMember(
  config: JSRConfig,
  scope: string,
  githubLogin: string,
): Promise<ScopeInvite> {
  return await makeApiRequest<ScopeInvite>(config, `/scopes/${scope}/members`, {
    method: "POST",
    body: JSON.stringify({ githubLogin }),
  });
}

/**
 * Update scope member roles (requires authentication and scope admin).
 * Updates the roles of a scope member.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param userId The user ID (UUID)
 * @param isAdmin Whether the user should be an admin
 * @returns Updated scope member details
 */
export async function updateScopeMember(
  config: JSRConfig,
  scope: string,
  userId: string,
  isAdmin: boolean,
): Promise<ScopeMember> {
  return await makeApiRequest<ScopeMember>(
    config,
    `/scopes/${scope}/members/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ isAdmin }),
    },
  );
}

/**
 * Remove a member from a scope (requires authentication and scope admin).
 * Removes a member from a scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param userId The user ID (UUID)
 */
export async function removeScopeMember(
  config: JSRConfig,
  scope: string,
  userId: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/scopes/${scope}/members/${userId}`, {
    method: "DELETE",
  });
}

/**
 * Delete a scope invite (requires authentication and scope admin).
 * Deletes an invite to a scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param userId The user ID (UUID)
 */
export async function deleteScopeInvite(
  config: JSRConfig,
  scope: string,
  userId: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/scopes/${scope}/invites/${userId}`, {
    method: "DELETE",
  });
}

/**
 * Create a new package in a scope (requires authentication and scope membership).
 * Creates a new package in a scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param packageName The package name
 * @returns Created package details
 */
export async function createPackage(
  config: JSRConfig,
  scope: string,
  packageName: string,
): Promise<JSRPackageResponse> {
  return await makeApiRequest<JSRPackageResponse>(
    config,
    `/scopes/${scope}/packages`,
    {
      method: "POST",
      body: JSON.stringify({ package: packageName }),
    },
  );
}

/**
 * Update package details (requires authentication and scope membership).
 * Updates the details of a package.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @param updates Object containing package properties to update
 * @returns Updated package details
 */
export async function updatePackage(
  config: JSRConfig,
  scope: string,
  name: string,
  updates: {
    /** Package description (max 250 chars) */
    description?: string | undefined;
    /** GitHub repository information */
    githubRepository?: { owner: string; name: string } | null | undefined;
    /** Runtime compatibility information */
    runtimeCompat?: RuntimeCompat | undefined;
    /** Whether the package is archived */
    isArchived?: boolean | undefined;
  },
): Promise<JSRPackageResponse> {
  return await makeApiRequest<JSRPackageResponse>(
    config,
    `/scopes/${scope}/packages/${name}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    },
  );
}

/**
 * Delete a package (requires authentication and scope admin, package must have no versions).
 * Deletes a package if the package has no versions.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 */
export async function deletePackage(
  config: JSRConfig,
  scope: string,
  name: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/scopes/${scope}/packages/${name}`, {
    method: "DELETE",
  });
}

/**
 * Create a new package version by uploading a tarball (requires authentication and scope membership).
 * Creates a new version of a package.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @param version The semantic version
 * @param configPath Path to the config file within the tarball
 * @param tarballData Gzipped tarball containing all files in the package version
 * @returns Publishing task for tracking upload progress
 */
export async function createPackageVersion(
  config: JSRConfig,
  scope: string,
  name: string,
  version: string,
  configPath: string,
  tarballData: ArrayBuffer,
): Promise<PublishingTask> {
  const params = new URLSearchParams({ config: configPath });

  return await makeApiRequest<PublishingTask>(
    config,
    `/scopes/${scope}/packages/${name}/versions/${version}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: tarballData,
    },
  );
}

/**
 * Update package version yanked status (requires authentication and scope membership).
 * Updates the details of a package version.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @param name The package name
 * @param version The semantic version
 * @param yanked Whether the version should be yanked
 * @returns Updated package version details
 */
export async function updatePackageVersion(
  config: JSRConfig,
  scope: string,
  name: string,
  version: string,
  yanked: boolean,
): Promise<JSRVersionResponse> {
  return await makeApiRequest<JSRVersionResponse>(
    config,
    `/scopes/${scope}/packages/${name}/versions/${version}`,
    {
      method: "PATCH",
      body: JSON.stringify({ yanked }),
    },
  );
}

/**
 * Accept an invite to a scope (requires authentication).
 * Accepts an invite to a scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 * @returns Scope membership details
 */
export async function acceptScopeInvite(
  config: JSRConfig,
  scope: string,
): Promise<ScopeMember> {
  return await makeApiRequest<ScopeMember>(config, `/user/invites/${scope}`, {
    method: "POST",
  });
}

/**
 * Decline an invite to a scope (requires authentication).
 * Declines an invite to a scope.
 * @param config JSR configuration object (requires authentication)
 * @param scope The scope name (without @ prefix)
 */
export async function declineScopeInvite(
  config: JSRConfig,
  scope: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/user/invites/${scope}`, {
    method: "DELETE",
  });
}

/**
 * Start an authorization flow.
 * Starts an authorization flow.
 * @param config JSR configuration object
 * @param challenge The challenge for later token retrieval
 * @param permissions Optional permissions for the token
 * @returns Authorization flow details including verification URL and exchange token
 */
export async function createAuthorization(
  config: JSRConfig,
  challenge: string,
  permissions?: Permission[] | undefined,
): Promise<{
  /** The URL that the user should visit to approve the authorization */
  verificationUrl: string;
  /** The authorization code that the user can manually enter if they can not directly visit the link */
  code: string;
  /** The token that can be used to exchange for a device token after the authorization has been approved */
  exchangeToken: string;
  /** The number of seconds that should be waited between polling the status of the authorization */
  pollInterval: number;
  /** The date and time until which the authorization can be approved/exchanged */
  expiresAt: string;
}> {
  return await makeApiRequest<{
    verificationUrl: string;
    code: string;
    exchangeToken: string;
    pollInterval: number;
    expiresAt: string;
  }>(config, `/authorizations`, {
    method: "POST",
    body: JSON.stringify({ challenge, permissions }),
  });
}

/**
 * Get details of an authorization.
 * Returns details of an authorization.
 * @param config JSR configuration object
 * @param code The authorization code
 * @returns Authorization details including permissions and expiration
 */
export async function getAuthorizationDetails(
  config: JSRConfig,
  code: string,
): Promise<Authorization> {
  return await makeApiRequest<Authorization>(
    config,
    `/authorizations/details/${code}`,
  );
}

/**
 * Approve an authorization (requires authentication).
 * Approves an authorization.
 * @param config JSR configuration object (requires authentication)
 * @param code The authorization code
 */
export async function approveAuthorization(
  config: JSRConfig,
  code: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/authorizations/approve/${code}`, {
    method: "POST",
  });
}

/**
 * Deny an authorization (requires authentication).
 * Denies an authorization.
 * @param config JSR configuration object (requires authentication)
 * @param code The authorization code
 */
export async function denyAuthorization(
  config: JSRConfig,
  code: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/authorizations/deny/${code}`, {
    method: "POST",
  });
}

/**
 * Exchange authorization code for access token.
 * Exchanges an authorization code for an access token.
 * @param config JSR configuration object
 * @param exchangeToken The exchange token
 * @param verifier The verifier for the challenge
 * @returns Access token and associated user information
 */
export async function exchangeAuthorizationCode(
  config: JSRConfig,
  exchangeToken: string,
  verifier: string,
): Promise<{
  /** The device token that can be used to authenticate requests */
  token: string;
  /** The user that the token is for */
  user: User;
}> {
  return await makeApiRequest<{
    token: string;
    user: User;
  }>(config, `/authorizations/exchange`, {
    method: "POST",
    body: JSON.stringify({ exchangeToken, verifier }),
  });
}

/**
 * Test connection to the JSR API.
 * Verifies that the API is accessible and credentials (if provided) are valid.
 * @param config JSR configuration object
 * @returns Connection test result with success status and optional error message
 */
export async function testConnection(
  config: JSRConfig,
): Promise<{ success: boolean; error?: string | undefined }> {
  try {
    // Try to search with empty query to test the API
    await searchPackages(config, undefined, 1);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
