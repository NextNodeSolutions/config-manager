/**
 * Definitions module exports
 */

export {
	CONFIG_CACHE_PREFIX,
	ENV_VARS,
	ERROR_CODES,
	FILE_EXTENSIONS,
	VALID_ENVIRONMENTS,
} from './constants.js'

export {
	AppEnvRequiredError,
	AppEnvUnavailableError,
	ConfigDirNotFoundError,
	ConfigError,
	ConfigNotFoundError,
	ConfigurationPathError,
	DefaultConfigMissingError,
	InvalidConfigFormatError,
	InvalidEnvironmentError,
	InvalidJsonSyntaxError,
} from './errors.js'

export type {
	AutoConfigPath,
	ConfigObject,
	ConfigOptions,
	ConfigPath,
	ConfigSchema,
	ConfigValue,
	DetectedConfigType,
	InferConfigType,
	MergeConfigs,
	PathValue,
} from './types.js'
