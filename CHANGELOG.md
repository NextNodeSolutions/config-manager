# @nextnode/functions-server

## 1.0.1

### Patch Changes

- [#8](https://github.com/NextNodeSolutions/functions-server/pull/8) [`80ef43b`](https://github.com/NextNodeSolutions/functions-server/commit/80ef43bb563e1e3f0582d0dd8c300f603dc6208f) Thanks [@walid-mos](https://github.com/walid-mos)! - Fix type generation by excluding invalid test files. Prevents error warnings during type checking while maintaining test file integrity.

## 1.0.0

### Major Changes

- [#3](https://github.com/NextNodeSolutions/functions-server/pull/3) [`22e3d18`](https://github.com/NextNodeSolutions/functions-server/commit/22e3d18659e3f7f8e329147a2201ef90599e4387) Thanks [@walid-mos](https://github.com/walid-mos)! - Initialize Project

### Minor Changes

- [#5](https://github.com/NextNodeSolutions/functions-server/pull/5) [`f03ed55`](https://github.com/NextNodeSolutions/functions-server/commit/f03ed5563d89284d5140245914e7dc6364725433) Thanks [@walid-mos](https://github.com/walid-mos)! - Add complete configuration management system with environment support, caching, and validation

  This adds a comprehensive configuration management system that supports:

  - Environment-specific configurations (local, dev, prod, test)
  - JSON configuration file loading with validation
  - Configuration caching for performance
  - Deep merging of configuration objects
  - Dot notation path access (e.g., 'email.from')
  - Type-safe configuration interfaces
  - Automatic environment detection via APP_ENV

### Patch Changes

- [#6](https://github.com/NextNodeSolutions/functions-server/pull/6) [`51e9362`](https://github.com/NextNodeSolutions/functions-server/commit/51e93624671f9b1ba950b13c62bfa61b023dca80) Thanks [@walid-mos](https://github.com/walid-mos)! - Micro changeset to satisfy CI requirements
