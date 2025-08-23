#!/usr/bin/env node

/**
 * Generate TypeScript type definitions from JSON configuration files
 * This script reads JSON config files and creates precise TypeScript types
 */

import {
	readFileSync,
	writeFileSync,
	readdirSync,
	existsSync,
	mkdirSync,
} from 'node:fs'
import { join, extname, basename, dirname, relative } from 'node:path'

/**
 * Collect all possible values for each property path across all configs
 */
function collectAllValues(configs, currentPath = '', allValues = new Map()) {
	const configValues = Object.values(configs).filter(
		config =>
			config !== null &&
			typeof config === 'object' &&
			!Array.isArray(config),
	)

	if (configValues.length === 0) return allValues

	// Get all possible keys from all configs
	const allKeys = new Set()
	configValues.forEach(config => {
		Object.keys(config).forEach(key => allKeys.add(key))
	})

	allKeys.forEach(key => {
		const fullPath = currentPath ? `${currentPath}.${key}` : key
		const valuesForKey = new Set()

		configValues.forEach(config => {
			if (config[key] !== undefined) {
				const value = config[key]
				if (
					typeof value === 'object' &&
					value !== null &&
					!Array.isArray(value)
				) {
					// Recursively collect for nested objects
					const nestedConfigs = {}
					Object.entries(configs).forEach(([env, envConfig]) => {
						if (envConfig && envConfig[key]) {
							nestedConfigs[env] = envConfig[key]
						}
					})
					collectAllValues(nestedConfigs, fullPath, allValues)
				} else {
					valuesForKey.add(value)
				}
			}
		})

		if (valuesForKey.size > 0) {
			allValues.set(fullPath, valuesForKey)
		}
	})

	return allValues
}

/**
 * Create TypeScript type from collected values with union types for multiple values
 */
function createUnionType(values) {
	if (values.size === 0) return 'unknown'
	if (values.size === 1) {
		const value = Array.from(values)[0]
		if (value === null) return 'null'
		if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`
		if (typeof value === 'number') return value.toString()
		if (typeof value === 'boolean') return value.toString()
		if (Array.isArray(value)) {
			const uniqueTypes = new Set()
			value.forEach(item => {
				if (typeof item === 'string')
					uniqueTypes.add(`'${item.replace(/'/g, "\\'")}'`)
				else if (typeof item === 'number')
					uniqueTypes.add(item.toString())
				else if (typeof item === 'boolean')
					uniqueTypes.add(item.toString())
				else if (item === null) uniqueTypes.add('null')
				else uniqueTypes.add('unknown')
			})
			const elementType = Array.from(uniqueTypes).join(' | ')
			return `readonly (${elementType})[]`
		}
		return 'unknown'
	}

	// Multiple values - create union type
	const types = Array.from(values).map(value => {
		if (value === null) return 'null'
		if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`
		if (typeof value === 'number') return value.toString()
		if (typeof value === 'boolean') return value.toString()
		if (Array.isArray(value)) {
			const uniqueTypes = new Set()
			value.forEach(item => {
				if (typeof item === 'string')
					uniqueTypes.add(`'${item.replace(/'/g, "\\'")}'`)
				else if (typeof item === 'number')
					uniqueTypes.add(item.toString())
				else if (typeof item === 'boolean')
					uniqueTypes.add(item.toString())
				else if (item === null) uniqueTypes.add('null')
				else uniqueTypes.add('unknown')
			})
			const elementType = Array.from(uniqueTypes).join(' | ')
			return `readonly (${elementType})[]`
		}
		return 'unknown'
	})

	return types.join(' | ')
}

/**
 * Generate merged structure with union types
 */
function generateMergedStructure(
	configs,
	allValues,
	currentPath = '',
	depth = 0,
) {
	const indent = '  '.repeat(depth)
	const configValues = Object.values(configs).filter(
		config =>
			config !== null &&
			typeof config === 'object' &&
			!Array.isArray(config),
	)

	if (configValues.length === 0) return 'Record<string, unknown>'

	// Get all possible keys from all configs
	const allKeys = new Set()
	configValues.forEach(config => {
		Object.keys(config).forEach(key => allKeys.add(key))
	})

	const properties = Array.from(allKeys).map(key => {
		const fullPath = currentPath ? `${currentPath}.${key}` : key

		// Check if this path has collected values (primitive types)
		if (allValues.has(fullPath)) {
			const values = allValues.get(fullPath)
			const unionType = createUnionType(values)
			return `${indent}  readonly ${key}: ${unionType}`
		}

		// This must be a nested object - recurse
		const nestedConfigs = {}
		Object.entries(configs).forEach(([env, envConfig]) => {
			if (
				envConfig &&
				envConfig[key] &&
				typeof envConfig[key] === 'object' &&
				!Array.isArray(envConfig[key])
			) {
				nestedConfigs[env] = envConfig[key]
			}
		})

		if (Object.keys(nestedConfigs).length > 0) {
			const nestedType = generateMergedStructure(
				nestedConfigs,
				allValues,
				fullPath,
				depth + 1,
			)
			return `${indent}  readonly ${key}: ${nestedType}`
		}

		return `${indent}  readonly ${key}: unknown`
	})

	return `{\n${properties.join('\n')}\n${indent}}`
}

/**
 * Merge multiple JSON objects and infer their combined type with union types
 */
function mergeJsonTypes(configs) {
	// Collect all possible values for each property path
	const allValues = collectAllValues(configs)

	// Generate the structure with union types
	return generateMergedStructure(configs, allValues)
}

/**
 * Simple validation to ensure all configs have consistent structure
 * Note: 'default' is excluded as it's the base merged with all environments
 */
function validateConfigConsistency(configs) {
	const environments = Object.keys(configs).filter(
		env =>
			env !== 'default' && // Exclude default - it's the base for all environments
			configs[env] !== null &&
			typeof configs[env] === 'object',
	)

	if (environments.length < 2) return // No validation needed for single environment

	// Get all property paths from all environments
	const getAllPaths = (obj, prefix = '') => {
		const paths = new Set()
		if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return paths

		Object.keys(obj).forEach(key => {
			const fullPath = prefix ? `${prefix}.${key}` : key
			paths.add(fullPath)
			if (
				typeof obj[key] === 'object' &&
				obj[key] !== null &&
				!Array.isArray(obj[key])
			) {
				getAllPaths(obj[key], fullPath).forEach(path => paths.add(path))
			}
		})
		return paths
	}

	// Collect all paths from all environments
	const allPaths = new Map() // path -> Set of environments that have it
	environments.forEach(env => {
		const paths = getAllPaths(configs[env])
		paths.forEach(path => {
			if (!allPaths.has(path)) allPaths.set(path, new Set())
			allPaths.get(path).add(env)
		})
	})

	// Check for inconsistencies
	const errors = []
	allPaths.forEach((envsWithPath, path) => {
		const missingEnvs = environments.filter(env => !envsWithPath.has(env))
		if (missingEnvs.length > 0) {
			const hasEnvs = Array.from(envsWithPath)
			errors.push(
				`Property '${path}' exists in [${hasEnvs.join(', ')}] but missing in [${missingEnvs.join(', ')}]`,
			)
		}
	})

	if (errors.length > 0) {
		throw new Error(
			`❌ Configuration consistency validation failed:\n\n${errors.join('\n')}\n\nAll environments must have the same structure.`,
		)
	}
}

/**
 * Generate TypeScript declaration from JSON config files
 */
function generateConfigTypes(configDir) {
	if (!existsSync(configDir)) {
		throw new Error(`Config directory not found: ${configDir}`)
	}

	// Files to exclude from type generation (used for error testing)
	const excludedFiles = ['invalid.json']

	const files = readdirSync(configDir)
		.filter(file => extname(file) === '.json')
		.filter(file => !excludedFiles.includes(file))

	if (files.length === 0) {
		throw new Error(`No JSON config files found in: ${configDir}`)
	}

	const configs = {}

	// Load all config files
	files.forEach(file => {
		const filePath = join(configDir, file)
		const configName = basename(file, '.json')

		try {
			const content = readFileSync(filePath, 'utf-8')
			configs[configName] = JSON.parse(content)
		} catch (error) {
			console.warn(`Warning: Failed to parse ${file}:`, error)
		}
	})

	// Validate consistency between environments
	validateConfigConsistency(configs)

	// Generate merged type structure
	const typeDefinition = mergeJsonTypes(configs)

	// Generate the module declaration
	return `/**
 * Auto-generated type definitions from JSON configuration files
 * Generated from: ${configDir}
 * DO NOT EDIT MANUALLY - This file is automatically generated
 */

declare module '@nextnode/config-manager' {
  interface UserConfigSchema ${typeDefinition}
}

export {}
`
}

/**
 * Auto-detect user project and generate types
 */
function autoGenerateForUserProject() {
	// Find the user project root (go up from node_modules)
	const currentDir = process.cwd()
	let projectRoot = currentDir

	// If we're in node_modules/@nextnode/config-manager, go up to find project root
	if (currentDir.includes('node_modules/@nextnode/config-manager')) {
		const parts = currentDir.split('node_modules')
		projectRoot = parts[0]
	}

	const configDir = join(projectRoot, 'config')
	if (!existsSync(configDir)) {
		// No config directory found, skip generation
		return false
	}

	const outputFile = join(projectRoot, 'types', 'config.d.ts')

	try {
		// Ensure types directory exists
		const typesDir = dirname(outputFile)
		if (!existsSync(typesDir)) {
			mkdirSync(typesDir, { recursive: true })
		}

		const typeDeclaration = generateConfigTypes(configDir)
		writeFileSync(outputFile, typeDeclaration)

		// Create relative paths from project root
		const relativeOutputFile = relative(projectRoot, outputFile)
		const relativeConfigDir = relative(projectRoot, configDir)

		console.log(
			`✅ Generated config types: ${relativeOutputFile} (from ${relativeConfigDir})`,
		)
		return true
	} catch (error) {
		console.error('❌ Failed to generate config types:', error)
		return false
	}
}

// Export for internal use by type-generator.ts
export { generateConfigTypes }

// Handle CLI arguments or auto-run
const args = process.argv.slice(2)
if (args.length >= 2) {
	// CLI mode with explicit paths
	const [configDir, outputFile] = args
	try {
		// Ensure types directory exists
		const typesDir = dirname(outputFile)
		if (!existsSync(typesDir)) {
			mkdirSync(typesDir, { recursive: true })
		}

		const typeDeclaration = generateConfigTypes(configDir)
		writeFileSync(outputFile, typeDeclaration)

		// For CLI mode, show absolute paths
		console.log(
			`✅ Generated config types: ${outputFile} (from ${configDir})`,
		)
	} catch (error) {
		console.error('❌ Failed to generate config types:', error)
		process.exit(1)
	}
} else {
	// Auto-run when called directly without arguments
	autoGenerateForUserProject()
}
