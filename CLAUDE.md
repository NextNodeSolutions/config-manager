# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@nextnode/config-manager** (v1.0.0) is a powerful TypeScript configuration management library with automatic type generation from JSON config files. It provides environment-aware configuration loading with intelligent type inference, eliminating the need for manual type annotations.

**Key Features:**
- **Automatic type generation** from JSON configuration files with smart caching
- **Environment-aware configuration management** with layered loading (default → environment → local)
- **Intelligent type inference** with path-based type resolution
- **Zero configuration setup** with automatic project and config directory detection
- **Pure ESM package** with TypeScript strict mode
- **Full test coverage** with Vitest and comprehensive integration testing
- **Automated CI/CD** with quality gates and NPM publishing

## Architecture

### Core Modules

- **Configuration Management** (`src/core/`): Core configuration system with automatic type generation
  - `manager.ts`: Public API for configuration access (initConfig, getConfig, validateRequiredConfig, etc.)
  - `loader.ts`: ConfigLoader class handling file loading, caching, and environment merging
  - `type-generator.ts`: Automatic TypeScript type generation from JSON configs with smart caching

- **Type System** (`src/definitions/`): TypeScript definitions and error handling
  - `types.ts`: Complete type definitions for the configuration system including advanced types
  - `errors.ts`: Custom error classes for configuration failures with detailed messages
  - `constants.ts`: Environment constants, error codes, and configuration defaults

- **Utilities** (`src/utils/`): Helper functions and validation
  - `helpers.ts`: Deep merge, nested value utilities, and object manipulation
  - `validation.ts`: Configuration validation and environment detection

### Test Infrastructure

- **Test Fixtures** (`src/__test-fixtures__/`): JSON config files for testing all scenarios
- **Generated Types** (`src/__test-fixtures__/generated-types.d.ts`): Auto-generated test types
- **Comprehensive Test Coverage**: Unit tests, integration tests, and type generation tests

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

# Type Generation
pnpm generate-test-types     # Generate types from test fixtures
pnpm generate-config-types   # Generate types for config directory (manual CLI)

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
- **Integration Tests**: Full module integration scenarios (`integration.spec.ts`)
- **Type Generation Tests**: Automatic type generation validation
- **Test Fixtures**: Located in `src/__test-fixtures__/` with comprehensive JSON configs
- **Coverage Requirements**: Aim for >80% coverage on new code

## Export Structure

The library uses a single main export path:
- **Main entry** (`@nextnode/config-manager`): All public APIs including:
  - Configuration functions: `initConfig`, `getConfig`, `hasConfig`, `validateRequiredConfig`
  - Core classes: `ConfigLoader`
  - Utility functions: `deepMerge`, `getNestedValue`, `setNestedValue`
  - Error classes: `ConfigError`, `ConfigNotFoundError`, etc.
  - Types: `ConfigObject`, `ConfigValue`, `ConfigPath`, `UserConfigSchema`, etc.
  - Constants: `VALID_ENVIRONMENTS`, `ERROR_CODES`, `ENV_VARS`

## TypeScript Configuration

- **Strict Mode**: Full TypeScript strict mode enabled
- **No Any**: `any` type is forbidden, use proper typing or `unknown` as last resort
- **ES Modules**: Pure ESM package with no CommonJS support
- **Target**: ES2023 with ESNext module resolution
- **Advanced Types**: Complex type inference system with path-based type resolution

## Automatic Type Generation

The library's flagship feature automatically generates TypeScript types from JSON config files:

### How It Works
1. **Project Detection**: Detects user projects by finding `config/` directories
2. **Smart Generation**: Scans JSON files and generates precise TypeScript definitions
3. **Intelligent Caching**: Uses MD5 hashing to only regenerate when files change
4. **Zero Configuration**: Works automatically with standard project structures

### Generated Files
- Creates `types/config.d.ts` in user projects
- Provides module augmentation for `@nextnode/config-manager`
- Enables perfect type inference without manual type annotations

## Common Development Tasks

### Adding New Features
1. Implement with full TypeScript typing (no `any` types)
2. Add comprehensive tests with fixtures
3. Update exports in `src/index.ts`
4. Ensure automatic type generation compatibility
5. Run `pnpm lint && pnpm type-check && pnpm test` before committing
6. Ensure GitHub Actions workflows pass in PR

### Working with Type Generation
1. Test fixtures are in `src/__test-fixtures__/`
2. Generated test types are at `src/__test-fixtures__/generated-types.d.ts`
3. Use `pnpm generate-test-types` to regenerate during development
4. Type generation logic is in `src/core/type-generator.ts`

### Publishing Updates
1. Create changeset: `pnpm changeset`
2. Select package, version type, and describe changes
3. Version update: `pnpm changeset:version`
4. Publish: `pnpm changeset:publish`

## Module-Specific Notes

### Configuration Management System
- **Singleton Pattern**: Uses global loader instance with `ensureGlobalLoader()` for consistent state
- **Environment Layering**: Merges default → environment → local configurations
- **Automatic Type Generation**: Triggers on first `initConfig()` or `getConfig()` call
- **Path-based Type Inference**: `getConfig('email.provider')` returns exact type from generated schema
- **Smart Caching**: Both configuration and type generation use intelligent caching
- **Validation System**: `validateRequiredConfig()` for runtime config validation with detailed error reporting

### Type System Architecture
- **Module Augmentation**: Uses `declare module` pattern for user project type integration
- **Advanced Type Inference**: Complex conditional types for path-based type resolution
- **Deep Readonly**: All generated types are deeply immutable
- **Union Type Generation**: Automatically infers union types from actual config values

### Error Handling
- **Detailed Error Classes**: Specific error types for different failure scenarios
- **Error Codes**: Standardized error codes for programmatic handling
- **Helpful Messages**: Clear, actionable error messages for developers

## Best Practices

### Code Style
- Use arrow functions consistently
- Prefer `const` over `let`
- Use destructuring when beneficial
- Avoid `any` types completely
- Use `unknown` only as last resort
- Prefer type inference over explicit typing when clear

### Configuration Management
- Always validate required configuration at startup
- Use environment variables for secrets
- Structure configs by feature/domain
- Leverage automatic type generation instead of manual types
- Test configuration loading in different environments

### Type Generation
- Keep JSON configs well-structured and consistent
- Use meaningful property names that will generate good types
- Test type generation with various config structures
- Validate generated types work correctly in user scenarios

## Development Environment

### Prerequisites
- Node.js >=20.0.0
- pnpm (specified in packageManager field)
- TypeScript knowledge for type system work

### Setup
1. Clone repository
2. Install dependencies: `pnpm install`
3. Generate test types: `pnpm generate-test-types`
4. Run tests: `pnpm test`
5. Start development with watch mode: `pnpm test:watch`

### Debugging
- Use `pnpm test:ui` for interactive test debugging
- Check generated types in `src/__test-fixtures__/generated-types.d.ts`
- Use `pnpm type-check` to validate TypeScript compilation
- Enable verbose logging for configuration loading issues