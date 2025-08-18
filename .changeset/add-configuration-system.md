---
"@nextnode/functions-server": minor
---

Add complete configuration management system with environment support, caching, and validation

This adds a comprehensive configuration management system that supports:
- Environment-specific configurations (local, dev, prod, test)
- JSON configuration file loading with validation
- Configuration caching for performance
- Deep merging of configuration objects
- Dot notation path access (e.g., 'email.from')
- Type-safe configuration interfaces
- Automatic environment detection via APP_ENV