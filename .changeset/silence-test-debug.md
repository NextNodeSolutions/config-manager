---
"@nextnode/config-manager": patch
---

Silence debug messages during test execution

- Set NODE_ENV=test in Vitest configuration to detect test environment
- Only show debug messages when not in test mode
- Improves test output readability by hiding unnecessary debug info