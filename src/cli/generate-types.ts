#!/usr/bin/env node

/**
 * CLI for generating TypeScript type definitions from JSON configuration files
 * This script reads JSON config files and creates precise TypeScript types
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import {
	generateConfigTypes,
	autoGenerateForUserProject,
} from '../lib/types/generator.js'

const args = process.argv.slice(2)

if (args.length >= 2) {
	// CLI mode with explicit paths
	const [configDir, outputFile] = args
	if (!configDir || !outputFile) {
		console.error('❌ Both configDir and outputFile are required')
		process.exit(1)
	}

	try {
		// Ensure output directory exists
		const outputDir = dirname(outputFile)
		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true })
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
	const success = autoGenerateForUserProject()
	if (!success) {
		process.exit(1)
	}
}
