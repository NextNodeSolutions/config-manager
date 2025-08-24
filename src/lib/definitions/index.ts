/**
 * Definitions module exports
 */

export {
	VALID_ENVIRONMENTS,
	ERROR_CODES,
	ENV_VARS,
	FILE_EXTENSIONS,
	CONFIG_CACHE_PREFIX,
} from './constants.js'

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
} from './errors.js'

export type {
	ConfigValue,
	ConfigObject,
	ConfigPath,
	ConfigOptions,
	ConfigSchema,
	InferConfigType,
	MergeConfigs,
	PathValue,
	DetectedConfigType,
	AutoConfigPath,
} from './types.js'
