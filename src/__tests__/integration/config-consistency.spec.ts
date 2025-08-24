import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { initConfig, getConfig } from '@/index.js'
import { generateConfigTypes } from '@/lib/types/generator.js'

describe('Configuration Consistency Between Environments', () => {
	let tempDir: string

	beforeAll(() => {
		tempDir = join(tmpdir(), `config-consistency-test-${Date.now()}`)
		mkdirSync(tempDir, { recursive: true })

		// Mock environment variable
		vi.stubEnv('APP_ENV', 'TEST')
	})

	afterAll(() => {
		rmSync(tempDir, { recursive: true, force: true })
	})

	describe('Current behavior with missing properties', () => {
		it('should work correctly when property exists in all environments', () => {
			// Test with consistent configs (like our fixed fixtures)
			initConfig({ configDir: 'src/__tests__/fixtures/configs' })

			// All environments should have these properties
			expect(() => getConfig('database.ssl', 'dev')).not.toThrow()
			expect(() => getConfig('database.ssl', 'prod')).not.toThrow()
			expect(() => getConfig('database.ssl', 'test')).not.toThrow()

			expect(getConfig('database.ssl', 'dev')).toBe(false)
			expect(getConfig('database.ssl', 'prod')).toBe(true)
			expect(getConfig('database.ssl', 'test')).toBe(false)
		})

		it('should demonstrate how consistent structure provides reliable types', () => {
			// With consistent structures, all properties are guaranteed to exist
			initConfig({ configDir: 'src/__tests__/fixtures/configs' })

			// Test that all environments have monitoring section
			const devMonitoring = getConfig('monitoring', 'dev')
			const prodMonitoring = getConfig('monitoring', 'prod')
			const testMonitoring = getConfig('monitoring', 'test')

			// All should have the same structure, just different values
			expect(devMonitoring).toHaveProperty('enabled')
			expect(devMonitoring).toHaveProperty('service')
			expect(prodMonitoring).toHaveProperty('enabled')
			expect(prodMonitoring).toHaveProperty('service')
			expect(testMonitoring).toHaveProperty('enabled')
			expect(testMonitoring).toHaveProperty('service')
		})
	})

	describe('Validation enforcement', () => {
		it('should throw error when generating types for inconsistent configs', () => {
			const configDir = join(tempDir, 'inconsistent')
			mkdirSync(configDir, { recursive: true })

			// Default config
			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					app: { name: 'test' },
					database: { host: 'localhost' },
				}),
			)

			// Dev config with extra property
			writeFileSync(
				join(configDir, 'dev.json'),
				JSON.stringify({
					app: { debug: true }, // debug only exists in dev
				}),
			)

			// Prod config without the debug property
			writeFileSync(
				join(configDir, 'prod.json'),
				JSON.stringify({
					app: { name: 'test-prod' }, // no debug property
				}),
			)

			// This should throw an error during type generation
			expect(() => generateConfigTypes(configDir)).toThrow()
			expect(() => generateConfigTypes(configDir)).toThrow(
				/Configuration consistency validation failed/,
			)
		})

		it('should pass validation when all environments have same structure', () => {
			const configDir = join(tempDir, 'consistent')
			mkdirSync(configDir, { recursive: true })

			// All configs have same structure, just different values
			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					app: { name: 'test', debug: false },
					database: { host: 'localhost', port: 5432 },
				}),
			)

			writeFileSync(
				join(configDir, 'dev.json'),
				JSON.stringify({
					app: { name: 'test-dev', debug: true },
					database: { host: 'dev-host', port: 5433 },
				}),
			)

			writeFileSync(
				join(configDir, 'prod.json'),
				JSON.stringify({
					app: { name: 'test-prod', debug: false },
					database: { host: 'prod-host', port: 5432 },
				}),
			)

			// This should NOT throw an error
			expect(() => generateConfigTypes(configDir)).not.toThrow()
		})

		it('should handle nested structure inconsistencies', () => {
			const configDir = join(tempDir, 'nested-inconsistent')
			mkdirSync(configDir, { recursive: true })

			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					email: {
						provider: 'default',
						templates: {
							welcome: { subject: 'Hello' },
						},
					},
				}),
			)

			writeFileSync(
				join(configDir, 'dev.json'),
				JSON.stringify({
					email: {
						provider: 'console',
						templates: {
							welcome: { subject: 'Hello Dev', debugInfo: true }, // extra nested property
						},
					},
				}),
			)

			writeFileSync(
				join(configDir, 'prod.json'),
				JSON.stringify({
					email: {
						provider: 'sendgrid',
						templates: {
							welcome: { subject: 'Hello Prod' }, // missing debugInfo
						},
					},
				}),
			)

			// Should detect nested inconsistency
			expect(() => generateConfigTypes(configDir)).toThrow()
			expect(() => generateConfigTypes(configDir)).toThrow(
				/email\.templates\.welcome\.debugInfo/,
			)
		})
	})
})
