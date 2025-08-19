import { describe, it, expect } from 'vitest'

import {
	ConfigError,
	ConfigNotFoundError,
	InvalidEnvironmentError,
	InvalidConfigFormatError,
	InvalidJsonSyntaxError,
	DefaultConfigMissingError,
	AppEnvRequiredError,
	AppEnvUnavailableError,
} from './errors'
import { ERROR_CODES } from './constants'

describe('ConfigError', () => {
	it('should create error with message and code', () => {
		const error = new ConfigError('Test message', 'TEST_CODE')

		expect(error.name).toBe('ConfigError')
		expect(error.message).toBe('Test message')
		expect(error.code).toBe('TEST_CODE')
		expect(error.path).toBeUndefined()
		expect(error).toBeInstanceOf(Error)
	})

	it('should create error with path', () => {
		const path = 'email.from'
		const error = new ConfigError('Test message', 'TEST_CODE', path)

		expect(error.path).toBe(path)
	})

	it('should create error with array path', () => {
		const path = ['email', 'templates', 'welcome']
		const error = new ConfigError('Test message', 'TEST_CODE', path)

		expect(error.path).toEqual(path)
	})
})

describe('ConfigNotFoundError', () => {
	it('should create error for string path', () => {
		const path = 'email.from'
		const error = new ConfigNotFoundError(path)

		expect(error.name).toBe('ConfigError')
		expect(error.message).toBe(
			'Configuration not found at path: email.from',
		)
		expect(error.code).toBe(ERROR_CODES.CONFIG_NOT_FOUND)
		expect(error.path).toBe(path)
		expect(error).toBeInstanceOf(ConfigError)
	})

	it('should create error for array path', () => {
		const path = ['email', 'templates', 'welcome']
		const error = new ConfigNotFoundError(path)

		expect(error.message).toBe(
			'Configuration not found at path: email.templates.welcome',
		)
		expect(error.path).toEqual(path)
	})

	it('should handle empty string path', () => {
		const error = new ConfigNotFoundError('')

		expect(error.message).toBe('Configuration not found at path: ')
	})

	it('should handle empty array path', () => {
		const error = new ConfigNotFoundError([])

		expect(error.message).toBe('Configuration not found at path: ')
	})
})

describe('InvalidEnvironmentError', () => {
	it('should create error with environment and valid options', () => {
		const environment = 'invalid'
		const validEnvironments = ['LOCAL', 'DEV', 'PROD', 'TEST'] as const
		const error = new InvalidEnvironmentError(
			environment,
			validEnvironments,
		)

		expect(error.name).toBe('ConfigError')
		expect(error.message).toBe(
			'Invalid environment: invalid. Valid values: LOCAL, DEV, PROD, TEST',
		)
		expect(error.code).toBe(ERROR_CODES.INVALID_ENVIRONMENT)
		expect(error).toBeInstanceOf(ConfigError)
	})

	it('should handle empty valid environments array', () => {
		const error = new InvalidEnvironmentError('test', [])

		expect(error.message).toBe('Invalid environment: test. Valid values: ')
	})

	it('should handle single valid environment', () => {
		const error = new InvalidEnvironmentError('test', ['PROD'])

		expect(error.message).toBe(
			'Invalid environment: test. Valid values: PROD',
		)
	})
})

describe('InvalidConfigFormatError', () => {
	it('should create error with config path', () => {
		const configPath = '/path/to/config.json'
		const error = new InvalidConfigFormatError(configPath)

		expect(error.name).toBe('ConfigError')
		expect(error.message).toBe(
			'Invalid configuration format in /path/to/config.json. Expected a JSON object.',
		)
		expect(error.code).toBe(ERROR_CODES.INVALID_CONFIG_FORMAT)
		expect(error).toBeInstanceOf(ConfigError)
	})

	it('should handle relative paths', () => {
		const configPath = './config/default.json'
		const error = new InvalidConfigFormatError(configPath)

		expect(error.message).toContain('./config/default.json')
	})
})

describe('InvalidJsonSyntaxError', () => {
	it('should create error with config path and original error', () => {
		const configPath = '/path/to/config.json'
		const originalError = 'Unexpected token } in JSON at position 10'
		const error = new InvalidJsonSyntaxError(configPath, originalError)

		expect(error.name).toBe('ConfigError')
		expect(error.message).toBe(
			'Invalid JSON syntax in /path/to/config.json: Unexpected token } in JSON at position 10',
		)
		expect(error.code).toBe(ERROR_CODES.INVALID_JSON_SYNTAX)
		expect(error).toBeInstanceOf(ConfigError)
	})

	it('should handle empty original error', () => {
		const error = new InvalidJsonSyntaxError('/path/config.json', '')

		expect(error.message).toBe('Invalid JSON syntax in /path/config.json: ')
	})
})

describe('DefaultConfigMissingError', () => {
	it('should create error with config path', () => {
		const configPath = '/path/to/default.json'
		const error = new DefaultConfigMissingError(configPath)

		expect(error.name).toBe('ConfigError')
		expect(error.message).toBe(
			'Default configuration file not found at /path/to/default.json. Please create a default.json file in the config directory.',
		)
		expect(error.code).toBe(ERROR_CODES.DEFAULT_CONFIG_MISSING)
		expect(error).toBeInstanceOf(ConfigError)
	})

	it('should provide helpful message for relative paths', () => {
		const configPath = './config/default.json'
		const error = new DefaultConfigMissingError(configPath)

		expect(error.message).toContain('./config/default.json')
		expect(error.message).toContain(
			'Please create a default.json file in the config directory.',
		)
	})
})

describe('AppEnvRequiredError', () => {
	it('should create error with standard message', () => {
		const error = new AppEnvRequiredError()

		expect(error.name).toBe('ConfigError')
		expect(error.message).toBe(
			'APP_ENV environment variable is required. Valid values: LOCAL, DEV, PROD, TEST',
		)
		expect(error.code).toBe(ERROR_CODES.APP_ENV_REQUIRED)
		expect(error).toBeInstanceOf(ConfigError)
	})

	it('should not accept any parameters', () => {
		const error = new AppEnvRequiredError()

		expect(error.path).toBeUndefined()
	})
})

describe('AppEnvUnavailableError', () => {
	it('should create error with browser environment message', () => {
		const error = new AppEnvUnavailableError()

		expect(error.name).toBe('ConfigError')
		expect(error.message).toBe(
			'APP_ENV is required but not available in browser environment',
		)
		expect(error.code).toBe(ERROR_CODES.APP_ENV_UNAVAILABLE)
		expect(error).toBeInstanceOf(ConfigError)
	})

	it('should not accept any parameters', () => {
		const error = new AppEnvUnavailableError()

		expect(error.path).toBeUndefined()
	})
})

describe('Error inheritance', () => {
	it('should all errors inherit from ConfigError', () => {
		const errors = [
			new ConfigNotFoundError('test.path'),
			new InvalidEnvironmentError('invalid', ['VALID']),
			new InvalidConfigFormatError('/path/config.json'),
			new InvalidJsonSyntaxError('/path/config.json', 'syntax error'),
			new DefaultConfigMissingError('/path/default.json'),
			new AppEnvRequiredError(),
			new AppEnvUnavailableError(),
		]

		for (const error of errors) {
			expect(error).toBeInstanceOf(ConfigError)
			expect(error).toBeInstanceOf(Error)
			expect(error.name).toBe('ConfigError')
			expect(typeof error.code).toBe('string')
			expect(error.code.length).toBeGreaterThan(0)
		}
	})

	it('should have stack trace', () => {
		const error = new ConfigNotFoundError('test.path')

		expect(error.stack).toBeDefined()
		expect(typeof error.stack).toBe('string')
		expect(error.stack!.length).toBeGreaterThan(0)
	})
})
