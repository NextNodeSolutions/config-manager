/**
 * @nextnode/functions-server
 * Server library for Nextnode Functions
 */

// Date formatting utilities
export { formatDate } from './formatting/date'

// Configuration management functions
export {
	initConfig,
	getConfig,
	hasConfig,
	getEnvironment,
	clearConfigCache,
	getAvailableEnvironments,
	validateRequiredConfig,
} from './config/core/manager'

// Core classes
export { ConfigLoader } from './config/core/loader'

// Types
export type {
	ConfigObject,
	ConfigValue,
	ConfigPath,
	ConfigOptions,
	BaseConfigSchema,
} from './config/definitions/types'

// Utility functions
export {
	deepMerge,
	getNestedValue,
	setNestedValue,
} from './config/utils/helpers'

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
} from './config/definitions/errors'

// Constants
export {
	VALID_ENVIRONMENTS,
	ERROR_CODES,
	ENV_VARS,
} from './config/definitions/constants'
