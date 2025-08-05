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
} from "../types/jsr.ts";
import type { PaginatedResponse } from "../types/mcp.ts";
import deno from "../../deno.json" with { type: "json" };

export interface JSRConfig {
  readonly apiUrl: string;
  readonly registryUrl: string;
  readonly apiToken?: string | undefined;
}

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
      `jsr-mcp/${deno.version}; https://github.com/wyattjoh/jsr-mcp`,
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
      `jsr-mcp/${deno.version}; https://github.com/wyattjoh/jsr-mcp`,
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

    return await response.json();
  } catch (error) {
    throw new Error(
      `JSR Registry request failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Search packages
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

// Get package details
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

// Get package version details
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

// List package versions
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

// Get scope details
export async function getScope(
  config: JSRConfig,
  scope: string,
): Promise<JSRScopeResponse> {
  return await makeApiRequest<JSRScopeResponse>(config, `/scopes/${scope}`);
}

// List packages in a scope
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

// Get package metadata from registry (not management API)
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

// List all packages
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

// Get package dependents
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

// Get package score
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

// Get package dependencies
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

// Get current user
export async function getCurrentUser(config: JSRConfig): Promise<User> {
  return await makeApiRequest<User>(config, `/user`);
}

// List current user's scopes
export async function getCurrentUserScopes(
  config: JSRConfig,
): Promise<JSRScopeResponse[]> {
  return await makeApiRequest<JSRScopeResponse[]>(config, `/user/scopes`);
}

// Get current user's scope member details
export async function getCurrentUserScopeMember(
  config: JSRConfig,
  scope: string,
): Promise<ScopeMember> {
  return await makeApiRequest<ScopeMember>(config, `/user/member/${scope}`);
}

// List current user's invites
export async function getCurrentUserInvites(
  config: JSRConfig,
): Promise<ScopeInvite[]> {
  return await makeApiRequest<ScopeInvite[]>(config, `/user/invites`);
}

// Get user details
export async function getUser(
  config: JSRConfig,
  userId: string,
): Promise<User> {
  return await makeApiRequest<User>(config, `/users/${userId}`);
}

// List user's scopes
export async function getUserScopes(
  config: JSRConfig,
  userId: string,
): Promise<JSRScopeResponse[]> {
  return await makeApiRequest<JSRScopeResponse[]>(
    config,
    `/users/${userId}/scopes`,
  );
}

// List scope members
export async function listScopeMembers(
  config: JSRConfig,
  scope: string,
): Promise<ScopeMember[]> {
  return await makeApiRequest<ScopeMember[]>(
    config,
    `/scopes/${scope}/members`,
  );
}

// List scope invites
export async function listScopeInvites(
  config: JSRConfig,
  scope: string,
): Promise<ScopeInvite[]> {
  return await makeApiRequest<ScopeInvite[]>(
    config,
    `/scopes/${scope}/invites`,
  );
}

// Get publishing task
export async function getPublishingTask(
  config: JSRConfig,
  taskId: string,
): Promise<PublishingTask> {
  return await makeApiRequest<PublishingTask>(
    config,
    `/publishing_tasks/${taskId}`,
  );
}

// Get stats
export async function getStats(config: JSRConfig): Promise<Stats> {
  return await makeApiRequest<Stats>(config, `/stats`);
}

// Create a new scope
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

// Update scope
export async function updateScope(
  config: JSRConfig,
  scope: string,
  updates: {
    ghActionsVerifyActor?: boolean | undefined;
    requirePublishingFromCI?: boolean | undefined;
  },
): Promise<JSRScopeResponse> {
  return await makeApiRequest<JSRScopeResponse>(config, `/scopes/${scope}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

// Delete scope
export async function deleteScope(
  config: JSRConfig,
  scope: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/scopes/${scope}`, {
    method: "DELETE",
  });
}

// Add scope member
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

// Update scope member
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

// Remove scope member
export async function removeScopeMember(
  config: JSRConfig,
  scope: string,
  userId: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/scopes/${scope}/members/${userId}`, {
    method: "DELETE",
  });
}

// Delete scope invite
export async function deleteScopeInvite(
  config: JSRConfig,
  scope: string,
  userId: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/scopes/${scope}/invites/${userId}`, {
    method: "DELETE",
  });
}

// Create package
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

// Update package
export async function updatePackage(
  config: JSRConfig,
  scope: string,
  name: string,
  updates: {
    description?: string | undefined;
    githubRepository?: { owner: string; repo: string } | null | undefined;
    runtimeCompat?: RuntimeCompat | undefined;
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

// Delete package
export async function deletePackage(
  config: JSRConfig,
  scope: string,
  name: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/scopes/${scope}/packages/${name}`, {
    method: "DELETE",
  });
}

// Create package version (file upload)
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

// Update package version
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

// Accept scope invite
export async function acceptScopeInvite(
  config: JSRConfig,
  scope: string,
): Promise<ScopeMember> {
  return await makeApiRequest<ScopeMember>(config, `/user/invites/${scope}`, {
    method: "POST",
  });
}

// Decline scope invite
export async function declineScopeInvite(
  config: JSRConfig,
  scope: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/user/invites/${scope}`, {
    method: "DELETE",
  });
}

// Create authorization
export async function createAuthorization(
  config: JSRConfig,
  challenge: string,
  permissions?: Permission[] | undefined,
): Promise<{
  verificationUrl: string;
  code: string;
  exchangeToken: string;
  pollInterval: number;
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

// Get authorization details
export async function getAuthorizationDetails(
  config: JSRConfig,
  code: string,
): Promise<Authorization> {
  return await makeApiRequest<Authorization>(
    config,
    `/authorizations/details/${code}`,
  );
}

// Approve authorization
export async function approveAuthorization(
  config: JSRConfig,
  code: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/authorizations/approve/${code}`, {
    method: "POST",
  });
}

// Deny authorization
export async function denyAuthorization(
  config: JSRConfig,
  code: string,
): Promise<void> {
  await makeApiRequest<void>(config, `/authorizations/deny/${code}`, {
    method: "POST",
  });
}

// Exchange authorization code
export async function exchangeAuthorizationCode(
  config: JSRConfig,
  exchangeToken: string,
  verifier: string,
): Promise<{
  token: string;
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

// Test connection to JSR API
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
