import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { ConfigObject, ConfigValue } from '@/lib/definitions/types.js'

/**
 * Test helper utilities for reducing duplication in test files
 * These utilities provide clean, reusable functions for common test patterns
 */

/**
 * Create a temporary directory for testing
 * @returns Path to the created temporary directory
 */
export const createTempDir = (prefix = 'config-test'): string => {
	const tempDir = join(tmpdir(), `${prefix}-${Date.now()}-${Math.random()}`)
	mkdirSync(tempDir, { recursive: true })
	return tempDir
}

/**
 * Clean up a temporary directory
 * @param tempDir Path to the temporary directory to remove
 */
export const cleanupTempDir = (tempDir: string): void => {
	if (existsSync(tempDir)) {
		rmSync(tempDir, { recursive: true, force: true })
	}
}

/**
 * Write a JSON configuration file to a directory
 * @param dir Directory to write the file to
 * @param filename Name of the file (e.g., 'default.json')
 * @param config Configuration object to write
 * @param pretty Whether to pretty-print the JSON (default: true)
 */
export const writeConfigFile = (
	dir: string,
	filename: string,
	config: ConfigObject | Record<string, unknown>,
	pretty = true,
): void => {
	const content = pretty
		? JSON.stringify(config, null, 2)
		: JSON.stringify(config)
	writeFileSync(join(dir, filename), content)
}

/**
 * Create multiple configuration files at once
 * @param dir Directory to write files to
 * @param configs Object mapping filenames to configurations
 * @param pretty Whether to pretty-print the JSON (default: true)
 */
export const writeConfigFiles = (
	dir: string,
	configs: Record<string, ConfigObject | Record<string, unknown>>,
	pretty = true,
): void => {
	for (const [filename, config] of Object.entries(configs)) {
		writeConfigFile(dir, filename, config, pretty)
	}
}

/**
 * Create a test configuration directory with standard configs
 * Useful for quickly setting up common test scenarios
 * @param options Configuration options
 * @returns Path to the created directory
 */
export interface TestConfigOptions {
	prefix?: string
	defaultConfig?: ConfigObject
	envConfigs?: Record<string, ConfigObject>
	pretty?: boolean
}

export const createTestConfigDir = (
	options: TestConfigOptions = {},
): string => {
	const {
		prefix = 'config-test',
		defaultConfig = { app: { name: 'test-app' } },
		envConfigs = {},
		pretty = true,
	} = options

	const tempDir = createTempDir(prefix)

	// Always write default config
	writeConfigFile(tempDir, 'default.json', defaultConfig, pretty)

	// Write environment-specific configs
	for (const [env, config] of Object.entries(envConfigs)) {
		writeConfigFile(tempDir, `${env}.json`, config, pretty)
	}

	return tempDir
}

/**
 * Create a nested configuration structure for testing
 * Helps create deep object structures without manual nesting
 * @param paths Array of path-value pairs (e.g., [['app.name', 'test'], ['app.debug', true]])
 * @returns Configuration object with nested structure
 */
export const createNestedConfig = (
	paths: Array<[string, unknown]>,
): ConfigObject => {
	const config: ConfigObject = {}

	for (const [path, value] of paths) {
		const keys = path.split('.')
		let current = config

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i]
			if (!key) continue // Skip empty keys

			if (!(key in current)) {
				current[key] = {}
			}
			current = current[key] as ConfigObject
		}

		const lastKey = keys[keys.length - 1]
		if (lastKey) {
			current[lastKey] = value as ConfigValue
		}
	}

	return config
}

/**
 * Assert that a configuration has specific nested values
 * Useful for validating merged configurations
 * @param config Configuration object to check
 * @param expectations Array of path-value pairs to validate
 */
export const assertConfigValues = (
	config: ConfigObject,
	expectations: Array<[string, unknown]>,
): void => {
	for (const [path, expectedValue] of expectations) {
		const keys = path.split('.')
		let current: unknown = config

		for (const key of keys) {
			if (
				current &&
				typeof current === 'object' &&
				!Array.isArray(current)
			) {
				current = (current as Record<string, unknown>)[key]
			} else {
				throw new Error(
					`Path '${path}' not found in config at key '${key}'`,
				)
			}
		}

		if (JSON.stringify(current) !== JSON.stringify(expectedValue)) {
			throw new Error(
				`Config value at '${path}' does not match. Expected: ${JSON.stringify(expectedValue)}, Got: ${JSON.stringify(current)}`,
			)
		}
	}
}

/**
 * Create a config with common test patterns
 * Provides frequently used configuration structures
 */
export const TEST_CONFIGS = {
	basic: (): ConfigObject => ({
		app: { name: 'test-app', version: '1.0.0' },
		email: { from: 'test@example.com' },
	}),

	withDatabase: (): ConfigObject => ({
		app: { name: 'test-app', version: '1.0.0' },
		database: { host: 'localhost', port: 5432, ssl: false },
		email: { from: 'test@example.com' },
	}),

	withFeatures: (): ConfigObject => ({
		app: {
			name: 'test-app',
			version: '1.0.0',
			features: ['auth', 'api', 'logging'],
			debug: false,
		},
		email: { from: 'test@example.com' },
	}),

	nested: (): ConfigObject => ({
		app: {
			name: 'test-app',
			version: '1.0.0',
			settings: {
				theme: 'dark',
				notifications: {
					email: true,
					push: false,
				},
			},
		},
		email: {
			from: 'test@example.com',
			templates: {
				welcome: {
					subject: 'Welcome!',
					body: 'Hello there',
				},
				reset: {
					subject: 'Reset Password',
					body: 'Click here to reset',
				},
			},
		},
	}),

	environments: (): Record<string, ConfigObject> => ({
		default: TEST_CONFIGS.basic(),
		dev: {
			app: { debug: true },
			email: { from: 'dev@example.com' },
		},
		prod: {
			app: { debug: false },
			email: { from: 'prod@example.com' },
		},
		test: {
			app: { debug: true },
			email: { from: 'test-env@example.com' },
		},
	}),
}
