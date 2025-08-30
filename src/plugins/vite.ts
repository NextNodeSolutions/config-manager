/**
 * Vite plugin for automatic config type generation
 * Works with Vite, Astro, and other Vite-based build tools
 */

import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { autoGenerateTypes } from '../lib/types/generator.js'
import { typeLogger } from '../lib/utils/logger.js'

// Vite types - declared here to avoid dependency on vite
interface ViteDevServer {
	config: { root: string }
	watcher: {
		add: (path: string) => void
		on: (event: string, callback: (file: string) => void) => void
	}
	ws: {
		send: (data: { type: string }) => void
	}
}

export interface Plugin {
	name: string
	buildStart?: () => Promise<void>
	configureServer?: (server: ViteDevServer) => void
}

export interface ConfigManagerPluginOptions {
	/**
	 * Config directory path relative to project root
	 * @default 'config'
	 */
	configDir?: string

	/**
	 * Watch config files for changes in dev mode
	 * @default true
	 */
	watch?: boolean

	/**
	 * Enable verbose logging
	 * @default false
	 */
	verbose?: boolean
}

export const configManagerPlugin = (
	options: ConfigManagerPluginOptions = {},
): Plugin => {
	const { configDir = 'config', watch = true, verbose = false } = options

	return {
		name: 'config-manager',
		async buildStart(): Promise<void> {
			// Generate types before build
			try {
				const success = await autoGenerateTypes({
					configDir,
					force: true, // Always generate on build
					silent: !verbose,
				})

				if (!success && verbose) {
					typeLogger.info(
						'No config directory found, skipping type generation',
						{
							scope: 'vite-plugin',
						},
					)
				}
			} catch (error) {
				// Don't fail the build if type generation fails
				const errorMessage =
					error instanceof Error ? error.message : String(error)
				typeLogger.error(`Type generation failed: ${errorMessage}`, {
					scope: 'vite-plugin-error',
				})
			}
		},

		configureServer(server: ViteDevServer): void {
			if (!watch) return

			const configPath = join(server.config.root, configDir)
			if (!existsSync(configPath)) return

			// Watch config directory for changes
			server.watcher.add(`${configPath}/*.json`)

			server.watcher.on('change', async (file: string) => {
				if (file.includes(`${configDir}/`) && file.endsWith('.json')) {
					if (verbose) {
						typeLogger.info(`Config file changed: ${file}`, {
							scope: 'vite-plugin-watch',
						})
					}

					try {
						await autoGenerateTypes({
							configDir,
							force: true,
							silent: !verbose,
						})

						// Trigger HMR reload
						server.ws.send({
							type: 'full-reload',
						})
					} catch (error) {
						const errorMessage =
							error instanceof Error
								? error.message
								: String(error)
						typeLogger.error(
							`Hot reload type generation failed: ${errorMessage}`,
							{
								scope: 'vite-plugin-hmr-error',
							},
						)
					}
				}
			})

			if (verbose) {
				typeLogger.info(`Watching config files in ${configPath}`, {
					scope: 'vite-plugin-init',
				})
			}
		},
	}
}

// Export for Astro integration
export default configManagerPlugin
