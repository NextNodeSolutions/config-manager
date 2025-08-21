import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Import generated types for precise type inference in tests
import './__test-fixtures__/generated-types.d.ts'

import {
	initConfig,
	getConfig,
	hasConfig,
	getEnvironment,
	clearConfigCache,
	getAvailableEnvironments,
	validateRequiredConfig,
} from './index'

import type { ConfigOptions } from './types'

describe('Configuration API', () => {
	let tempDir: string

	beforeEach(() => {
		tempDir = join(
			tmpdir(),
			`config-api-test-${Date.now()}-${Math.random()}`,
		)
		mkdirSync(tempDir, { recursive: true })

		vi.stubEnv('APP_ENV', 'TEST')

		clearConfigCache()
	})

	afterEach(() => {
		if (existsSync(tempDir)) {
			rmSync(tempDir, { recursive: true, force: true })
		}

		vi.unstubAllEnvs()
		clearConfigCache()
	})

	describe('initConfig', () => {
		it('should initialize global loader with options', () => {
			const options: ConfigOptions = { configDir: tempDir, cache: false }

			expect(() => initConfig(options)).not.toThrow()
		})

		it('should work with explicit config directory', () => {
			// Use tempDir instead of creating config in current working directory
			writeFileSync(
				join(tempDir, 'default.json'),
				'{"app": {"name": "TestApp"}}',
			)

			expect(() => initConfig({ configDir: tempDir })).not.toThrow()
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

		it('should get configuration values with proper typing', () => {
			// Test that individual paths work correctly
			expect(getConfig('app.name')).toBe('TestApp')
			expect(getConfig('app.debug')).toBe(true)
			expect(getConfig('email.from')).toBe('test-env@example.com')

			// Test that hasConfig works for different paths
			expect(hasConfig('app')).toBe(true)
			expect(hasConfig('email')).toBe(true)
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

		it('should work with automatic type inference', () => {
			const appName = getConfig('app.name')
			const features = getConfig('app.features')
			const debug = getConfig('app.debug')

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
			vi.stubEnv('APP_ENV', 'DEV')
			expect(getEnvironment()).toBe('dev')

			vi.stubEnv('APP_ENV', 'PROD')
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

		it('should work without explicit initialization using default config dir', () => {
			clearConfigCache()

			// This should work now because ensureGlobalLoader creates a loader automatically
			// It will use process.cwd() + '/config' by default
			expect(() => getAvailableEnvironments()).not.toThrow()
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
			vi.stubEnv('APP_ENV', 'TEST')

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
			vi.stubEnv('APP_ENV', 'TEST')

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
