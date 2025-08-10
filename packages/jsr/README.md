# @wyattjoh/jsr

A Deno library for interacting with the JSR (JavaScript Registry) API. This package provides a clean, type-safe API for searching packages, managing versions, and accessing registry metadata.

## Installation

```bash
deno add @wyattjoh/jsr
```

## Usage

```typescript
import {
  createJSRConfig,
  getPackage,
  getPackageVersion,
  listPackageVersions,
  searchPackages,
} from "@wyattjoh/jsr";

// Create a configuration
const config = createJSRConfig({
  apiToken: "your-api-token", // optional, for authenticated operations
});

// Search for packages
const results = await searchPackages(config, "react", 10);

// Get package details
const pkg = await getPackage(config, "deno", "std");

// Get specific version
const version = await getPackageVersion(config, "deno", "std", "1.0.0");

// List all versions
const versions = await listPackageVersions(config, "deno", "std");
```

## Features

- **Package Search**: Full-text search across the JSR registry
- **Package Management**: Create, update, and delete packages (with auth)
- **Version Control**: Manage package versions and dependencies
- **Scope Management**: Create and manage JSR scopes
- **Member Management**: Invite and manage scope members
- **Type-Safe**: Full TypeScript support with Zod validation
- **Comprehensive API**: Complete coverage of JSR API endpoints

## API Reference

### Configuration

```typescript
createJSRConfig(options?: ConfigOptions): JSRConfig
testConnection(config: JSRConfig): Promise<boolean>
```

### Packages

```typescript
searchPackages(config: JSRConfig, query?: string, limit?: number, page?: number): Promise<SearchResults>
getPackage(config: JSRConfig, scope: string, name: string): Promise<Package>
getPackageVersion(config: JSRConfig, scope: string, name: string, version: string): Promise<PackageVersion>
listPackageVersions(config: JSRConfig, scope: string, name: string, limit?: number, page?: number): Promise<PackageVersion[]>
getPackageMetadata(config: JSRConfig, scope: string, name: string): Promise<PackageMetadata>
getPackageDependencies(config: JSRConfig, scope: string, name: string, version: string): Promise<Dependencies>
getPackageScore(config: JSRConfig, scope: string, name: string): Promise<PackageScore>
getPackageDependents(config: JSRConfig, scope: string, name: string, options?: DependentsOptions): Promise<Dependents>
createPackage(config: JSRConfig, scope: string, name: string, description?: string): Promise<Package>
updatePackage(config: JSRConfig, scope: string, name: string, updates: PackageUpdates): Promise<Package>
deletePackage(config: JSRConfig, scope: string, name: string): Promise<void>
```

### Package Versions

```typescript
createPackageVersion(config: JSRConfig, scope: string, name: string, version: string, config?: object, files?: File[]): Promise<PackageVersion>
updatePackageVersion(config: JSRConfig, scope: string, name: string, version: string, yanked: boolean): Promise<PackageVersion>
```

### Scopes

```typescript
getScope(config: JSRConfig, scope: string): Promise<Scope>
listScopePackages(config: JSRConfig, scope: string, limit?: number, page?: number): Promise<Package[]>
createScope(config: JSRConfig, scope: string, description?: string): Promise<Scope>
updateScope(config: JSRConfig, scope: string, settings: ScopeSettings): Promise<Scope>
deleteScope(config: JSRConfig, scope: string): Promise<void>
```

### Members & Invites

```typescript
listScopeMembers(config: JSRConfig, scope: string): Promise<ScopeMember[]>
addScopeMember(config: JSRConfig, scope: string, githubLogin: string): Promise<void>
updateScopeMember(config: JSRConfig, scope: string, userId: string, isAdmin: boolean): Promise<void>
removeScopeMember(config: JSRConfig, scope: string, userId: string): Promise<void>
listScopeInvites(config: JSRConfig, scope: string): Promise<ScopeInvite[]>
deleteScopeInvite(config: JSRConfig, scope: string, userId: string): Promise<void>
acceptScopeInvite(config: JSRConfig, scope: string): Promise<void>
declineScopeInvite(config: JSRConfig, scope: string): Promise<void>
```

### Users

```typescript
getCurrentUser(config: JSRConfig): Promise<User>
getCurrentUserScopes(config: JSRConfig): Promise<Scope[]>
getCurrentUserScopeMember(config: JSRConfig, scope: string): Promise<ScopeMember>
getCurrentUserInvites(config: JSRConfig): Promise<ScopeInvite[]>
getUser(config: JSRConfig, id: string): Promise<User>
getUserScopes(config: JSRConfig, id: string): Promise<Scope[]>
```

### Registry

```typescript
listPackages(config: JSRConfig, options?: ListOptions): Promise<Package[]>
getStats(config: JSRConfig): Promise<RegistryStats>
```

### Publishing

```typescript
getPublishingTask(config: JSRConfig, taskId: string): Promise<PublishingTask>
```

### Authorization

```typescript
createAuthorization(config: JSRConfig, params: AuthorizationParams): Promise<Authorization>
getAuthorizationDetails(config: JSRConfig, code: string): Promise<AuthorizationDetails>
approveAuthorization(config: JSRConfig, code: string): Promise<void>
denyAuthorization(config: JSRConfig, code: string): Promise<void>
exchangeAuthorizationCode(config: JSRConfig, code: string, exchangeToken: string): Promise<TokenResponse>
```

## Authentication

Some operations require authentication via JSR API token:

```typescript
import { createJSRConfig, createPackage } from "@wyattjoh/jsr";

// Create a config with your JSR API token
const config = createJSRConfig({
  apiToken: "your-api-token",
});

// Now you can perform authenticated operations
await createPackage(config, "my-scope", "my-package", "Package description");
```

## Configuration

The client can be configured with custom URLs:

```typescript
import { createJSRConfig } from "@wyattjoh/jsr";

const config = createJSRConfig({
  apiUrl: "https://api.jsr.io",
  registryUrl: "https://jsr.io",
  apiToken: "your-api-token", // optional
});
```

## Requirements

- Deno 2.x or later
- Network access to JSR API
- JSR API token for authenticated operations

## License

MIT
