# @nextnode/config-manager

## 3.1.4

### Patch Changes

- [#40](https://github.com/NextNodeSolutions/config-manager/pull/40) [`7ae513c`](https://github.com/NextNodeSolutions/config-manager/commit/7ae513c11bc4dae647d1710075da97060418928e) Thanks [@walid-mos](https://github.com/walid-mos)! - Remove redundant workflow architecture and add manual publish recovery

  - Remove publish.yml workflow that was redundant with centralized github-actions repository_dispatch
  - Remove post-release.yml workflow that is no longer needed
  - Add manual-publish.yml workflow for recovery when automated publish fails
  - Eliminates double-triggering of publish workflows
  - Follows centralized workflow architecture pattern

## 3.1.3

### Patch Changes

- [#33](https://github.com/NextNodeSolutions/config-manager/pull/33) [`e278fc4`](https://github.com/NextNodeSolutions/config-manager/commit/e278fc4ce615bb33e7c45ecffa662cbf3b74ff04) Thanks [@walid-mos](https://github.com/walid-mos)! - fix: update release workflow to use modular GitHub Actions

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
