import { ConfigLoader } from './loader'
import { getNestedValue, getCurrentEnvironment } from './utils'
import { autoGenerateTypes } from './auto-types'

import type {
	ConfigPath,
	ConfigOptions,
	PathValue,
	ConfigObject,
	DetectedConfigType,
	AutoConfigPath,
	UserConfigSchema,
} from './types'

// Global configuration loader instance
let globalLoader: ConfigLoader | null = null

// Track if we've attempted auto type generation
let hasAttemptedAutoGeneration = false

/**
 * Ensure global loader is initialized with default options if not already present
 * @returns The global ConfigLoader instance
 */
function ensureGlobalLoader(): ConfigLoader {
	if (!globalLoader) {
		globalLoader = new ConfigLoader()
	}

	// Auto-generate types on first usage if not already done
	if (!hasAttemptedAutoGeneration) {
		hasAttemptedAutoGeneration = true
		autoGenerateTypes().catch(error => {
			console.error('❌ Type generation failed:', error)
			throw new Error(
				'Configuration type generation is required but failed',
			)
		})
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
 * Initialize the configuration system with optional type override
 *
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * // Basic initialization (uses automatic type detection)
 * initConfig({ configDir: './config' })
 *
 * // With explicit type override (optional)
 * initConfig<MyProjectConfigType>({ configDir: './config' })
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function initConfig<TSchema extends ConfigObject = UserConfigSchema>(
	options: ConfigOptions = {},
): void {
	globalLoader = new ConfigLoader(options)

	// Automatically generate types for the user project (mandatory)
	autoGenerateTypes(
		options.configDir ? { configDir: options.configDir } : {},
	).catch(error => {
		console.error('❌ Type generation failed during initialization:', error)
		throw new Error(
			'Configuration type generation is required but failed during initialization',
		)
	})
}

/**
 * Get configuration value with automatic type inference
 *
 * The types are automatically inferred from the user's config schema declaration
 * or fall back to generic types if no schema is provided.
 *
 * @param path - Optional configuration path with autocompletion
 * @param environment - Optional environment override
 * @returns Configuration value with precise type inference
 *
 * @example
 * ```typescript
 * // Automatic type inference (no generics needed!)
 * const config = getConfig() // DetectedConfigType - inferred from user schema
 * const emailFrom = getConfig('email.from') // Inferred type based on user schema
 * const database = getConfig('database') // Inferred section type
 *
 * // Optional type override (only if needed)
 * const customConfig = getConfig<MyCustomType>()
 * ```
 */
export function getConfig(): DetectedConfigType
export function getConfig<TPath extends AutoConfigPath>(
	path: TPath,
): PathValue<DetectedConfigType, TPath> | undefined
export function getConfig<TPath extends AutoConfigPath>(
	path: TPath,
	environment: string,
): PathValue<DetectedConfigType, TPath> | undefined
export function getConfig<TOverride extends ConfigObject = DetectedConfigType>(
	path?: ConfigPath<TOverride>,
	environment?: string,
): TOverride | PathValue<TOverride, ConfigPath<TOverride>> | undefined {
	const loader = ensureGlobalLoader()
	const resolvedEnv = resolveEnvironment(environment)
	const config = loader.loadConfig(resolvedEnv)

	// Return entire config if no path specified
	if (!path) {
		return config as unknown as TOverride
	}

	// Get nested value using dot notation
	return getNestedValue(config, path)
}

/**
 * Check if a configuration path exists with automatic type inference
 */
export function hasConfig<TPath extends AutoConfigPath>(path: TPath): boolean
export function hasConfig<TPath extends AutoConfigPath>(
	path: TPath,
	environment?: string,
): boolean
export function hasConfig<TOverride extends ConfigObject = DetectedConfigType>(
	path: ConfigPath<TOverride>,
	environment?: string,
): boolean {
	return getConfig(path as never, environment as never) !== undefined
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
 * Validate that required configuration paths exist with automatic type inference
 */
export function validateRequiredConfig<
	TOverride extends ConfigObject = DetectedConfigType,
>(
	requiredPaths: (ConfigPath<TOverride> | string)[],
	environment?: string,
): { valid: boolean; missing: (ConfigPath<TOverride> | string)[] } {
	const resolvedEnv = resolveEnvironment(environment)
	const missing: (ConfigPath<TOverride> | string)[] = []

	for (const path of requiredPaths) {
		if (getConfig(path as never, resolvedEnv) === undefined) {
			missing.push(path)
		}
	}

	return {
		valid: missing.length === 0,
		missing,
	}
}
