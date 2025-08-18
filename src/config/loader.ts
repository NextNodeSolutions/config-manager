import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

import { deepMerge, validateConfig, getCurrentEnvironment } from './utils'

import type { ConfigObject, ConfigOptions } from './types'

/**
 * Configuration loader with environment-specific overrides
 */
export class ConfigLoader {
	private cache = new Map<string, ConfigObject>()
	private configDir: string
	private useCache: boolean

	constructor(options: ConfigOptions = {}) {
		this.configDir = options.configDir || this.getDefaultConfigDir()
		this.useCache = options.cache ?? true
	}

	/**
	 * Load configuration for the specified environment
	 */
	loadConfig(environment?: string): ConfigObject {
		const env = environment || getCurrentEnvironment()
		const cacheKey = `config_${env}`

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
		const configPath = join(this.configDir, `${filename}.json`)

		if (!existsSync(configPath)) {
			if (filename === 'default') {
				throw new Error(
					`Default configuration file not found at ${configPath}. Please create a default.json file in the config directory.`,
				)
			}
			// Return empty object if environment-specific config doesn't exist
			return {}
		}

		try {
			const configContent = readFileSync(configPath, 'utf-8')
			const parsedConfig = JSON.parse(configContent)

			if (!validateConfig(parsedConfig)) {
				throw new Error(
					`Invalid configuration format in ${configPath}. Expected a JSON object.`,
				)
			}

			return parsedConfig
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error(
					`Invalid JSON syntax in ${configPath}: ${error.message}`,
				)
			}
			throw error
		}
	}

	/**
	 * Clear configuration cache
	 */
	clearCache(): void {
		this.cache.clear()
	}

	/**
	 * Get the default configuration directory path
	 */
	private getDefaultConfigDir(): string {
		// For Node.js environments
		if (typeof process !== 'undefined' && process.cwd) {
			return join(process.cwd(), 'config')
		}

		// Fallback for other environments
		return './config'
	}

	/**
	 * Check if configuration file exists
	 */
	hasConfigFile(filename: string): boolean {
		const configPath = join(this.configDir, `${filename}.json`)
		return existsSync(configPath)
	}

	/**
	 * Get available configuration files
	 */
	getAvailableConfigs(): string[] {
		try {
			return readdirSync(this.configDir)
				.filter(file => file.endsWith('.json'))
				.map(file => file.replace('.json', ''))
		} catch {
			return []
		}
	}
}
