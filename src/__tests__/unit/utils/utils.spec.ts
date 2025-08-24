import { describe, it, expect, afterEach, vi } from 'vitest'

import {
	deepMerge,
	getNestedValue,
	setNestedValue,
} from '@/lib/utils/helpers.js'
import {
	validateConfig,
	getCurrentEnvironment,
} from '@/lib/utils/validation.js'
import {
	InvalidEnvironmentError,
	AppEnvRequiredError,
	AppEnvUnavailableError,
} from '@/lib/definitions/errors.js'

import type { ConfigObject, ConfigValue } from '@/lib/definitions/types.js'

describe('deepMerge', () => {
	it('should merge simple objects', () => {
		const target = { a: 1, b: 2 }
		const source = { b: 3, c: 4 }
		const result = deepMerge(target, source)

		expect(result).toEqual({ a: 1, b: 3, c: 4 })
	})

	it('should merge nested objects recursively', () => {
		const target = {
			level1: {
				level2: {
					a: 1,
					b: 2,
				},
				c: 3,
			},
		}
		const source = {
			level1: {
				level2: {
					b: 'updated',
					d: 'new',
				},
			},
		}

		const result = deepMerge(target, source)

		expect(result).toEqual({
			level1: {
				level2: {
					a: 1,
					b: 'updated',
					d: 'new',
				},
				c: 3,
			},
		})
	})

	it('should replace arrays entirely', () => {
		const target = { arr: [1, 2, 3] }
		const source = { arr: ['a', 'b'] }
		const result = deepMerge(target, source)

		expect(result).toEqual({ arr: ['a', 'b'] })
	})

	it('should handle null and undefined values', () => {
		const target = { a: 1, b: null, c: undefined }
		const source = { b: 'new', c: 'value', d: null }
		const result = deepMerge(target, source)

		expect(result).toEqual({ a: 1, b: 'new', c: 'value', d: null })
	})

	it('should not mutate original objects', () => {
		const target = { a: { b: 1 } }
		const source = { a: { c: 2 } }
		const result = deepMerge(target, source)

		expect(target).toEqual({ a: { b: 1 } })
		expect(source).toEqual({ a: { c: 2 } })
		expect(result).toEqual({ a: { b: 1, c: 2 } })
	})
})

describe('getNestedValue', () => {
	const testObj: ConfigObject = {
		email: {
			from: 'test@example.com',
			templates: {
				welcome: {
					subject: 'Welcome!',
					body: 'Hello there',
				},
			},
		},
		app: {
			name: 'TestApp',
			features: ['auth', 'api'],
		},
		nullValue: null,
		undefinedValue: undefined,
	}

	it('should get simple nested values', () => {
		expect(getNestedValue(testObj, 'email.from')).toBe('test@example.com')
		expect(getNestedValue(testObj, 'app.name')).toBe('TestApp')
	})

	it('should get deeply nested values', () => {
		expect(getNestedValue(testObj, 'email.templates.welcome.subject')).toBe(
			'Welcome!',
		)
	})

	it('should handle array paths', () => {
		expect(getNestedValue(testObj, ['email', 'from'])).toBe(
			'test@example.com',
		)
		expect(
			getNestedValue(testObj, ['email', 'templates', 'welcome', 'body']),
		).toBe('Hello there')
	})

	it('should return undefined for non-existent paths', () => {
		expect(getNestedValue(testObj, 'nonexistent')).toBeUndefined()
		expect(getNestedValue(testObj, 'email.nonexistent')).toBeUndefined()
		expect(
			getNestedValue(testObj, 'email.templates.nonexistent.subject'),
		).toBeUndefined()
	})

	it('should return undefined for null and undefined values', () => {
		expect(getNestedValue(testObj, 'nullValue')).toBeUndefined()
		expect(getNestedValue(testObj, 'undefinedValue')).toBeUndefined()
	})

	it('should handle empty paths', () => {
		expect(getNestedValue(testObj, '')).toBeUndefined()
		expect(getNestedValue(testObj, [])).toBe(testObj)
	})

	it('should handle type safety with generics', () => {
		const stringValue = getNestedValue<string>(testObj, 'email.from')
		expect(typeof stringValue).toBe('string')

		const arrayValue = getNestedValue<string[]>(testObj, 'app.features')
		expect(Array.isArray(arrayValue)).toBe(true)
	})
})

describe('setNestedValue', () => {
	it('should set simple nested values', () => {
		const obj: ConfigObject = { email: { from: 'old@example.com' } }
		setNestedValue(obj, 'email.from', 'new@example.com')

		const emailConfig = obj.email as Record<string, ConfigValue>
		expect(emailConfig.from).toBe('new@example.com')
	})

	it('should create nested objects when they do not exist', () => {
		const obj: ConfigObject = {}
		setNestedValue(obj, 'email.templates.welcome.subject', 'Welcome!')

		const emailConfig = obj.email as Record<string, ConfigValue>
		const templatesConfig = emailConfig?.templates as Record<
			string,
			ConfigValue
		>
		const welcomeConfig = templatesConfig?.welcome as Record<
			string,
			ConfigValue
		>
		expect(welcomeConfig?.subject).toBe('Welcome!')
	})

	it('should handle array paths', () => {
		const obj: ConfigObject = {}
		setNestedValue(obj, ['app', 'name'], 'TestApp')

		const appConfig = obj.app as Record<string, ConfigValue>
		expect(appConfig?.name).toBe('TestApp')
	})

	it('should replace non-object intermediate values with objects', () => {
		const obj: ConfigObject = { app: 'string-value' }
		setNestedValue(obj, 'app.name', 'TestApp')

		expect(obj.app).toEqual({ name: 'TestApp' })
	})

	it('should handle empty paths gracefully', () => {
		const obj: ConfigObject = { test: 'value' }
		setNestedValue(obj, '', 'new-value')
		setNestedValue(obj, [], 'another-value')

		expect(obj.test).toBe('value')
	})
})

describe('validateConfig', () => {
	it('should validate correct config objects', () => {
		expect(validateConfig({})).toBe(true)
		expect(validateConfig({ key: 'value' })).toBe(true)
		expect(validateConfig({ nested: { key: 'value' } })).toBe(true)
	})

	it('should reject non-object values', () => {
		expect(validateConfig(null)).toBe(false)
		expect(validateConfig(undefined)).toBe(false)
		expect(validateConfig('string')).toBe(false)
		expect(validateConfig(123)).toBe(false)
		expect(validateConfig(true)).toBe(false)
		expect(validateConfig([])).toBe(false)
	})
})

describe('getCurrentEnvironment', () => {
	afterEach(() => {
		vi.unstubAllEnvs()
	})

	it('should return lowercase environment when APP_ENV is set correctly', () => {
		vi.stubEnv('APP_ENV', 'DEV')
		expect(getCurrentEnvironment()).toBe('dev')

		vi.stubEnv('APP_ENV', 'PROD')
		expect(getCurrentEnvironment()).toBe('prod')

		vi.stubEnv('APP_ENV', 'LOCAL')
		expect(getCurrentEnvironment()).toBe('local')

		vi.stubEnv('APP_ENV', 'TEST')
		expect(getCurrentEnvironment()).toBe('test')
	})

	it('should throw AppEnvRequiredError when APP_ENV is not set', () => {
		expect(() => getCurrentEnvironment()).toThrow(AppEnvRequiredError)
	})

	it('should throw InvalidEnvironmentError for invalid environments', () => {
		vi.stubEnv('APP_ENV', 'INVALID')
		expect(() => getCurrentEnvironment()).toThrow(InvalidEnvironmentError)

		vi.stubEnv('APP_ENV', 'staging')
		expect(() => getCurrentEnvironment()).toThrow(InvalidEnvironmentError)
	})

	it('should throw AppEnvUnavailableError in browser environment', () => {
		const processGlobalSpy = vi.spyOn(global, 'process', 'get')
		// @ts-expect-error - Testing browser environment
		processGlobalSpy.mockReturnValue(undefined)

		expect(() => getCurrentEnvironment()).toThrow(AppEnvUnavailableError)

		processGlobalSpy.mockRestore()
	})
})
