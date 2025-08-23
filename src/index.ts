/**
 * @nextnode/config-manager
 * Configuration management library with automatic type generation
 */

// Configuration management functions
export {
	initConfig,
	getConfig,
	hasConfig,
	getEnvironment,
	clearConfigCache,
	getAvailableEnvironments,
	validateRequiredConfig,
} from './core/manager.js'

// Core classes
export { ConfigLoader } from './core/loader.js'

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
} from './definitions/types.js'

// Utility functions
export { deepMerge, getNestedValue, setNestedValue } from './utils/helpers.js'

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
} from './definitions/errors.js'

// Constants
export {
	VALID_ENVIRONMENTS,
	ERROR_CODES,
	ENV_VARS,
} from './definitions/constants.js'
