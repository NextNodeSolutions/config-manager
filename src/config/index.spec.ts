import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

import {
	initConfig,
	getConfig,
	getTypedConfig,
	hasConfig,
	getEnvironment,
	clearConfigCache,
	getAvailableEnvironments,
	validateRequiredConfig,
	ConfigDirRequiredError,
	resetGlobalLoader,
} from './index'

import type { RootConfig, ConfigOptions } from './types'

describe('Configuration API', () => {
	let tempDir: string
	const originalEnv = process.env.APP_ENV

	beforeEach(() => {
		tempDir = join(
			tmpdir(),
			`config-api-test-${Date.now()}-${Math.random()}`,
		)
		mkdirSync(tempDir, { recursive: true })

		process.env.APP_ENV = 'TEST'

		clearConfigCache()
	})

	afterEach(() => {
		if (existsSync(tempDir)) {
			rmSync(tempDir, { recursive: true, force: true })
		}

		if (originalEnv !== undefined) {
			process.env.APP_ENV = originalEnv
		} else {
			delete process.env.APP_ENV
		}

		clearConfigCache()
	})

	describe('initConfig', () => {
		it('should initialize global loader with options', () => {
			const options: ConfigOptions = { configDir: tempDir, cache: false }

			expect(() => initConfig(options)).not.toThrow()
		})

		it('should throw error when no configDir provided', () => {
			expect(() => initConfig()).toThrow(ConfigDirRequiredError)
			expect(() => initConfig({})).toThrow(ConfigDirRequiredError)
		})

		it('should replace existing global loader', () => {
			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify({ app: { name: 'TestApp' } }),
			)

			initConfig({ configDir: tempDir })
			const config1 = getConfig('app.name')

			initConfig({ configDir: tempDir, cache: false })
			const config2 = getConfig('app.name')

			expect(config1).toBe('TestApp')
			expect(config2).toBe('TestApp')
		})
	})

	describe('getConfig', () => {
		beforeEach(() => {
			const defaultConfig = {
				app: {
					name: 'TestApp',
					version: '1.0.0',
					features: ['auth', 'api'],
				},
				email: {
					from: 'test@example.com',
					templates: {
						welcome: {
							subject: 'Welcome!',
							body: 'Hello there',
						},
					},
				},
			}

			const testConfig = {
				app: {
					debug: true,
				},
				email: {
					from: 'test-env@example.com',
				},
			}

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)
			writeFileSync(
				join(tempDir, 'test.json'),
				JSON.stringify(testConfig, null, 2),
			)

			initConfig({ configDir: tempDir })
		})

		it('should get entire config when no path specified', () => {
			const config = getConfig()

			expect(config).toHaveProperty('app')
			expect(config).toHaveProperty('email')
			expect(config?.app?.name).toBe('TestApp')
			expect(config?.app?.debug).toBe(true)
			expect(config?.email?.from).toBe('test-env@example.com')
		})

		it('should get nested configuration values', () => {
			expect(getConfig('app.name')).toBe('TestApp')
			expect(getConfig('app.debug')).toBe(true)
			expect(getConfig('email.from')).toBe('test-env@example.com')
			expect(getConfig('email.templates.welcome.subject')).toBe(
				'Welcome!',
			)
		})

		it('should return undefined for non-existent paths', () => {
			expect(getConfig('nonexistent')).toBeUndefined()
			expect(getConfig('app.nonexistent')).toBeUndefined()
			expect(
				getConfig('email.templates.nonexistent.subject'),
			).toBeUndefined()
		})

		it('should work with type parameters', () => {
			const appName = getConfig<string>('app.name')
			const features = getConfig<string[]>('app.features')
			const debug = getConfig<boolean>('app.debug')

			expect(typeof appName).toBe('string')
			expect(Array.isArray(features)).toBe(true)
			expect(typeof debug).toBe('boolean')
		})

		it('should override environment when specified', () => {
			const devConfig = { app: { env: 'development' } }
			writeFileSync(
				join(tempDir, 'dev.json'),
				JSON.stringify(devConfig, null, 2),
			)

			const testEnvValue = getConfig('app.debug', 'test')
			const devEnvValue = getConfig('app.env', 'dev')

			expect(testEnvValue).toBe(true)
			expect(devEnvValue).toBe('development')
		})
	})

	describe('getTypedConfig', () => {
		beforeEach(() => {
			const defaultConfig: RootConfig = {
				app: {
					name: 'TestApp',
					version: '1.0.0',
				},
				email: {
					from: 'test@example.com',
					templates: {
						welcome: {
							subject: 'Welcome!',
							body: 'Hello there',
						},
					},
				},
			}

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			initConfig({ configDir: tempDir })
		})

		it('should get typed configuration sections', () => {
			const appConfig = getTypedConfig('app')
			const emailConfig = getTypedConfig('email')

			expect(appConfig?.name).toBe('TestApp')
			expect(appConfig?.version).toBe('1.0.0')
			expect(emailConfig?.from).toBe('test@example.com')
		})

		it('should return undefined for non-existent top-level keys', () => {
			// @ts-expect-error - Testing invalid key
			const nonExistent = getTypedConfig('nonexistent')
			expect(nonExistent).toBeUndefined()
		})

		it('should work with environment override', () => {
			const testConfig = { app: { name: 'TestApp-Test' } }
			writeFileSync(
				join(tempDir, 'test.json'),
				JSON.stringify(testConfig, null, 2),
			)

			const appConfig = getTypedConfig('app', 'test')
			expect(appConfig?.name).toBe('TestApp-Test')
		})
	})

	describe('hasConfig', () => {
		beforeEach(() => {
			const defaultConfig = {
				app: { name: 'TestApp' },
				email: { from: 'test@example.com' },
			}

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			initConfig({ configDir: tempDir })
		})

		it('should return true for existing paths', () => {
			expect(hasConfig('app')).toBe(true)
			expect(hasConfig('app.name')).toBe(true)
			expect(hasConfig('email.from')).toBe(true)
		})

		it('should return false for non-existent paths', () => {
			expect(hasConfig('nonexistent')).toBe(false)
			expect(hasConfig('app.nonexistent')).toBe(false)
			expect(hasConfig('email.templates.welcome.subject')).toBe(false)
		})

		it('should work with environment override', () => {
			const devConfig = { database: { host: 'localhost' } }
			writeFileSync(
				join(tempDir, 'dev.json'),
				JSON.stringify(devConfig, null, 2),
			)

			expect(hasConfig('database.host', 'dev')).toBe(true)
			expect(hasConfig('database.host', 'test')).toBe(false)
		})
	})

	describe('getEnvironment', () => {
		it('should return current environment', () => {
			process.env.APP_ENV = 'DEV'
			expect(getEnvironment()).toBe('dev')

			process.env.APP_ENV = 'PROD'
			expect(getEnvironment()).toBe('prod')
		})
	})

	describe('clearConfigCache', () => {
		beforeEach(() => {
			const defaultConfig = { app: { name: 'TestApp' } }

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			initConfig({ configDir: tempDir })
		})

		it('should clear configuration cache', () => {
			const config1 = getConfig('app.name')
			clearConfigCache()
			const config2 = getConfig('app.name')

			expect(config1).toBe('TestApp')
			expect(config2).toBe('TestApp')
		})

		it('should handle clearing cache when no global loader exists', () => {
			clearConfigCache()

			expect(() => clearConfigCache()).not.toThrow()
		})
	})

	describe('getAvailableEnvironments', () => {
		beforeEach(() => {
			writeFileSync(join(tempDir, 'default.json'), '{}')
			writeFileSync(join(tempDir, 'dev.json'), '{}')
			writeFileSync(join(tempDir, 'prod.json'), '{}')
			writeFileSync(join(tempDir, 'test.json'), '{}')

			initConfig({ configDir: tempDir })
		})

		it('should return list of available environments', () => {
			const environments = getAvailableEnvironments()

			expect(environments).toContain('default')
			expect(environments).toContain('dev')
			expect(environments).toContain('prod')
			expect(environments).toContain('test')
			expect(environments.length).toBe(4)
		})

		it('should throw error without explicit initialization', () => {
			resetGlobalLoader()

			expect(() => getAvailableEnvironments()).toThrow(
				ConfigDirRequiredError,
			)
		})
	})

	describe('validateRequiredConfig', () => {
		beforeEach(() => {
			const defaultConfig = {
				app: { name: 'TestApp', version: '1.0.0' },
				email: { from: 'test@example.com' },
			}

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			initConfig({ configDir: tempDir })
		})

		it('should validate existing required paths', () => {
			const requiredPaths = ['app.name', 'app.version', 'email.from']
			const result = validateRequiredConfig(requiredPaths)

			expect(result.valid).toBe(true)
			expect(result.missing).toEqual([])
		})

		it('should identify missing required paths', () => {
			const requiredPaths = [
				'app.name',
				'app.nonexistent',
				'database.host',
				'email.from',
			]
			const result = validateRequiredConfig(requiredPaths)

			expect(result.valid).toBe(false)
			expect(result.missing).toEqual(['app.nonexistent', 'database.host'])
		})

		it('should return valid=true for empty required paths', () => {
			const result = validateRequiredConfig([])

			expect(result.valid).toBe(true)
			expect(result.missing).toEqual([])
		})

		it('should work with environment override', () => {
			const devConfig = { database: { host: 'localhost' } }
			writeFileSync(
				join(tempDir, 'dev.json'),
				JSON.stringify(devConfig, null, 2),
			)

			const requiredPaths = ['app.name', 'database.host']
			const testResult = validateRequiredConfig(requiredPaths, 'test')
			const devResult = validateRequiredConfig(requiredPaths, 'dev')

			expect(testResult.valid).toBe(false)
			expect(testResult.missing).toEqual(['database.host'])

			expect(devResult.valid).toBe(true)
			expect(devResult.missing).toEqual([])
		})
	})

	describe('global loader management', () => {
		it('should create global loader when none exists', () => {
			clearConfigCache()

			const defaultConfig = { app: { name: 'TestApp' } }
			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			initConfig({ configDir: tempDir })
			process.env.APP_ENV = 'TEST'

			expect(() => getConfig()).not.toThrow()
		})

		it('should reuse existing global loader', () => {
			const defaultConfig = { app: { name: 'TestApp' } }
			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			initConfig({ configDir: tempDir })

			const config1 = getConfig('app.name')
			const config2 = getConfig('app.name')

			expect(config1).toBe(config2)
		})
	})

	describe('environment resolution', () => {
		beforeEach(() => {
			const defaultConfig = { app: { name: 'TestApp' } }
			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			initConfig({ configDir: tempDir })
		})

		it('should use current environment when none specified', () => {
			process.env.APP_ENV = 'TEST'

			const config = getConfig('app.name')
			expect(config).toBe('TestApp')
		})

		it('should override with specified environment', () => {
			const devConfig = { app: { name: 'DevApp' } }
			writeFileSync(
				join(tempDir, 'dev.json'),
				JSON.stringify(devConfig, null, 2),
			)

			const config = getConfig('app.name', 'dev')
			expect(config).toBe('DevApp')
		})
	})
})
