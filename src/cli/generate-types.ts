#!/usr/bin/env node

/**
 * CLI for generating TypeScript type definitions from JSON configuration files
 * This script reads JSON config files and creates precise TypeScript types
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import {
	generateConfigTypes,
	autoGenerateTypes,
} from '../lib/types/generator.js'
import { cliLogger } from '../lib/utils/logger.js'

const parseArgs = (): { isAutoMode: boolean; paths: string[] } => {
	const args = process.argv.slice(2)
	return {
		isAutoMode: args.includes('--auto'),
		paths: args.filter(arg => !arg.startsWith('--')),
	}
}

const generateWithPaths = (configDir: string, outputFile: string): void => {
	const outputDir = dirname(outputFile)
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true })
	}

	const typeDeclaration = generateConfigTypes(configDir)
	writeFileSync(outputFile, typeDeclaration)
	cliLogger.info(`Generated config types: ${outputFile}`, {
		scope: 'type-generation',
	})
}

const main = async (): Promise<void> => {
	const { isAutoMode, paths } = parseArgs()

	// Explicit paths mode
	if (paths.length >= 2) {
		const [configDir, outputFile] = paths
		if (!configDir || !outputFile) {
			cliLogger.error('Missing required arguments', {
				scope: 'cli-validation',
			})
			process.exit(1)
		}
		generateWithPaths(configDir, outputFile)
		return
	}

	// Auto-detect mode
	const success = await autoGenerateTypes({ silent: isAutoMode })
	if (!success && !isAutoMode) {
		cliLogger.info('No config directory found', {
			scope: 'auto-detection',
		})
		process.exit(1)
	}
}

// Run and handle errors simply
main().catch(error => {
	const errorMessage = error instanceof Error ? error.message : String(error)
	cliLogger.error(`Type generation failed: ${errorMessage}`, {
		scope: 'cli-error',
	})
	process.exit(1)
})
