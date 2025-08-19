import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import {
	initConfig,
	getConfig,
	hasConfig,
	getEnvironment,
	clearConfigCache,
	getAvailableEnvironments,
	validateRequiredConfig,
} from './index'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const fixturesDir = join(__dirname, '__test-fixtures__')

describe('Configuration Integration Tests', () => {
	beforeEach(() => {
		clearConfigCache()
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		clearConfigCache()
	})

	describe('Real configuration file loading', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir })
			vi.stubEnv('APP_ENV', 'TEST')
		})

		it('should load and merge configuration from real files', () => {
			const config = getConfig()

			expect(config?.app?.name).toBe('NextNode Functions Server')
			expect(config?.app?.environment).toBe('test')
			expect(config?.app?.debug).toBe(true)
			expect(config?.email?.from).toBe('test@nextnode.test')
			expect(config?.email?.provider).toBe('mock')
			expect(config?.database?.port).toBe(5434)
		})

		it('should correctly merge environment-specific overrides', () => {
			const devConfig = getConfig(undefined, 'dev')
			const prodConfig = getConfig(undefined, 'prod')

			expect(devConfig?.app?.debug).toBe(true)
			expect(devConfig?.email?.provider).toBe('console')
			expect(devConfig?.database?.port).toBe(5433)

			expect(prodConfig?.app?.debug).toBe(false)
			expect(prodConfig?.email?.provider).toBe('sendgrid')
			expect(prodConfig?.database?.ssl).toBe(true)
		})

		it('should preserve default values when not overridden', () => {
			const config = getConfig(undefined, 'prod')

			expect(config?.app?.name).toBe('NextNode Functions Server')
			expect(config?.app?.version).toBe('1.0.0')
			expect(config?.database?.name).toBe('nextnode_production')
			expect(config?.api?.retries).toBe(5)
		})

		it('should handle deep merging of nested objects', () => {
			const devConfig = getConfig(undefined, 'dev')

			expect(devConfig?.email?.templates?.welcome?.subject).toBe(
				'[DEV] Welcome to NextNode',
			)
			expect(devConfig?.email?.templates?.welcome?.body).toBe(
				'Welcome to our platform!',
			)
			expect(devConfig?.email?.templates?.projectRequest?.subject).toBe(
				'New Project Request',
			)
		})
	})

	describe('Type-safe configuration access', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir })
			vi.stubEnv('APP_ENV', 'TEST')
		})

		it('should provide access to configuration sections', () => {
			const appConfig = getConfig('app')
			const emailConfig = getConfig('email')

			expect(appConfig?.name).toBe('NextNode Functions Server')
			expect(appConfig?.features).toEqual(['config'])
			expect(emailConfig?.from).toBe('test@nextnode.test')
			expect(emailConfig?.templates?.welcome?.subject).toBe(
				'[TEST] Welcome',
			)
		})

		it('should work with different environments', () => {
			const prodAppConfig = getConfig('app', 'prod')
			const devEmailConfig = getConfig('email', 'dev')

			expect(prodAppConfig?.debug).toBe(false)
			expect(prodAppConfig?.features).toContain('monitoring')
			expect(devEmailConfig?.provider).toBe('console')
		})
	})

	describe('Configuration validation scenarios', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir })
			vi.stubEnv('APP_ENV', 'TEST')
		})

		it('should validate complex configuration requirements', () => {
			const requiredPaths = [
				'app.name',
				'app.version',
				'email.from',
				'email.templates.welcome.subject',
				'database.host',
				'database.port',
				'api.baseUrl',
			]

			const result = validateRequiredConfig(requiredPaths)

			expect(result.valid).toBe(true)
			expect(result.missing).toEqual([])
		})

		it('should identify missing configuration in different environments', () => {
			const requiredPaths = [
				'app.name',
				'monitoring.enabled',
				'database.ssl',
			]

			const testResult = validateRequiredConfig(requiredPaths, 'test')
			const prodResult = validateRequiredConfig(requiredPaths, 'prod')

			expect(testResult.valid).toBe(false)
			expect(testResult.missing).toEqual([
				'monitoring.enabled',
				'database.ssl',
			])

			expect(prodResult.valid).toBe(true)
			expect(prodResult.missing).toEqual([])
		})
	})

	describe('Environment-specific behavior', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir })
		})

		it('should handle development environment correctly', () => {
			vi.stubEnv('APP_ENV', 'DEV')

			const config = getConfig()
			expect(config?.app?.debug).toBe(true)
			expect(config?.email?.provider).toBe('console')
			expect(config?.api?.timeout).toBe(10000)
			expect(getEnvironment()).toBe('dev')
		})

		it('should handle production environment correctly', () => {
			vi.stubEnv('APP_ENV', 'PROD')

			const config = getConfig()
			expect(config?.app?.debug).toBe(false)
			expect(config?.email?.provider).toBe('sendgrid')
			expect(config?.database?.ssl).toBe(true)
			expect(config?.monitoring?.enabled).toBe(true)
			expect(getEnvironment()).toBe('prod')
		})
	})

	describe('Configuration file discovery', () => {
		it('should discover all available configuration files', () => {
			initConfig({ configDir: fixturesDir })

			const environments = getAvailableEnvironments()

			expect(environments).toContain('default')
			expect(environments).toContain('dev')
			expect(environments).toContain('prod')
			expect(environments).toContain('test')
			expect(environments).toContain('invalid')
			expect(environments).toContain('not-object')
			expect(environments.length).toBeGreaterThanOrEqual(6)
		})
	})

	describe('Performance and caching', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir, cache: true })
			vi.stubEnv('APP_ENV', 'TEST')
		})

		it('should cache configuration for repeated access', () => {
			// Test that the same object reference is returned from cache
			const config1 = getConfig()
			const config2 = getConfig()

			// With caching enabled, should return exact same object reference
			expect(config1).toBe(config2)

			// Clear cache and verify new object is created
			clearConfigCache()
			const config3 = getConfig()

			// After clearing cache, should be different object reference
			expect(config3).not.toBe(config1)
			expect(config3).toEqual(config1) // But same content
		})

		it('should return identical objects when cached', () => {
			const config1 = getConfig()
			const config2 = getConfig()

			expect(config1).toBe(config2)
		})
	})

	describe('Complex nested configuration access', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir })
			vi.stubEnv('APP_ENV', 'TEST')
		})

		it('should handle deeply nested configuration paths', () => {
			expect(getConfig('email.templates.welcome.subject')).toBe(
				'[TEST] Welcome',
			)
			expect(getConfig('email.templates.welcome.body')).toBe(
				'Test welcome message',
			)
			expect(getConfig('email.templates.projectRequest.subject')).toBe(
				'New Project Request',
			)
		})

		it('should correctly check existence of nested paths', () => {
			expect(hasConfig('email.templates.welcome')).toBe(true)
			expect(hasConfig('email.templates.welcome.subject')).toBe(true)
			expect(hasConfig('email.templates.nonexistent')).toBe(false)
			expect(hasConfig('email.templates.welcome.nonexistent')).toBe(false)
		})
	})

	describe('Environment precedence and merging', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir })
		})

		it('should demonstrate correct precedence order', () => {
			const config = getConfig(undefined, 'prod')

			expect(config?.app?.name).toBe('NextNode Functions Server')
			expect(config?.app?.features).toEqual([
				'config',
				'logging',
				'metrics',
				'monitoring',
			])
			expect(config?.email?.from).toBe('noreply@nextnode.com')
			expect(config?.email?.provider).toBe('sendgrid')
		})

		it('should preserve arrays from environment overrides', () => {
			const defaultConfig = getConfig(undefined, 'dev')
			const prodConfig = getConfig(undefined, 'prod')

			expect(defaultConfig?.app?.features).toEqual([
				'config',
				'logging',
				'metrics',
			])
			expect(prodConfig?.app?.features).toEqual([
				'config',
				'logging',
				'metrics',
				'monitoring',
			])
		})
	})
})
