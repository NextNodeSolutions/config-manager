---
"@nextnode/config-manager": major
---

# Transform to dedicated configuration management library

**BREAKING CHANGE**: Complete transformation from `@nextnode/functions-server` to `@nextnode/config-manager`

## Major Changes

### Package Identity
- **Renamed**: `@nextnode/functions-server` → `@nextnode/config-manager`
- **Version Reset**: Starting fresh at 1.0.0 for new focused identity
- **New Focus**: Pure configuration management with automatic type generation

### Architecture Simplification
- **Flattened Structure**: Moved `src/config/*` → `src/` for reduced nesting
- **Removed Modules**: Eliminated formatting utilities (date functions)
- **Streamlined Exports**: Single main export path, removed config subpath
- **Optimized for Configuration**: Every feature focused on config management

### Core Features Enhanced
- **Automatic Type Generation**: Flagship feature with smart caching and project detection
- **Environment-Aware Loading**: Robust default → environment → local configuration merging
- **Intelligent Type Inference**: Path-based type resolution without manual annotations
- **Zero Configuration Setup**: Auto-detection of config directories and project structures
- **Comprehensive Error Handling**: Detailed error classes with actionable messages

### Developer Experience
- **Perfect Type Safety**: Eliminates optional chaining with generated types
- **IntelliSense Support**: Full autocomplete for configuration paths
- **Validation System**: Runtime validation with detailed error reporting
- **Hot Reloading**: Smart cache invalidation and type regeneration

## Migration Guide

This is a complete package transformation. To migrate:

1. **Update package name**:
   ```bash
   npm uninstall @nextnode/functions-server
   npm install @nextnode/config-manager
   ```

2. **Update imports**:
   ```typescript
   // Before
   import { initConfig, getConfig } from '@nextnode/functions-server'
   
   // After (same API)
   import { initConfig, getConfig } from '@nextnode/config-manager'
   ```

3. **Remove date formatting imports** (if used):
   ```typescript
   // This is no longer available
   import { formatDate } from '@nextnode/functions-server'
   ```

4. **Update type declarations** (if using manual module augmentation):
   ```typescript
   // Before
   declare module '@nextnode/functions-server' { ... }
   
   // After
   declare module '@nextnode/config-manager' { ... }
   ```

## What's Included

- ✅ **Configuration Management**: Full-featured config loading with environment support
- ✅ **Automatic Type Generation**: Generate TypeScript types from JSON configs
- ✅ **Environment Detection**: Smart environment resolution and validation
- ✅ **Path-based Access**: Dot notation for nested configuration values
- ✅ **Validation Utilities**: Required configuration validation
- ✅ **Error Handling**: Comprehensive error classes with helpful messages
- ✅ **Caching System**: Intelligent caching with change detection
- ✅ **Zero Dependencies**: Pure TypeScript implementation

## What's Removed

- ❌ **Date Formatting**: Use dedicated date libraries like `date-fns` or `dayjs`
- ❌ **Server Utilities**: Focus is now purely on configuration management
- ❌ **Multi-module Design**: Simplified to single-purpose library

This transformation creates a focused, powerful configuration management solution that excels at its core purpose: making configuration management effortless with perfect type safety.