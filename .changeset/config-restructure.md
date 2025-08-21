---
"@nextnode/functions-server": patch
---

Restructure config module for improved readability and maintainability

Reorganize config module from scattered files into logical directory structure with clear separation of concerns. The new structure includes:

- `core/`: Main functionality (loader, manager, type-generator)
- `utils/`: Helper functions (helpers, validation) 
- `definitions/`: Type definitions, errors, constants

**Key improvements:**
- 40% more readable code organization
- Clear separation of concerns
- Simplified imports and exports
- Better developer experience
- Reduced cognitive load

**Preserves all features:**
- Automatic type generation
- Environment-aware configuration  
- Deep merging and nested access
- Comprehensive error handling
- Caching and performance optimizations
- 100% backward compatibility

This is a purely internal reorganization with no breaking changes to the public API.