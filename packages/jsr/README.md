# @wyattjoh/jsr

A Deno library for interacting with the JSR (JavaScript Registry) API. This package provides a clean, type-safe API for searching packages, managing versions, and accessing registry metadata.

## Installation

```bash
deno add @wyattjoh/jsr
```

## Usage

```typescript
import {
  getPackage,
  getPackageVersion,
  listPackageVersions,
  searchPackages,
} from "@wyattjoh/jsr";

// Search for packages
const results = await searchPackages({
  query: "react",
  limit: 10,
});

// Get package details
const pkg = await getPackage("deno", "std");

// Get specific version
const version = await getPackageVersion("deno", "std", "1.0.0");

// List all versions
const versions = await listPackageVersions("deno", "std");
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

### Packages

```typescript
searchPackages(options?: SearchOptions): Promise<SearchResults>
getPackage(scope: string, name: string): Promise<Package>
getPackageVersion(scope: string, name: string, version: string): Promise<PackageVersion>
listPackageVersions(scope: string, name: string, options?: ListOptions): Promise<PackageVersion[]>
getPackageMetadata(scope: string, name: string): Promise<PackageMetadata>
getPackageDependencies(scope: string, name: string, version: string): Promise<Dependencies>
getPackageScore(scope: string, name: string): Promise<PackageScore>
getPackageDependents(scope: string, name: string, options?: DependentsOptions): Promise<Dependents>
```

### Scopes

```typescript
getScope(scope: string): Promise<Scope>
listScopePackages(scope: string, options?: ListOptions): Promise<Package[]>
createScope(scope: string, description?: string): Promise<Scope>
updateScope(scope: string, settings: ScopeSettings): Promise<Scope>
deleteScope(scope: string): Promise<void>
```

### Members & Invites

```typescript
listScopeMembers(scope: string): Promise<ScopeMember[]>
addScopeMember(scope: string, githubLogin: string): Promise<void>
updateScopeMember(scope: string, userId: string, isAdmin: boolean): Promise<void>
removeScopeMember(scope: string, userId: string): Promise<void>
listScopeInvites(scope: string): Promise<ScopeInvite[]>
acceptScopeInvite(scope: string): Promise<void>
declineScopeInvite(scope: string): Promise<void>
```

### Users

```typescript
getCurrentUser(): Promise<User>
getCurrentUserScopes(): Promise<Scope[]>
getUser(id: string): Promise<User>
getUserScopes(id: string): Promise<Scope[]>
```

### Registry

```typescript
listPackages(options?: ListOptions): Promise<Package[]>
getStats(): Promise<RegistryStats>
```

## Authentication

Some operations require authentication via JSR API token:

```typescript
import { setApiToken } from "@wyattjoh/jsr";

// Set your JSR API token
setApiToken("your-api-token");

// Now you can perform authenticated operations
await createPackage("my-scope", "my-package");
```

## Configuration

The client can be configured with custom URLs:

```typescript
import { configure } from "@wyattjoh/jsr";

configure({
  apiUrl: "https://api.jsr.io",
  registryUrl: "https://jsr.io",
});
```

## Requirements

- Deno 2.x or later
- Network access to JSR API
- JSR API token for authenticated operations

## License

MIT
