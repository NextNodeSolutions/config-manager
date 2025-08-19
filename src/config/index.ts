import { ConfigLoader } from './loader'
import { getNestedValue, getCurrentEnvironment } from './utils'
import { ConfigDirRequiredError } from './errors'

import type {
	ConfigValue,
	ConfigPath,
	ConfigOptions,
	RootConfig,
} from './types'

// Global configuration loader instance
let globalLoader: ConfigLoader | null = null

/**
 * Ensure global loader is initialized - throws error if not initialized
 * @returns The global ConfigLoader instance
 * @throws {ConfigDirRequiredError} When no global loader has been initialized
 */
function ensureGlobalLoader(): ConfigLoader {
	if (!globalLoader) {
		throw new ConfigDirRequiredError()
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
 * Get configuration value using dot notation
 *
 * @param path - Configuration path (e.g., 'email.from', 'app.name')
 * @param environment - Optional environment override
 * @returns Configuration value or undefined if not found
 *
 * @example
 * ```typescript
 * // Get email configuration
 * const emailConfig = getConfig<EmailConfig>('email')
 *
 * // Get specific email value
 * const fromEmail = getConfig<string>('email.from')
 *
 * // Get array value
 * const features = getConfig<string[]>('app.features')
 * ```
 */
export function getConfig<T = ConfigValue>(
	path?: ConfigPath,
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
 * Get configuration with type safety for the root config
 */
export function getTypedConfig<T extends keyof RootConfig>(
	path: T,
	environment?: string,
): RootConfig[T] | undefined {
	return getConfig<RootConfig[T]>(path, resolveEnvironment(environment))
}

/**
 * Check if a configuration path exists
 */
export function hasConfig(path: ConfigPath, environment?: string): boolean {
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
 * Reset global loader (useful for testing)
 * @internal
 */
export function resetGlobalLoader(): void {
	globalLoader = null
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
export function validateRequiredConfig(
	requiredPaths: ConfigPath[],
	environment?: string,
): { valid: boolean; missing: ConfigPath[] } {
	const resolvedEnv = resolveEnvironment(environment)
	const missing: ConfigPath[] = []

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
	EmailConfig,
	AppConfig,
	RootConfig,
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
	ConfigDirRequiredError,
} from './errors'

// Re-export constants for external usage
export {
	VALID_ENVIRONMENTS,
	ERROR_CODES,
	ENV_VARS,
} from './constants'
