# @nextnode/config-manager

## 3.1.4

### Patch Changes

- [#31](https://github.com/NextNodeSolutions/config-manager/pull/31) [`bf718cd`](https://github.com/NextNodeSolutions/config-manager/commit/bf718cd44c27bf820ebf5d33e1b2d35e77e12f9f) Thanks [@walid-mos](https://github.com/walid-mos)! - Update README with latest dependency versions info

  Added note about recent dependency updates including Vite 7.x, TypeScript 5.9, and Biome 2.x to highlight compatibility with latest tooling.

  This changeset also serves as a test for the fixed automated release workflow.

## 3.1.3

### Patch Changes

- [#29](https://github.com/NextNodeSolutions/config-manager/pull/29) [`a5ce7e8`](https://github.com/NextNodeSolutions/config-manager/commit/a5ce7e8939cfc1cf586632c7dfe15c6465d84035) Thanks [@walid-mos](https://github.com/walid-mos)! - Update all packages to latest versions

  Updated dependencies:

  - Vite: 6.3.5 → 7.1.5 (major version bump)
  - TypeScript: 5.8.3 → 5.9.2 (minor version bump)
  - Biome: 1.9.4 → 2.2.3 (major version bump with config migration)
  - Vitest: 3.1.4 → 3.2.4 (minor version bump)
  - ESLint: 9.27.0 → 9.35.0 (minor version bump)
  - Other dev dependencies updated to latest versions

  Migrated Biome configuration to new schema format.
  All tests pass (128/128) and type checking successful.

## 3.1.2

### Patch Changes

- [#24](https://github.com/NextNodeSolutions/config-manager/pull/24) [`f27046b`](https://github.com/NextNodeSolutions/config-manager/commit/f27046b76cbb058404b282df92d243e4f37fa2fd) Thanks [@walid-mos](https://github.com/walid-mos)! - Repository structure cleanup and coverage configuration improvements

  - Remove unnecessary documentation files (CHANGELOG.md, README_CHANGESETS.md)
  - Remove misplaced src/README.md file
  - Delete unused empty .github-actions directory
  - Configure Vitest coverage output to src/**tests**/coverage directory
  - Improve overall project organization and maintainability

- [`4b341fe`](https://github.com/NextNodeSolutions/config-manager/commit/4b341fe8466bf10d924a02ed5d9cc099c22dcf2d) Thanks [@walid-mos](https://github.com/walid-mos)! - Fix automated NPM release workflow

  - Fixed GitHub Actions workflow to properly push version commits
  - Removed unused updateInternalDependencies configuration
  - Improved automated release pipeline for seamless NPM publishing
