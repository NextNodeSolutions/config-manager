# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@nextnode/functions-server** (v1.0.1) is a comprehensive TypeScript server library for Nextnode projects, providing shared utilities and functions for server-side development. It includes configuration management with automatic type generation, formatting utilities, and will expand to include more server-related functionality.

**Key Features:**
- **Environment-aware configuration management** with automatic TypeScript type generation
- **Comprehensive error handling** with custom error classes
- **Pure ESM package** with TypeScript strict mode
- **Full test coverage** with Vitest and integration testing
- **Automated CI/CD** with quality gates and NPM publishing

## Architecture

### Current Modules

- **Configuration Management** (`src/config/`): Environment-aware config system with automatic type generation
  - `manager.ts`: Public API for configuration access (initConfig, getConfig, validateRequiredConfig, etc.)
  - `loader.ts`: ConfigLoader class handling file loading and caching
  - `auto-types.ts`: Automatic TypeScript type generation from JSON configs
  - `utils.ts`: Deep merge, nested value utilities, and environment detection
  - `errors.ts`: Custom error classes for configuration failures
  - `constants.ts`: Environment constants and error codes
  - `types.ts`: TypeScript type definitions for the config system

- **Formatting Utilities** (`src/formatting/`): Date and data formatting helpers
  - `date.ts`: Date formatting functions

### Planned Modules (to be added)

This library will expand to include:
- **API Utilities**: Request/response helpers, middleware utilities
- **Database Helpers**: Connection management, query builders
- **Authentication**: JWT handling, session management
- **Validation**: Schema validation, input sanitization
- **Logging**: Structured logging utilities
- **Error Handling**: Standardized error responses
- **Caching**: Cache management utilities
- **Email Services**: Email sending utilities
- **File Operations**: File upload/download helpers
- **Security**: Rate limiting, CORS, security headers

## Development Commands

```bash
# Build & Development
pnpm build              # Build library (clean + tsc)
pnpm clean              # Remove dist directory
pnpm type-check         # Generate test types + TypeScript validation

# Testing
pnpm test               # Run tests once
pnpm test:watch         # Watch mode for tests
pnpm test:coverage      # Generate coverage report
pnpm test:ui            # Open Vitest UI

# Code Quality
pnpm lint               # ESLint with @nextnode/eslint-plugin (max warnings: 0)
pnpm lint:fix           # Auto-fix linting issues
pnpm format             # Format with Biome

# Type Generation (for config module)
pnpm generate-test-types     # Generate types from test fixtures
pnpm generate-config-types   # Generate types for config directory

# Publishing
pnpm changeset          # Create changeset for version bump
pnpm changeset:version  # Update versions from changesets
pnpm changeset:publish  # Publish to NPM registry
```

## CI/CD Workflows

The project includes comprehensive GitHub Actions workflows:

### Test Workflow (`.github/workflows/test.yml`)
- Triggers on pull requests to main/master branches
- Runs comprehensive quality checks using reusable actions from `NextNodeSolutions/github-actions`
- Includes linting, type checking, testing, and formatting validation

### Release Workflow (`.github/workflows/release.yml`)
- Triggers on pushes to main branch and manual workflow dispatch
- Single integrated pipeline: quality validation + automated release
- Uses Changesets for version management and NPM publishing
- Automatically creates release PRs and publishes to NPM registry
- Includes concurrency control to prevent conflicting releases

## Testing Strategy

- **Unit Tests**: Individual functions and classes (`*.spec.ts`)
- **Integration Tests**: Full module integration scenarios
- **Test Fixtures**: Located in module-specific `__test-fixtures__/` directories
- **Coverage Requirements**: Aim for >80% coverage on new code

## Export Structure

The library uses multiple export paths for different modules:
- **Main entry** (`@nextnode/functions-server`): All public APIs including:
  - Configuration functions: `initConfig`, `getConfig`, `hasConfig`, `validateRequiredConfig`
  - Utility functions: `deepMerge`, `getNestedValue`, `setNestedValue`
  - Error classes: `ConfigError`, `ConfigNotFoundError`, etc.
  - Types: `ConfigObject`, `ConfigValue`, `ConfigPath`, etc.
  - Date formatting: `formatDate`
- **Config subpath** (`@nextnode/functions-server/config`): Config-specific exports
- Additional subpaths will be added as new modules are implemented

## TypeScript Configuration

- **Strict Mode**: Full TypeScript strict mode enabled
- **No Any**: `any` type is forbidden, use proper typing or `unknown` as last resort
- **ES Modules**: Pure ESM package with no CommonJS support
- **Target**: ES2023 with ESNext module resolution

## Adding New Modules

When adding new server functionality:

1. Create a new directory under `src/` for the module
2. Implement with TypeScript strict compliance
3. Add comprehensive tests in `.spec.ts` files
4. Export public API from `src/index.ts`
5. Consider adding a subpath export in `package.json` if module is substantial
6. Document the module in this file under "Current Modules"
7. Run full validation: `pnpm lint && pnpm type-check && pnpm test`
8. Ensure CI/CD workflows pass before merging PRs

## Common Development Tasks

### Adding New Features
1. Determine which module the feature belongs to (or create a new module)
2. Implement with full TypeScript typing (no `any` types)
3. Add comprehensive tests
4. Update exports in `src/index.ts`
5. Run `pnpm lint && pnpm type-check && pnpm test` before committing
6. Ensure GitHub Actions workflows pass in PR

### Creating a New Module
1. Create directory: `src/[module-name]/`
2. Add main file: `src/[module-name]/index.ts`
3. Add tests: `src/[module-name]/*.spec.ts`
4. Export from main index: `src/index.ts`
5. Optional: Add subpath export in `package.json`

### Publishing Updates
1. Create changeset: `pnpm changeset`
2. Select package, version type, and describe changes
3. Version update: `pnpm changeset:version`
4. Publish: `pnpm changeset:publish`

## Module-Specific Notes

### Configuration Module
- **Auto-type generation**: Automatically generates TypeScript types from JSON config files
- **Environment-aware loading**: Supports layered config loading (default → environment → local)
- **Global management**: Uses singleton pattern with `ensureGlobalLoader()` for consistent state
- **Type generation location**: Types generated in user's project at `types/config.d.ts`
- **Auto-trigger**: Type generation occurs automatically on first `initConfig()` or `getConfig()` call
- **Validation**: Includes `validateRequiredConfig()` for runtime config validation
- **Environment detection**: Automatic environment detection from NODE_ENV and custom logic

### Future Modules
Each new module should:
- Follow single responsibility principle
- Export clean, typed public APIs
- Include comprehensive error handling
- Provide both synchronous and asynchronous variants where applicable
- Be fully tree-shakeable