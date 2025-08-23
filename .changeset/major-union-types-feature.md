---
"@nextnode/config-manager": minor
---

Implement exact union types and configuration consistency validation

- **NEW**: Exact union type generation from actual config values (e.g., `"smtp" | "sendgrid"` instead of `string`)
- **NEW**: Configuration consistency validation across environments
- **BREAKING**: Restructured project architecture - moved core logic to `src/lib/` with better separation
- **ENHANCEMENT**: Improved type generation with more precise type inference
- **ENHANCEMENT**: Better error handling and validation for configuration mismatches
- **FIX**: Silence debug messages during test execution for cleaner test output