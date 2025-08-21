import {
	existsSync,
	statSync,
	readFileSync,
	writeFileSync,
	readdirSync,
	mkdirSync,
} from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { createHash } from 'node:crypto'

interface AutoTypeOptions {
	configDir?: string
	outputFile?: string
	force?: boolean
}

let hasGeneratedTypes = false

/**
 * Main automatic type generation function
 * This is called automatically when functions-server is imported in a user project
 */
export const autoGenerateTypes = async (
	options: AutoTypeOptions = {},
): Promise<boolean> => {
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

	// Get config directory
	const configDir = getConfigDirectory(projectRoot, options.configDir)
	if (!existsSync(configDir)) {
		throw new Error(
			`Config directory not found: ${configDir}. Make sure the config directory exists or specify a custom path via configDir option.`,
		)
	}

	// Determine output file
	const outputFile =
		options.outputFile || join(projectRoot, 'types', 'config.d.ts')

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
export const resetAutoGeneration = (): void => {
	hasGeneratedTypes = false
}

/**
 * Detect if we're running in a user project by checking for a config directory
 */
const detectUserProject = (): string | null => {
	const currentDir = process.cwd()

	// Check if we're in the functions-server package itself
	const packageJsonPath = join(currentDir, 'package.json')
	if (existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(
				readFileSync(packageJsonPath, 'utf-8'),
			)
			if (packageJson.name === '@nextnode/functions-server') {
				// We're in the functions-server package itself, don't auto-generate
				return null
			}
		} catch {
			// Invalid package.json, continue with config check
		}
	}

	const configPath = join(currentDir, 'config')
	if (existsSync(configPath) && statSync(configPath).isDirectory()) {
		return currentDir
	}

	return null
}

/**
 * Get the config directory path (always config/ at project root)
 */
const getConfigDirectory = (
	projectRoot: string,
	customConfigDir?: string,
): string => {
	if (customConfigDir) {
		return join(projectRoot, customConfigDir)
	}
	return join(projectRoot, 'config')
}

/**
 * Calculate hash of all config files content for change detection
 */
const getConfigHash = (configDir: string): string => {
	const files = readdirSync(configDir)
		.filter(file => file.endsWith('.json'))
		.sort()

	let combinedContent = ''
	for (const file of files) {
		const filePath = join(configDir, file)
		combinedContent += readFileSync(filePath, 'utf-8')
	}

	return createHash('md5').update(combinedContent).digest('hex')
}

/**
 * Check if config files have changed since last generation
 */
const hasConfigChanged = (configDir: string, outputFile: string): boolean => {
	if (!existsSync(outputFile)) return true

	try {
		// Read the hash from the generated file header
		const generatedContent = readFileSync(outputFile, 'utf-8')
		const hashMatch = generatedContent.match(
			/Generated hash: ([a-f0-9]{32})/,
		)

		if (!hashMatch) return true

		const oldHash = hashMatch[1]
		const newHash = getConfigHash(configDir)

		return oldHash !== newHash
	} catch {
		return true
	}
}

/**
 * Validate that the output path is safe (no path traversal)
 */
const validateOutputPath = (
	outputFile: string,
	projectRoot: string,
): boolean => {
	try {
		const resolvedOutput = resolve(outputFile)
		const resolvedProject = resolve(projectRoot)
		const relativePath = relative(resolvedProject, resolvedOutput)

		// Check if the path tries to escape the project directory
		return !relativePath.startsWith('..')
	} catch {
		return false
	}
}

/**
 * Generate types using our existing generator
 */
const generateTypes = async (
	configDir: string,
	outputFile: string,
): Promise<void> => {
	try {
		// Validate output path for security
		const projectRoot = process.cwd()
		if (!validateOutputPath(outputFile, projectRoot)) {
			throw new Error(
				`Invalid output path: ${outputFile}. Path traversal detected.`,
			)
		}

		// Ensure types directory exists
		const typesDir = dirname(outputFile)
		if (!existsSync(typesDir)) {
			mkdirSync(typesDir, { recursive: true })
		}

		// Import our generator dynamically
		const { generateConfigTypes } = await import('../generate-types.js')
		const typeContent = generateConfigTypes(configDir)

		// Add hash to the generated content for change detection
		const configHash = getConfigHash(configDir)
		const contentWithHash = typeContent.replace(
			'* DO NOT EDIT MANUALLY - This file is automatically generated',
			`* DO NOT EDIT MANUALLY - This file is automatically generated\n * Generated hash: ${configHash}`,
		)

		writeFileSync(outputFile, contentWithHash)
		console.log(`✅ Generated config types: ${outputFile}`)
	} catch (error) {
		console.error(`❌ Failed to generate config types:`, error)
		throw error
	}
}
