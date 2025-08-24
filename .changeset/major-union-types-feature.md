---
"@nextnode/config-manager": major
---

Major architectural overhaul with Prisma-style type generation and breaking changes

## 🚨 BREAKING CHANGES

- **Architecture restructure**: Core logic moved from `src/core/` to `src/lib/` with new module organization
- **API changes**: Import paths and internal APIs have been restructured
- **Test structure**: Test fixtures relocated from `src/__test-fixtures__/` to `src/__tests__/fixtures/`
- **Type generation**: Complete rewrite of type inference system with new ConfigSchema architecture

## ✨ NEW FEATURES

- **Prisma-style type generation**: Advanced type system with exact union types from config values
- **Exact union types**: Generate precise types like `"smtp" | "sendgrid"` instead of generic `string`
- **Configuration consistency validation**: Cross-environment validation to ensure config coherence
- **Enhanced CLI tooling**: New CLI structure with improved type generation commands

## 🔧 ENHANCEMENTS

- **Improved type inference**: More precise and intelligent type generation from JSON configs
- **Better error handling**: Enhanced validation with detailed error reporting for config mismatches
- **Cleaner test output**: Debug messages silenced during test execution
- **Modular architecture**: Better separation of concerns with new `src/lib/` structure

## 📖 MIGRATION GUIDE

Users upgrading from v1.x should:
1. Review any custom imports that may reference internal paths
2. Regenerate types using the new CLI commands
3. Test configuration loading with the new validation system
4. Update any tests that rely on the previous test fixture structure