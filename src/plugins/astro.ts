/**
 * Astro integration for automatic config type generation
 */

import { configManagerPlugin, type ConfigManagerPluginOptions } from './vite.js'

// Astro types - declared here to avoid dependency on astro
interface AstroConfig {
	vite?: {
		plugins?: unknown[]
	}
}

interface AstroIntegrationHooks {
	'astro:config:setup': (params: {
		updateConfig: (config: AstroConfig) => void
	}) => void
}

export interface AstroIntegration {
	name: string
	hooks: AstroIntegrationHooks
}

export interface AstroConfigManagerOptions extends ConfigManagerPluginOptions {
	/**
	 * Integration name
	 * @default 'config-manager'
	 */
	name?: string
}

export const configManagerIntegration = (
	options: AstroConfigManagerOptions = {},
): AstroIntegration => {
	const { name = 'config-manager', ...pluginOptions } = options

	return {
		name,
		hooks: {
			'astro:config:setup': ({
				updateConfig,
			}: { updateConfig: (config: AstroConfig) => void }): void => {
				updateConfig({
					vite: {
						plugins: [configManagerPlugin(pluginOptions)],
					},
				})
			},
		},
	}
}

export default configManagerIntegration
