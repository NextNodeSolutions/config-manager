// Configuration management functions
export {
	initConfig,
	getConfig,
	hasConfig,
	getEnvironment,
	clearConfigCache,
	getAvailableEnvironments,
	validateRequiredConfig,
} from './core/manager'

// Core classes
export { ConfigLoader } from './core/loader'

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
} from './definitions/types'

// Utility functions
export { deepMerge, getNestedValue, setNestedValue } from './utils/helpers'

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
} from './definitions/errors'

// Constants
export {
	VALID_ENVIRONMENTS,
	ERROR_CODES,
	ENV_VARS,
} from './definitions/constants'
