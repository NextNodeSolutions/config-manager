import type { ConfigObject, ConfigValue } from '../definitions/types.js'

/**
 * Deep merge two configuration objects
 * Arrays are replaced entirely, objects are merged recursively
 */
export const deepMerge = (
	target: ConfigObject,
	source: ConfigObject,
): ConfigObject => {
	const result: ConfigObject = { ...target }

	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			const sourceValue = source[key]
			const targetValue = result[key]

			if (
				isConfigObject(sourceValue) &&
				isConfigObject(targetValue) &&
				targetValue !== undefined &&
				sourceValue !== undefined
			) {
				// Recursively merge objects
				result[key] = deepMerge(targetValue, sourceValue)
			} else {
				// Replace primitive values and arrays entirely
				result[key] = sourceValue
			}
		}
	}

	return result
}

/**
 * Get nested value from object using dot notation
 * Examples: "email.from", "email.templates.projectRequest.subject"
 */
export const getNestedValue = <T = ConfigValue>(
	obj: ConfigObject,
	path: string | string[],
): T | undefined => {
	const keys = Array.isArray(path) ? path : path.split('.')
	let current: ConfigValue | undefined = obj

	for (const key of keys) {
		if (current && isConfigObject(current) && key in current) {
			current = current[key]
		} else {
			return undefined
		}
	}

	// Return undefined for null values to maintain type safety
	if (current === null || current === undefined) {
		return undefined
	}

	return current as T
}

/**
 * Set nested value in object using dot notation
 */
export const setNestedValue = (
	obj: ConfigObject,
	path: string | string[],
	value: ConfigValue,
): void => {
	const keys = Array.isArray(path) ? path : path.split('.')
	const lastKey = keys.pop()

	if (!lastKey) return

	let current: ConfigValue | undefined = obj

	// Navigate to the parent object
	for (const key of keys) {
		if (!current || !isConfigObject(current)) {
			return
		}

		if (
			!(key in current) ||
			current[key] === undefined ||
			!isConfigObject(current[key])
		) {
			current[key] = {}
		}

		current = current[key]
	}

	if (current && isConfigObject(current)) {
		current[lastKey] = value
	}
}

/**
 * Create a deep clone of a configuration object
 */
export const cloneConfig = (config: ConfigObject): ConfigObject =>
	JSON.parse(JSON.stringify(config))

/**
 * Check if value is a plain object (not array, null, or other types)
 */
const isConfigObject = (
	value: ConfigValue | undefined,
): value is ConfigObject =>
	value !== null &&
	value !== undefined &&
	typeof value === 'object' &&
	!Array.isArray(value)
