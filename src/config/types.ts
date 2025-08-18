export interface ConfigObject {
	[key: string]: ConfigValue | undefined
}

export type ConfigValue =
	| string
	| number
	| boolean
	| null
	| ConfigValue[]
	| ConfigObject

export interface EmailConfig {
	provider: 'resend' | 'nodemailer'
	from: string
	to: string
	replyTo?: string
	templates: {
		projectRequest: {
			subject: string
			companyName: string
			websiteUrl: string
			companyLogo?: string
		}
	}
}

export interface AppConfig {
	name: string
	version: string
	features: string[]
	environment: string
}

export interface RootConfig {
	email: EmailConfig
	app: AppConfig
}

/**
 * Known configuration paths for better type safety and autocomplete
 */
type KnownConfigPaths =
	| 'email'
	| 'email.from'
	| 'email.to'
	| 'email.provider'
	| 'email.replyTo'
	| 'email.templates'
	| 'email.templates.projectRequest'
	| 'email.templates.projectRequest.subject'
	| 'email.templates.projectRequest.companyName'
	| 'email.templates.projectRequest.websiteUrl'
	| 'email.templates.projectRequest.companyLogo'
	| 'app'
	| 'app.name'
	| 'app.version'
	| 'app.features'
	| 'app.environment'

export type ConfigPath = KnownConfigPaths | string | string[]

export interface ConfigOptions {
	environment?: string
	configDir?: string
	cache?: boolean
}
