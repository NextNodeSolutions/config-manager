import type { ConfigObject, ConfigValue } from './types'

/**
 * Deep merge two configuration objects
 * Arrays are replaced entirely, objects are merged recursively
 */
export function deepMerge(
	target: ConfigObject,
	source: ConfigObject,
): ConfigObject {
	const result: ConfigObject = { ...target }

	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			const sourceValue = source[key]
			const targetValue = result[key]

			if (
				isObject(sourceValue) &&
				isObject(targetValue) &&
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
export function getNestedValue<T = ConfigValue>(
	obj: ConfigObject,
	path: string | string[],
): T | undefined {
	const keys = Array.isArray(path) ? path : path.split('.')
	let current: ConfigValue | undefined = obj

	for (const key of keys) {
		if (current && isObject(current) && key in (current as ConfigObject)) {
			current = (current as ConfigObject)[key]
		} else {
			return undefined
		}
	}

	return current as T
}

/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(
	obj: ConfigObject,
	path: string | string[],
	value: ConfigValue,
): void {
	const keys = Array.isArray(path) ? path : path.split('.')
	const lastKey = keys.pop()

	if (!lastKey) return

	let current: ConfigValue | undefined = obj

	// Navigate to the parent object
	for (const key of keys) {
		if (!current || !isObject(current)) {
			return
		}

		const currentObj = current as ConfigObject

		if (
			!(key in currentObj) ||
			currentObj[key] === undefined ||
			!isObject(currentObj[key])
		) {
			currentObj[key] = {}
		}

		current = currentObj[key]
	}

	if (current && isObject(current)) {
		;(current as ConfigObject)[lastKey] = value
	}
}

/**
 * Check if value is a plain object (not array, null, or other types)
 */
function isObject(value: ConfigValue | undefined): value is ConfigObject {
	return (
		value !== null &&
		value !== undefined &&
		typeof value === 'object' &&
		!Array.isArray(value)
	)
}

/**
 * Validate configuration object structure
 */
export function validateConfig(config: unknown): config is ConfigObject {
	return (
		typeof config === 'object' && config !== null && !Array.isArray(config)
	)
}

/**
 * Get current environment from APP_ENV
 * APP_ENV is mandatory - no fallback to avoid ambiguity
 */
export function getCurrentEnvironment(): string {
	if (typeof process !== 'undefined') {
		const appEnv = process.env.APP_ENV

		if (!appEnv) {
			throw new Error(
				'APP_ENV environment variable is required. Valid values: LOCAL, DEV, PROD',
			)
		}

		const validEnvironments = ['LOCAL', 'DEV', 'PROD', 'TEST']
		if (!validEnvironments.includes(appEnv)) {
			throw new Error(
				`Invalid APP_ENV value: ${appEnv}. Valid values: ${validEnvironments.join(', ')}`,
			)
		}

		// Convert to lowercase for file matching
		return appEnv.toLowerCase()
	}

	// Browser environment - throw error as APP_ENV is mandatory
	throw new Error(
		'APP_ENV is required but not available in browser environment',
	)
}

/**
 * Create a deep clone of a configuration object
 */
export function cloneConfig(config: ConfigObject): ConfigObject {
	return JSON.parse(JSON.stringify(config))
}
