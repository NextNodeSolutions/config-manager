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
 * Utility type to infer exact types from JSON config objects
 * Converts values to their literal types and makes everything readonly
 */
export type InferConfigType<T> = T extends Record<string, unknown>
	? Readonly<{
			[K in keyof T]: T[K] extends Record<string, unknown>
				? InferConfigType<T[K]>
				: T[K] extends Array<unknown>
					? Readonly<T[K]>
					: T[K]
		}>
	: T

/**
 * Deep merge two config types, with the second taking precedence
 * Used for merging default config with environment-specific overrides
 */
export type MergeConfigs<TBase, TOverride> = TBase extends Record<
	string,
	unknown
>
	? TOverride extends Record<string, unknown>
		? InferConfigType<{
				[K in keyof TBase | keyof TOverride]: K extends keyof TOverride
					? TOverride[K] extends Record<string, unknown>
						? K extends keyof TBase
							? TBase[K] extends Record<string, unknown>
								? MergeConfigs<TBase[K], TOverride[K]>
								: TOverride[K]
							: TOverride[K]
						: TOverride[K]
					: K extends keyof TBase
						? TBase[K]
						: never
			}>
		: InferConfigType<TBase>
	: InferConfigType<TBase>

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

/**
 * Global interface that can be augmented by the user project
 * to provide automatic type inference for their specific config structure
 *
 * Example usage in user project:
 * ```typescript
 * declare module '@nextnode/functions-server' {
 *   interface UserConfigSchema {
 *     app: { name: string; debug: boolean }
 *     email: { from: string; provider: string }
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserConfigSchema extends BaseConfigSchema {}

/**
 * Detected config type - either user-defined or fallback to generic
 */
export type DetectedConfigType = keyof UserConfigSchema extends never
	? ConfigObject // Fallback to generic if no user schema defined
	: InferConfigType<UserConfigSchema>

/**
 * Auto-detected configuration paths based on user schema or generic fallback
 */
export type AutoConfigPath = keyof UserConfigSchema extends never
	? string // Generic string if no user schema
	: ConfigPath<UserConfigSchema>

export interface ConfigOptions {
	environment?: string
	configDir?: string
	cache?: boolean
}
