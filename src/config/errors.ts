import { ERROR_CODES } from './constants'

import type { ConfigPath } from './types'

/**
 * Base error class for configuration-related errors
 */
export class ConfigError extends Error {
	constructor(
		message: string,
		public code: string,
		public path?: ConfigPath,
	) {
		super(message)
		this.name = 'ConfigError'
	}
}

/**
 * Error thrown when a configuration path is not found
 */
export class ConfigNotFoundError extends ConfigError {
	constructor(path: ConfigPath) {
		const pathString = Array.isArray(path) ? path.join('.') : path
		super(
			`Configuration not found at path: ${pathString}`,
			ERROR_CODES.CONFIG_NOT_FOUND,
			path,
		)
	}
}

/**
 * Error thrown when an invalid environment is specified
 */
export class InvalidEnvironmentError extends ConfigError {
	constructor(environment: string, validEnvironments: readonly string[]) {
		super(
			`Invalid environment: ${environment}. Valid values: ${validEnvironments.join(', ')}`,
			ERROR_CODES.INVALID_ENVIRONMENT,
		)
	}
}

/**
 * Error thrown when configuration format is invalid
 */
export class InvalidConfigFormatError extends ConfigError {
	constructor(configPath: string) {
		super(
			`Invalid configuration format in ${configPath}. Expected a JSON object.`,
			ERROR_CODES.INVALID_CONFIG_FORMAT,
		)
	}
}

/**
 * Error thrown when JSON syntax is invalid
 */
export class InvalidJsonSyntaxError extends ConfigError {
	constructor(configPath: string, originalError: string) {
		super(
			`Invalid JSON syntax in ${configPath}: ${originalError}`,
			ERROR_CODES.INVALID_JSON_SYNTAX,
		)
	}
}

/**
 * Error thrown when default configuration file is missing
 */
export class DefaultConfigMissingError extends ConfigError {
	constructor(configPath: string) {
		super(
			`Default configuration file not found at ${configPath}. Please create a default.json file in the config directory.`,
			ERROR_CODES.DEFAULT_CONFIG_MISSING,
		)
	}
}

/**
 * Error thrown when APP_ENV environment variable is required but not set
 */
export class AppEnvRequiredError extends ConfigError {
	constructor() {
		super(
			'APP_ENV environment variable is required. Valid values: LOCAL, DEV, PROD, TEST',
			ERROR_CODES.APP_ENV_REQUIRED,
		)
	}
}

/**
 * Error thrown when APP_ENV is not available in the current environment
 */
export class AppEnvUnavailableError extends ConfigError {
	constructor() {
		super(
			'APP_ENV is required but not available in browser environment',
			ERROR_CODES.APP_ENV_UNAVAILABLE,
		)
	}
}

/**
 * Error thrown when configuration directory is not found
 */
export class ConfigDirNotFoundError extends ConfigError {
	constructor(configDir: string) {
		super(
			`Configuration directory not found: ${configDir}. Please ensure the directory exists or specify a valid configDir in ConfigOptions.`,
			ERROR_CODES.CONFIG_DIR_NOT_FOUND,
		)
	}
}
