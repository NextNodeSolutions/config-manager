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
 * Deep readonly utility type that makes all properties readonly recursively
 * Ensures complete immutability for nested configuration objects
 */
export type DeepReadonly<T> = T extends (infer U)[]
	? ReadonlyArray<DeepReadonly<U>>
	: T extends Record<string, unknown>
		? {
				readonly [K in keyof T]: DeepReadonly<T[K]>
			}
		: T

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
 * Returns strict literal types for type safety and autocompletion
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
 * Utility type to get the exact value type at a specific path in a nested object
 * Returns the precise type without undefined (strict mode by default)
 * Used to infer the return type of getConfig based on the path parameter
 * Robuste : évite les 'never' qui cassent l'inférence
 */
// Version simplifiée qui marche avec nos types générés
export type PathValue<T, P extends string> = P extends keyof T
	? T[P]
	: P extends `${infer Key}.${infer Rest}`
		? Key extends keyof T
			? PathValue<T[Key], Rest>
			: never
		: never

/**
 * Configuration schema interface - automatically populated from generated types
 * This interface is dynamically extended by module augmentation from generated config schema
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ConfigSchema extends Record<string, unknown> {}

/**
 * Detected config type - uses ConfigSchema from generated types
 * Types are generated automatically from the project's config files
 */
export type DetectedConfigType = ConfigSchema

/**
 * Auto-detected configuration paths based on generated schema
 */
export type AutoConfigPath = ConfigPath<ConfigSchema>

/**
 * Utility type for testing - extracts a property type from ConfigValue
 * Used to safely access nested properties in test scenarios
 */
export type ExtractConfigProperty<
	T extends ConfigValue,
	K extends string,
> = T extends Record<K, infer U> ? U : never

/**
 * Utility type for testing - safely cast ConfigObject to expected structure
 * Only use this in test files where structure is known
 */
export type TestConfigCast<T> = T extends ConfigObject
	? T & Record<string, ConfigValue>
	: T

export interface ConfigOptions {
	environment?: string
	configDir?: string
	cache?: boolean
}
