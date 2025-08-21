import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

import { ConfigLoader } from './loader'
import {
	DefaultConfigMissingError,
	InvalidConfigFormatError,
	InvalidJsonSyntaxError,
	ConfigDirNotFoundError,
} from './errors'

import type { ConfigOptions } from './types'

describe('ConfigLoader', () => {
	let tempDir: string
	let loader: ConfigLoader

	beforeEach(() => {
		tempDir = join(tmpdir(), `config-test-${Date.now()}-${Math.random()}`)
		mkdirSync(tempDir, { recursive: true })
	})

	afterEach(() => {
		if (existsSync(tempDir)) {
			rmSync(tempDir, { recursive: true, force: true })
		}
	})

	describe('constructor', () => {
		it('should throw error when default config directory does not exist', () => {
			const cwdSpy = vi
				.spyOn(process, 'cwd')
				.mockReturnValue('/non-existent-path')

			expect(() => new ConfigLoader()).toThrow(ConfigDirNotFoundError)
			expect(() => new ConfigLoader({})).toThrow(ConfigDirNotFoundError)

			cwdSpy.mockRestore()
		})

		it('should use provided config directory', () => {
			const options: ConfigOptions = { configDir: tempDir }
			loader = new ConfigLoader(options)
			expect(loader).toBeInstanceOf(ConfigLoader)
		})

		it('should respect cache option', () => {
			const options: ConfigOptions = { configDir: tempDir, cache: false }
			loader = new ConfigLoader(options)
			expect(loader).toBeInstanceOf(ConfigLoader)
		})
	})

	describe('loadConfig', () => {
		beforeEach(() => {
			loader = new ConfigLoader({ configDir: tempDir })
		})

		it('should load default configuration only', () => {
			const defaultConfig = {
				app: { name: 'TestApp', version: '1.0.0' },
				email: { from: 'default@example.com' },
			}

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			const result = loader.loadConfig('dev')
			expect(result).toEqual(defaultConfig)
		})

		it('should merge environment-specific configuration with default', () => {
			const defaultConfig = {
				app: { name: 'TestApp', version: '1.0.0' },
				email: { from: 'default@example.com' },
			}

			const devConfig = {
				email: { from: 'dev@example.com' },
				app: { debug: true },
			}

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)
			writeFileSync(
				join(tempDir, 'dev.json'),
				JSON.stringify(devConfig, null, 2),
			)

			const result = loader.loadConfig('dev')
			expect(result).toEqual({
				app: { name: 'TestApp', version: '1.0.0', debug: true },
				email: { from: 'dev@example.com' },
			})
		})

		it('should use current environment when none specified', () => {
			const defaultConfig = { app: { name: 'TestApp' } }
			const testConfig = { app: { env: 'test' } }

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)
			writeFileSync(
				join(tempDir, 'test.json'),
				JSON.stringify(testConfig, null, 2),
			)

			vi.stubEnv('APP_ENV', 'TEST')

			const result = loader.loadConfig()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((result.app as any)?.env).toBe('test')

			vi.unstubAllEnvs()
		})

		it('should cache configuration when cache is enabled', () => {
			const defaultConfig = { app: { name: 'TestApp' } }

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			const cacheLoader = new ConfigLoader({
				configDir: tempDir,
				cache: true,
			})
			const result1 = cacheLoader.loadConfig('dev')
			const result2 = cacheLoader.loadConfig('dev')

			expect(result1).toBe(result2)
		})

		it('should not cache configuration when cache is disabled', () => {
			const defaultConfig = { app: { name: 'TestApp' } }

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			const noCacheLoader = new ConfigLoader({
				configDir: tempDir,
				cache: false,
			})
			const result1 = noCacheLoader.loadConfig('dev')
			const result2 = noCacheLoader.loadConfig('dev')

			expect(result1).toEqual(result2)
			expect(result1).not.toBe(result2)
		})

		it('should throw DefaultConfigMissingError when default.json is missing', () => {
			expect(() => loader.loadConfig('dev')).toThrow(
				DefaultConfigMissingError,
			)
		})

		it('should throw InvalidJsonSyntaxError for malformed JSON', () => {
			writeFileSync(join(tempDir, 'default.json'), '{ invalid json }')

			expect(() => loader.loadConfig('dev')).toThrow(
				InvalidJsonSyntaxError,
			)
		})

		it('should throw InvalidConfigFormatError for non-object JSON', () => {
			writeFileSync(join(tempDir, 'default.json'), '"string value"')

			expect(() => loader.loadConfig('dev')).toThrow(
				InvalidConfigFormatError,
			)
		})

		it('should handle missing environment-specific config gracefully', () => {
			const defaultConfig = { app: { name: 'TestApp' } }

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			const result = loader.loadConfig('nonexistent')
			expect(result).toEqual(defaultConfig)
		})
	})

	describe('clearCache', () => {
		beforeEach(() => {
			loader = new ConfigLoader({ configDir: tempDir })
		})

		it('should clear configuration cache', () => {
			const defaultConfig = { app: { name: 'TestApp' } }

			writeFileSync(
				join(tempDir, 'default.json'),
				JSON.stringify(defaultConfig, null, 2),
			)

			const result1 = loader.loadConfig('dev')
			loader.clearCache()
			const result2 = loader.loadConfig('dev')

			expect(result1).toEqual(result2)
		})

		it('should clear available configs cache', () => {
			writeFileSync(join(tempDir, 'default.json'), '{}')
			writeFileSync(join(tempDir, 'dev.json'), '{}')

			const configs1 = loader.getAvailableConfigs()
			writeFileSync(join(tempDir, 'prod.json'), '{}')

			loader.clearCache()
			const configs2 = loader.getAvailableConfigs()

			expect(configs1.length).toBe(2)
			expect(configs2.length).toBe(3)
			expect(configs2).toContain('prod')
		})
	})

	describe('hasConfigFile', () => {
		beforeEach(() => {
			loader = new ConfigLoader({ configDir: tempDir })
		})

		it('should return true for existing config files', () => {
			writeFileSync(join(tempDir, 'default.json'), '{}')

			expect(loader.hasConfigFile('default')).toBe(true)
		})

		it('should return false for non-existing config files', () => {
			expect(loader.hasConfigFile('nonexistent')).toBe(false)
		})
	})

	describe('getAvailableConfigs', () => {
		beforeEach(() => {
			loader = new ConfigLoader({ configDir: tempDir })
		})

		it('should return list of available configuration files', () => {
			writeFileSync(join(tempDir, 'default.json'), '{}')
			writeFileSync(join(tempDir, 'dev.json'), '{}')
			writeFileSync(join(tempDir, 'prod.json'), '{}')
			writeFileSync(join(tempDir, 'not-json.txt'), 'text file')

			const configs = loader.getAvailableConfigs()

			expect(configs).toContain('default')
			expect(configs).toContain('dev')
			expect(configs).toContain('prod')
			expect(configs).not.toContain('not-json')
			expect(configs.length).toBe(3)
		})

		it('should throw error for non-existent config directory', () => {
			expect(
				() =>
					new ConfigLoader({
						configDir: '/non-existent-directory',
					}),
			).toThrow(ConfigDirNotFoundError)
		})

		it('should cache available configs result', () => {
			writeFileSync(join(tempDir, 'default.json'), '{}')

			const configs1 = loader.getAvailableConfigs()
			const configs2 = loader.getAvailableConfigs()

			expect(configs1).toBe(configs2)
		})
	})

	describe('error handling', () => {
		beforeEach(() => {
			loader = new ConfigLoader({ configDir: tempDir })
		})

		it('should preserve original error when not JSON syntax error', () => {
			writeFileSync(join(tempDir, 'default.json'), JSON.stringify([]))

			expect(() => loader.loadConfig('dev')).toThrow(
				InvalidConfigFormatError,
			)
		})
	})

	describe('cache key generation', () => {
		it('should generate unique cache keys for different directories', () => {
			const tempDir2 = join(
				tmpdir(),
				`config-test-2-${Date.now()}-${Math.random()}`,
			)
			mkdirSync(tempDir2, { recursive: true })

			try {
				writeFileSync(
					join(tempDir, 'default.json'),
					'{"app": {"name": "App1"}}',
				)
				writeFileSync(
					join(tempDir2, 'default.json'),
					'{"app": {"name": "App2"}}',
				)

				const loader1 = new ConfigLoader({ configDir: tempDir })
				const loader2 = new ConfigLoader({ configDir: tempDir2 })

				const config1 = loader1.loadConfig('dev')
				const config2 = loader2.loadConfig('dev')

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				expect((config1.app as any)?.name).toBe('App1')
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				expect((config2.app as any)?.name).toBe('App2')
			} finally {
				rmSync(tempDir2, { recursive: true, force: true })
			}
		})
	})
})
