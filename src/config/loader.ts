import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

import { deepMerge, validateConfig, getCurrentEnvironment } from './utils'
import { FILE_EXTENSIONS, CONFIG_CACHE_PREFIX } from './constants'
import {
	DefaultConfigMissingError,
	InvalidConfigFormatError,
	InvalidJsonSyntaxError,
	ConfigDirNotFoundError,
} from './errors'

import type { ConfigObject, ConfigOptions } from './types'

/**
 * Configuration loader with environment-specific overrides
 */
export class ConfigLoader {
	private cache = new Map<string, ConfigObject>()
	private configDir: string
	private useCache: boolean
	private availableConfigsCache: string[] | null = null

	constructor(options: ConfigOptions = {}) {
		// Use provided configDir or default to process.cwd() + '/config'
		this.configDir = options.configDir || join(process.cwd(), 'config')

		// Verify the configuration directory exists
		if (!existsSync(this.configDir)) {
			throw new ConfigDirNotFoundError(this.configDir)
		}

		this.useCache = options.cache ?? true
	}

	/**
	 * Load configuration for the specified environment
	 */
	loadConfig(environment?: string): ConfigObject {
		const env = environment || getCurrentEnvironment()
		const cacheKey = this.generateCacheKey(env)

		// Return cached config if available
		if (this.useCache && this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey)!
		}

		// Load default configuration
		const defaultConfig = this.loadConfigFile('default')

		// Load environment-specific configuration
		const envConfig = this.loadConfigFile(env)

		// Merge configurations (environment overrides default)
		const mergedConfig = envConfig
			? deepMerge(defaultConfig, envConfig)
			: defaultConfig

		// Cache the result
		if (this.useCache) {
			this.cache.set(cacheKey, mergedConfig)
		}

		return mergedConfig
	}

	/**
	 * Load a specific configuration file
	 */
	private loadConfigFile(filename: string): ConfigObject {
		const configPath = join(
			this.configDir,
			`${filename}${FILE_EXTENSIONS.JSON}`,
		)

		if (!existsSync(configPath)) {
			if (filename === 'default') {
				throw new DefaultConfigMissingError(configPath)
			}
			// Return empty object if environment-specific config doesn't exist
			return {}
		}

		try {
			const configContent = readFileSync(configPath, 'utf-8')
			const parsedConfig = JSON.parse(configContent)

			if (!validateConfig(parsedConfig)) {
				throw new InvalidConfigFormatError(configPath)
			}

			return parsedConfig
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new InvalidJsonSyntaxError(configPath, error.message)
			}
			throw error
		}
	}

	/**
	 * Clear configuration cache
	 */
	clearCache(): void {
		this.cache.clear()
		this.availableConfigsCache = null
	}

	/**
	 * Generate a robust cache key that includes environment and config directory
	 * to avoid collisions between different loader instances
	 */
	private generateCacheKey(environment: string): string {
		const safeDirPath = this.configDir.replace(/[^\w]/g, '_')
		return `${CONFIG_CACHE_PREFIX}${environment}_${safeDirPath}`
	}

	/**
	 * Check if configuration file exists
	 */
	hasConfigFile(filename: string): boolean {
		const configPath = join(
			this.configDir,
			`${filename}${FILE_EXTENSIONS.JSON}`,
		)
		return existsSync(configPath)
	}

	/**
	 * Get available configuration files
	 */
	getAvailableConfigs(): string[] {
		if (this.availableConfigsCache !== null) {
			return this.availableConfigsCache
		}

		try {
			this.availableConfigsCache = readdirSync(this.configDir)
				.filter(file => file.endsWith(FILE_EXTENSIONS.JSON))
				.map(file => file.replace(FILE_EXTENSIONS.JSON, ''))
			return this.availableConfigsCache
		} catch {
			this.availableConfigsCache = []
			return this.availableConfigsCache
		}
	}
}
