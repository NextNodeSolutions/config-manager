import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

import { deepMerge } from '../utils/helpers'
import { validateConfig, getCurrentEnvironment } from '../utils/validation'
import { FILE_EXTENSIONS, CONFIG_CACHE_PREFIX } from '../definitions/constants'
import {
	DefaultConfigMissingError,
	InvalidConfigFormatError,
	InvalidJsonSyntaxError,
	ConfigDirNotFoundError,
} from '../definitions/errors'

import type { ConfigObject, ConfigOptions } from '../definitions/types'

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

		// Load and merge configurations
		const config = this.mergeConfigs(env)

		// Cache the result
		if (this.useCache) {
			this.cache.set(cacheKey, config)
		}

		return config
	}

	/**
	 * Get the configuration directory path
	 */
	getConfigDirectory(): string {
		return this.configDir
	}

	/**
	 * Clear configuration cache
	 */
	clearCache(): void {
		this.cache.clear()
		this.availableConfigsCache = null
	}

	/**
	 * Check if configuration file exists
	 */
	hasConfigFile(filename: string): boolean {
		const configPath = this.buildConfigPath(filename)
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

	/**
	 * Merge default and environment configurations
	 */
	private mergeConfigs(environment: string): ConfigObject {
		// Load default configuration (required)
		const defaultConfig = this.loadConfigFile('default')

		// Load environment-specific configuration (optional)
		const envConfig = this.loadConfigFile(environment)

		// Merge configurations (environment overrides default)
		return envConfig ? deepMerge(defaultConfig, envConfig) : defaultConfig
	}

	/**
	 * Load a specific configuration file
	 */
	private loadConfigFile(filename: string): ConfigObject {
		const configPath = this.buildConfigPath(filename)

		if (!existsSync(configPath)) {
			if (filename === 'default') {
				throw new DefaultConfigMissingError(configPath)
			}
			// Return empty object if environment-specific config doesn't exist
			return {}
		}

		return this.parseConfigFile(configPath)
	}

	/**
	 * Parse and validate a configuration file
	 */
	private parseConfigFile(configPath: string): ConfigObject {
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
	 * Build full path to configuration file
	 */
	private buildConfigPath(filename: string): string {
		return join(this.configDir, `${filename}${FILE_EXTENSIONS.JSON}`)
	}

	/**
	 * Generate a robust cache key that includes environment and config directory
	 * to avoid collisions between different loader instances
	 */
	private generateCacheKey(environment: string): string {
		const safeDirPath = this.configDir.replace(/[^\w]/g, '_')
		return `${CONFIG_CACHE_PREFIX}${environment}_${safeDirPath}`
	}
}
