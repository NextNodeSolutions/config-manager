# Configuration System with Automatic Type Inference

This configuration system provides **automatic type inference** from your project's JSON configuration files without requiring explicit type annotations.

## Basic Usage

```typescript
import { initConfig, getConfig } from '@nextnode/functions-server'

// Initialize with your config directory
initConfig({ configDir: './config' })

// Get configuration with automatic type inference
const config = getConfig()  // Automatically typed!
const emailFrom = getConfig('email.from')  // Precise type inference
const database = getConfig('database')  // Section-level inference
```

## Automatic Type Inference

The system automatically detects your configuration structure. No generics required!

```typescript
// These work automatically with precise types:
const config = getConfig()
const appName = config.app.name      // string (no optional chaining needed!)
const features = config.app.features // string[]
const dbPort = config.database.port  // number
```

## Advanced: Custom Type Schema (Optional)

For even more precise types, you can declare your config schema:

```typescript
// In your project, add this declaration:
declare module '@nextnode/functions-server' {
  interface UserConfigSchema {
    app: {
      name: string
      debug: boolean
      features: string[]
    }
    email: {
      from: string
      provider: 'sendgrid' | 'mock' | 'console'
    }
    database: {
      host: string
      port: number
      ssl?: boolean
    }
  }
}

// Now getConfig() uses your exact types:
const provider = getConfig('email.provider')  // 'sendgrid' | 'mock' | 'console'
const isDebug = getConfig('app.debug')        // boolean
```

## API Reference

### `initConfig<T>(options?)`
- **`options.configDir`**: Path to config directory (default: `./config`)
- **`T`**: Optional type override (rarely needed)

### `getConfig()` / `getConfig(path)`
- **No generics needed** - types are automatically inferred
- **`getConfig()`**: Returns full configuration object
- **`getConfig(path)`**: Returns value at specific path with type narrowing
- **`getConfig<T>()`**: Optional type override for custom schemas

### `hasConfig(path)` / `validateRequiredConfig(paths)`
- Check if configuration paths exist
- Automatic type inference for path validation

## File Structure

```
your-project/
├── config/
│   ├── default.json     # Base configuration
│   ├── dev.json         # Development overrides  
│   ├── prod.json        # Production overrides
│   └── test.json        # Test overrides
└── src/
    └── app.ts
```

The system automatically merges `default.json + environment.json` and infers precise types from the merged result.