// Configuration management functions
export {
	initConfig,
	getConfig,
	hasConfig,
	getEnvironment,
	clearConfigCache,
	getAvailableEnvironments,
	validateRequiredConfig,
} from './manager'

// Core classes
export { ConfigLoader } from './loader'

// Types
export type {
	ConfigObject,
	ConfigValue,
	ConfigPath,
	ConfigOptions,
	BaseConfigSchema,
	InferConfigType,
	MergeConfigs,
	PathValue,
	UserConfigSchema,
	DetectedConfigType,
	AutoConfigPath,
} from './types'

// Utility functions
export { deepMerge, getNestedValue, setNestedValue } from './utils'

// Error classes
export {
	ConfigError,
	ConfigNotFoundError,
	InvalidEnvironmentError,
	InvalidConfigFormatError,
	InvalidJsonSyntaxError,
	DefaultConfigMissingError,
	AppEnvRequiredError,
	AppEnvUnavailableError,
	ConfigDirNotFoundError,
	ConfigurationPathError,
} from './errors'

// Constants
export {
	VALID_ENVIRONMENTS,
	ERROR_CODES,
	ENV_VARS,
} from './constants'
