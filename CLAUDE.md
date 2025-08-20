# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@nextnode/functions-server** is a comprehensive TypeScript server library for Nextnode projects, providing shared utilities and functions for server-side development. It includes configuration management, formatting utilities, and will expand to include more server-related functionality.

## Architecture

### Current Modules

- **Configuration Management** (`src/config/`): Environment-aware config system with automatic type generation
  - `manager.ts`: Public API for configuration access (initConfig, getConfig, etc.)
  - `loader.ts`: ConfigLoader class handling file loading and caching
  - `auto-types.ts`: Automatic TypeScript type generation from JSON configs
  - `utils.ts`: Deep merge and nested value utilities
  - `errors.ts`: Custom error classes for configuration failures

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

## Testing Strategy

- **Unit Tests**: Individual functions and classes (`*.spec.ts`)
- **Integration Tests**: Full module integration scenarios
- **Test Fixtures**: Located in module-specific `__test-fixtures__/` directories
- **Coverage Requirements**: Aim for >80% coverage on new code

## Export Structure

The library uses multiple export paths for different modules:
- Main entry (`@nextnode/functions-server`): All public APIs
- Config subpath (`@nextnode/functions-server/config`): Config-specific exports
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

## Common Development Tasks

### Adding New Features
1. Determine which module the feature belongs to (or create a new module)
2. Implement with full TypeScript typing (no `any` types)
3. Add comprehensive tests
4. Update exports in `src/index.ts`
5. Run `pnpm lint && pnpm type-check && pnpm test` before committing

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
- Auto-generates types from JSON config files
- Supports environment-based config loading (default → environment → local)
- Types generated in user's project at `types/config.d.ts`
- Triggers type generation on first `initConfig()` or `getConfig()` call

### Future Modules
Each new module should:
- Follow single responsibility principle
- Export clean, typed public APIs
- Include comprehensive error handling
- Provide both synchronous and asynchronous variants where applicable
- Be fully tree-shakeable