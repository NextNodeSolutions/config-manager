/**
 * Test script for configuration system
 * Run with: node -e "import('./dist/server/entry.mjs').then(() => console.log('Config loaded'))"
 */

import {
	getConfig,
	getTypedConfig,
	hasConfig,
	validateRequiredConfig,
} from './index'

import type { EmailConfig } from './types'

// Test basic configuration loading
console.log('=== Testing Configuration System ===')

// Test environment detection
console.log('Environment:', process.env.NODE_ENV || 'not set')

// Test getting entire email config
const emailConfig = getConfig<EmailConfig>('email')
console.log('Email config:', emailConfig)

// Test getting specific values with dot notation
const fromEmail = getConfig<string>('email.from')
console.log('From email:', fromEmail)

const templateSubject = getConfig<string>(
	'email.templates.projectRequest.subject',
)
console.log('Template subject:', templateSubject)

// Test getting arrays
const features = getConfig<string[]>('app.features')
console.log('App features:', features)

// Test typed config
const typedEmailConfig = getTypedConfig('email')
console.log('Typed email config:', typedEmailConfig)

// Test config existence
console.log('Has email.from:', hasConfig('email.from'))
console.log('Has nonexistent.path:', hasConfig('nonexistent.path'))

// Test validation
const validation = validateRequiredConfig([
	'email.from',
	'email.to',
	'email.provider',
	'app.name',
])
console.log('Validation result:', validation)

// Test environment-specific config
console.log('\n=== Testing Environment-Specific Config ===')

const devConfig = getConfig<EmailConfig>('email', 'development')
console.log('Dev email config:', devConfig)

const prodConfig = getConfig<EmailConfig>('email', 'production')
console.log('Prod email config:', prodConfig)

console.log('=== Configuration Tests Complete ===')

export default {
	emailConfig,
	fromEmail,
	templateSubject,
	features,
	validation,
}
