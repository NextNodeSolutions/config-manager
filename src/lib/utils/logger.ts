/**
 * Logger utility for config-manager
 * Centralized logging with @nextnode/logger
 */

import { createLogger } from '@nextnode/logger'

// Create dedicated logger for config-manager
export const logger = createLogger({
	prefix: 'config-manager',
})

// Specialized loggers for different modules
export const typeLogger = createLogger({ prefix: 'type-generator' })
export const configLogger = createLogger({ prefix: 'config-loader' })
export const cliLogger = createLogger({ prefix: 'cli' })
