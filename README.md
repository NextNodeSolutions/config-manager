# @nextnode/functions-server

A TypeScript library for server-side configuration management, designed to provide flexible, environment-aware configuration loading with type safety and validation.

## Features

- 🔧 **Environment-based configuration** - Support for multiple environments (development, staging, production)
- 🛡️ **Type-safe configuration** - Full TypeScript support with proper type definitions
- 📁 **Flexible file structure** - Load configurations from various file formats
- 🎯 **Dot notation access** - Easy access to nested configuration values
- 🔄 **Caching system** - Optimized performance with intelligent caching
- ✅ **Configuration validation** - Built-in validation for required configuration paths
- 🌍 **Environment detection** - Automatic environment detection with manual override

## Installation

```bash
npm install @nextnode/functions-server
```

Or with pnpm:

```bash
pnpm add @nextnode/functions-server
```

Or with yarn:

```bash
yarn add @nextnode/functions-server
```

## Quick Start

### Basic Usage

```typescript
import { initConfig, getConfig } from '@nextnode/functions-server'

// Initialize the configuration system
initConfig({
  configDir: './config',  // optional, defaults to './config'
  environment: 'development',  // optional, auto-detected from NODE_ENV
  cache: true  // optional, defaults to true
})

// Get configuration values
const appName = getConfig<string>('app.name')
const emailProvider = getConfig<string>('email.provider')
const features = getConfig<string[]>('app.features')

// Get entire configuration sections
const emailConfig = getConfig('email')
const appConfig = getConfig('app')
```

### Configuration File Structure

Create configuration files in your project's `config` directory:

```
config/
├── default.json          # Base configuration
├── development.json      # Development overrides
├── staging.json         # Staging overrides
└── production.json      # Production overrides
```

**Example `config/default.json`:**
```json
{
  "app": {
    "name": "My Application",
    "version": "1.0.0",
    "features": ["authentication", "analytics"],
    "environment": "development"
  },
  "email": {
    "provider": "resend",
    "from": "noreply@example.com",
    "to": "admin@example.com",
    "templates": {
      "projectRequest": {
        "subject": "New Project Request",
        "companyName": "Your Company",
        "websiteUrl": "https://example.com"
      }
    }
  }
}
```

**Example `config/production.json`:**
```json
{
  "app": {
    "environment": "production"
  },
  "email": {
    "provider": "nodemailer",
    "from": "noreply@yourcompany.com",
    "to": "admin@yourcompany.com"
  }
}
```

## API Reference

### Configuration Functions

#### `initConfig(options?)`
Initialize the configuration system with custom options.

```typescript
initConfig({
  environment?: string    // Override auto-detected environment
  configDir?: string     // Custom config directory path
  cache?: boolean        // Enable/disable caching (default: true)
})
```

#### `getConfig<T>(path?, environment?)`
Get configuration value using dot notation.

```typescript
// Get specific values
const value = getConfig<string>('email.from')
const features = getConfig<string[]>('app.features')

// Get entire sections
const emailConfig = getConfig('email')
const allConfig = getConfig()  // Get everything

// Override environment for specific call
const prodEmail = getConfig('email.from', 'production')
```

#### `getTypedConfig<T>(path, environment?)`
Get configuration with enhanced type safety for known config keys.

```typescript
const emailConfig = getTypedConfig('email')  // Returns EmailConfig
const appConfig = getTypedConfig('app')      // Returns AppConfig
```

#### `hasConfig(path, environment?)`
Check if a configuration path exists.

```typescript
if (hasConfig('email.templates.welcome')) {
  // Configuration exists
}
```

#### `validateRequiredConfig(requiredPaths, environment?)`
Validate that required configuration paths exist.

```typescript
const validation = validateRequiredConfig([
  'app.name',
  'email.from',
  'email.provider'
])

if (!validation.valid) {
  console.error('Missing required config:', validation.missing)
}
```

### Utility Functions

#### `getEnvironment()`
Get the current environment name.

```typescript
const env = getEnvironment()  // 'development', 'staging', 'production', etc.
```

#### `getAvailableEnvironments()`
Get list of all available configuration environments.

```typescript
const environments = getAvailableEnvironments()
// ['default', 'development', 'staging', 'production']
```

#### `clearConfigCache()`
Clear the configuration cache (useful for testing or hot reloading).

```typescript
clearConfigCache()
```

### Advanced Utilities

#### `deepMerge(target, source)`
Deep merge configuration objects.

```typescript
import { deepMerge } from '@nextnode/functions-server'

const merged = deepMerge(baseConfig, overrideConfig)
```

#### `getNestedValue<T>(object, path)`
Get nested value using dot notation.

```typescript
import { getNestedValue } from '@nextnode/functions-server'

const value = getNestedValue(config, 'email.templates.welcome.subject')
```

#### `setNestedValue(object, path, value)`
Set nested value using dot notation.

```typescript
import { setNestedValue } from '@nextnode/functions-server'

setNestedValue(config, 'email.provider', 'sendgrid')
```

## TypeScript Support

The library includes comprehensive TypeScript definitions:

```typescript
interface EmailConfig {
  provider: 'resend' | 'nodemailer'
  from: string
  to: string
  replyTo?: string
  templates: {
    projectRequest: {
      subject: string
      companyName: string
      websiteUrl: string
      companyLogo?: string
    }
  }
}

interface AppConfig {
  name: string
  version: string
  features: string[]
  environment: string
}

interface RootConfig {
  email: EmailConfig
  app: AppConfig
}
```

## Environment Detection

The configuration system automatically detects the environment in this order:

1. `environment` option passed to `initConfig()`
2. `NODE_ENV` environment variable
3. Defaults to `'development'`

## Configuration Loading Priority

Configurations are merged in this order (later configs override earlier ones):

1. `default.json` - Base configuration
2. `{environment}.json` - Environment-specific configuration  
3. `local.json` - Local overrides (git-ignored, optional)

## Best Practices

### 1. Organize by Feature
```json
{
  "database": {
    "host": "localhost",
    "port": 5432
  },
  "redis": {
    "host": "localhost", 
    "port": 6379
  },
  "email": {
    "provider": "resend"
  }
}
```

### 2. Use Environment Variables for Secrets
```json
{
  "database": {
    "password": "${DATABASE_PASSWORD}"
  },
  "email": {
    "apiKey": "${EMAIL_API_KEY}"
  }
}
```

### 3. Validate Required Configuration
```typescript
// At application startup
const validation = validateRequiredConfig([
  'database.host',
  'database.password',
  'email.apiKey'
])

if (!validation.valid) {
  console.error('Missing required configuration:', validation.missing)
  process.exit(1)
}
```

### 4. Use TypeScript for Type Safety
```typescript
// Define your configuration interface
interface MyAppConfig {
  database: {
    host: string
    port: number
    ssl: boolean
  }
  api: {
    timeout: number
    retries: number
  }
}

// Use typed access
const dbConfig = getConfig<MyAppConfig['database']>('database')
```

## Troubleshooting

### Configuration Not Found
- Verify the config directory path
- Check file naming (must match environment name)
- Ensure JSON syntax is valid

### Type Errors
- Ensure TypeScript types match your configuration structure
- Use generic types for custom configuration schemas
- Check that optional fields are properly marked

### Environment Issues
- Verify `NODE_ENV` is set correctly
- Use `getEnvironment()` to debug current environment
- Check `getAvailableEnvironments()` for valid options

## Contributing

We welcome contributions! Please ensure your code:

- Follows TypeScript best practices
- Includes proper type definitions
- Has comprehensive test coverage
- Follows the existing code style

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build
pnpm build
```

## License

ISC