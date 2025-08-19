/**
 * Automatic type generation system that detects user projects
 * and generates precise TypeScript types from their config files
 */

import {
	existsSync,
	statSync,
	readFileSync,
	writeFileSync,
	readdirSync,
} from 'node:fs'
import { join, dirname } from 'node:path'

interface AutoTypeOptions {
	configDir?: string
	outputFile?: string
	force?: boolean
}

let hasGeneratedTypes = false

/**
 * Detect if we're running in a user project (not in the functions-server package itself)
 */
function detectUserProject(): string | null {
	// Start from the current working directory
	let currentDir = process.cwd()

	// Walk up the directory tree looking for package.json
	while (currentDir !== dirname(currentDir)) {
		const packageJsonPath = join(currentDir, 'package.json')

		if (existsSync(packageJsonPath)) {
			try {
				const packageJson = JSON.parse(
					readFileSync(packageJsonPath, 'utf-8'),
				)

				// Check if this is the functions-server package itself (skip it)
				if (packageJson.name === '@nextnode/functions-server') {
					currentDir = dirname(currentDir)
					continue
				}

				// Check if functions-server is a dependency
				const deps = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
				}

				if (deps['@nextnode/functions-server']) {
					return currentDir
				}
			} catch {
				// Invalid package.json, continue searching
			}
		}

		currentDir = dirname(currentDir)
	}

	return null
}

/**
 * Find the config directory in the user project
 */
function findConfigDirectory(projectRoot: string): string | null {
	const possiblePaths = [
		join(projectRoot, 'config'),
		join(projectRoot, 'configs'),
		join(projectRoot, 'src/config'),
		join(projectRoot, 'src/configs'),
	]

	for (const configPath of possiblePaths) {
		if (existsSync(configPath) && statSync(configPath).isDirectory()) {
			return configPath
		}
	}

	return null
}

/**
 * Check if config files have changed since last generation
 */
function hasConfigChanged(configDir: string, outputFile: string): boolean {
	if (!existsSync(outputFile)) return true

	try {
		const outputStat = statSync(outputFile)
		const outputTime = outputStat.mtime.getTime()

		// Check if any JSON files in config dir are newer
		const files = readdirSync(configDir)

		for (const file of files) {
			if (file.endsWith('.json')) {
				const filePath = join(configDir, file)
				const fileStat = statSync(filePath)
				if (fileStat.mtime.getTime() > outputTime) {
					return true
				}
			}
		}

		return false
	} catch {
		return true
	}
}

/**
 * Generate types using our existing generator
 */
async function generateTypes(
	configDir: string,
	outputFile: string,
): Promise<void> {
	try {
		// Import our generator
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { generateConfigTypes } = require('./generate-types.cjs')
		const typeContent = generateConfigTypes(configDir)

		writeFileSync(outputFile, typeContent)
		console.log(`✅ Generated config types: ${outputFile}`)
	} catch (error) {
		console.error(`❌ Failed to generate config types:`, error)
		throw error
	}
}

/**
 * Main automatic type generation function
 * This is called automatically when functions-server is imported in a user project
 */
export async function autoGenerateTypes(
	options: AutoTypeOptions = {},
): Promise<boolean> {
	// Skip if already generated this session (unless forced)
	if (hasGeneratedTypes && !options.force) {
		return true
	}

	// Detect user project
	const projectRoot = detectUserProject()
	if (!projectRoot) {
		// We're not in a user project (maybe in development of functions-server itself)
		return false
	}

	// Find config directory
	const configDir = options.configDir || findConfigDirectory(projectRoot)
	if (!configDir) {
		// Config directory is required in user projects
		throw new Error(
			`No config directory found in project root: ${projectRoot}. Expected one of: config/, configs/, src/config/, src/configs/`,
		)
	}

	// Determine output file
	const outputFile =
		options.outputFile || join(projectRoot, 'config-types.d.ts')

	// Check if generation is needed
	if (!options.force && !hasConfigChanged(configDir, outputFile)) {
		hasGeneratedTypes = true
		return true
	}

	try {
		await generateTypes(configDir, outputFile)
		hasGeneratedTypes = true
		return true
	} catch (error) {
		console.error('❌ Auto type generation failed:', error)
		return false
	}
}

/**
 * Reset generation state (useful for testing)
 */
export function resetAutoGeneration(): void {
	hasGeneratedTypes = false
}
