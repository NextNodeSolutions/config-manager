---
"@nextnode/config-manager": patch
---

Fix TypeScript path resolution in build output

- Add tsc-alias dependency to resolve @/ paths during build process
- Update build script to run tsc-alias after TypeScript compilation  
- Fix module resolution issue where @/lib paths weren't resolved in dist output
- Ensure built package can be imported correctly from external projects
- All existing functionality preserved with improved build reliability