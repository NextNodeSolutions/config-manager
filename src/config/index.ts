import { ConfigLoader } from './loader'
import { getNestedValue, getCurrentEnvironment } from './utils'

import type {
	ConfigValue,
	ConfigPath,
	ConfigOptions,
	RootConfig,
} from './types'

// Global configuration loader instance
let globalLoader: ConfigLoader | null = null

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
	// Initialize with default options if not already initialized
	if (!globalLoader) {
		globalLoader = new ConfigLoader()
	}

	const config = globalLoader.loadConfig(environment)

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
	return getConfig<RootConfig[T]>(path, environment)
}

/**
 * Check if a configuration path exists
 */
export function hasConfig(path: ConfigPath, environment?: string): boolean {
	return getConfig(path, environment) !== undefined
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
	if (!globalLoader) {
		globalLoader = new ConfigLoader()
	}

	return globalLoader.getAvailableConfigs()
}

/**
 * Validate that required configuration paths exist
 */
export function validateRequiredConfig(
	requiredPaths: ConfigPath[],
	environment?: string,
): { valid: boolean; missing: ConfigPath[] } {
	const missing: ConfigPath[] = []

	for (const path of requiredPaths) {
		if (!hasConfig(path, environment)) {
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
