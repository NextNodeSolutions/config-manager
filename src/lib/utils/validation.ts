import { ENV_VARS, VALID_ENVIRONMENTS } from '../definitions/constants.js'
import {
	AppEnvRequiredError,
	AppEnvUnavailableError,
	InvalidEnvironmentError,
} from '../definitions/errors.js'

import type { ConfigObject } from '../definitions/types.js'

/**
 * Validate configuration object structure
 */
export const validateConfig = (config: unknown): config is ConfigObject =>
	typeof config === 'object' && config !== null && !Array.isArray(config)

/**
 * Get current environment from APP_ENV
 * APP_ENV is mandatory - no fallback to avoid ambiguity
 */
export const getCurrentEnvironment = (): string => {
	if (typeof process !== 'undefined') {
		const appEnv = process.env[ENV_VARS.APP_ENV]

		if (!appEnv) {
			throw new AppEnvRequiredError()
		}

		if (
			!VALID_ENVIRONMENTS.includes(
				appEnv as (typeof VALID_ENVIRONMENTS)[number],
			)
		) {
			throw new InvalidEnvironmentError(appEnv, VALID_ENVIRONMENTS)
		}

		// Convert to lowercase for file matching
		return appEnv.toLowerCase()
	}

	// Browser environment - throw error as APP_ENV is mandatory
	throw new AppEnvUnavailableError()
}

/**
 * Resolve environment parameter, falling back to current environment
 */
export const resolveEnvironment = (environment?: string): string =>
	environment || getCurrentEnvironment()
