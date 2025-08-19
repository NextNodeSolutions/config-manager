export interface ConfigObject {
	[key: string]: ConfigValue | undefined
}

export type ConfigValue =
	| string
	| number
	| boolean
	| null
	| ConfigValue[]
	| ConfigObject

/**
 * Utility type to extract all possible string paths from a nested object type
 * Supports dot notation like 'email.from', 'app.name', etc.
 */
export type ConfigPath<T = ConfigObject> = T extends Record<string, unknown>
	? {
			[K in keyof T]: K extends string
				? T[K] extends Record<string, unknown>
					? K | `${K}.${ConfigPath<T[K]>}`
					: K
				: never
		}[keyof T]
	: string

/**
 * Utility type to get the value type at a specific path in a nested object
 * Used to infer the return type of getConfig based on the path parameter
 */
export type PathValue<T, P extends string> = P extends keyof T
	? T[P]
	: P extends `${infer K}.${infer R}`
		? K extends keyof T
			? T[K] extends Record<string, unknown>
				? PathValue<T[K], R>
				: never
			: never
		: never

/**
 * Base configuration schema that can be extended by projects
 * Provides a foundation for type inference while remaining flexible
 */
export interface BaseConfigSchema {
	[key: string]: ConfigValue
}

export interface ConfigOptions {
	environment?: string
	configDir?: string
	cache?: boolean
}
