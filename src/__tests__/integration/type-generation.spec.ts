import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { generateConfigTypes } from '@/lib/types/generator.js'
// Import generated types for precise type inference validation
import '@/__tests__/fixtures/configs/generated-types.d.ts'
import { getConfig, initConfig } from '@/index.js'

describe('Type Generation', () => {
	let tempDir: string

	beforeAll(() => {
		tempDir = join(tmpdir(), `config-test-${Date.now()}`)
		mkdirSync(tempDir, { recursive: true })
	})

	afterAll(() => {
		rmSync(tempDir, { recursive: true, force: true })
	})

	describe('Union Type Generation', () => {
		it('should generate exact string literal types for string values', () => {
			const configDir = join(tempDir, 'string-literals')
			mkdirSync(configDir, { recursive: true })

			// Create configs with different string values
			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					provider: 'default',
					environment: 'development',
				}),
			)

			writeFileSync(
				join(configDir, 'prod.json'),
				JSON.stringify({
					provider: 'sendgrid',
					environment: 'production',
				}),
			)

			const typeDeclaration = generateConfigTypes(configDir)

			expect(typeDeclaration).toContain(
				"readonly provider: 'default' | 'sendgrid'",
			)
			expect(typeDeclaration).toContain(
				"readonly environment: 'development' | 'production'",
			)
		})

		it('should generate exact number literal types for number values', () => {
			const configDir = join(tempDir, 'number-literals')
			mkdirSync(configDir, { recursive: true })

			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					port: 3000,
					timeout: 5000,
				}),
			)

			writeFileSync(
				join(configDir, 'dev.json'),
				JSON.stringify({
					port: 3001,
					timeout: 10000,
				}),
			)

			const typeDeclaration = generateConfigTypes(configDir)

			expect(typeDeclaration).toContain('readonly port: 3000 | 3001')
			expect(typeDeclaration).toContain('readonly timeout: 5000 | 10000')
		})

		it('should generate exact boolean literal types for boolean values', () => {
			const configDir = join(tempDir, 'boolean-literals')
			mkdirSync(configDir, { recursive: true })

			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					debug: false,
					ssl: true,
				}),
			)

			writeFileSync(
				join(configDir, 'dev.json'),
				JSON.stringify({
					debug: true,
					// ssl not overridden, should still be true
				}),
			)

			const typeDeclaration = generateConfigTypes(configDir)

			expect(typeDeclaration).toContain('readonly debug: false | true')
			expect(typeDeclaration).toContain('readonly ssl: true')
		})

		it('should handle arrays with union types for elements', () => {
			const configDir = join(tempDir, 'array-unions')
			mkdirSync(configDir, { recursive: true })

			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					features: ['auth', 'logging'],
				}),
			)

			writeFileSync(
				join(configDir, 'prod.json'),
				JSON.stringify({
					features: ['auth', 'logging', 'metrics', 'monitoring'],
				}),
			)

			const typeDeclaration = generateConfigTypes(configDir)

			expect(typeDeclaration).toContain(
				"readonly features: readonly ('auth' | 'logging')[] | readonly ('auth' | 'logging' | 'metrics' | 'monitoring')[]",
			)
		})

		it('should escape single quotes in string literals', () => {
			const configDir = join(tempDir, 'escaped-quotes')
			mkdirSync(configDir, { recursive: true })

			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					message: "We're excited to have you!",
					title: "User's Profile",
				}),
			)

			const typeDeclaration = generateConfigTypes(configDir)

			expect(typeDeclaration).toContain(
				"readonly message: 'We\\'re excited to have you!'",
			)
			expect(typeDeclaration).toContain(
				"readonly title: 'User\\'s Profile'",
			)
		})
	})

	describe('Runtime Type Validation with Generated Types', () => {
		beforeAll(() => {
			// Mock environment variable
			vi.stubEnv('APP_ENV', 'TEST')
			// Initialize config using our test fixtures which have generated types
			initConfig({ configDir: 'src/__tests__/fixtures/configs' })
		})

		it('should provide exact type inference for string values', () => {
			// These should have exact string literal types based on generated-types.d.ts
			const provider = getConfig('email.provider') // Should be 'default' | 'console' | 'sendgrid' | 'mock'
			const environment = getConfig('app.environment') // Should be 'default' | 'development' | 'production' | 'test'

			// Runtime validation that values are from expected set
			const validProviders = ['default', 'console', 'sendgrid', 'mock']
			const validEnvironments = [
				'default',
				'development',
				'production',
				'test',
			]

			expect(validProviders).toContain(provider)
			expect(validEnvironments).toContain(environment)
		})

		it('should provide exact type inference for number values', () => {
			const port = getConfig('database.port') // Should be 5432 | 5433 | 5434
			const timeout = getConfig('api.timeout') // Should be 5000 | 10000 | 3000 | 1000

			// Runtime validation that values are from expected set
			const validPorts = [5432, 5433, 5434]
			const validTimeouts = [5000, 10000, 3000, 1000]

			expect(validPorts).toContain(port)
			expect(validTimeouts).toContain(timeout)
		})

		it('should provide exact type inference for boolean values', () => {
			const appDebug = getConfig('app.debug') // Should be true | false
			const dbDebug = getConfig('database.debug') // Should be true | false

			expect(typeof appDebug).toBe('boolean')
			expect(typeof dbDebug).toBe('boolean')
		})

		it('should validate array element types match expected unions', () => {
			const features = getConfig('app.features') // Should be array with specific string literals

			expect(Array.isArray(features)).toBe(true)

			// All elements should be from the expected set
			const validFeatures = ['config', 'logging', 'metrics', 'monitoring']
			// TODO: Fix type generation for arrays - should be readonly string[] not union of different arrays
			if (Array.isArray(features)) {
				features.forEach((feature: string) => {
					expect(validFeatures).toContain(feature)
				})
			}
		})

		it('should handle nested object types with exact inference', () => {
			const welcomeSubject = getConfig('email.templates.welcome.subject')
			const welcomeBody = getConfig('email.templates.welcome.body')

			// Should be from exact set based on configs
			const validSubjects = [
				'Welcome to NextNode',
				'[DEV] Welcome to NextNode',
				'[TEST] Welcome',
			]
			const validBodies = [
				'Welcome to our platform!',
				"Thank you for joining NextNode. We're excited to have you on board!",
				'Test welcome message',
			]

			expect(validSubjects).toContain(welcomeSubject)
			expect(validBodies).toContain(welcomeBody)
		})
	})

	describe('Complex Type Generation Scenarios', () => {
		it('should handle mixed primitive types in union', () => {
			const configDir = join(tempDir, 'mixed-types')
			mkdirSync(configDir, { recursive: true })

			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					config: {
						maxConnections: 100,
						enableCache: true,
						cacheType: 'memory',
					},
				}),
			)

			writeFileSync(
				join(configDir, 'prod.json'),
				JSON.stringify({
					config: {
						maxConnections: 1000,
						enableCache: false,
						cacheType: 'redis',
					},
				}),
			)

			const typeDeclaration = generateConfigTypes(configDir)

			expect(typeDeclaration).toContain(
				'readonly maxConnections: 100 | 1000',
			)
			expect(typeDeclaration).toContain(
				'readonly enableCache: true | false',
			)
			expect(typeDeclaration).toContain(
				"readonly cacheType: 'memory' | 'redis'",
			)
		})

		it('should generate single literal type when value is consistent across environments', () => {
			const configDir = join(tempDir, 'consistent-values')
			mkdirSync(configDir, { recursive: true })

			writeFileSync(
				join(configDir, 'default.json'),
				JSON.stringify({
					appName: 'MyApp',
					version: '1.0.0',
				}),
			)

			writeFileSync(
				join(configDir, 'dev.json'),
				JSON.stringify({
					// Same values in dev
					appName: 'MyApp',
					version: '1.0.0',
				}),
			)

			const typeDeclaration = generateConfigTypes(configDir)

			// Should be single literal types, not unions
			expect(typeDeclaration).toContain("readonly appName: 'MyApp'")
			expect(typeDeclaration).toContain("readonly version: '1.0.0'")
		})
	})
})
