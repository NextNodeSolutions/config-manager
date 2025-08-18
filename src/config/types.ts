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

export type ConfigPath = string | string[]

export interface ConfigOptions {
	environment?: string
	configDir?: string
	cache?: boolean
}
