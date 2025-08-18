/**
 * Configuration system constants
 */

export const DEFAULT_CONFIG_DIR = './config'
export const DEFAULT_CONFIG_FILE = 'default.json'
export const VALID_ENVIRONMENTS = ['LOCAL', 'DEV', 'PROD', 'TEST'] as const
export const DEFAULT_LOCALE = 'en-US'

/**
 * Default date formatting options
 */
export const DEFAULT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
}

/**
 * Configuration cache key prefix
 */
export const CONFIG_CACHE_PREFIX = 'config_'

/**
 * Environment variable names
 */
export const ENV_VARS = {
	APP_ENV: 'APP_ENV',
} as const

/**
 * Error codes for configuration system
 */
export const ERROR_CODES = {
	CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
	INVALID_ENVIRONMENT: 'INVALID_ENVIRONMENT',
	INVALID_CONFIG_FORMAT: 'INVALID_CONFIG_FORMAT',
	INVALID_JSON_SYNTAX: 'INVALID_JSON_SYNTAX',
	DEFAULT_CONFIG_MISSING: 'DEFAULT_CONFIG_MISSING',
	APP_ENV_REQUIRED: 'APP_ENV_REQUIRED',
	APP_ENV_UNAVAILABLE: 'APP_ENV_UNAVAILABLE',
} as const

/**
 * File extensions
 */
export const FILE_EXTENSIONS = {
	JSON: '.json',
} as const
