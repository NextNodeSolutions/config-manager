import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.{test,spec}.ts'],
		env: {
			NODE_ENV: 'test',
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			reportsDirectory: './src/__tests__/coverage',
			exclude: [
				'node_modules/**',
				'dist/**',
				'**/*.d.ts',
				'**/*.test.ts',
				'**/*.config.ts',
				'**/types.ts',
			],
		},
	},
})
