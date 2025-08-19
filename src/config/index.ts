import { ConfigLoader } from './loader'
import { getNestedValue, getCurrentEnvironment } from './utils'

import type {
	ConfigValue,
	ConfigPath,
	ConfigOptions,
	BaseConfigSchema,
} from './types'

// Global configuration loader instance
let globalLoader: ConfigLoader | null = null

/**
 * Ensure global loader is initialized with default options if not already present
 * @returns The global ConfigLoader instance
 */
function ensureGlobalLoader(): ConfigLoader {
	if (!globalLoader) {
		globalLoader = new ConfigLoader()
	}
	return globalLoader
}

/**
 * Resolve environment parameter, falling back to current environment
 * @param environment - Optional environment override
 * @returns Resolved environment string
 */
function resolveEnvironment(environment?: string): string {
	return environment || getCurrentEnvironment()
}

/**
 * Initialize the configuration system
 */
export function initConfig(options: ConfigOptions = {}): void {
	globalLoader = new ConfigLoader(options)
}

/**
 * Get configuration value with automatic type inference
 *
 * @param path - Configuration path (e.g., 'email.from', 'app.name')
 * @param environment - Optional environment override
 * @returns Configuration value or undefined if not found
 *
 * @example
 * ```typescript
 * // Get entire config
 * const config = getConfig()
 *
 * // Get specific values with path
 * const emailFrom = getConfig('email.from')
 * const appFeatures = getConfig('app.features')
 *
 * // With type override
 * const customConfig = getConfig<MyCustomType>('custom.path')
 * ```
 */
export function getConfig<T = ConfigValue>(
	path?: string | string[],
	environment?: string,
): T | undefined {
	const loader = ensureGlobalLoader()
	const resolvedEnv = resolveEnvironment(environment)
	const config = loader.loadConfig(resolvedEnv)

	// Return entire config if no path specified
	if (!path) {
		return config as T
	}

	// Get nested value using dot notation
	return getNestedValue<T>(config, path)
}

/**
 * Check if a configuration path exists
 */
export function hasConfig<TSchema extends BaseConfigSchema = BaseConfigSchema>(
	path: ConfigPath<TSchema> | string | string[],
	environment?: string,
): boolean {
	return getConfig(path, resolveEnvironment(environment)) !== undefined
}

/**
 * Get current environment name
 */
export function getEnvironment(): string {
	return getCurrentEnvironment()
}

/**
 * Clear configuration cache (useful for testing or hot reloading)
 */
export function clearConfigCache(): void {
	if (globalLoader) {
		globalLoader.clearCache()
	}
}

/**
 * Get all available configuration environments
 */
export function getAvailableEnvironments(): string[] {
	const loader = ensureGlobalLoader()
	return loader.getAvailableConfigs()
}

/**
 * Validate that required configuration paths exist
 */
export function validateRequiredConfig<
	TSchema extends BaseConfigSchema = BaseConfigSchema,
>(
	requiredPaths: (ConfigPath<TSchema> | string | string[])[],
	environment?: string,
): { valid: boolean; missing: (ConfigPath<TSchema> | string | string[])[] } {
	const resolvedEnv = resolveEnvironment(environment)
	const missing: (ConfigPath<TSchema> | string | string[])[] = []

	for (const path of requiredPaths) {
		if (!hasConfig(path, resolvedEnv)) {
			missing.push(path)
		}
	}

	return {
		valid: missing.length === 0,
		missing,
	}
}

// Re-export types for convenience
export type {
	ConfigObject,
	ConfigValue,
	ConfigPath,
	ConfigOptions,
	BaseConfigSchema,
} from './types'

// Re-export utilities for advanced usage
export { deepMerge, getNestedValue, setNestedValue } from './utils'
export { ConfigLoader } from './loader'

// Re-export error classes for error handling
export {
	ConfigError,
	ConfigNotFoundError,
	InvalidEnvironmentError,
	InvalidConfigFormatError,
	InvalidJsonSyntaxError,
	DefaultConfigMissingError,
	AppEnvRequiredError,
	AppEnvUnavailableError,
	ConfigDirNotFoundError,
} from './errors'

// Re-export constants for external usage
export {
	VALID_ENVIRONMENTS,
	ERROR_CODES,
	ENV_VARS,
} from './constants'
