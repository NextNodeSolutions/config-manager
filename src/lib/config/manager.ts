import { getNestedValue } from '@/lib/utils/helpers.js'
import { resolveEnvironment } from '@/lib/utils/validation.js'
import { autoGenerateTypes } from '@/lib/types/generator.js'
import { ConfigurationPathError } from '@/lib/definitions/errors.js'

import { ConfigLoader } from './loader.js'

import type {
	ConfigOptions,
	PathValue,
	DetectedConfigType,
	AutoConfigPath,
	UserConfigSchema,
} from '@/lib/definitions/types.js'

// Global configuration loader instance
let globalLoader: ConfigLoader | null = null

/**
 * Ensure global loader is initialized with default options if not already present
 */
const ensureGlobalLoader = (): ConfigLoader => {
	if (!globalLoader) {
		globalLoader = new ConfigLoader()
	}

	return globalLoader
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
export const initConfig = async <TSchema = UserConfigSchema>(
	options: ConfigOptions = {},
): Promise<void> => {
	globalLoader = new ConfigLoader(options)

	// Automatically generate types for the user project (mandatory)
	try {
		await autoGenerateTypes(
			options.configDir ? { configDir: options.configDir } : {},
		)
	} catch (error) {
		console.error('❌ Type generation failed during initialization:', error)
		throw new Error(
			'Configuration type generation is required but failed during initialization',
		)
	}
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
export function getConfig(
	path: undefined,
	environment: string,
): DetectedConfigType
export function getConfig<TPath extends AutoConfigPath>(
	path: TPath,
): PathValue<UserConfigSchema, TPath>
export function getConfig<TPath extends AutoConfigPath>(
	path: TPath,
	environment: string,
): PathValue<UserConfigSchema, TPath>
export function getConfig<TOverride = DetectedConfigType>(
	path?: string,
	environment?: string,
): TOverride | PathValue<UserConfigSchema, AutoConfigPath> {
	const loader = ensureGlobalLoader()
	const resolvedEnv = resolveEnvironment(environment)
	const config = loader.loadConfig(resolvedEnv)

	// Return entire config if no path specified (deeply readonly)
	if (!path) {
		return config as TOverride
	}

	// Get nested value using dot notation
	const value = getNestedValue(config, path)
	if (value === undefined) {
		throw new ConfigurationPathError(
			path,
			resolvedEnv,
			loader.getConfigDirectory?.(),
		)
	}
	return value as PathValue<UserConfigSchema, AutoConfigPath>
}

/**
 * Check if a configuration path exists with automatic type inference
 */
export function hasConfig<TPath extends AutoConfigPath>(path: TPath): boolean
export function hasConfig<TPath extends AutoConfigPath>(
	path: TPath,
	environment?: string,
): boolean
export function hasConfig(path: string, environment?: string): boolean {
	try {
		const value = getNestedValue(
			ensureGlobalLoader().loadConfig(resolveEnvironment(environment)),
			path,
		)
		return value !== undefined
	} catch {
		return false
	}
}

/**
 * Get current environment name
 */
export const getEnvironment = (): string => resolveEnvironment()

/**
 * Clear configuration cache (useful for testing or hot reloading)
 */
export const clearConfigCache = (): void => {
	if (globalLoader) {
		globalLoader.clearCache()
	}
}

/**
 * Get all available configuration environments
 */
export const getAvailableEnvironments = (): string[] => {
	const loader = ensureGlobalLoader()
	return loader.getAvailableConfigs()
}

/**
 * Validate that required configuration paths exist with automatic type inference
 */
export const validateRequiredConfig = (
	requiredPaths: string[],
	environment?: string,
): { valid: boolean; missing: string[] } => {
	const resolvedEnv = resolveEnvironment(environment)
	const missing: string[] = []

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
