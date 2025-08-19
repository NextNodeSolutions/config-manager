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
} from './config/manager'

// Core classes
export { ConfigLoader } from './config/loader'

// Types
export type {
	ConfigObject,
	ConfigValue,
	ConfigPath,
	ConfigOptions,
	BaseConfigSchema,
} from './config/types'

// Utility functions
export { deepMerge, getNestedValue, setNestedValue } from './config/utils'

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
} from './config/errors'

// Constants
export {
	VALID_ENVIRONMENTS,
	ERROR_CODES,
	ENV_VARS,
} from './config/constants'
