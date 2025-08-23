/**
 * Utility functions for type generation
 * Consolidates common logic used in type generation to reduce duplication
 */

import type { ConfigObject } from '../definitions/types.js'

/**
 * Check if value is a plain object (not array, null, or other types)
 */
export const isPlainObject = (
	value: unknown,
): value is Record<string, unknown> =>
	value !== null &&
	value !== undefined &&
	typeof value === 'object' &&
	!Array.isArray(value)

/**
 * Escape single quotes in string literals for TypeScript type generation
 */
export const escapeStringLiteral = (str: string): string =>
	str.replace(/'/g, "\\'")

/**
 * Convert a primitive value to its TypeScript literal type representation
 */
export const valueToLiteralType = (value: unknown): string => {
	if (value === null) return 'null'
	if (value === undefined) return 'undefined'

	switch (typeof value) {
		case 'string':
			return `'${escapeStringLiteral(value)}'`
		case 'number':
			return value.toString()
		case 'boolean':
			return value.toString()
		default:
			return 'unknown'
	}
}

/**
 * Convert an array to its TypeScript type representation
 */
export const arrayToType = (arr: unknown[]): string => {
	const uniqueTypes = new Set<string>()

	for (const item of arr) {
		if (Array.isArray(item)) {
			// Nested array
			uniqueTypes.add(arrayToType(item))
		} else if (isPlainObject(item)) {
			// Object in array - mark as unknown for now
			uniqueTypes.add('unknown')
		} else {
			// Primitive value
			uniqueTypes.add(valueToLiteralType(item))
		}
	}

	const elementType =
		uniqueTypes.size === 0 ? 'unknown' : Array.from(uniqueTypes).join(' | ')

	return `readonly (${elementType})[]`
}

/**
 * Create a TypeScript union type from a set of values
 */
export const createUnionType = (values: Set<unknown>): string => {
	if (values.size === 0) return 'unknown'

	// Single value - return its literal type
	if (values.size === 1) {
		const value = Array.from(values)[0]
		if (Array.isArray(value)) {
			return arrayToType(value)
		}
		return valueToLiteralType(value)
	}

	// Multiple values - create union type
	const types: string[] = []

	for (const value of values) {
		if (Array.isArray(value)) {
			types.push(arrayToType(value))
		} else if (isPlainObject(value)) {
			// For objects, we'll use unknown for now
			// In a real scenario, we might want to generate interfaces
			types.push('unknown')
		} else {
			types.push(valueToLiteralType(value))
		}
	}

	return types.join(' | ')
}

/**
 * Collect all values for each property path across multiple configurations
 * This is used to determine union types for properties that vary across environments
 */
export const collectPropertyValues = (
	configs: Record<string, ConfigObject>,
	currentPath = '',
): Map<string, Set<unknown>> => {
	const allValues = new Map<string, Set<unknown>>()

	// Filter out null/undefined configs
	const validConfigs = Object.values(configs).filter(
		(config): config is ConfigObject => isPlainObject(config),
	)

	if (validConfigs.length === 0) return allValues

	// Get all unique keys from all configs
	const allKeys = new Set<string>()
	for (const config of validConfigs) {
		for (const key of Object.keys(config)) {
			allKeys.add(key)
		}
	}

	// Process each key
	for (const key of allKeys) {
		const fullPath = currentPath ? `${currentPath}.${key}` : key
		const valuesForKey = new Set<unknown>()
		const nestedConfigs: Record<string, ConfigObject> = {}

		for (const [envName, envConfig] of Object.entries(configs)) {
			if (!isPlainObject(envConfig) || !(key in envConfig)) continue

			const value = envConfig[key]

			if (isPlainObject(value)) {
				// Collect nested object for recursive processing
				nestedConfigs[envName] = value as ConfigObject
			} else {
				// Collect primitive or array value
				valuesForKey.add(value)
			}
		}

		// If we have primitive values, add them to the map
		if (valuesForKey.size > 0) {
			allValues.set(fullPath, valuesForKey)
		}

		// Recursively process nested objects
		if (Object.keys(nestedConfigs).length > 0) {
			const nestedValues = collectPropertyValues(nestedConfigs, fullPath)
			for (const [path, values] of nestedValues) {
				allValues.set(path, values)
			}
		}
	}

	return allValues
}

/**
 * Get all property paths from a configuration object
 * Used for consistency validation
 */
export const getConfigPaths = (obj: ConfigObject, prefix = ''): Set<string> => {
	const paths = new Set<string>()

	for (const [key, value] of Object.entries(obj)) {
		const fullPath = prefix ? `${prefix}.${key}` : key
		paths.add(fullPath)

		if (isPlainObject(value)) {
			const nestedPaths = getConfigPaths(value as ConfigObject, fullPath)
			for (const path of nestedPaths) {
				paths.add(path)
			}
		}
	}

	return paths
}

/**
 * Validate configuration consistency across environments
 * Ensures all environments have the same structure
 */
export interface ConsistencyValidationResult {
	valid: boolean
	errors: string[]
}

export const validateConfigurationConsistency = (
	configs: Record<string, ConfigObject>,
	excludeDefault = true,
): ConsistencyValidationResult => {
	// Filter environments (optionally excluding 'default')
	const environments = Object.keys(configs).filter(
		env =>
			(!excludeDefault || env !== 'default') &&
			isPlainObject(configs[env]),
	)

	if (environments.length < 2) {
		return { valid: true, errors: [] }
	}

	// Collect all paths from all environments
	const pathsByEnv = new Map<string, Set<string>>()

	for (const env of environments) {
		const config = configs[env]
		if (config) {
			pathsByEnv.set(env, getConfigPaths(config))
		}
	}

	// Find inconsistencies
	const allPaths = new Set<string>()
	for (const paths of pathsByEnv.values()) {
		for (const path of paths) {
			allPaths.add(path)
		}
	}

	const errors: string[] = []

	for (const path of allPaths) {
		const envsWithPath = environments.filter(env =>
			pathsByEnv.get(env)?.has(path),
		)
		const missingEnvs = environments.filter(
			env => !envsWithPath.includes(env),
		)

		if (missingEnvs.length > 0) {
			errors.push(
				`Property '${path}' exists in [${envsWithPath.join(', ')}] but missing in [${missingEnvs.join(', ')}]`,
			)
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	}
}

/**
 * Generate TypeScript interface properties from collected values
 */
export const generateInterfaceProperties = (
	configs: Record<string, ConfigObject>,
	propertyValues: Map<string, Set<unknown>>,
	currentPath = '',
	depth = 0,
): string => {
	const indent = '  '.repeat(depth)
	const validConfigs = Object.values(configs).filter(
		(config): config is ConfigObject => isPlainObject(config),
	)

	if (validConfigs.length === 0) {
		return 'Record<string, unknown>'
	}

	// Get all keys from all configs
	const allKeys = new Set<string>()
	for (const config of validConfigs) {
		for (const key of Object.keys(config)) {
			allKeys.add(key)
		}
	}

	const properties: string[] = []

	for (const key of Array.from(allKeys).sort()) {
		const fullPath = currentPath ? `${currentPath}.${key}` : key

		// Check if this path has collected values (primitive types)
		if (propertyValues.has(fullPath)) {
			const values = propertyValues.get(fullPath)!
			const unionType = createUnionType(values)
			properties.push(`${indent}  readonly ${key}: ${unionType}`)
		} else {
			// This must be a nested object - recurse
			const nestedConfigs: Record<string, ConfigObject> = {}

			for (const [env, envConfig] of Object.entries(configs)) {
				if (isPlainObject(envConfig) && key in envConfig) {
					const nestedValue = envConfig[key]
					if (isPlainObject(nestedValue)) {
						nestedConfigs[env] = nestedValue as ConfigObject
					}
				}
			}

			if (Object.keys(nestedConfigs).length > 0) {
				const nestedType = generateInterfaceProperties(
					nestedConfigs,
					propertyValues,
					fullPath,
					depth + 1,
				)
				properties.push(`${indent}  readonly ${key}: ${nestedType}`)
			} else {
				properties.push(`${indent}  readonly ${key}: unknown`)
			}
		}
	}

	return `{\n${properties.join('\n')}\n${indent}}`
}

/**
 * Format a TypeScript module declaration
 */
export const formatModuleDeclaration = (
	interfaceContent: string,
	configDir: string,
	hash?: string,
): string => {
	const hashComment = hash ? ` * Generated hash: ${hash}\n` : ''

	return `/**
 * Auto-generated type definitions from JSON configuration files
 * Generated from: ${configDir}
 * DO NOT EDIT MANUALLY - This file is automatically generated
${hashComment} */

declare module '@nextnode/config-manager' {
  interface UserConfigSchema ${interfaceContent}
}

export {}
`
}
