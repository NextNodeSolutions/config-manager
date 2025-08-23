---
"@nextnode/config-manager": patch
---

Fix ESM imports and add generate-config binary command

- Fix all TypeScript import statements to include .js extensions for ESM compatibility
- Make initConfig() async to properly await type generation  
- Add `generate-config` binary for automatic type generation from package scripts
- Implement auto-detection of user projects in generate-types.js
- Add executable permissions to generated binary file
- Update build process with postbuild chmod for npm compatibility

The config-manager now provides a `generate-config` command that can be called from package.json scripts to automatically generate types/config.d.ts when configuration files change.