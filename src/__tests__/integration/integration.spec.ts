import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Import generated types for precise type inference in tests
import '@/__tests__/fixtures/configs/generated-types.d.ts'

import {
	initConfig,
	getConfig,
	hasConfig,
	getEnvironment,
	clearConfigCache,
	getAvailableEnvironments,
	validateRequiredConfig,
} from '@/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const fixturesDir = join(__dirname, '../fixtures/configs')

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
			expect(getConfig('app.name')).toBe('NextNode Functions Server')
			expect(getConfig('app.environment')).toBe('test')
			expect(getConfig('app.debug')).toBe(true)
			expect(getConfig('email.from')).toBe('test@nextnode.test')
			expect(getConfig('email.provider')).toBe('mock')
			expect(getConfig('database.port')).toBe(5434)
		})

		it('should correctly merge environment-specific overrides', () => {
			expect(getConfig('app.debug', 'dev')).toBe(true)
			expect(getConfig('email.provider', 'dev')).toBe('console')
			expect(getConfig('database.port', 'dev')).toBe(5433)

			expect(getConfig('app.debug', 'prod')).toBe(false)
			expect(getConfig('email.provider', 'prod')).toBe('sendgrid')
			expect(getConfig('database.ssl', 'prod')).toBe(true)
		})

		it('should preserve default values when not overridden', () => {
			expect(getConfig('app.name', 'prod')).toBe(
				'NextNode Functions Server',
			)
			expect(getConfig('app.version', 'prod')).toBe('1.0.0')
			expect(getConfig('database.name', 'prod')).toBe(
				'nextnode_production',
			)
			expect(getConfig('api.retries', 'prod')).toBe(5)
		})

		it('should handle deep merging of nested objects', () => {
			expect(getConfig('email.templates.welcome.subject', 'dev')).toBe(
				'[DEV] Welcome to NextNode',
			)
			expect(getConfig('email.templates.welcome.body', 'dev')).toBe(
				'Welcome to our development environment!',
			)
			expect(
				getConfig('email.templates.projectRequest.subject', 'dev'),
			).toBe('New Project Request')
		})
	})

	describe('Type-safe configuration access', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir })
			vi.stubEnv('APP_ENV', 'TEST')
		})

		it('should provide access to configuration sections', () => {
			expect(getConfig('app.name')).toBe('NextNode Functions Server')
			expect(getConfig('app.features')).toEqual(['config'])
			expect(getConfig('email.from')).toBe('test@nextnode.test')
			expect(getConfig('email.templates.welcome.subject')).toBe(
				'[TEST] Welcome',
			)
		})

		it('should work with different environments', () => {
			expect(getConfig('app.debug', 'prod')).toBe(false)
			expect(getConfig('app.features', 'prod')).toContain('monitoring')
			expect(getConfig('email.provider', 'dev')).toBe('console')
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
				'app.name', // This exists in default but not overridden in environments
				'nonexistent.property', // This doesn't exist anywhere
				'database.ssl', // This should exist in all environments now
			]

			const testResult = validateRequiredConfig(requiredPaths, 'test')
			const prodResult = validateRequiredConfig(requiredPaths, 'prod')

			expect(testResult.valid).toBe(false)
			expect(testResult.missing).toEqual([
				'nonexistent.property', // Only this should be missing now
			])

			expect(prodResult.valid).toBe(false)
			expect(prodResult.missing).toEqual([
				'nonexistent.property', // Same missing property
			])
		})
	})

	describe('Environment-specific behavior', () => {
		beforeEach(() => {
			initConfig({ configDir: fixturesDir })
		})

		it('should handle development environment correctly', () => {
			vi.stubEnv('APP_ENV', 'DEV')

			expect(getConfig('app.debug')).toBe(true)
			expect(getConfig('email.provider')).toBe('console')
			expect(getConfig('api.timeout')).toBe(10000)
			expect(getEnvironment()).toBe('dev')
		})

		it('should handle production environment correctly', () => {
			vi.stubEnv('APP_ENV', 'PROD')

			expect(getConfig('app.debug')).toBe(false)
			expect(getConfig('email.provider')).toBe('sendgrid')
			expect(getConfig('database.ssl')).toBe(true)
			expect(getConfig('monitoring.enabled')).toBe(true)
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
			expect(getConfig('app.name', 'prod')).toBe(
				'NextNode Functions Server',
			)
			expect(getConfig('app.features', 'prod')).toEqual([
				'config',
				'logging',
				'metrics',
				'monitoring',
			])
			expect(getConfig('email.from', 'prod')).toBe('noreply@nextnode.com')
			expect(getConfig('email.provider', 'prod')).toBe('sendgrid')
		})

		it('should preserve arrays from environment overrides', () => {
			expect(getConfig('app.features', 'dev')).toEqual([
				'config',
				'logging',
			])
			expect(getConfig('app.features', 'prod')).toEqual([
				'config',
				'logging',
				'metrics',
				'monitoring',
			])
		})
	})
})
