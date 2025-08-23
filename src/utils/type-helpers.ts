/**
 * Shared utilities for type generation and manipulation
 * Extracted to eliminate duplication across generate-types.js and type-generator.ts
 */

import type { ConfigValue } from '../definitions/types.js'

/**
 * Escape single quotes in string literals for TypeScript type generation
 */
export const escapeStringLiteral = (value: string): string =>
	value.replace(/'/g, "\\'")

/**
 * Convert a primitive value to its TypeScript literal type representation
 */
export const primitiveToLiteralType = (value: ConfigValue): string => {
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
 * Convert array values to TypeScript array type with union of element types
 */
export const arrayToType = (values: unknown[]): string => {
	const uniqueTypes = new Set<string>()

	for (const item of values) {
		if (item === null) {
			uniqueTypes.add('null')
		} else if (item === undefined) {
			uniqueTypes.add('undefined')
		} else if (typeof item === 'string') {
			uniqueTypes.add(`'${escapeStringLiteral(item)}'`)
		} else if (typeof item === 'number') {
			uniqueTypes.add(item.toString())
		} else if (typeof item === 'boolean') {
			uniqueTypes.add(item.toString())
		} else {
			uniqueTypes.add('unknown')
		}
	}

	const elementType = Array.from(uniqueTypes).join(' | ')
	return `readonly (${elementType})[]`
}

/**
 * Create a union type from multiple values
 */
export const createUnionType = (values: Set<ConfigValue>): string => {
	if (values.size === 0) return 'unknown'

	// Single value - return its literal type
	if (values.size === 1) {
		const value = Array.from(values)[0]
		if (Array.isArray(value)) {
			return arrayToType(value)
		}
		if (value !== undefined) {
			return primitiveToLiteralType(value)
		}
		return 'undefined'
	}

	// Multiple values - create union
	const types: string[] = []
	for (const value of values) {
		if (Array.isArray(value)) {
			types.push(arrayToType(value))
		} else {
			types.push(primitiveToLiteralType(value))
		}
	}

	return types.join(' | ')
}

/**
 * Check if a value is a valid configuration object
 */
export const isConfigObject = (
	value: ConfigValue | undefined,
): value is Record<string, ConfigValue> =>
	value !== null &&
	value !== undefined &&
	typeof value === 'object' &&
	!Array.isArray(value)

/**
 * Generate indentation string for pretty-printing
 */
export const indent = (depth: number, spaces = 2): string =>
	' '.repeat(depth * spaces)

/**
 * Extract all property paths from an object for validation
 */
export const extractAllPaths = (obj: unknown, prefix = ''): Set<string> => {
	const paths = new Set<string>()

	if (!isConfigObject(obj as ConfigValue)) return paths

	for (const key of Object.keys(obj as Record<string, unknown>)) {
		const fullPath = prefix ? `${prefix}.${key}` : key
		paths.add(fullPath)

		const value = (obj as Record<string, unknown>)[key]
		if (isConfigObject(value as ConfigValue)) {
			const nestedPaths = extractAllPaths(value, fullPath)
			for (const path of nestedPaths) {
				paths.add(path)
			}
		}
	}

	return paths
}

/**
 * Generate TypeScript interface property definition
 */
export const generateProperty = (
	key: string,
	type: string,
	depth: number,
): string => `${indent(depth)}readonly ${key}: ${type}`

/**
 * Filter config files that should be excluded from type generation
 */
export const filterValidConfigFiles = (
	files: string[],
	excludedFiles: string[] = ['invalid.json', 'not-object.json'],
): string[] => files.filter(file => !excludedFiles.includes(file))
